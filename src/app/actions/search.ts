"use server";

import { db } from "@/lib/db";

/* =========================================================
   TYPES
   ========================================================= */

interface SearchParams {
  query: string;
  limit?: number;
  /** Category slug OR id. Filters within that category (includes subcategories). */
  category?: string;
  minPrice?: number;
  maxPrice?: number;
}

export type SearchSuggestion =
  | { type: "category"; id: string; text: string; slug: string; icon: "🏷️" }
  | { type: "product"; id: string; text: string; slug: string; icon: "📦" };

/* =========================================================
   HELPERS
   ========================================================= */

/**
 * `mode: "insensitive"` only works on Postgres.
 * On MongoDB, `contains` is already case-insensitive-ish for regex,
 * but to be safe we normalize to regex via `contains` + `mode: undefined`
 * — Prisma still emits a regex match on Mongo.
 *
 * If you're on Postgres keep `mode: "insensitive"`.
 */
const CONTAINS = (value: string) => ({
  contains: value,
  mode: "insensitive" as const,
});

/**
 * Resolve a category slug OR id to a category record,
 * including its child ids so we can filter products that live
 * under subcategories too.
 */
async function resolveCategory(categoryRef: string) {
  const category = await db.category.findFirst({
    where: {
      OR: [{ slug: categoryRef }, { id: categoryRef }],
    },
    include: {
      children: { select: { id: true } },
    },
  });
  if (!category) return null;

  return {
    id: category.id,
    slug: category.slug,
    name: category.name,
    /** ids to use in OR clause for product filtering */
    ids: [category.id, ...category.children.map((c) => c.id)],
  };
}

/* =========================================================
   MAIN SEARCH
   ========================================================= */

export async function searchProducts({
  query,
  limit = 10,
  category,
  minPrice,
  maxPrice,
}: SearchParams) {
  try {
    const trimmed = query?.trim() ?? "";
    if (trimmed.length < 2) {
      return {
        success: true as const,
        products: [],
        suggestions: [],
        total: 0,
      };
    }

    // Resolve category filter (slug or id) → matched ids
    const cat = category ? await resolveCategory(category) : null;

    const products = await db.product.findMany({
      where: {
        isAvailable: true,
        AND: [
          {
            OR: [
              { name: CONTAINS(trimmed) },
              { desc: CONTAINS(trimmed) },
              // match on related category/subcategory names
              { category: { name: CONTAINS(trimmed) } },
              { subCategory: { name: CONTAINS(trimmed) } },
            ],
          },
          cat ?
            {
              OR: [
                { categoryId: { in: cat.ids } },
                { subCategoryId: { in: cat.ids } },
              ],
            }
          : {},
          minPrice != null ? { price: { gte: minPrice } } : {},
          maxPrice != null ? { price: { lte: maxPrice } } : {},
        ],
      },
      take: limit,
      orderBy: { name: "asc" },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        subCategory: { select: { id: true, name: true, slug: true } },
      },
    });

    const suggestions = await generateSuggestions(trimmed, cat?.id);

    return {
      success: true as const,
      products,
      suggestions,
      total: products.length,
    };
  } catch (error) {
    console.error("Search error:", error);
    return {
      success: false as const,
      error: "Failed to search products",
      products: [],
      suggestions: [],
      total: 0,
    };
  }
}

/* =========================================================
   SUGGESTIONS (for search-as-you-type)
   ========================================================= */

async function generateSuggestions(
  query: string,
  categoryFilterId?: string,
): Promise<SearchSuggestion[]> {
  if (query.length < 2) return [];

  // Run category + product lookups in parallel
  const [categories, products] = await Promise.all([
    db.category.findMany({
      where: {
        isActive: true,
        name: CONTAINS(query),
        ...(categoryFilterId && { id: categoryFilterId }),
      },
      select: { id: true, name: true, slug: true },
      take: 5,
      orderBy: { name: "asc" },
    }),
    db.product.findMany({
      where: {
        isAvailable: true,
        name: CONTAINS(query),
      },
      select: { id: true, name: true, slug: true },
      take: 5,
      orderBy: { name: "asc" },
    }),
  ]);

  const categorySuggestions: SearchSuggestion[] = categories.map((c) => ({
    type: "category",
    id: c.id,
    text: c.name,
    slug: c.slug,
    icon: "🏷️",
  }));

  const productSuggestions: SearchSuggestion[] = products.map((p) => ({
    type: "product",
    id: p.id,
    text: p.name,
    slug: p.slug ?? p.id,
    icon: "📦",
  }));

  // Dedupe by text+type
  const seen = new Set<string>();
  return [...categorySuggestions, ...productSuggestions].filter((s) => {
    const key = `${s.type}:${s.text.toLowerCase()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/* =========================================================
   AUTOCOMPLETE ENDPOINT
   ========================================================= */

export async function getSearchSuggestions(query: string) {
  try {
    const trimmed = query?.trim() ?? "";
    if (trimmed.length < 2) {
      return {
        success: true as const,
        suggestions: {
          products: [] as {
            id: string;
            name: string;
            slug: string | null;
            price: number;
            images: unknown;
          }[],
          categories: [] as { id: string; name: string; slug: string }[],
        },
      };
    }

    const [products, categories] = await Promise.all([
      db.product.findMany({
        where: {
          isAvailable: true,
          OR: [
            { name: CONTAINS(trimmed) },
            { category: { name: CONTAINS(trimmed) } },
            { subCategory: { name: CONTAINS(trimmed) } },
          ],
        },
        select: {
          id: true,
          name: true,
          slug: true,
          price: true,
          images: true,
        },
        take: 8,
        orderBy: { name: "asc" },
      }),
      db.category.findMany({
        where: {
          isActive: true,
          name: CONTAINS(trimmed),
        },
        select: { id: true, name: true, slug: true },
        take: 4,
        orderBy: { name: "asc" },
      }),
    ]);

    return {
      success: true as const,
      suggestions: { products, categories },
    };
  } catch (error) {
    console.error("Suggestion error:", error);
    return {
      success: false as const,
      suggestions: { products: [], categories: [] },
    };
  }
}
