'use server'

import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { initiateStkPush } from '@/lib/m-pesa'

interface CreateOrderInput {
  userId: string
  items: Array<{
    productId: string
    quantity: number
    price: number
  }>
  subtotal: number
  tax: number
  shippingFee: number
  total: number
  phone: string
  email: string
  shippingAddress: any
  paymentMethod: 'MPESA' | 'CASH_ON_DELIVERY'
}

// Generate unique order number
function generateOrderNumber(): string {
  const prefix = 'ORD'
  const timestamp = Date.now().toString().slice(-8)
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `${prefix}${timestamp}${random}`
}

export async function createOrder(orderData: CreateOrderInput) {
  try {
    const orderNumber = generateOrderNumber()

    const order = await db.order.create({
      data: {
        orderNumber,
        userId: orderData.userId,
        subtotal: orderData.subtotal,
        tax: orderData.tax,
        shippingFee: orderData.shippingFee,
        total: orderData.total,
        phone: orderData.phone,
        email: orderData.email,
        shippingAddress: orderData.shippingAddress,
        paymentMethod: orderData.paymentMethod,
        status:
          orderData.paymentMethod === 'CASH_ON_DELIVERY'
            ? 'PROCESSING'
            : 'PENDING',
        paymentStatus:
          orderData.paymentMethod === 'CASH_ON_DELIVERY' ? 'PAID' : 'PAID',
        items: {
          create: orderData.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
            name: item.productId,
          })),
        },
      },
      include: {
        items: true,
      },
    })

    // if (orderData.paymentMethod === 'MPESA') {
    //   const mpesaResponse = await initiateStkPush(
    //     orderData.phone,
    //     orderData.total,
    //     orderNumber,
    //     `Payment for order ${orderNumber}`,
    //   )

    //   // Update order with M-Pesa checkout request ID
    //   await db.order.update({
    //     where: { id: order.id },
    //     data: {
    //       mpesaTransactionId: mpesaResponse.CheckoutRequestID,
    //     },
    //   })

    //   return {
    //     success: true,
    //     order,
    //     mpesaResponse,
    //   }
    // }

    revalidatePath('/my-orders')
    return {
      success: true,
      order,
    }
  } catch (error) {
    console.error('Error creating order:', error)
    return {
      success: false,
      error: 'Failed to create order',
    }
  }
}

// Update order payment status after M-Pesa callback
export async function updateOrderPayment(
  orderNumber: string,
  paymentStatus: 'PAID' | 'FAILED',
  mpesaReceiptNumber?: string,
  mpesaResultCode?: string,
) {
  try {
    const updateData: any = {
      paymentStatus,
    }

    if (mpesaReceiptNumber) {
      updateData.mpesaReceiptNumber = mpesaReceiptNumber
    }
    if (mpesaResultCode) {
      updateData.mpesaResultCode = mpesaResultCode
    }
    if (paymentStatus === 'PAID') {
      updateData.paidAt = new Date()
      updateData.status = 'PROCESSING'
    }

    const order = await db.order.update({
      where: { orderNumber },
      data: updateData,
    })

    return { success: true, order }
  } catch (error) {
    console.error('Error updating order payment:', error)
    return { success: false, error: 'Failed to update order payment' }
  }
}

// Get user orders
export async function getUserOrders(userId: string) {
  try {
    const orders = await db.order.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return { success: true, orders }
  } catch (error) {
    console.error('Error fetching orders:', error)
    return { success: false, error: 'Failed to fetch orders', orders: [] }
  }
}

// Get single order by ID
export async function getOrderById(orderId: string) {
  try {
    const order = await db.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        user: true,
      },
    })

    if (!order) {
      return { success: false, error: 'Order not found', order: null }
    }

    return { success: true, order }
  } catch (error) {
    console.error('Error fetching order:', error)
    return { success: false, error: 'Failed to fetch order', order: null }
  }
}

// Admin: Get all orders
export async function getAllOrders() {
  try {
    const orders = await db.order.findMany({
      include: {
        items: {
          include: {
            product: true,
          },
        },
        user: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return { success: true, orders }
  } catch (error) {
    console.error('Error fetching orders:', error)
    return { success: false, error: 'Failed to fetch orders', orders: [] }
  }
}

export async function getAllOrdersCount() {
  try {
    const count = await db.order.count()
    return { success: true, count }
  } catch (error) {
    console.error('Error fetching orders count:', error)
    return { success: false, error: 'Failed to fetch orders count', count: 0 }
  }
}

export async function getRecentOrders(limit: number = 5) {
  try {
    const orders = await db.order.findMany({
      include: {
        items: {
          include: {
            product: true,
            order: true,
          },
        },
        user: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    })

    return { success: true, orders }
  } catch (error) {
    console.error('Error fetching recent orders:', error)
    return {
      success: false,
      error: 'Failed to fetch recent orders',
      orders: [],
    }
  }
}

export async function updateOrderStatus(orderId: string, status: string) {
  try {
    const order = await db.order.update({
      where: { id: orderId },
      data: {
        status: status as
          | 'PENDING'
          | 'PROCESSING'
          | 'SHIPPED'
          | 'DELIVERED'
          | 'CANCELLED',
      },
    })

    return { success: true, order }
  } catch (error) {
    console.error('Error updating order status:', error)
    return { success: false, error: 'Failed to update order status' }
  }
}
