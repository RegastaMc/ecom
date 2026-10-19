import { db } from "../db";

export async function getCategoriesWithCounts() {
  const categories = await db.category.findMany({
    where: { parentId: null, isActive: true },
    orderBy: { sortOrder: "asc" },
    include: {
      children: {
        select: { id: true, name: true, slug: true },
        orderBy: { name: "asc" },
      },
      _count: { select: { products: true } },
    },
  });

  return categories.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    image: c.image ?? "",
    description: c.description ?? "",
    productCount: c._count.products,
    subCategories: c.children.map((s) => ({
      id: s.id,
      name: s.name,
      slug: s.slug,
    })),
  }));
}

export async function getCategoryBySlug(slug: string) {
  return db.category.findUnique({
    where: { slug },
    include: {
      children: { select: { id: true, name: true, slug: true } },
      products: {
        where: { isAvailable: true },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          slug: true,
          price: true,
          offerPrice: true,
          images: true,
        },
      },
      _count: { select: { products: true } },
    },
  });
}

export type CategoryWithSubs = {
  id: string;
  name: string;
  slug: string;
  image: string;
  description: string;
  subCategories: { id: string; name: string; slug: string }[];
};

export async function getTopLevelCategories(): Promise<CategoryWithSubs[]> {
  const categories = await db.category.findMany({
    where: { parentId: null, isActive: true },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: {
      children: {
        where: { isActive: true },
        orderBy: { name: "asc" },
        select: { id: true, name: true, slug: true },
      },
    },
  });

  return categories.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    image: c.image ?? "",
    description: c.description ?? "",
    subCategories: c.children,
  }));
}
