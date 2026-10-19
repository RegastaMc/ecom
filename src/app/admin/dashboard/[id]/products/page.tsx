'use client'

import { getAllProducts } from '@/app/actions/getProducts'
import ProductsPage from '@/components/components/Admin/ProductsPage'
import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { Product } from '../../../../../../prisma/src/lib/prisma/client'

export default function Page() {
  const [products, setProducts] = useState<Product[]>([])

  useEffect(() => {
    const fetchProducts = async () => {
      const response = await getAllProducts()
      setProducts(response.products)
    }
    fetchProducts()
  }, [])

  const handleToggleAvailability = async (id: string, value: boolean) => {
    try {
      const response = await fetch(`/api/products/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isAvailable: value,
        }),
      })

      if (!response.ok) {
        toast.error('Failed to update availability')
        return
      }

      toast.success('Product availability updated')
    } catch (error) {
      toast.error('Failed to update availability')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/products/${id}`, {
        method: 'DELETE',
      })

      toast.success('Product deleted')
    } catch (error) {}
  }

  return (
    <ProductsPage
      products={products}
      onDelete={(id) => handleDelete(id)}
      onToggleAvailability={(id, value) => handleToggleAvailability(id, value)}
    />
  )
}
