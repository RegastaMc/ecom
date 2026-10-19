'use client'


import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { mockCategories } from './CategoriesSection'

const cats = mockCategories

const Categories = () => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const selectedCategory = searchParams.get('category')

  const handleChange = (slug: string) => {
    const params = new URLSearchParams(searchParams)
    if (slug === 'all') {
      params.delete('category')
    } else {
      params.set('category', slug)
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }

  const isActive = (slug: string) => {
    if (slug === 'all' && !selectedCategory) return true
    return selectedCategory === slug
  }

  return (
    <div className='w-full mb-8'>
      {/* Categories Header */}
      <div className='flex items-center justify-between mb-4'>
        <h2 className='text-lg font-semibold text-gray-900'>
          Shop by Category
        </h2>
        {selectedCategory && (
          <button
            onClick={() => handleChange('all')}
            className='text-sm text-blue-600 hover:text-blue-700 transition'
          >
            Clear filter
          </button>
        )}
      </div>

      {/* Categories Tabs */}
      <div className='flex flex-wrap gap-2'>
        {/* All Categories Tab */}
        <button
          onClick={() => handleChange('all')}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
            isActive('all')
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-200'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All
        </button>

        {/* Category Tabs */}
        {cats.map((category) => (
          <button
            key={category.name}
            onClick={() => handleChange(category.slug)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
              isActive(category.slug)
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-200'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {/* {category.image && <category.image />} */}
            {category.name}
          </button>
        ))}
      </div>
    </div>
  )
}

export default Categories
