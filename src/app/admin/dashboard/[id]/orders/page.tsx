import { getAllOrders } from '@/app/actions/order'
import OrdersPageContent from '@/components/components/Admin/OrdersPageContent'

export default async function OrdersPage() {
  const oders = getAllOrders()

  const orders = await oders.then((res) => {
    if (res.success) {
      return res.orders
    } else {
      console.error(res.error)
      return []
    }
  })

  const transformedOrders = orders.map((order) => ({
    ...order,
    shippingAddress: order.shippingAddress as {
      fullName: string
      address: string
      city: string
      country: string
    },
    items: order.items.map((item) => ({
      id: item.id,
      name: item.product.name,
      quantity: item.quantity,
      price: item.price,
      image:
        Array.isArray(item.product.images) &&
        typeof item.product.images[0] === 'string'
          ? item.product.images[0]
          : '',
    })),
  }))

  if (!transformedOrders) {
    return <div>Loading...</div>
  }

  return <OrdersPageContent initialOrders={transformedOrders} />
}
