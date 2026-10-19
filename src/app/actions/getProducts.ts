'use server'

import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'

export async function getAllProducts() {
  try {
    const products = await db.product.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    })

    return {
      success: true,
      products,
    }
  } catch (error) {
    console.error('Error fetching products:', error)
    return {
      success: false,
      error: 'Failed to fetch products',
      products: [],
    }
  }
}

interface GetProductsParams {
  category?: string
  search?: string
  minPrice?: number
  maxPrice?: number
  isAvailable?: boolean
  sortBy?: 'name' | 'price' | 'createdAt' | 'updatedAt'
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
}

export async function getProducts(params: GetProductsParams = {}) {
  try {
    const {
      category,
      search,
      minPrice,
      maxPrice,
      isAvailable,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 10,
    } = params

    // Build where clause
    const where: any = {}

    if (category) {
      where.category = category
    }

    if (isAvailable !== undefined) {
      where.isAvailable = isAvailable
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { desc: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {}
      if (minPrice !== undefined) {
        where.price.gte = minPrice
      }
      if (maxPrice !== undefined) {
        where.price.lte = maxPrice
      }
    }

    // Calculate pagination
    const skip = (page - 1) * limit

    // Get total count for pagination
    const totalCount = await db.product.count({ where })

    // Get products with pagination
    const products = await db.product.findMany({
      where,
      orderBy: {
        [sortBy]: sortOrder,
      },
      skip,
      take: limit,
    })

    return {
      success: true,
      products,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalItems: totalCount,
        itemsPerPage: limit,
      },
    }
  } catch (error) {
    console.error('Error fetching products:', error)
    return {
      success: false,
      error: 'Failed to fetch products',
      products: [],
      pagination: null,
    }
  }
}
export async function getProductById(id: string) {
  try {
    if (!id) {
      return {
        success: false,
        error: 'Product ID is required',
        product: null,
      }
    }

    const product = await db.product.findUnique({
      where: { id },
      include: {
        orderItems: true, // Include related order items if needed
      },
    })

    if (!product) {
      return {
        success: false,
        error: 'Product not found',
        product: null,
      }
    }

    return {
      success: true,
      product,
    }
  } catch (error) {
    console.error('Error fetching product:', error)
    return {
      success: false,
      error: 'Failed to fetch product',
      product: null,
    }
  }
}
export async function getProductsByCategory(category: string, limit?: number) {
  try {
    const products = await db.product.findMany({
      where: {
        category,
        isAvailable: true, // Only show available products
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit, // Optional limit
    })

    return {
      success: true,
      products,
      category,
    }
  } catch (error) {
    console.error('Error fetching products by category:', error)
    return {
      success: false,
      error: 'Failed to fetch products',
      products: [],
    }
  }
}

export async function getFeaturedProducts(limit: number = 8) {
  try {
    const products = await db.product.findMany({
      where: {
        isAvailable: true,
        offerPrice: {
          not: null, // Products with offer price
        },
      },
      orderBy: {
        offerPrice: 'asc', // Show biggest discounts first
      },
      take: limit,
    })

    return {
      success: true,
      products,
    }
  } catch (error) {
    console.error('Error fetching featured products:', error)
    return {
      success: false,
      error: 'Failed to fetch featured products',
      products: [],
    }
  }
}
export async function getProductStats() {
  try {
    const [totalProducts, availableProducts, categories, priceStats] =
      await Promise.all([
        db.product.count(),
        db.product.count({ where: { isAvailable: true } }),
        db.product.groupBy({
          by: ['category'],
          _count: {
            category: true,
          },
        }),
        db.product.aggregate({
          _min: {
            price: true,
          },
          _max: {
            price: true,
          },
          _avg: {
            price: true,
          },
        }),
      ])

    return {
      success: true,
      stats: {
        totalProducts,
        availableProducts,
        unavailableProducts: totalProducts - availableProducts,
        categories: categories.map((cat) => ({
          name: cat.category,
          count: cat._count.category,
        })),
        priceRange: {
          min: priceStats._min.price,
          max: priceStats._max.price,
          avg: priceStats._avg.price,
        },
      },
    }
  } catch (error) {
    console.error('Error fetching product stats:', error)
    return {
      success: false,
      error: 'Failed to fetch product statistics',
      stats: null,
    }
  }
}
interface SearchProductsParams {
  query: string
  category?: string
  minPrice?: number
  maxPrice?: number
  sortBy?: 'relevance' | 'price_asc' | 'price_desc' | 'newest'
  page?: number
  limit?: number
}

export async function searchProducts(params: SearchProductsParams) {
  try {
    const {
      query,
      category,
      minPrice,
      maxPrice,
      sortBy = 'relevance',
      page = 1,
      limit = 20,
    } = params

    const where: any = {
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { desc: { contains: query, mode: 'insensitive' } },
      ],
      isAvailable: true,
    }

    if (category) {
      where.category = category
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {}
      if (minPrice !== undefined) where.price.gte = minPrice
      if (maxPrice !== undefined) where.price.lte = maxPrice
    }

    let orderBy: any = {}

    switch (sortBy) {
      case 'price_asc':
        orderBy = { price: 'asc' }
        break
      case 'price_desc':
        orderBy = { price: 'desc' }
        break
      case 'newest':
        orderBy = { createdAt: 'desc' }
        break
      case 'relevance':
      default:
        // For relevance, we'll sort by name match and then price
        orderBy = [{ name: 'asc' }, { price: 'asc' }]
        break
    }

    const skip = (page - 1) * limit
    const totalCount = await db.product.count({ where })

    const products = await db.product.findMany({
      where,
      orderBy,
      skip,
      take: limit,
    })

    return {
      success: true,
      products,
      searchInfo: {
        query,
        totalResults: totalCount,
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
      },
    }
  } catch (error) {
    console.error('Error searching products:', error)
    return {
      success: false,
      error: 'Failed to search products',
      products: [],
      searchInfo: null,
    }
  }
}
