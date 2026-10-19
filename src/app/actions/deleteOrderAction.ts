'use server'
import { db } from '@/lib/db'

// Example with Prisma
export async function deleteOrderAction(orderId: string) {
  try {
    // Delete order items first (if not using cascade)
    await db.orderItem.deleteMany({
      where: { orderId },
    })

    // Delete the order
    await db.order.delete({
      where: { id: orderId },
    })

    return { success: true, message: 'Order deleted successfully' }
  } catch (error) {
    return { success: false, message: 'Failed to delete order' }
  }
}
