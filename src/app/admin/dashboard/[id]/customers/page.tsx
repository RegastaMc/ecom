import Image from 'next/image'
import {
  Search,
  Trash2,
  Mail,
  Phone,
  CalendarDays,
  Shield,
  MoreVertical,
} from 'lucide-react'
import { getAllUsers } from '@/app/actions/users'
import { Suspense } from 'react'
import CustomersTable, {
  CustomersTableSkeleton,
} from '@/components/components/Admin/CustomersTable'

// Server Component
export default async function CustomersPage() {
  const { success, users, error } = await getAllUsers()

  if (!success) {
    return (
      <div className='space-y-6'>
        <div className='rounded-3xl border border-red-200 bg-red-50 p-6 text-center'>
          <h3 className='text-lg font-semibold text-red-800'>
            Error Loading Customers
          </h3>
          <p className='text-red-600'>{error || 'Failed to load customers'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4'>
        <div>
          <h1 className='text-2xl md:text-3xl font-bold text-gray-800'>
            Customers
          </h1>
          <p className='mt-1 text-sm text-gray-500'>
            View and manage all users registered on your website.
          </p>
        </div>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4'>
        <div className='rounded-3xl border border-gray-100 bg-white p-5 shadow-sm'>
          <p className='text-sm text-gray-500'>Total Customers</p>
          <h2 className='mt-2 text-3xl font-bold text-gray-800'>
            {users.length}
          </h2>
        </div>

        <div className='rounded-3xl border border-gray-100 bg-white p-5 shadow-sm'>
          <p className='text-sm text-gray-500'>Active Users</p>
          <h2 className='mt-2 text-3xl font-bold text-green-600'>
            {users.filter((user: any) => user.status === 'ACTIVE').length}
          </h2>
        </div>

        <div className='rounded-3xl border border-gray-100 bg-white p-5 shadow-sm'>
          <p className='text-sm text-gray-500'>Inactive Users</p>
          <h2 className='mt-2 text-3xl font-bold text-red-500'>
            {users.filter((user: any) => user.status === 'INACTIVE').length}
          </h2>
        </div>

        <div className='rounded-3xl border border-gray-100 bg-white p-5 shadow-sm'>
          <p className='text-sm text-gray-500'>Admin</p>
          <h2 className='mt-2 text-3xl font-bold text-purple-600'>
            {users.filter((user: any) => user.role === 'ADMIN').length}
          </h2>
        </div>
      </div>

      {/* Client Component for Search and Interactive Features */}
      <Suspense fallback={<CustomersTableSkeleton />}>
        <CustomersTable initialUsers={users} />
      </Suspense>
    </div>
  )
}

// Client Component for search and interactive features
