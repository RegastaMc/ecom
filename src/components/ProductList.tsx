'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import Categories from './Categories'
import ProductCard from './ProductCard'
import Link from 'next/link'
import Filter from './Filter'
import { getAllProducts } from '@/app/actions/getProducts'
import { Package, ArrowRight, Loader2 } from 'lucide-react'

interface ProductListProps {
  initialCategory?: string | null
  params: 'homepage' | 'products'
}

const ProductList = ({ initialCategory = null, params }: ProductListProps) => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Get category from URL or props
  const urlCategory = searchParams.get('category')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    initialCategory || urlCategory || null,
  )

  // Workaround for missing/unknown Categories prop types
  const CategoriesComp = Categories as any

  // Fetch all products on mount
  useEffect(() => {
    fetchProducts()
  }, [])

  // Sync selected category with URL changes
  useEffect(() => {
    const newCategory = searchParams.get('category')
    if (newCategory !== selectedCategory) {
      setSelectedCategory(newCategory || null)
    }
  }, [searchParams])

  const fetchProducts = async () => {
    setLoading(true)
    const result = await getAllProducts()
    if (result.success) {
      setProducts(result.products || [])
      setError(null)
    } else {
      setError(result.error || 'Failed to load products')
    }
    setLoading(false)
  }

  // Filter products based on selected category
  const filteredProducts = products.filter((product) => {
    if (!selectedCategory || selectedCategory === 'all') {
      return product.isAvailable
    }
    return (
      product.category?.toLowerCase() === selectedCategory.toLowerCase() &&
      product.isAvailable
    )
  })

  const handleCategoryChange = useCallback(
    (category: string | null) => {
      setSelectedCategory(category)

      // Update URL
      const params = new URLSearchParams(searchParams)
      if (category) {
        params.set('category', category)
      } else {
        params.delete('category')
      }
      router.push(`${pathname}?${params.toString()}`, { scroll: false })
    },
    [router, pathname, searchParams],
  )

  if (loading) {
    return (
      <div className='w-full text-center py-12'>
        <div className='flex flex-col items-center justify-center gap-3'>
          <Loader2 className='w-8 h-8 text-blue-600 animate-spin' />
          <p className='text-gray-500'>Loading products...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className='w-full text-center py-12'>
        <div className='bg-red-50 rounded-lg p-6 max-w-md mx-auto'>
          <Package className='w-12 h-12 text-red-400 mx-auto mb-3' />
          <h3 className='text-lg font-semibold text-red-800 mb-2'>
            Error Loading Products
          </h3>
          <p className='text-red-600'>{error}</p>
          <button
            onClick={fetchProducts}
            className='mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition'
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className='w-full'>
      {/* Categories Section */}
      <CategoriesComp
        onCategoryChange={handleCategoryChange}
        initialCategory={selectedCategory}
      />

      {/* Filter Section (only for products page) */}
      {params === 'products' && <Filter />}

      {/* Results Info */}
      <div className='flex items-center justify-between mb-6 flex-wrap gap-3'>
        <div>
          <h2 className='text-xl font-semibold text-gray-900'>
            {selectedCategory && selectedCategory !== 'all'
              ? `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Products`
              : 'All Products'}
          </h2>
          <p className='text-sm text-gray-500 mt-1'>
            Showing {filteredProducts.length} product
            {filteredProducts.length !== 1 ? 's' : ''}
          </p>
        </div>

        {selectedCategory && selectedCategory !== 'all' && (
          <button
            onClick={() => handleCategoryChange('all')}
            className='text-sm text-blue-600 hover:text-blue-700 transition'
          >
            Clear filter
          </button>
        )}
      </div>

      {/* Products Grid */}
      {filteredProducts.length > 0 ? (
        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6'>
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className='text-center py-12 bg-gray-50 rounded-xl'>
          <Package className='w-16 h-16 text-gray-400 mx-auto mb-4' />
          <h3 className='text-lg font-medium text-gray-900 mb-2'>
            No products found
          </h3>
          <p className='text-gray-500 mb-6'>
            {selectedCategory && selectedCategory !== 'all'
              ? `No products available in ${selectedCategory} category`
              : 'No products available at the moment'}
          </p>
          {selectedCategory && selectedCategory !== 'all' && (
            <button
              onClick={() => handleCategoryChange('all')}
              className='inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium'
            >
              View all products
              <ArrowRight className='w-4 h-4' />
            </button>
          )}
        </div>
      )}

      {/* View All Products Link (only for homepage) */}
      {params === 'homepage' &&
        filteredProducts.length > 0 &&
        selectedCategory &&
        selectedCategory !== 'all' && (
          <div className='flex justify-end mt-8'>
            <Link
              href={`/products?category=${selectedCategory}`}
              className='inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition'
            >
              View all {selectedCategory} products
              <ArrowRight className='w-4 h-4' />
            </Link>
          </div>
        )}
    </div>
  )
}

export default ProductList
