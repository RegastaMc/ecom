// app/actions/product.ts
'use server';

import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';

// ============================================================
// TYPES
// ============================================================
export interface ProductFilters {
  category?: string;
  subCategory?: string;
  minPrice?: number;
  maxPrice?: number;
  isAvailable?: boolean;
  search?: string;
  sortBy?: 'newest' | 'price-asc' | 'price-desc' | 'popular' | 'rating';
  limit?: number;
  page?: number;
}

export interface ProductResponse {
  items: any[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ============================================================
// FETCH PRODUCTS WITH FILTERS
// ============================================================
export async function getProducts(filters: ProductFilters = {}): Promise<ProductResponse> {
  try {
    const {
      category,
      subCategory,
      minPrice,
      maxPrice,
      isAvailable = true,
      search,
      sortBy = 'newest',
      limit = 20,
      page = 1,
    } = filters;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      isAvailable,
    };

    if (category) {
      where.category = category;
    }

    if (subCategory) {
      where.subCategory = subCategory;
    }

    if (minPrice !== undefined) {
      where.price = { ...where.price, gte: minPrice };
    }

    if (maxPrice !== undefined) {
      where.price = { ...where.price, lte: maxPrice };
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { desc: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Build order by
    let orderBy: any = {};
    switch (sortBy) {
      case 'newest':
        orderBy = { createdAt: 'desc' };
        break;
      case 'price-asc':
        orderBy = { price: 'asc' };
        break;
      case 'price-desc':
        orderBy = { price: 'desc' };
        break;
      case 'popular':
        orderBy = { orderCount: 'desc' };
        break;
      case 'rating':
        orderBy = { rating: 'desc' };
        break;
      default:
        orderBy = { createdAt: 'desc' };
    }

    const [items, total] = await Promise.all([
      db.product.findMany({
        where,
        orderBy,
        skip,
        take: limit,
      }),
      db.product.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  } catch (error) {
    console.error('Error fetching products:', error);
    return {
      items: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    };
  }
}

// ============================================================
// FETCH TOP SELLING PRODUCTS
// ============================================================
export async function getTopSellingProducts(limit: number = 8): Promise<any[]> {
  try {
    const products = await db.product.findMany({
      where: {
        isAvailable: true,
      },
    
      take: limit,
    });
    return products;
  } catch (error) {
    console.error('Error fetching top selling products:', error);
    return [];
  }
}

// ============================================================
// FETCH NEW ARRIVALS
// ============================================================
export async function getNewArrivals(limit: number = 8): Promise<any[]> {
  try {
    const products = await db.product.findMany({
      where: {
        isAvailable: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });
    return products;
  } catch (error) {
    console.error('Error fetching new arrivals:', error);
    return [];
  }
}


export async function getProductsByCategory(category: string, limit: number = 4): Promise<any[]> {
  try {
    const products = await db.product.findMany({
      where: {
        category,
        isAvailable: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });
    return products;
  } catch (error) {
    console.error(`Error fetching products for category ${category}:`, error);
    return [];
  }
}

// ============================================================
// FETCH FEATURED PRODUCTS
// ============================================================
export async function getFeaturedProducts(limit: number = 6): Promise<any[]> {
  try {
    const products = await db.product.findMany({
      where: {
        isAvailable: true,       
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });
    return products;
  } catch (error) {
    console.error('Error fetching featured products:', error);
    return [];
  }
}

// ============================================================
// FETCH DISCOUNTED PRODUCTS
// ============================================================
export async function getDiscountedProducts(limit: number = 6): Promise<any[]> {
  try {
    const products = await db.product.findMany({
      where: {
        isAvailable: true,
        offerPrice: { not: null },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });
    return products;
  } catch (error) {
    console.error('Error fetching discounted products:', error);
    return [];
  }
}

// ============================================================
// FETCH SINGLE PRODUCT
// ============================================================
export async function getProductById(id: string): Promise<any | null> {
  try {
    const product = await db.product.findUnique({
      where: { id },
    });
    return product;
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
}

export async function getProductBySlug(slug: string): Promise<any | null> {
  try {
    const product = await db.product.findUnique({
      where: { slug },
    });
    return product;
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
}