'use client'

import Link from 'next/link'
import {
  Package,
  ShoppingCart,
  Users,
  Plus,
  Eye,
  ArrowRight,
} from 'lucide-react'
import { Order } from '../../../../prisma/src/lib/prisma/client'

interface DashboardOverviewProps {
  totalProducts: number
  totalOrders: number
  totalCustomers: number
  recentOrders: Order[]
}

const statusStyles: Record<Order['status'], string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  SHIPPED: 'bg-blue-100 text-blue-700',
  DELIVERED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
  PROCESSING: 'bg-gray-100 text-gray-700',
}

export default function DashboardOverview({
  totalProducts,
  totalOrders,
  totalCustomers,
  recentOrders,
}: DashboardOverviewProps) {
  const summaryCards = [
    {
      title: 'Total Products',
      value: totalProducts,
      icon: Package,
      bg: 'bg-blue-50',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
    },
    {
      title: 'Total Orders',
      value: totalOrders,
      icon: ShoppingCart,
      bg: 'bg-green-50',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
    },
    {
      title: 'Total Customers',
      value: totalCustomers,
      icon: Users,
      bg: 'bg-purple-50',
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
    },
  ]

  const quickLinks = [
    {
      title: 'Add Product',
      href: '/admin/dashboard/id/products/add',
      icon: Plus,
    },
    {
      title: 'View Orders',
      href: '/admin/dashboard/id/orders',
      icon: ShoppingCart,
    },
    {
      title: 'View Products',
      href: '/admin/dashboard/id/products',
      icon: Eye,
    },
  ]

  return (
    <div className='min-h-screen bg-gray-50 p-4 md:p-6'>
      <div className='mx-auto max-w-7xl space-y-6'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900 md:text-3xl'>
            Dashboard Overview
          </h1>
          <p className='mt-1 text-sm text-gray-500'>
            Monitor your store performance and manage recent activity.
          </p>
        </div>

        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
          {summaryCards.map((card) => {
            const Icon = card.icon

            return (
              <div
                key={card.title}
                className={`${card.bg} rounded-2xl border border-gray-100 p-5 shadow-sm transition hover:shadow-md`}
              >
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-sm font-medium text-gray-500'>
                      {card.title}
                    </p>
                    <h2 className='mt-2 text-3xl font-bold text-gray-900'>
                      {card.value}
                    </h2>
                  </div>

                  <div className={`${card.iconBg} rounded-full p-3`}>
                    <Icon className={`h-6 w-6 ${card.iconColor}`} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className='rounded-2xl border border-gray-200 bg-white p-5 shadow-sm'>
          <div className='mb-4 flex items-center justify-between'>
            <div>
              <h2 className='text-lg font-semibold text-gray-900'>
                Quick Actions
              </h2>
              <p className='text-sm text-gray-500'>
                Navigate quickly to common admin tasks.
              </p>
            </div>
          </div>

          <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3'>
            {quickLinks.map((link) => {
              const Icon = link.icon

              return (
                <Link
                  key={link.title}
                  href={link.href}
                  className='group flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 p-4 transition hover:border-gray-300 hover:bg-white hover:shadow-sm'
                >
                  <div className='flex items-center gap-3'>
                    <div className='rounded-full bg-gray-100 p-2'>
                      <Icon className='h-5 w-5 text-gray-700' />
                    </div>
                    <span className='font-medium text-gray-800'>
                      {link.title}
                    </span>
                  </div>

                  <ArrowRight className='h-4 w-4 text-gray-400 transition group-hover:translate-x-1' />
                </Link>
              )
            })}
          </div>
        </div>

        <div className='rounded-2xl border border-gray-200 bg-white shadow-sm'>
          <div className='border-b border-gray-100 p-5'>
            <h2 className='text-lg font-semibold text-gray-900'>
              Recent Orders
            </h2>
            <p className='text-sm text-gray-500'>
              Showing the latest 10 customer orders.
            </p>
          </div>

          <div className='overflow-x-auto'>
            <table className='min-w-full divide-y divide-gray-200'>
              <thead className='bg-gray-50'>
                <tr>
                  <th className='px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500'>
                    Order ID
                  </th>
                  <th className='px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500'>
                    Customer
                  </th>
                  <th className='px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500'>
                    Total
                  </th>
                  <th className='px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500'>
                    Status
                  </th>
                  <th className='px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500'>
                    Date
                  </th>
                </tr>
              </thead>

              <tbody className='divide-y divide-gray-100 bg-white'>
                {recentOrders.slice(0, 10).map((order) => (
                  <tr key={order.id} className='hover:bg-gray-50'>
                    <td className='whitespace-nowrap px-4 py-4 text-sm font-medium text-gray-900'>
                      #{order.id}
                    </td>
                    <td className='whitespace-nowrap px-4 py-4 text-sm text-gray-700'>
                      {order.email}
                    </td>
                    <td className='whitespace-nowrap px-4 py-4 text-sm text-gray-700'>
                      KSh {order.total.toLocaleString()}
                    </td>
                    <td className='whitespace-nowrap px-4 py-4 text-sm'>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${statusStyles[order.status]}`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className='whitespace-nowrap px-4 py-4 text-sm text-gray-500'>
                      {order.createdAt.toDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
