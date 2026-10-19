// components/CategoryPageClient.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import ProductCard from '@/components/ProductCard';

// ============================================================
// TYPES
// ============================================================
interface Product {
  id: string;
  name: string;
  isAvailable: boolean;
  desc: string | null;
  images: string[];
  category: string;
  price: number;
  offerPrice: number | null;
  createdAt: Date;
  updatedAt: Date;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
  description?: string;
  productCount?: number;
  subCategories?: SubCategory[];
}

interface SubCategory {
  id: string;
  name: string;
  slug: string;
  productCount?: number;
}

interface CategoryPageClientProps {
  products: Product[];
  category: Category;
  totalProducts: number;
  currentPage: number;
  totalPages: number;
  currentSort: string;
  currentView: 'grid' | 'list';
  subCategory?: SubCategory;
}

// ============================================================
// MAIN CLIENT COMPONENT
// ============================================================
export function CategoryPageClient({
  products,
  category,
  totalProducts,
  currentPage,
  totalPages,
  currentSort,
  currentView,
  subCategory,
}: CategoryPageClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(currentView);

  const handleSortChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('sort', value);
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleViewChange = (view: 'grid' | 'list') => {
    setViewMode(view);
    const params = new URLSearchParams(searchParams.toString());
    params.set('view', view);
    router.push(`${pathname}?${params.toString()}`);
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  useEffect(() => {
    const viewParam = searchParams.get('view') as 'grid' | 'list';
    if (viewParam === 'grid' || viewParam === 'list') {
      setViewMode(viewParam);
    }
  }, [searchParams]);

  // Pagination component
  const Pagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisible = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);

    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    return (
      <div className="flex items-center justify-center gap-2 mt-8">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-2 rounded-lg border border-[#F5EBEO] hover:border-[#DBA39A] disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm text-[#3d2c28]"
        >
          Previous
        </button>
        
        {startPage > 1 && (
          <>
            <button
              onClick={() => handlePageChange(1)}
              className="w-10 h-10 rounded-lg hover:bg-[#F5EBEO] transition-colors text-sm text-[#3d2c28]"
            >
              1
            </button>
            {startPage > 2 && <span className="text-[#3d2c28]/40">...</span>}
          </>
        )}

        {Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i).map((page) => (
          <button
            key={page}
            onClick={() => handlePageChange(page)}
            className={`w-10 h-10 rounded-lg transition-colors text-sm ${
              page === currentPage
                ? 'bg-[#DBA39A] text-white shadow-md'
                : 'hover:bg-[#F5EBEO] text-[#3d2c28]'
            }`}
          >
            {page}
          </button>
        ))}

        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && <span className="text-[#3d2c28]/40">...</span>}
            <button
              onClick={() => handlePageChange(totalPages)}
              className="w-10 h-10 rounded-lg hover:bg-[#F5EBEO] transition-colors text-sm text-[#3d2c28]"
            >
              {totalPages}
            </button>
          </>
        )}

        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-2 rounded-lg border border-[#F5EBEO] hover:border-[#DBA39A] disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm text-[#3d2c28]"
        >
          Next
        </button>
      </div>
    );
  };

  return (
    <>
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <p className="text-sm text-[#3d2c28]/60">
            Showing <span className="font-medium text-[#3d2c28]">{products.length}</span> of{' '}
            <span className="font-medium text-[#3d2c28]">{totalProducts}</span> products
            {subCategory && (
              <span className="ml-1">
                in <span className="font-medium text-[#DBA39A]">{subCategory.name}</span>
              </span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View toggle */}
          <div className="flex border border-[#F5EBEO] rounded-lg overflow-hidden">
            <button
              onClick={() => handleViewChange('grid')}
              className={`p-2 transition-colors ${
                viewMode === 'grid'
                  ? 'bg-[#DBA39A] text-white'
                  : 'bg-white text-[#3d2c28]/40 hover:bg-[#F5EBEO]'
              }`}
              aria-label="Grid view"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => handleViewChange('list')}
              className={`p-2 transition-colors ${
                viewMode === 'list'
                  ? 'bg-[#DBA39A] text-white'
                  : 'bg-white text-[#3d2c28]/40 hover:bg-[#F5EBEO]'
              }`}
              aria-label="List view"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          {/* Sort */}
          <select
            value={currentSort}
            onChange={(e) => handleSortChange(e.target.value)}
            className="px-3 py-2 rounded-lg border border-[#F5EBEO] bg-white focus:outline-none focus:ring-2 focus:ring-[#DBA39A]/20 focus:border-[#DBA39A] text-sm text-[#3d2c28]"
          >
            <option value="relevance">Relevance</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="rating">Top Rated</option>
            <option value="newest">Newest</option>
          </select>
        </div>
      </div>

      {/* Products Grid */}
      {products.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-[#F5EBEO]">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-[#3d2c28] mb-2">No products found</h3>
          <p className="text-[#3d2c28]/60 max-w-md mx-auto">
            We couldn't find any products in this category. Check back later!
          </p>
          <Link
            href="/"
            className="mt-4 inline-block px-6 py-2 bg-[#DBA39A] hover:bg-[#c49087] text-white rounded-xl font-medium transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className={`grid gap-4 ${
          viewMode === 'grid'
            ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'
            : 'grid-cols-1'
        }`}>
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {/* Pagination */}
      <Pagination />
    </>
  );
}