'use client'

import { useState, useMemo } from 'react'
import {
  Search,
  Mail,
  Phone,
  CalendarDays,
  Shield,
  MoreVertical,
  Trash2,
  X,
} from 'lucide-react'
import Image from 'next/image'
import { db } from '@/lib/db'
import { deleteCustomerAction } from '@/app/actions/deleteCustomerAction'
import { toast } from 'react-toastify'

// Delete confirmation modal component
function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  customerName,
  isDeleting,
}: {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  customerName: string
  isDeleting: boolean
}) {
  if (!isOpen) return null

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center'>
      {/* Backdrop */}
      <div
        className='absolute inset-0 bg-black/30 bg-opacity-50 transition-opacity'
        onClick={onClose}
      />

      {/* Modal */}
      <div className='relative bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 p-6 animate-in fade-in zoom-in duration-200'>
        <button
          onClick={onClose}
          className='absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors'
        >
          <X className='h-5 w-5' />
        </button>

        <div className='mb-4'>
          <div className='mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mb-4'>
            <Trash2 className='h-6 w-6 text-red-600' />
          </div>
          <h3 className='text-lg font-semibold text-gray-900 text-center'>
            Delete Customer
          </h3>
          <p className='mt-2 text-sm text-gray-500 text-center'>
            Are you sure you want to delete{' '}
            <span className='font-semibold text-gray-700'>{customerName}</span>?
            This action cannot be undone and will permanently remove all
            customer data.
          </p>
        </div>

        <div className='flex gap-3 mt-6'>
          <button
            onClick={onClose}
            disabled={isDeleting}
            className='flex-1 rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className='flex-1 rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'
          >
            {isDeleting ? (
              <>
                <div className='h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent' />
                Deleting...
              </>
            ) : (
              'Delete'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function CustomersTable({
  initialUsers,
}: {
  initialUsers: any[]
}) {
  const [search, setSearch] = useState('')
  const [customers, setCustomers] = useState(initialUsers)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const filteredCustomers = useMemo(() => {
    if (!search) return customers
    return customers.filter(
      (customer) =>
        customer?.name?.toLowerCase().includes(search.toLowerCase()) ||
        customer?.email?.toLowerCase().includes(search.toLowerCase()) ||
        customer?.phone?.toLowerCase().includes(search.toLowerCase()),
    )
  }, [search, customers])

  const handleDeleteClick = (customer: any) => {
    setSelectedCustomer(customer)
    setDeleteModalOpen(true)
    setError(null)
  }

  const handleConfirmDelete = async () => {
    if (!selectedCustomer) return

    setIsDeleting(true)
    setError(null)

    try {
      const result = await deleteCustomerAction(selectedCustomer.id)

      if (result.success) {
        setCustomers((prevCustomers) =>
          prevCustomers.filter((c) => c.id !== selectedCustomer.id),
        )
        setDeleteModalOpen(false)
        setSelectedCustomer(null)
        toast.success('Customer deleted successfully')
      } else {
        setError(result.message || 'Failed to delete customer')
        toast.error(result.message || 'Failed to delete customer')
      }
    } catch (err) {
      setError('An error occurred while deleting the customer')
      console.error('Delete error:', err)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <div className='relative w-full lg:w-80 mb-6'>
        <Search className='absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400' />
        <input
          type='text'
          placeholder='Search customers...'
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className='w-full rounded-2xl border border-gray-200 bg-white py-3 pl-11 pr-4 text-sm outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
        />
      </div>

      {/* Error Toast */}
      {error && (
        <div className='mb-4 rounded-xl bg-red-50 border border-red-200 p-4'>
          <div className='flex items-center gap-2 text-red-800'>
            <div className='h-4 w-4 rounded-full bg-red-600' />
            <p className='text-sm font-medium'>{error}</p>
            <button
              onClick={() => setError(null)}
              className='ml-auto text-red-600 hover:text-red-800'
            >
              <X className='h-4 w-4' />
            </button>
          </div>
        </div>
      )}

      <div className='overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm'>
        <div className='overflow-x-auto'>
          <table className='min-w-full'>
            <thead className='bg-gray-50'>
              <tr>
                <th className='px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500'>
                  Customer
                </th>
                <th className='px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500'>
                  Contact
                </th>
                <th className='px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500'>
                  Role
                </th>
                <th className='px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500'>
                  Total Spent
                </th>
                <th className='px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500'>
                  Joined
                </th>
                <th className='px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500'>
                  Status
                </th>
                <th className='px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-500'>
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className='divide-y divide-gray-100'>
              {filteredCustomers.map((customer) => (
                <tr
                  key={customer.id}
                  className='hover:bg-gray-50 transition-all'
                >
                  <td className='px-6 py-5'>
                    <div className='flex items-center gap-4'>
                      <div>
                        <div className='flex items-center gap-2'>
                          <p className='font-semibold text-gray-800'>
                            {customer.name}
                          </p>
                          {customer.role === 'ADMIN' && (
                            <span className='rounded-full bg-purple-100 px-2 py-1 text-[10px] font-semibold text-purple-700'>
                              ADMIN
                            </span>
                          )}
                        </div>
                        <p className='text-sm text-gray-500'>{customer.id}</p>
                      </div>
                    </div>
                  </td>

                  <td className='px-6 py-5'>
                    <div className='space-y-2'>
                      <div className='flex items-center gap-2 text-sm text-gray-600'>
                        <Mail className='h-4 w-4 text-blue-500' />
                        <span>{customer.email}</span>
                      </div>
                      <div className='flex items-center gap-2 text-sm text-gray-600'>
                        <Phone className='h-4 w-4 text-green-500' />
                        <span>{customer.phone || 'N/A'}</span>
                      </div>
                    </div>
                  </td>

                  <td className='px-6 py-5'>
                    <div className='rounded-2xl bg-blue-50 px-4 py-2 text-center text-sm font-semibold text-blue-700 w-fit'>
                      {customer.role}
                    </div>
                  </td>

                  <td className='px-6 py-5'>
                    <p className='font-semibold text-gray-800'>
                      KES {(customer.totalSpent || 0).toLocaleString()}
                    </p>
                  </td>

                  <td className='px-6 py-5'>
                    <div className='flex items-center gap-2 text-sm text-gray-600'>
                      <CalendarDays className='h-4 w-4 text-orange-500' />
                      <span>
                        {new Date(customer.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </td>

                  <td className='px-6 py-5'>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        customer.status === 'ACTIVE'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {customer.status || 'ACTIVE'}
                    </span>
                  </td>

                  <td className='px-6 py-5'>
                    <div className='flex items-center justify-end gap-2'>
                      <button
                        onClick={() => handleDeleteClick(customer)}
                        className='rounded-xl border border-red-200 p-2 text-red-500 hover:bg-red-50 transition-colors'
                      >
                        <Trash2 className='h-4 w-4' />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false)
          setSelectedCustomer(null)
          setError(null)
        }}
        onConfirm={handleConfirmDelete}
        customerName={selectedCustomer?.name || ''}
        isDeleting={isDeleting}
      />
    </>
  )
}

export function CustomersTableSkeleton() {
  return (
    <div className='overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm'>
      <div className='animate-pulse'>
        <div className='bg-gray-50 p-4'>
          <div className='h-4 bg-gray-200 rounded w-24'></div>
        </div>
        <div className='space-y-4 p-4'>
          {[...Array(5)].map((_, i) => (
            <div key={i} className='flex gap-4'>
              <div className='h-14 w-14 bg-gray-200 rounded-2xl'></div>
              <div className='flex-1'>
                <div className='h-4 bg-gray-200 rounded w-32 mb-2'></div>
                <div className='h-3 bg-gray-200 rounded w-24'></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
