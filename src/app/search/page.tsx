import { Suspense } from "react";
import { searchProducts } from "@/app/actions/search";
import { getTopLevelCategories } from "@/lib/queries/categories";
import SearchClient from "@/components/components/Ui/SearchClient";

interface SearchPageProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
    minPrice?: string;
    maxPrice?: string;
  }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const query = params.q ?? "";
  const category = params.category;
  const minPrice = params.minPrice ? parseFloat(params.minPrice) : undefined;
  const maxPrice = params.maxPrice ? parseFloat(params.maxPrice) : undefined;

  const [{ products, suggestions, success }, categories] = await Promise.all([
    searchProducts({
      query,
      limit: 20,
      category,
      minPrice,
      maxPrice,
    }),
    getTopLevelCategories(),
  ]);

  // Normalize products so the client receives a predictable shape
  const normalizedProducts = products.map((product) => ({
    id: product.id,
    name: product.name,
    slug: product.slug ?? product.id,
    price: product.price,
    offerPrice: product.offerPrice,
    images:
      Array.isArray(product.images) ?
        (product.images as string[]).filter(
          (img): img is string => typeof img === "string",
        )
      : [],
    categoryName: product.category?.name ?? "",
    categorySlug: product.category?.slug ?? "",
    subCategoryName: product.subCategory?.name ?? null,
  }));

  // Normalize suggestions into the union shape the client expects
  const normalizedSuggestions = (suggestions ?? []).map((s) =>
    s.type === "category" ?
      {
        type: "category" as const,
        id: s.id,
        text: s.text,
        slug: s.slug,
        icon: s.icon,
      }
    : {
        type: "product" as const,
        id: s.id,
        text: s.text,
        slug: s.slug,
        icon: s.icon,
      },
  );

  // Pass categories as plain objects (name + slug only) — nothing else leaks
  const categoryOptions = categories.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <Suspense fallback={<SearchSkeleton />}>
          <SearchClient
            initialProducts={normalizedProducts}
            initialSuggestions={normalizedSuggestions}
            initialQuery={query}
            initialCategory={category}
            initialMinPrice={minPrice}
            initialMaxPrice={maxPrice}
            categories={categoryOptions}
          />
        </Suspense>
      </div>
    </div>
  );
}

function SearchSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="mb-8 h-14 w-full rounded-2xl bg-gray-200" />
      <div className="mb-8 h-10 w-64 rounded-lg bg-gray-200" />
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-80 rounded-lg bg-gray-200" />
        ))}
      </div>
    </div>
  );
}
