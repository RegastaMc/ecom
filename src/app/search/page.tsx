import { Suspense } from 'react'
import { searchProducts } from '@/app/actions/search'
import SearchClient from '@/components/components/Ui/SearchClient'

interface SearchPageProps {
  searchParams: Promise<{
    q: string
    category?: string
    minPrice?: string
    maxPrice?: string
  }>
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams
  const query = params.q || ''
  const category = params.category
  const minPrice = params.minPrice ? parseFloat(params.minPrice) : undefined
  const maxPrice = params.maxPrice ? parseFloat(params.maxPrice) : undefined

  const { products, suggestions, success } = await searchProducts({
    query,
    limit: 20,
    category,
    minPrice,
    maxPrice,
  })

  const normalizedProducts = products.map((product) => ({
    ...product,
    images: Array.isArray(product.images)
      ? (product.images as string[]).filter(
          (img): img is string => typeof img === 'string',
        )
      : [],
  }))

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='container mx-auto px-4 py-8'>
        <Suspense fallback={<SearchSkeleton />}>
          <SearchClient
            initialProducts={normalizedProducts}
            initialSuggestions={suggestions}
            initialQuery={query}
            initialCategory={category}
            initialMinPrice={minPrice}
            initialMaxPrice={maxPrice}
          />
        </Suspense>
      </div>
    </div>
  )
}

function SearchSkeleton() {
  return (
    <div className='animate-pulse'>
      <div className='h-10 bg-gray-200 rounded-lg w-64 mb-8'></div>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
        {[...Array(8)].map((_, i) => (
          <div key={i} className='bg-gray-200 rounded-lg h-80'></div>
        ))}
      </div>
    </div>
  )
}
