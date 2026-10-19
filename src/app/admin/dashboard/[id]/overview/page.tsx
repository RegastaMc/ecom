import { getAllOrdersCount, getRecentOrders } from '@/app/actions/order'
import { getproductCount } from '@/app/actions/prod'
import { getUsersCount } from '@/app/actions/users'
import DashboardOverview from '@/components/components/seller/DashboardOverview'
import React from 'react'

export default async function page() {
  const totalProducts = await getproductCount()
  const totalOrders = await getAllOrdersCount()
  const totalCustomers = await getUsersCount()
  const recentOrders = (await getRecentOrders()).orders

  return (
    <DashboardOverview
      totalProducts={totalProducts}
      totalOrders={totalOrders.count}
      totalCustomers={totalCustomers}
      recentOrders={recentOrders}
    />
  )
}
