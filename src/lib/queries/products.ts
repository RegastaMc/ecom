import { Prisma } from "../../../prisma/src/lib/prisma/client";
import { db } from "../db";

export const PRODUCTS_PER_PAGE = 12;

export type ProductListParams = {
  categorySlug: string;
  subSlug?: string;
  sort?: "newest" | "price-asc" | "price-desc" | "name-asc";
  minPrice?: number;
  maxPrice?: number;
  availableOnly?: boolean;
  page?: number;
};

export async function getProductsForCategory({
  categorySlug,
  subSlug,
  sort = "newest",
  minPrice,
  maxPrice,
  availableOnly,
  page = 1,
}: ProductListParams) {
  const category = await db.category.findUnique({
    where: { slug: categorySlug },
    include: {
      children: {
        where: { isActive: true },
        orderBy: { name: "asc" },
        select: { id: true, name: true, slug: true },
      },
    },
  });

  if (!category) return null;

  // Resolve subcategory
  const sub =
    subSlug ?
      (category.children.find((c) => c.slug === subSlug) ?? null)
    : null;

  // Build where clause
  const where: Prisma.ProductWhereInput = {
    OR:
      sub ?
        [{ subCategoryId: sub.id }, { categoryId: sub.id }]
      : [{ categoryId: category.id }],
    ...(availableOnly && { isAvailable: true }),
  };

  if (minPrice != null || maxPrice != null) {
    where.price = {
      ...(minPrice != null && { gte: minPrice }),
      ...(maxPrice != null && { lte: maxPrice }),
    };
  }

  const orderBy: Prisma.ProductOrderByWithRelationInput =
    sort === "price-asc" ? { price: "asc" }
    : sort === "price-desc" ? { price: "desc" }
    : sort === "name-asc" ? { name: "asc" }
    : { createdAt: "desc" };

  const [products, total] = await Promise.all([
    db.product.findMany({
      where,
      orderBy,
      skip: (page - 1) * PRODUCTS_PER_PAGE,
      take: PRODUCTS_PER_PAGE,
    }),
    db.product.count({ where }),
  ]);

  return {
    category,
    sub,
    products,
    total,
    totalPages: Math.max(1, Math.ceil(total / PRODUCTS_PER_PAGE)),
  };
}
