'use client'

import { useMemo, useState } from 'react'
import jsPDF from 'jspdf'
import 'jspdf-autotable'
import { Download, Eye, Trash2, X } from 'lucide-react'
import { Order } from '../../../../prisma/src/lib/prisma/client'
import autoTable from 'jspdf-autotable'
import { deleteOrderAction } from '@/app/actions/deleteOrderAction'
import { toast } from 'react-toastify'

interface OrderWithItems extends Order {
  items: {
    id: string
    name: string
    quantity: number
    price: number
    image: string
  }[]
  shippingAddress: {
    fullName: string
    address: string
    city: string
    country: string
  }
}

// Server action for deleting an order

// Full-screen delete confirmation modal
// Full-screen delete confirmation modal
function FullScreenDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  orderNumber,
  isDeleting,
}: {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  orderNumber: string
  isDeleting: boolean
}) {
  if (!isOpen) return null

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm'>
      <div className='relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6 animate-in fade-in zoom-in duration-200'>
        <button
          onClick={onClose}
          disabled={isDeleting}
          className='absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors'
        >
          <X className='h-5 w-5' />
        </button>

        <div className='mb-4'>
          <div className='mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mb-4'>
            <Trash2 className='h-6 w-6 text-red-600' />
          </div>
          <h3 className='text-lg font-semibold text-gray-900 text-center'>
            Delete Order
          </h3>
          <p className='mt-2 text-sm text-gray-500 text-center'>
            Are you sure you want to delete order{' '}
            <span className='font-semibold text-gray-700'>{orderNumber}</span>?
            This action cannot be undone and will permanently remove all order
            data including items and shipping information.
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
              'Delete Order'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function OrdersPageContent({
  initialOrders,
}: {
  initialOrders: OrderWithItems[]
}) {
  const [activeTab, setActiveTab] = useState('ALL')
  const [orders, setOrders] = useState(initialOrders)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<OrderWithItems | null>(
    null,
  )
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const filteredOrders = useMemo(() => {
    if (activeTab === 'PENDING') {
      return orders.filter((order) => order.status === 'PENDING')
    }

    if (activeTab === 'DELIVERED') {
      return orders.filter((order) => order.status === 'DELIVERED')
    }

    if (activeTab === 'PAID') {
      return orders.filter((order) => order.paymentStatus === 'PAID')
    }

    return orders
  }, [activeTab, orders])

  // Helper function to format date with minutes
  const formatDateTime = (date: Date | string) => {
    const dateObj = date instanceof Date ? date : new Date(date)
    return dateObj.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })
  }

  const exportToPDF = () => {
    // Get current time with minutes
    const currentTime = new Date()
    const formattedTime = currentTime.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    })

    // Format orders for PDF with detailed time
    const formattedOrders = filteredOrders.map((order) => ({
      OrderNumber: order.orderNumber,
      Status: order.status,
      PaymentStatus: order.paymentStatus,
      Phone: order.phone,
      Email: order.email,
      Address: `${(order.shippingAddress as any)?.address}, ${(order.shippingAddress as any)?.city}, ${(order.shippingAddress as any)?.country}`,
      Items: order.items
        .map((item: any) => `${item.name} x${item.quantity}`)
        .join(', '),
      Total: `KES ${order.total.toLocaleString()}`,
      CreatedTime: formatDateTime(order.createdAt),
    }))

    // Create PDF document in landscape orientation
    const doc = new jsPDF({ orientation: 'landscape' })

    // Add title
    doc.setFontSize(18)
    doc.setTextColor(0, 0, 0)
    doc.text(`Orders Report - ${activeTab}`, 14, 15)

    // Add timestamp with minutes
    doc.setFontSize(10)
    doc.setTextColor(100, 100, 100)
    doc.text(`Generated on: ${formattedTime}`, 14, 25)

    // Add total orders count
    doc.setFontSize(11)
    doc.setTextColor(0, 0, 0)
    doc.text(`Total Orders: ${filteredOrders.length}`, 14, 35)

    // Prepare table columns
    const columns = [
      'Order Number',
      'Order Status',
      'Payment Status',
      'Phone',
      'Email',
      'Address',
      'Items',
      'Total',
      'Created Time',
    ]

    // Prepare table rows
    const rows = formattedOrders.map((order) => [
      order.OrderNumber,
      order.Status,
      order.PaymentStatus,
      order.Phone,
      order.Email,
      order.Address,
      order.Items,
      order.Total,
      order.CreatedTime,
    ])

    // Generate table
    autoTable(doc, {
      head: [columns],
      body: rows,
      startY: 42,
      theme: 'striped',
      styles: {
        fontSize: 8,
        cellPadding: 2,
        overflow: 'linebreak',
        cellWidth: 'wrap',
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontSize: 9,
        fontStyle: 'bold',
        halign: 'center',
      },
      bodyStyles: {
        valign: 'middle',
      },
      alternateRowStyles: {
        fillColor: [240, 248, 255],
      },
      columnStyles: {
        0: { cellWidth: 35 }, // Order Number
        1: { cellWidth: 20 }, // Status
        2: { cellWidth: 25 }, // Payment Status
        4: { cellWidth: 25 }, // Phone
        5: { cellWidth: 40 }, // Email
        6: { cellWidth: 45 }, // Address
        7: { cellWidth: 55 }, // Items
        8: { cellWidth: 25 }, // Total
        9: { cellWidth: 35 }, // Created Time
      },
      margin: { top: 42, left: 10, right: 10 },
    })

    // Add footer with page numbers
    const pageCount = doc.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      doc.setFontSize(8)
      doc.setTextColor(150, 150, 150)
      doc.text(
        `Page ${i} of ${pageCount}`,
        doc.internal.pageSize.getWidth() / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' },
      )
    }

    // Save PDF with timestamp
    const timestamp = currentTime.getTime()
    doc.save(`orders-${activeTab}-${timestamp}.pdf`)
  }

  const handleDeleteClick = (order: OrderWithItems) => {
    setSelectedOrder(order)
    setDeleteModalOpen(true)
    setError(null)
  }

  const handleConfirmDelete = async () => {
    if (!selectedOrder) return

    setIsDeleting(true)
    setError(null)

    try {
      const result = await deleteOrderAction(selectedOrder.id)

      if (result.success) {
        // Remove order from local state
        setOrders((prevOrders) =>
          prevOrders.filter((order) => order.id !== selectedOrder.id),
        )
        setDeleteModalOpen(false)
        setSelectedOrder(null)
        toast.success('Order deleted successfully')
      } else {
        setError(result.message || 'Failed to delete order')
      }
    } catch (err) {
      setError('An error occurred while deleting the order')
      console.error('Delete error:', err)
    } finally {
      setIsDeleting(false)
    }
  }

  const tabs = ['ALL', 'PENDING', 'DELIVERED', 'PAID']

  return (
    <div className='p-4 md:p-6 space-y-6'>
      {/* Error Toast */}
      {error && (
        <div className='rounded-xl bg-red-50 border border-red-200 p-4'>
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

      <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
        <div>
          <h1 className='text-2xl md:text-3xl font-bold'>Orders</h1>
          <p className='text-gray-500 text-sm'>
            Manage all customer orders from one place.
          </p>
        </div>

        <button
          onClick={exportToPDF}
          className='flex items-center justify-center gap-2 rounded-2xl bg-black text-white px-5 py-3 text-sm font-medium hover:opacity-90'
        >
          <Download className='w-4 h-4' />
          Export to PDF
        </button>
      </div>

      <div className='flex flex-wrap gap-3'>
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              activeTab === tab
                ? 'bg-black text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className='grid gap-5'>
        {filteredOrders.map((order) => (
          <div
            key={order.id}
            className='rounded-3xl border border-gray-200 bg-white p-4 md:p-6 shadow-sm'
          >
            <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b pb-4'>
              <div>
                <div className='flex items-center gap-3 flex-wrap'>
                  <h2 className='text-lg font-semibold'>{order.orderNumber}</h2>
                </div>
                <div className='mt-2 space-y-1'>
                  <p className='text-sm text-gray-600 flex items-center gap-2'>
                    <span className='font-medium'>Created:</span>
                    <span className='text-gray-700'>
                      {formatDateTime(order.createdAt)}
                    </span>
                  </p>
                  <p className='text-xs text-gray-400'>Full ID: {order.id}</p>
                </div>
              </div>

              <div className='flex gap-2'>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    order.status === 'PENDING'
                      ? 'bg-yellow-100 text-yellow-700'
                      : order.status === 'DELIVERED'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-blue-100 text-blue-700'
                  }`}
                >
                  <div className='flex flex-col'>
                    <div> Order Status </div>
                    {order.status}
                  </div>
                </span>
                <span
                  className={`rounded-full px-3 py-1 flex flex-col text-xs font-semibold ${
                    order.paymentStatus === 'PAID'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  <div className=''>Payment Status</div>
                  {order.paymentStatus}
                </span>
              </div>
            </div>

            <div className='grid grid-cols-1 xl:grid-cols-3 gap-6 mt-6'>
              <div className='xl:col-span-2 space-y-4'>
                <div className='flex justify-between items-center'>
                  <h3 className='font-semibold text-base'>Items</h3>
                  <button
                    onClick={() => handleDeleteClick(order)}
                    className='flex items-center gap-2 rounded-xl bg-red-50 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-100 transition-colors'
                  >
                    <Trash2 className='w-4 h-4' />
                    Delete Order
                  </button>
                </div>

                {order.items.map((item: any) => (
                  <div
                    key={item.id}
                    className='flex flex-col sm:flex-row sm:items-center gap-4 rounded-2xl border border-gray-100 p-3'
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className='w-20 h-20 rounded-2xl object-cover border'
                    />

                    <div className='flex-1'>
                      <h4 className='font-medium'>{item.name}</h4>
                      <p className='text-sm text-gray-500'>
                        Quantity: {item.quantity}
                      </p>
                      <p className='text-sm text-gray-500'>
                        Price: KES {item.price.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className='space-y-4 rounded-2xl bg-gray-50 p-4'>
                <div>
                  <h3 className='font-semibold text-base mb-2'>
                    Delivery Address
                  </h3>
                  <p className='text-sm text-gray-700'>
                    {order.shippingAddress.fullName}
                  </p>
                  <p className='text-sm text-gray-500'>
                    {order.shippingAddress.address}
                  </p>
                  <p className='text-sm text-gray-500'>
                    {order.shippingAddress.city},{' '}
                    {order.shippingAddress.country}
                  </p>
                  <p className='text-sm text-gray-500 mt-2'>{order.phone}</p>
                  <p className='text-sm text-gray-500'>{order.email}</p>
                </div>

                <div className='border-t pt-4 space-y-2 text-sm'>
                  <div className='flex justify-between'>
                    <span>Subtotal</span>
                    <span>KES {order.subtotal.toLocaleString()}</span>
                  </div>
                  <div className='flex justify-between'>
                    <span>Tax</span>
                    <span>KES {order.tax.toLocaleString()}</span>
                  </div>
                  <div className='flex justify-between'>
                    <span>Shipping</span>
                    <span>KES {order.shippingFee.toLocaleString()}</span>
                  </div>
                  <div className='flex justify-between font-bold text-base border-t pt-2'>
                    <span>Total</span>
                    <span>KES {order.total.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {filteredOrders.length === 0 && (
          <div className='text-center py-12 bg-white rounded-3xl border border-gray-200'>
            <p className='text-gray-500'>No orders found for {activeTab} tab</p>
          </div>
        )}
      </div>

      {/* Full-Screen Delete Confirmation Modal */}
      <FullScreenDeleteModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false)
          setSelectedOrder(null)
          setError(null)
        }}
        onConfirm={handleConfirmDelete}
        orderNumber={selectedOrder?.orderNumber || ''}
        isDeleting={isDeleting}
      />
    </div>
  )
}
