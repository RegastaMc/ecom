import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import OrdersClient from '@/components/components/Ui/OrdersClient'
import { getUserOrders } from '../actions/order'

export default async function OrdersPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/signin')
  }

  const { orders, success, error } = await getUserOrders(session.user.id)

  // Normalize dates to strings so the client component's Order types match (createdAt/updatedAt as string)
  const normalizedOrders = orders ? JSON.parse(JSON.stringify(orders)) : []

  return (
    <div className='container mx-auto px-4 py-8'>
      <div className='max-w-6xl mx-auto'>
        <h1 className='text-2xl font-bold mb-6'>My Orders</h1>
        <OrdersClient orders={normalizedOrders} success={success} error={error} />
      </div>
    </div>
  )
}
