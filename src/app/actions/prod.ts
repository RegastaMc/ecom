'use server'

import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'

// Create product (existing)
export async function createProduct(data: any) {
  try {
    const product = await db.product.create({
      data: {
        name: data.name,
        desc: data.desc,
        category: data.category,
        price: data.price,
        offerPrice: data.offerPrice,
        isAvailable: data.isAvailable,
        images: data.images,
      },
    })

    revalidatePath('/products')
    return { success: true, product }
  } catch (error) {
    console.error('Error creating product:', error)
    return { success: false, error: 'Failed to create product' }
  }
}

// Update product
export async function updateProduct(data: {
  id: string
  name: string
  desc: string | null
  category: string
  price: number
  offerPrice: number | null
  isAvailable: boolean
  images: string[]
  deletedImages?: string[]
}) {
  try {
    // Update product in database
    const product = await db.product.update({
      where: { id: data.id },
      data: {
        name: data.name,
        desc: data.desc,
        category: data.category,
        price: data.price,
        offerPrice: data.offerPrice,
        isAvailable: data.isAvailable,
        images: data.images,
      },
    })

    // Optionally delete images from Cloudinary if needed
    // This can be done in a separate background job

    revalidatePath('/products')
    revalidatePath(`/products/${data.id}`)

    return { success: true, product }
  } catch (error) {
    console.error('Error updating product:', error)
    return { success: false, error: 'Failed to update product' }
  }
}

// Get single product by ID
export async function getProductById(id: string) {
  try {
    const product = await db.product.findUnique({
      where: { id },
    })

    if (!product) {
      return { success: false, error: 'Product not found', product: null }
    }

    return { success: true, product }
  } catch (error) {
    console.error('Error fetching product:', error)
    return { success: false, error: 'Failed to fetch product', product: null }
  }
}

export const getproductCount = async () => {
  try {
    const count = await db.product.count()
    return count
  } catch (error) {
    console.error('Error fetching product count:', error)
    return 0
  }
}
