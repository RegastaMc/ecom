'use server';

import { mockCategories } from '@/components/CategoriesSection';
import { db } from '@/lib/db';

interface SearchParams {
  query: string;
  limit?: number;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
}

export async function searchProducts({ 
  query, 
  limit = 10, 
  category, 
  minPrice, 
  maxPrice 
}: SearchParams) {
  try {
    if (!query || query.length < 2) {
      return { success: true, products: [], suggestions: [] };
    }

    // Search products
    const products = await db.product.findMany({
      where: {
        AND: [
          {
            OR: [
              { name: { contains: query, mode: 'insensitive' } },
              { desc: { contains: query, mode: 'insensitive' } },
              { category: { contains: query, mode: 'insensitive' } },
            ],
          },
          category ? { category } : {},
          minPrice ? { price: { gte: minPrice } } : {},
          maxPrice ? { price: { lte: maxPrice } } : {},
        ],
        isAvailable: true,
      },
      take: limit,
      orderBy: {
        name: 'asc',
      },
    });

    // Generate search suggestions based on matching terms
    const suggestions = await generateSuggestions(query);

    return {
      success: true,
      products,
      suggestions,
      total: products.length,
    };
  } catch (error) {
    console.error('Search error:', error);
    return {
      success: false,
      error: 'Failed to search products',
      products: [],
      suggestions: [],
    };
  }
}

async function generateSuggestions(query: string) {
  if (query.length < 2) return [];

  // Get unique categories that match the search
  const categories = await db.product.findMany({
    where: {
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { category: { contains: query, mode: 'insensitive' } },
      ],
    },
    select: {
      category: true,
    },
    distinct: ['category'],
    take: 5,
  });

  // Get popular search terms from existing products
  const popularNames = await db.product.findMany({
    where: {
      name: { contains: query, mode: 'insensitive' },
    },
    select: {
      name: true,
    },
    take: 5,
  });

  const suggestions = [
    ...categories.map(c => ({ type: 'category', text: c.category, icon: '🏷️' })),
    ...popularNames.map(p => ({ type: 'product', text: p.name, icon: '📦' })),
  ];

  // Remove duplicates
  return suggestions.filter((v, i, a) => a.findIndex(t => t.text === v.text) === i);
}

// Get search suggestions (for autocomplete)
export async function getSearchSuggestions(query: string) {
  try {
    if (!query || query.length < 2) {
      return { success: true, suggestions: [] };
    }

    const products = await db.product.findMany({
      where: {
        name: { contains: query, mode: 'insensitive' },
        isAvailable: true,
      },
      select: {
        id: true,
        name: true,
        price: true,
        images: true,
      },
      take: 8,
    });

    // const categories = await db.product.findMany({
    //   where: {
    //     category: { contains: query, mode: 'insensitive' },
    //   },
    //   select: {
    //     category: true,
    //   },
    //   distinct: ['category'],
    //   take: 4,
    // });

    const categories= mockCategories

    return {
      success: true,
      suggestions: {
        products,
        categories: categories.map(c => c.name),
      },
    };
  } catch (error) {
    console.error('Suggestion error:', error);
    return { success: false, suggestions: { products: [], categories: [] } };
  }
}