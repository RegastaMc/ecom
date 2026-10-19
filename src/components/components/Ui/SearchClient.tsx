'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Search, X, TrendingUp, Package, Tag, Loader2 } from 'lucide-react'
import { searchProducts, getSearchSuggestions } from '@/app/actions/search'
import { debounce } from 'lodash'
import { mockCategories } from '@/components/CategoriesSection'



interface Product {
  id: string
  name: string
  price: number
  offerPrice: number | null
  images: string[]
  category: string
}

interface SearchClientProps {
  initialProducts: Product[]
  initialSuggestions: any[]
  initialQuery: string
  initialCategory?: string
  initialMinPrice?: number
  initialMaxPrice?: number
}

const SearchClient = ({
  initialProducts,
  initialSuggestions,
  initialQuery,
  initialCategory,
  initialMinPrice,
  initialMaxPrice,
}: SearchClientProps) => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState(initialQuery)
  const [products, setProducts] = useState(initialProducts)
  const [suggestions, setSuggestions] = useState(initialSuggestions)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState(
    initialCategory || '',
  )
  const [priceRange, setPriceRange] = useState({
    min: initialMinPrice || '',
    max: initialMaxPrice || '',
  })
  const [sortBy, setSortBy] = useState('relevance')

  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(
      async (
        query: string,
        category: string,
        minPrice: number | '',
        maxPrice: number | '',
      ) => {
        if (query.length >= 2 || query.length === 0) {
          setIsLoading(true)

          const params = new URLSearchParams()
          if (query) params.set('q', query)
          if (category) params.set('category', category)
          if (minPrice) params.set('minPrice', minPrice.toString())
          if (maxPrice) params.set('maxPrice', maxPrice.toString())

          router.push(`/search?${params.toString()}`, { scroll: false })

          const result = await searchProducts({
            query,
            limit: 20,
            category: category || undefined,
            minPrice: minPrice || undefined,
            maxPrice: maxPrice || undefined,
          })

          if (result.success) {
            setProducts(result.products as Product[])
            setSuggestions(result.suggestions)
          }

          setIsLoading(false)
        }
      },
      500,
    ),
    [router],
  )

  const categories = mockCategories

  // Get suggestions as user types
  const fetchSuggestions = useCallback(
    debounce(async (query: string) => {
      if (query.length >= 2) {
        const result = await getSearchSuggestions(query)
        if (result.success) {
          // Update suggestions display
        }
      }
    }, 300),
    [],
  )

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchQuery(value)
    setShowSuggestions(value.length >= 2)

    if (value.length >= 2 || value.length === 0) {
      fetchSuggestions(value)
      debouncedSearch(
        value,
        selectedCategory,
        priceRange.min ? Number(priceRange.min) : '',
        priceRange.max ? Number(priceRange.max) : '',
      )
    } else {
      setSuggestions([])
      setProducts([])
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion)
    setShowSuggestions(false)
    debouncedSearch(
      suggestion,
      selectedCategory,
      priceRange.min ? Number(priceRange.min) : '',
      priceRange.max ? Number(priceRange.max) : '',
    )
  }

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
    debouncedSearch(searchQuery, category, priceRange.min ? Number(priceRange.min) : '', priceRange.max ? Number(priceRange.max) : '')
  }

  const handlePriceChange = (type: 'min' | 'max', value: string) => {
    const newRange = { ...priceRange, [type]: value }
    setPriceRange(newRange)
    debouncedSearch(searchQuery, selectedCategory, newRange.min ? Number(newRange.min) : '', newRange.max ? Number(newRange.max) : '')
  }

  const handleSort = (sort: string) => {
    setSortBy(sort)
    const sortedProducts = [...products]

    switch (sort) {
      case 'price_asc':
        sortedProducts.sort((a, b) => a.price - b.price)
        break
      case 'price_desc':
        sortedProducts.sort((a, b) => b.price - a.price)
        break
      case 'name_asc':
        sortedProducts.sort((a, b) => a.name.localeCompare(b.name))
        break
      default:
        // relevance - keep original order
        break
    }

    setProducts(sortedProducts)
  }

  const clearSearch = () => {
    setSearchQuery('')
    setShowSuggestions(false)
    setSuggestions([])
    setProducts([])
    inputRef.current?.focus()
    router.push('/search')
  }

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div>
      {/* Search Header */}
      <div className='mb-8'>
        <div className='relative' ref={searchRef}>
          <div className='relative'>
            <div className='absolute left-4 top-1/2 -translate-y-1/2 text-gray-400'>
              <Search className='h-5 w-5' />
            </div>
            <input
              ref={inputRef}
              type='text'
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={() =>
                searchQuery.length >= 2 && setShowSuggestions(true)
              }
              placeholder='Search products... (min. 2 characters)'
              className='w-full rounded-2xl border border-gray-200 bg-white py-4 pl-12 pr-12 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500'
              autoComplete='off'
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className='absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600'
              >
                <X className='h-5 w-5' />
              </button>
            )}
          </div>

          {/* Search Suggestions Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className='absolute z-10 mt-2 w-full rounded-xl border border-gray-200 bg-white shadow-lg'>
              <div className='max-h-96 overflow-y-auto py-2'>
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion.text)}
                    className='flex w-full items-center gap-3 px-4 py-2 text-left hover:bg-gray-50'
                  >
                    <span className='text-lg'>{suggestion.icon}</span>
                    <div>
                      <p className='text-sm text-gray-900'>{suggestion.text}</p>
                      <p className='text-xs text-gray-500 capitalize'>
                        {suggestion.type}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Search Info */}
        {searchQuery && (
          <div className='mt-4 flex items-center justify-between'>
            <p className='text-sm text-gray-600'>
              {isLoading ? (
                <span className='flex items-center gap-2'>
                  <Loader2 className='h-4 w-4 animate-spin' />
                  Searching...
                </span>
              ) : (
                `${products.length} result${products.length !== 1 ? 's' : ''} found for "${searchQuery}"`
              )}
            </p>
          </div>
        )}
      </div>

      <div className='flex flex-col lg:flex-row gap-8'>
        {/* Filters Sidebar */}
        <div className='lg:w-64 space-y-6'>
          {/* Category Filter */}
          <div className='rounded-xl border border-gray-200 bg-white p-4'>
            <h3 className='mb-3 font-semibold text-gray-900'>Categories</h3>
            <div className='space-y-2'>
              <button
                onClick={() => handleCategoryChange('')}
                className={`w-full text-left px-2 py-1 rounded-lg text-sm transition ${
                  !selectedCategory
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                All Categories
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.name}
                  onClick={() => handleCategoryChange(cat.slug)}
                  className={`w-full text-left px-2 py-1 rounded-lg text-sm transition ${
                    selectedCategory === cat.slug
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Price Filter */}
          <div className='rounded-xl border border-gray-200 bg-white p-4'>
            <h3 className='mb-3 font-semibold text-gray-900'>Price Range</h3>
            <div className='space-y-3'>
              <div>
                <label className='text-xs text-gray-500'>Min Price (Ksh)</label>
                <input
                  type='number'
                  value={priceRange.min}
                  onChange={(e) => handlePriceChange('min', e.target.value)}
                  placeholder='0'
                  className='mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm'
                />
              </div>
              <div>
                <label className='text-xs text-gray-500'>Max Price (Ksh)</label>
                <input
                  type='number'
                  value={priceRange.max}
                  onChange={(e) => handlePriceChange('max', e.target.value)}
                  placeholder='Any'
                  className='mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm'
                />
              </div>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className='flex-1'>
          {/* Sort Options */}
          <div className='mb-6 flex justify-end'>
            <select
              value={sortBy}
              onChange={(e) => handleSort(e.target.value)}
              className='rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none'
            >
              <option value='relevance'>Sort by: Relevance</option>
              <option value='price_asc'>Price: Low to High</option>
              <option value='price_desc'>Price: High to Low</option>
              <option value='name_asc'>Name: A to Z</option>
            </select>
          </div>

          {/* Products */}
          {products.length > 0 ? (
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            searchQuery &&
            !isLoading && (
              <div className='text-center py-12'>
                <Package className='mx-auto h-16 w-16 text-gray-400' />
                <h3 className='mt-4 text-lg font-medium text-gray-900'>
                  No products found
                </h3>
                <p className='mt-2 text-gray-500'>
                  Try searching for something else or check your spelling
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('')
                    clearSearch()
                  }}
                  className='mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700'
                >
                  Clear Search
                </button>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  )
}

// Product Card Component
function ProductCard({ product }: { product: Product }) {
  const hasOffer = product.offerPrice && product.offerPrice < product.price
  const displayPrice = hasOffer ? product.offerPrice! : product.price
  const imageUrl = product.images?.[0] || '/placeholder-image.jpg'

  return (
    <Link href={`/products/${product.id}`} className='group'>
      <div className='overflow-hidden rounded-xl border border-gray-200 bg-white transition-shadow hover:shadow-lg'>
        <div className='relative aspect-square overflow-hidden bg-gray-100'>
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            className='object-cover transition-transform group-hover:scale-105'
          />
          {hasOffer && (
            <span className='absolute left-2 top-2 rounded-full bg-red-500 px-2 py-1 text-xs font-bold text-white'>
              Sale!
            </span>
          )}
        </div>
        <div className='p-4'>
          <p className='text-xs text-gray-500'>{product.category}</p>
          <h3 className='mt-1 font-medium text-gray-900 line-clamp-2'>
            {product.name}
          </h3>
          <div className='mt-2 flex items-baseline gap-2'>
            <span className='text-lg font-bold text-gray-900'>
              Ksh {displayPrice.toLocaleString()}
            </span>
            {hasOffer && (
              <span className='text-sm text-gray-400 line-through'>
                Ksh {product.price.toLocaleString()}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}

export default SearchClient
