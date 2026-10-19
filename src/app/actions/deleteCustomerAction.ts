'use server'
import { db } from '@/lib/db'

// Example with Prisma
export async function deleteCustomerAction(customerId: string) {
  const deletedCustomer = await db.user.delete({
    where: { id: customerId },
  })

  return { success: true, message: 'Customer deleted successfully' }
}
