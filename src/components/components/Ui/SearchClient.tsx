"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Search, X, Package, Loader2 } from "lucide-react";
import { searchProducts } from "@/app/actions/search";
import { debounce } from "lodash";

/* =========================================================
   TYPES
   ========================================================= */

export interface SearchProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  offerPrice: number | null;
  images: string[];
  categoryName: string;
  categorySlug: string;
  subCategoryName: string | null;
}

export type SearchSuggestion =
  | {
      type: "category";
      id: string;
      text: string;
      slug: string;
      icon: string;
    }
  | {
      type: "product";
      id: string;
      text: string;
      slug: string;
      icon: string;
    };

interface CategoryOption {
  id: string;
  name: string;
  slug: string;
}

interface SearchClientProps {
  initialProducts: SearchProduct[];
  initialSuggestions: SearchSuggestion[];
  initialQuery: string;
  initialCategory?: string;
  initialMinPrice?: number;
  initialMaxPrice?: number;
  categories: CategoryOption[];
}

/* =========================================================
   COMPONENT
   ========================================================= */

const SearchClient = ({
  initialProducts,
  initialSuggestions,
  initialQuery,
  initialCategory,
  initialMinPrice,
  initialMaxPrice,
  categories,
}: SearchClientProps) => {
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [products, setProducts] = useState<SearchProduct[]>(initialProducts);
  const [suggestions, setSuggestions] =
    useState<SearchSuggestion[]>(initialSuggestions);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(
    initialCategory ?? "",
  );
  const [priceRange, setPriceRange] = useState({
    min: initialMinPrice ?? "",
    max: initialMaxPrice ?? "",
  });
  const [sortBy, setSortBy] = useState("relevance");

  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Only update URL when user submits — not on every keystroke
  const pushToUrl = useCallback(
    (q: string, category: string, min: string, max: string) => {
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      if (category) params.set("category", category);
      if (min) params.set("minPrice", min);
      if (max) params.set("maxPrice", max);
      router.push(`/search?${params.toString()}`, { scroll: false });
    },
    [router],
  );

  // Server-side search (called on submit, category change, price change)
  const runSearch = useCallback(
    async (
      q: string,
      category: string,
      min: number | undefined,
      max: number | undefined,
    ) => {
      if (q.length === 1) return;
      setIsLoading(true);
      try {
        const result = await searchProducts({
          query: q,
          limit: 20,
          category: category || undefined,
          minPrice: min,
          maxPrice: max,
        });
        if (result.success) {
          const normalized: SearchProduct[] = result.products.map((p) => ({
            id: p.id,
            name: p.name,
            slug: p.slug ?? p.id,
            price: p.price,
            offerPrice: p.offerPrice,
            images:
              Array.isArray(p.images) ?
                (p.images as string[]).filter(
                  (img): img is string => typeof img === "string",
                )
              : [],
            categoryName: p.category?.name ?? "",
            categorySlug: p.category?.slug ?? "",
            subCategoryName: p.subCategory?.name ?? null,
          }));
          setProducts(normalized);
          setSuggestions(result.suggestions as SearchSuggestion[]);
        }
      } catch (err) {
        console.error("Search failed:", err);
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  // Suggestions-only fetch (as user types)
  const fetchSuggestions = useMemo(
    () =>
      debounce(async (q: string) => {
        if (q.length < 2) {
          setSuggestions([]);
          return;
        }
        const result = await searchProducts({ query: q, limit: 8 });
        if (result.success) {
          setSuggestions(result.suggestions as SearchSuggestion[]);
        }
      }, 300),
    [],
  );

  // Debounced live-search (below the input) — only after 2+ chars
  const liveSearch = useMemo(
    () =>
      debounce((q: string) => {
        runSearch(
          q,
          selectedCategory,
          priceRange.min ? Number(priceRange.min) : undefined,
          priceRange.max ? Number(priceRange.max) : undefined,
        );
      }, 500),
    [runSearch, selectedCategory, priceRange.min, priceRange.max],
  );

  // Cleanup debouncers on unmount
  useEffect(() => {
    return () => {
      fetchSuggestions.cancel();
      liveSearch.cancel();
    };
  }, [fetchSuggestions, liveSearch]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    setShowSuggestions(value.length >= 2);

    if (value.length >= 2) {
      fetchSuggestions(value);
      liveSearch(value);
    } else if (value.length === 0) {
      setSuggestions([]);
      setProducts([]);
    }
  };

  const submitSearch = (q: string) => {
    setShowSuggestions(false);
    liveSearch.cancel();
    pushToUrl(
      q,
      selectedCategory,
      priceRange.min ? String(priceRange.min) : "",
      priceRange.max ? String(priceRange.max) : "",
    );
    runSearch(
      q,
      selectedCategory,
      priceRange.min ? Number(priceRange.min) : undefined,
      priceRange.max ? Number(priceRange.max) : undefined,
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitSearch(searchQuery);
  };

  const handleSuggestionClick = (s: SearchSuggestion) => {
    if (s.type === "category") {
      // Go straight to the category page
      router.push(`/product-category/${s.slug}`);
    } else {
      // Go straight to the product detail page
      router.push(`/products/${s.slug}`);
    }
    setShowSuggestions(false);
  };

  const handleCategoryChange = (slug: string) => {
    setSelectedCategory(slug);
    runSearch(
      searchQuery,
      slug,
      priceRange.min ? Number(priceRange.min) : undefined,
      priceRange.max ? Number(priceRange.max) : undefined,
    );
    pushToUrl(
      searchQuery,
      slug,
      priceRange.min ? String(priceRange.min) : "",
      priceRange.max ? String(priceRange.max) : "",
    );
  };

  const applyPrice = () => {
    runSearch(
      searchQuery,
      selectedCategory,
      priceRange.min ? Number(priceRange.min) : undefined,
      priceRange.max ? Number(priceRange.max) : undefined,
    );
    pushToUrl(
      searchQuery,
      selectedCategory,
      priceRange.min ? String(priceRange.min) : "",
      priceRange.max ? String(priceRange.max) : "",
    );
  };

  const clearSearch = () => {
    setSearchQuery("");
    setShowSuggestions(false);
    setSuggestions([]);
    setProducts([]);
    setSelectedCategory("");
    setPriceRange({ min: "", max: "" });
    inputRef.current?.focus();
    router.push("/search");
  };

  // Sort is applied client-side to the currently loaded page
  const sortedProducts = useMemo(() => {
    const arr = [...products];
    switch (sortBy) {
      case "price_asc":
        return arr.sort((a, b) => a.price - b.price);
      case "price_desc":
        return arr.sort((a, b) => b.price - a.price);
      case "name_asc":
        return arr.sort((a, b) => a.name.localeCompare(b.name));
      default:
        return arr;
    }
  }, [products, sortBy]);

  // Close suggestions on outside click
  useEffect(() => {
    const onOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, []);

  return (
    <div>
      {/* SEARCH HEADER */}
      <div className="mb-8">
        <div className="relative" ref={searchRef}>
          <form onSubmit={handleSubmit} className="relative">
            <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              <Search className="size-5" />
            </div>
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={() =>
                searchQuery.length >= 2 && setShowSuggestions(true)
              }
              placeholder="Search products… (min. 2 characters)"
              className="w-full rounded-2xl border border-gray-200 bg-white py-4 pl-12 pr-12 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoComplete="off"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label="Clear search"
              >
                <X className="size-5" />
              </button>
            )}
          </form>

          {/* Suggestions */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute z-10 mt-2 w-full rounded-xl border border-gray-200 bg-white shadow-lg">
              <div className="max-h-96 overflow-y-auto py-2">
                {suggestions.map((s) => (
                  <button
                    key={`${s.type}-${s.id}`}
                    onClick={() => handleSuggestionClick(s)}
                    className="flex w-full items-center gap-3 px-4 py-2 text-left hover:bg-gray-50"
                  >
                    <span className="text-lg">{s.icon}</span>
                    <div>
                      <p className="text-sm text-gray-900">{s.text}</p>
                      <p className="text-xs capitalize text-gray-500">
                        {s.type}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Info */}
        {searchQuery && (
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              {isLoading ?
                <span className="flex items-center gap-2">
                  <Loader2 className="size-4 animate-spin" />
                  Searching…
                </span>
              : `${sortedProducts.length} result${
                  sortedProducts.length !== 1 ? "s" : ""
                } found for "${searchQuery}"`
              }
            </p>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-8 lg:flex-row">
        {/* FILTERS */}
        <aside className="space-y-6 lg:w-64">
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <h3 className="mb-3 font-semibold text-gray-900">Categories</h3>
            <div className="space-y-1">
              <button
                onClick={() => handleCategoryChange("")}
                className={`w-full rounded-lg px-2 py-1.5 text-left text-sm transition ${
                  !selectedCategory ?
                    "bg-blue-50 text-blue-600"
                  : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                All Categories
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryChange(cat.slug)}
                  className={`w-full rounded-lg px-2 py-1.5 text-left text-sm transition ${
                    selectedCategory === cat.slug ?
                      "bg-blue-50 text-blue-600"
                    : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <h3 className="mb-3 font-semibold text-gray-900">Price Range</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500">Min Price (Ksh)</label>
                <input
                  type="number"
                  value={priceRange.min}
                  onChange={(e) =>
                    setPriceRange((r) => ({ ...r, min: e.target.value }))
                  }
                  placeholder="0"
                  className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500">Max Price (Ksh)</label>
                <input
                  type="number"
                  value={priceRange.max}
                  onChange={(e) =>
                    setPriceRange((r) => ({ ...r, max: e.target.value }))
                  }
                  placeholder="Any"
                  className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                />
              </div>
              <button
                onClick={applyPrice}
                className="w-full rounded-lg bg-gray-900 py-2 text-sm font-medium text-white hover:bg-gray-800"
              >
                Apply
              </button>
            </div>
          </div>
        </aside>

        {/* RESULTS */}
        <section className="flex-1">
          <div className="mb-6 flex justify-end">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            >
              <option value="relevance">Sort by: Relevance</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="name_asc">Name: A to Z</option>
            </select>
          </div>

          {sortedProducts.length > 0 ?
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {sortedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          : searchQuery &&
            !isLoading && (
              <div className="py-12 text-center">
                <Package className="mx-auto size-16 text-gray-400" />
                <h3 className="mt-4 text-lg font-medium text-gray-900">
                  No products found
                </h3>
                <p className="mt-2 text-gray-500">
                  Try searching for something else or check your spelling
                </p>
                <button
                  onClick={clearSearch}
                  className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                >
                  Clear Search
                </button>
              </div>
            )
          }
        </section>
      </div>
    </div>
  );
};

/* =========================================================
   PRODUCT CARD
   ========================================================= */

function ProductCard({ product }: { product: SearchProduct }) {
  const hasOffer =
    product.offerPrice != null && product.offerPrice < product.price;
  const displayPrice = hasOffer ? product.offerPrice! : product.price;
  const imageUrl = product.images[0] ?? "/placeholder-image.jpg";

  return (
    <Link href={`/products/${product.slug}`} className="group">
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white transition-shadow hover:shadow-lg">
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
          {hasOffer && (
            <span className="absolute left-2 top-2 rounded-full bg-red-500 px-2 py-1 text-xs font-bold text-white">
              Sale!
            </span>
          )}
        </div>
        <div className="p-4">
          {product.categoryName && (
            <p className="text-xs text-gray-500">
              {product.categoryName}
              {product.subCategoryName ? ` · ${product.subCategoryName}` : ""}
            </p>
          )}
          <h3 className="mt-1 line-clamp-2 font-medium text-gray-900">
            {product.name}
          </h3>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-lg font-bold text-gray-900">
              Ksh {displayPrice.toLocaleString()}
            </span>
            {hasOffer && (
              <span className="text-sm text-gray-400 line-through">
                Ksh {product.price.toLocaleString()}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

export default SearchClient;
