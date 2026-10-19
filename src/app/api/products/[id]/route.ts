import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const { isAvailable } = await request.json()

    const updatedProduct = await db.product.update({
      where: { id },
      data: { isAvailable },
    })
    if (!updatedProduct) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 },
      )
    }

    return NextResponse.json(
      { success: true, product: updatedProduct },
      { status: 200 },
    )
  } catch (error) {
    console.error('Error updating product:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update product' },
      { status: 500 },
    )
  }
}
