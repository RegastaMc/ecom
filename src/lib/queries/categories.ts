import { db } from "../db";
import { unstable_cache } from "next/cache";

export type CategoryWithSubs = {
  id: string;
  name: string;
  slug: string;
  image: string;
  description: string;
  subCategories: { id: string; name: string; slug: string }[];
};

export type NavSubCategory = {
  id: string;
  name: string;
  slug: string;
};

/**
 * Category shape used by the Navbar and category grids.
 * Matches the output of `getTopLevelCategories()`.
 */
export type NavCategory = {
  id: string;
  name: string;
  slug: string;
  image: string;
  description: string;
  subCategories: NavSubCategory[];
};

/** Category with product counts — used by admin / landing grids. */
export type CategoryWithCounts = NavCategory & {
  productCount: number;
};

/* =========================================================
   QUERIES
   ========================================================= */

/**
 * Fetch all top-level categories with their subcategories.
 * Cached for 60s and tagged so it can be revalidated after
 * admin mutations via `revalidateTag("categories")`.
 */
export const getTopLevelCategories = unstable_cache(
  async (): Promise<NavCategory[]> => {
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
  },
  ["categories-top-level"],
  { revalidate: 60, tags: ["categories"] },
);

/**
 * Same as above but also returns how many products belong to
 * each category. Used by landing-page grids.
 */
export const getCategoriesWithCounts = unstable_cache(
  async (): Promise<CategoryWithCounts[]> => {
    const categories = await db.category.findMany({
      where: { parentId: null, isActive: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      include: {
        children: {
          where: { isActive: true },
          orderBy: { name: "asc" },
          select: { id: true, name: true, slug: true },
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
      subCategories: c.children,
    }));
  },
  ["categories-with-counts"],
  { revalidate: 60, tags: ["categories"] },
);

/** Fetch a single category by slug (uncached — always fresh). */
export async function getCategoryBySlug(
  slug: string,
): Promise<NavCategory | null> {
  const category = await db.category.findUnique({
    where: { slug },
    include: {
      children: {
        where: { isActive: true },
        orderBy: { name: "asc" },
        select: { id: true, name: true, slug: true },
      },
    },
  });

  if (!category) return null;

  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    image: category.image ?? "",
    description: category.description ?? "",
    subCategories: category.children,
  };
}
