'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  Plus,
  Pencil,
  Trash2,
  Package,
  CheckCircle,
  XCircle,
  Tag,
  Download,
} from 'lucide-react'
import jsPDF from 'jspdf'
import 'jspdf-autotable'
import { Product } from '../../../../prisma/src/lib/prisma/client'
import { deleteProduct } from '@/app/actions/product'
import { toast } from 'react-toastify'
import { useRouter } from 'next/navigation'
import DeleteConfirmModal from './DeleteConfirmModal'
import autoTable from 'jspdf-autotable'

type FilterTab = 'all' | 'in-stock' | 'out-of-stock' | 'on-offer'

interface ProductsPageProps {
  products: Product[]
  onDelete?: (id: string) => void
  onToggleAvailability?: (id: string, value: boolean) => void
}

export default function ProductsPage({
  products,
  onDelete,
  onToggleAvailability,
}: ProductsPageProps) {
  const [activeTab, setActiveTab] = useState<FilterTab>('all')
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  const router = useRouter()

  const handleDeleteClick = (product: Product) => {
    setSelectedProduct(product)
    setDeleteModalOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!selectedProduct) return

    setIsDeleting(true)

    try {
      const result = await deleteProduct(selectedProduct.id)

      if (result.success) {
        // Remove product from local state
        products.filter((p) => p.id !== selectedProduct.id)
        toast.success(`${selectedProduct?.name} deleted successfully`)
        router.refresh()
      } else {
        toast.error(result.error || 'Failed to delete product')
      }
    } catch (error) {
      console.error('Delete error:', error)
      toast.error('Failed to delete product')
    } finally {
      setIsDeleting(false)
      setDeleteModalOpen(false)
      setSelectedProduct(null)
    }
  }

  const tabs = [
    {
      label: 'All Products',
      value: 'all',
      icon: Package,
    },
    {
      label: 'In Stock',
      value: 'in-stock',
      icon: CheckCircle,
    },
    {
      label: 'Out of Stock',
      value: 'out-of-stock',
      icon: XCircle,
    },
    {
      label: 'On Offer',
      value: 'on-offer',
      icon: Tag,
    },
  ] as const

  const filteredProducts = useMemo(() => {
    switch (activeTab) {
      case 'in-stock':
        return products.filter((product) => product.isAvailable)

      case 'out-of-stock':
        return products.filter((product) => !product.isAvailable)

      case 'on-offer':
        return products.filter(
          (product) =>
            product.offerPrice !== null &&
            product.offerPrice !== undefined &&
            product.offerPrice > 0,
        )

      default:
        return products
    }
  }, [activeTab, products])

  const exportToPDF = () => {
    // Get current time for the PDF
    const currentTime = new Date()
    const formattedTime = currentTime.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })

    // Prepare export data
    const exportData = filteredProducts.map((product) => ({
      Name: product.name,
      Category: product.category,
      Price: `KSh ${product.price.toLocaleString()}`,
      OfferPrice: product.offerPrice
        ? `KSh ${product.offerPrice.toLocaleString()}`
        : '-',
      Available: product.isAvailable ? 'Yes' : 'No',
      Features: product?.desc || '-',
      CreatedAt:
        product.createdAt instanceof Date
          ? product.createdAt.toLocaleString()
          : new Date(product.createdAt).toLocaleString(),
    }))

    // Create PDF document
    const doc = new jsPDF({ orientation: 'landscape' })

    // Add title
    doc.setFontSize(18)
    doc.setTextColor(0, 0, 0)
    doc.text(`Products Report - ${activeTab.toUpperCase()}`, 14, 15)

    // Add timestamp
    doc.setFontSize(10)
    doc.setTextColor(100, 100, 100)
    doc.text(`Generated on: ${formattedTime}`, 14, 25)

    // Add total products count
    doc.setFontSize(11)
    doc.setTextColor(0, 0, 0)
    doc.text(`Total Products: ${filteredProducts.length}`, 14, 35)

    // Prepare table columns
    const columns = [
      'Name',
      'Category',
      'Price',
      'Offer Price',
      'Available',
      'Features',
      'Created At',
    ]

    // Prepare table rows
    const rows = exportData.map((item) => [
      item.Name,
      item.Category,
      item.Price,
      item.OfferPrice,
      item.Available,
      item.Features,
      item.CreatedAt,
    ])

    autoTable(doc, {
      head: [columns],
      body: rows,
      startY: 42,
      theme: 'striped',
      styles: {
        fontSize: 9,
        cellPadding: 3,
        overflow: 'linebreak',
        cellWidth: 'wrap',
      },
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

    // Save PDF with timestamp in filename
    const timestamp = currentTime.getTime()
    doc.save(`products-${activeTab}-${timestamp}.pdf`)

    // Show success toast
    toast.success(
      `PDF exported successfully with ${filteredProducts.length} products`,
    )
  }

  return (
    <div className='min-h-screen bg-gray-50 p-4 md:p-6'>
      <div className='mx-auto max-w-7xl space-y-6'>
        <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
          <div>
            <h1 className='text-2xl font-bold text-gray-900 md:text-3xl'>
              Products Management
            </h1>
            <p className='mt-1 text-sm text-gray-500'>
              Manage all your products, stock availability and offers.
            </p>
          </div>

          <div className='flex flex-col gap-3 sm:flex-row'>
            <button
              onClick={exportToPDF}
              className='inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-100'
            >
              <Download className='h-4 w-4' />
              Export PDF
            </button>

            <Link
              href='/admin/dashboard/id/products/add'
              className='inline-flex items-center justify-center gap-2 rounded-xl bg-black px-4 py-3 text-sm font-medium text-white transition hover:bg-gray-800'
            >
              <Plus className='h-4 w-4' />
              Add New
            </Link>
          </div>
        </div>

        <div className='overflow-x-auto rounded-2xl border border-gray-200 bg-white p-2 shadow-sm'>
          <div className='flex min-w-max gap-2'>
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.value

              return (
                <button
                  key={tab.value}
                  onClick={() => setActiveTab(tab.value)}
                  className={`inline-flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium transition ${
                    isActive
                      ? 'bg-black text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Icon className='h-4 w-4' />
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>

        <div className='rounded-2xl border border-gray-200 bg-white shadow-sm'>
          <div className='border-b border-gray-100 px-5 py-4'>
            <h2 className='text-lg font-semibold text-gray-900'>
              Products ({filteredProducts.length})
            </h2>
          </div>

          <div className='overflow-x-auto'>
            <table className='min-w-full divide-y divide-gray-200'>
              <thead className='bg-gray-50'>
                <tr>
                  <th className='px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500'>
                    Product
                  </th>
                  <th className='px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500'>
                    Category
                  </th>
                  <th className='px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500'>
                    Price
                  </th>
                  <th className='px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500'>
                    Offer Price
                  </th>
                  <th className='px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500'>
                    Availability
                  </th>
                  <th className='px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500'>
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className='divide-y divide-gray-100 bg-white'>
                {filteredProducts.map((product) => (
                  <tr key={product.id} className='hover:bg-gray-50'>
                    <td className='px-4 py-4'>
                      <div className='flex items-center gap-3'>
                        <div className='relative h-14 w-14 overflow-hidden rounded-xl border border-gray-200 bg-gray-100'>
                          <Image
                            src={
                              Array.isArray(product.images) &&
                              typeof product.images[0] === 'string'
                                ? product.images[0]
                                : '/placeholder.png'
                            }
                            alt={product.name}
                            fill
                            className='object-cover'
                          />
                        </div>

                        <div>
                          <p className='font-medium text-gray-900'>
                            {product.name}
                          </p>

                          <p className='text-sm text-gray-500 line-clamp-1'>
                            {product.desc || 'No description available'}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className='whitespace-nowrap px-4 py-4 text-sm text-gray-700'>
                      {product.category}
                    </td>

                    <td className='whitespace-nowrap px-4 py-4 text-sm font-medium text-gray-900'>
                      KSh {product.price.toLocaleString()}
                    </td>

                    <td className='whitespace-nowrap px-4 py-4 text-sm text-gray-700'>
                      {product.offerPrice ? (
                        <span className='font-medium text-green-600'>
                          KSh {product.offerPrice.toLocaleString()}
                        </span>
                      ) : (
                        '-'
                      )}
                    </td>

                    <td className='whitespace-nowrap px-4 py-4'>
                      <button
                        onClick={() =>
                          onToggleAvailability?.(
                            product.id,
                            !product.isAvailable,
                          )
                        }
                        className={`rounded-full cursor-pointer px-3 py-1 text-xs font-medium transition ${
                          product.isAvailable
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-red-100 text-red-700 hover:bg-red-200'
                        }`}
                      >
                        {product.isAvailable ? 'In Stock' : 'Out of Stock'}
                      </button>
                    </td>

                    <td className='px-4 py-4'>
                      <div className='flex flex-wrap gap-2'>
                        <Link
                          href={`/admin/dashboard/id/products/edit/${product.id}`}
                          className='inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100'
                        >
                          <Pencil className='h-4 w-4' />
                          Edit
                        </Link>

                        <button
                          onClick={() => handleDeleteClick(product)}
                          className='inline-flex items-center gap-1 rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50'
                        >
                          <Trash2 className='h-4 w-4' />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredProducts.length === 0 && (
              <div className='flex flex-col items-center justify-center px-6 py-16 text-center'>
                <Package className='mb-3 h-12 w-12 text-gray-300' />
                <h3 className='text-lg font-semibold text-gray-800'>
                  No products found
                </h3>
                <p className='mt-1 text-sm text-gray-500'>
                  No products match the selected filter.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false)
          setSelectedProduct(null)
        }}
        onConfirm={handleDeleteConfirm}
        productName={selectedProduct?.name}
        isDeleting={isDeleting}
      />
    </div>
  )
}
