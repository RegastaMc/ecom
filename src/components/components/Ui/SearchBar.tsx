"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  X,
  TrendingUp,
  Package,
  Tag,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { debounce } from "lodash";
import { getSearchSuggestions } from "@/app/actions/search";

const SearchBar = () => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<{
    products: any[];
    categories: { id: string; name: string; slug: string }[];
  }>({ products: [], categories: [] });
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const fetchSuggestions = useCallback(
    debounce(async (searchQuery: string) => {
      if (searchQuery.length >= 2) {
        setIsLoading(true);
        const result = await getSearchSuggestions(searchQuery);
        if (result.success) {
          const suggestionsData =
            Array.isArray(result.suggestions) ?
              { products: [], categories: [] }
            : result.suggestions;
          setSuggestions(suggestionsData);
        }
        setIsLoading(false);
      } else {
        setSuggestions({ products: [], categories: [] });
      }
    }, 300),
    [],
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setShowSuggestions(value.length >= 2);
    fetchSuggestions(value);
  };

  const handleSearch = () => {
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
      setShowSuggestions(false);
      setIsFocused(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    router.push(`/search?q=${encodeURIComponent(suggestion)}`);
    setShowSuggestions(false);
    setIsFocused(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const clearSearch = () => {
    setQuery("");
    setSuggestions({ products: [], categories: [] });
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
        setIsFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Popular searches (you can fetch these from your API)
  const popularSearches = [
    "Electronics",
    "Clothing",
    "Shoes",
    "Books",
    "Phones",
  ];

  return (
    <div ref={searchRef} className="relative w-full">
      {/* Search Input Container */}
      <div
        className={`relative flex items-center rounded-2xl transition-all duration-300 ${
          isFocused ?
            "bg-white shadow-lg ring-2 ring-blue-500"
          : "bg-gray-50 hover:bg-gray-100"
        }`}
      >
        {/* Search Icon */}
        <div className="absolute left-4 text-gray-400">
          <Search className="h-5 w-5" />
        </div>

        {/* Input Field */}
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            setIsFocused(true);
            if (query.length >= 2) setShowSuggestions(true);
          }}
          placeholder="Search laptops, phones, etc..."
          className="w-full bg-transparent py-3.5 pl-12 pr-24 text-gray-900 placeholder:text-gray-400 focus:outline-none"
          autoComplete="off"
        />

        {/* Clear Button */}
        {query && (
          <button
            onClick={clearSearch}
            className="absolute right-20 text-gray-400 transition-colors hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        {/* Search Button */}
        <button
          onClick={handleSearch}
          disabled={!query.trim()}
          className="absolute right-1.5 flex items-center gap-2 rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 px-4 py-1.5 text-sm font-medium text-white transition-all hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Search className="h-4 w-4" />
          <span className="hidden sm:inline">Search</span>
        </button>
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 animate-in slide-in-from-top-2 duration-200">
          <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl">
            <div className="max-h-96 overflow-y-auto">
              {/* Recent/Popular Searches */}
              {!query && popularSearches.length > 0 && (
                <div className="border-b border-gray-100 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="h-4 w-4 text-blue-600" />
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Popular Searches
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {popularSearches.map((term, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSuggestionClick(term)}
                        className="rounded-full bg-gray-100 px-3 py-1.5 text-sm text-gray-700 transition hover:bg-gray-200"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Category Suggestions */}
              {suggestions.categories.length > 0 && (
                <div className="border-b border-gray-100 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Tag className="h-4 w-4 text-green-600" />
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Categories
                    </p>
                  </div>
                  <div className="space-y-1">
                    {suggestions.categories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => handleSuggestionClick(cat.name)}
                        className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left transition hover:bg-gray-50"
                      >
                        <span className="text-sm text-gray-700">{cat.name}</span>
                        <ArrowRight className="h-3 w-3 text-gray-400" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Product Suggestions */}
              {suggestions.products.length > 0 && (
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Package className="h-4 w-4 text-purple-600" />
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Products
                    </p>
                  </div>
                  <div className="space-y-2">
                    {suggestions.products.slice(0, 5).map((product) => (
                      <button
                        key={product.id}
                        onClick={() => handleSuggestionClick(product.name)}
                        className="flex w-full items-center gap-3 rounded-lg p-2 transition hover:bg-gray-50"
                      >
                        {/* Product Image Placeholder */}
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100">
                          {product.images?.[0] ?
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              className="h-full w-full rounded-lg object-cover"
                            />
                          : <Package className="h-6 w-6 text-gray-400" />}
                        </div>
                        <div className="flex-1 text-left">
                          <p className="text-sm font-medium text-gray-900 line-clamp-1">
                            {product.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            Ksh {product.price.toLocaleString()}
                          </p>
                        </div>
                        <ArrowRight className="h-3 w-3 text-gray-400" />
                      </button>
                    ))}
                  </div>

                  {suggestions.products.length > 5 && (
                    <button
                      onClick={() => handleSearch()}
                      className="mt-3 w-full rounded-lg bg-gray-50 px-3 py-2 text-center text-sm text-blue-600 transition hover:bg-gray-100"
                    >
                      View all {suggestions.products.length} products
                    </button>
                  )}
                </div>
              )}

              {/* Loading State */}
              {isLoading && (
                <div className="flex items-center justify-center gap-2 p-8">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
                  <p className="text-sm text-gray-500">Searching...</p>
                </div>
              )}

              {/* No Results */}
              {query.length >= 2 &&
                !isLoading &&
                suggestions.products.length === 0 &&
                suggestions.categories.length === 0 && (
                  <div className="p-8 text-center">
                    <Sparkles className="mx-auto h-8 w-8 text-gray-300" />
                    <p className="mt-2 text-sm text-gray-500">
                      No results found for "{query}"
                    </p>
                    <p className="text-xs text-gray-400">
                      Try searching for something else
                    </p>
                  </div>
                )}
            </div>
          </div>
        </div>
      )}

      {/* Loading Indicator Overlay */}
      {isLoading && (
        <div className="absolute right-24 top-1/2 -translate-y-1/2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
        </div>
      )}
    </div>
  );
};

export default SearchBar;
