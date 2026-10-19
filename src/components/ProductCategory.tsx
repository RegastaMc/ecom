// app/product-category/[slug]/CategoryPageClient.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import Image from 'next/image';


interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating: number;
  reviews: number;
  inStock: boolean;
  isNew?: boolean;
  isSale?: boolean;
}

interface CategoryPageClientProps {
  products: Product[];
  category: {
    id: string;
    name: string;
    slug: string;
  };
  totalProducts: number;
  currentPage: number;
  totalPages: number;
  currentSort: string;
  currentView: 'grid' | 'list';
}

const Icons = {
  Grid: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  ),
  List: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  ),
  Star: ({ filled = false }: { filled?: boolean }) => (
    <svg className={`w-4 h-4 ${filled ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>
  ),
};


const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <Link
      href={`/product/${product.slug}`}
      className="group bg-white rounded-2xl overflow-hidden border border-[#F5EBEO] hover:border-[#DBA39A]/30 hover:shadow-lg transition-all duration-300"
    >
      <div className="relative aspect-square bg-[#FEFCF3] flex items-center justify-center p-4">
        <Image
          src={product.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(product.name)}&size=200&background=DBA39A&color=ffffff&bold=true`}
          alt={product.name}
          width={200}
          height={200}
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Badges */}
        {product.isNew && (
          <span className="absolute top-3 left-3 bg-[#DBA39A] text-white text-xs font-semibold px-3 py-1 rounded-full shadow-md">
            New
          </span>
        )}
        {product.isSale && product.originalPrice && (
          <span className="absolute top-3 right-3 bg-[#F0DBDB] text-[#3d2c28] text-xs font-semibold px-3 py-1 rounded-full shadow-md">
            -{discount}%
          </span>
        )}
        
        {/* Out of Stock Overlay */}
        {!product.inStock && (
          <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px] flex items-center justify-center">
            <span className="bg-white/90 text-[#3d2c28] font-bold px-4 py-2 rounded-full text-sm shadow-lg">
              Out of Stock
            </span>
          </div>
        )}
      </div>
      
      <div className="p-4">
        <h3 className="font-semibold text-[#3d2c28] text-sm truncate">{product.name}</h3>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-lg font-bold text-[#DBA39A]">
            ${product.price.toFixed(2)}
          </span>
          {product.originalPrice && (
            <span className="text-sm text-[#3d2c28]/40 line-through">
              ${product.originalPrice.toFixed(2)}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Icons.Star key={i} filled={i < Math.floor(product.rating)} />
            ))}
            <span className="text-xs text-[#3d2c28]/40 ml-1">
              ({product.reviews})
            </span>
          </div>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('Added to wishlist:', product.id);
            }}
            className="p-1.5 hover:bg-[#F5EBEO] rounded-full transition-colors"
          >
            <svg className="w-4 h-4 text-[#3d2c28]/40 hover:text-[#DBA39A] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        </div>
      </div>
    </Link>
  );
};

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
}: CategoryPageClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(currentView);

  // Update URL when sort changes
  const handleSortChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('sort', value);
    router.push(`${pathname}?${params.toString()}`);
  };

  // Update URL when view changes
  const handleViewChange = (view: 'grid' | 'list') => {
    setViewMode(view);
    const params = new URLSearchParams(searchParams.toString());
    params.set('view', view);
    router.push(`${pathname}?${params.toString()}`);
  };

  // Update URL when page changes
  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  // Load view from URL on mount
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
    const endPage = Math.min(totalPages, startPage + maxVisible - 1);

    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    return (
      <div className="flex items-center justify-center gap-2 mt-8">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-2 rounded-lg border border-[#F5EBEO] hover:border-[#DBA39A] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Previous
        </button>
        
        {startPage > 1 && (
          <>
            <button
              onClick={() => handlePageChange(1)}
              className="w-10 h-10 rounded-lg hover:bg-[#F5EBEO] transition-colors"
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
            className={`w-10 h-10 rounded-lg transition-colors ${
              page === currentPage
                ? 'bg-[#DBA39A] text-white shadow-md'
                : 'hover:bg-[#F5EBEO]'
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
              className="w-10 h-10 rounded-lg hover:bg-[#F5EBEO] transition-colors"
            >
              {totalPages}
            </button>
          </>
        )}

        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-2 rounded-lg border border-[#F5EBEO] hover:border-[#DBA39A] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
              <Icons.Grid />
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
              <Icons.List />
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
            We could not find any products in this category. Check back later!
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