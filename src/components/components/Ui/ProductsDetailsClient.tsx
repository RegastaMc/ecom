'use client'

import { ProductType } from '@/types'
import useCartStore from '@/stores/cartStore'
import { useState } from 'react'
import Image from 'next/image'
import { toast } from 'react-toastify'
import {
  ShoppingCart,
  Heart,
  Share2,
  Check,
  Minus,
  Plus,
  Star,
  Truck,
  Shield,
  RefreshCw,
} from 'lucide-react'
import Link from 'next/link'
import { Product } from '../../../../prisma/src/lib/prisma/client'

interface ProductDetailsClientProps {
  product: Product
}

const ProductDetailsClient = ({ product }: ProductDetailsClientProps) => {
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const { addToCart } = useCartStore()

  const images =
    (Array.isArray(product.images) && product.images.length > 0
      ? product.images.filter((img) => img != null && typeof img === 'string')
      : []
    ).length > 0
      ? Array.isArray(product.images)
        ? product.images.filter((img) => img != null && typeof img === 'string')
        : []
      : ['/placeholder-image.jpg']

  const hasOffer = product.offerPrice && product.offerPrice < product.price
  const displayPrice = hasOffer ? product.offerPrice! : product.price
  const discountPercentage = hasOffer
    ? Math.round(((product.price - product.offerPrice!) / product.price) * 100)
    : 0

  const handleQuantityChange = (type: 'increase' | 'decrease') => {
    if (type === 'increase') {
      setQuantity((prev) => prev + 1)
    } else if (type === 'decrease' && quantity > 1) {
      setQuantity((prev) => prev - 1)
    }
  }

  const handleAddToCart = () => {
    if (!product.isAvailable) {
      toast.error(`${product.name} is out of stock`)
      return
    }

    addToCart({
      id: product.id,
      name: product.name,
      price: displayPrice,
      quantity: quantity,
      image: images[0],
      isAvailable: product.isAvailable,
    })

    toast.success(`${quantity} × ${product.name} added to cart`)
  }

  const handleBuyNow = () => {
    handleAddToCart()
    // Redirect to checkout
    window.location.href = '/checkout'
  }

  const handleShare = async () => {
    const url = window.location.href
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: product.desc || 'Check out this product!',
          url: url,
        })
      } catch (err) {
        console.log('Error sharing:', err)
      }
    } else {
      // Fallback - copy to clipboard
      await navigator.clipboard.writeText(url)
      toast.success('Link copied to clipboard!')
    }
  }

  return (
    <div className='bg-white rounded-xl'>
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12'>
        {/* Image Gallery */}
        <div className='space-y-4'>
          {/* Main Image */}
          <div className='relative aspect-square rounded-xl overflow-hidden bg-gray-100'>
            <Image
              src={images[selectedImage]}
              alt={product.name}
              fill
              className='object-cover'
              priority
              sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
            />

            {/* Discount Badge */}
            {hasOffer && product.isAvailable && (
              <div className='absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold'>
                -{discountPercentage}%
              </div>
            )}

            {/* Out of Stock Badge */}
            {!product.isAvailable && (
              <div className='absolute inset-0 bg-black/50 flex items-center justify-center'>
                <span className='bg-white text-gray-900 px-6 py-3 rounded-lg font-bold text-lg'>
                  Out of Stock
                </span>
              </div>
            )}
          </div>

          {/* Thumbnail Images */}
          {images.length > 1 && (
            <div className='grid grid-cols-5 gap-2'>
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                    selectedImage === index
                      ? 'border-blue-600 shadow-md'
                      : 'border-gray-200 hover:border-gray-400'
                  }`}
                >
                  <Image
                    src={image}
                    alt={`${product.name} - Image ${index + 1}`}
                    fill
                    className='object-cover'
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className='space-y-6'>
          {/* Category */}
          <div className='text-sm text-blue-600 font-semibold uppercase tracking-wide'>
            {product.category}
          </div>

          {/* Title */}
          <h1 className='text-3xl lg:text-4xl font-bold text-gray-900'>
            {product.name}
          </h1>

          {/* Rating (Placeholder - you can implement actual ratings) */}
          {/* <div className='flex items-center gap-2'>
            <div className='flex items-center'>
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className='w-4 h-4 fill-yellow-400 text-yellow-400'
                />
              ))}
            </div>
            <span className='text-sm text-gray-500'>5.0 (12 reviews)</span>
          </div> */}

          {/* Price */}
          <div className='flex items-baseline gap-3'>
            <span className='text-3xl font-bold text-gray-900'>
              Ksh.{displayPrice.toFixed(0).toLocaleString()}
            </span>
            {hasOffer && (
              <>
                <span className='text-lg text-gray-400 line-through'>
                  Ksh.{product.price.toLocaleString()}
                </span>
                <span className='text-green-600 font-semibold'>
                  Save {discountPercentage}%
                </span>
              </>
            )}
          </div>

          {/* Description */}
          {product.desc && (
            <div className='border-t border-b py-6'>
              <h3 className='font-semibold text-gray-900 mb-2'>Description</h3>
              <p className='text-gray-600 leading-relaxed whitespace-pre-wrap'>
                {product.desc}
              </p>
            </div>
          )}

          {/* Availability */}
          <div className='flex items-center gap-2'>
            <div
              className={`w-3 h-3 rounded-full ${product.isAvailable ? 'bg-green-500' : 'bg-red-500'}`}
            />
            <span className='text-sm font-medium'>
              {product.isAvailable ? 'In Stock' : 'Out of Stock'}
            </span>
          </div>

          {/* Quantity Selector */}
          {product.isAvailable && (
            <div className='space-y-4'>
              <div>
                <label className='text-sm font-medium text-gray-700 mb-2 block'>
                  Quantity
                </label>
                <div className='flex items-center gap-3'>
                  <button
                    onClick={() => handleQuantityChange('decrease')}
                    className='border border-gray-300 rounded-lg p-2 hover:bg-gray-50 transition'
                  >
                    <Minus className='w-5 h-5' />
                  </button>
                  <span className='w-12 text-center font-medium text-lg'>
                    {quantity}
                  </span>
                  <button
                    onClick={() => handleQuantityChange('increase')}
                    className='border border-gray-300 rounded-lg p-2 hover:bg-gray-50 transition'
                  >
                    <Plus className='w-5 h-5' />
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className='flex gap-4'>
                <button
                  onClick={handleAddToCart}
                  className='flex-1 bg-black text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition flex items-center justify-center gap-2'
                >
                  <ShoppingCart className='w-5 h-5' />
                  Add to Cart
                </button>
                {/* <button
                  onClick={handleBuyNow}
                  className='flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition'
                >
                  Buy Now
                </button> */}
              </div>
            </div>
          )}

          {/* Action Icons */}
          {/* <div className='flex gap-4 pt-4'>
            <button
              onClick={() => setIsWishlisted(!isWishlisted)}
              className={`flex items-center gap-2 text-sm transition ${
                isWishlisted
                  ? 'text-red-500'
                  : 'text-gray-500 hover:text-red-500'
              }`}
            >
              <Heart
                className={`w-5 h-5 ${isWishlisted ? 'fill-red-500' : ''}`}
              />
              Wishlist
            </button>
            <button
              onClick={handleShare}
              className='flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition'
            >
              <Share2 className='w-5 h-5' />
              Share
            </button>
          </div> */}
        </div>
      </div>

      {/* Product Features/Services */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mt-12 pt-8 border-t'>
        <div className='flex items-center gap-3 p-4 bg-gray-50 rounded-lg'>
          <Truck className='w-8 h-8 text-blue-600' />
          <div>
            <h4 className='font-semibold text-gray-900'>Reliable Shipping</h4>
            <p className='text-sm text-gray-500'>On All Orders</p>
          </div>
        </div>
        <div className='flex items-center gap-3 p-4 bg-gray-50 rounded-lg'>
          <Shield className='w-8 h-8 text-blue-600' />
          <div>
            <h4 className='font-semibold text-gray-900'>Secure Payment</h4>
            <p className='text-sm text-gray-500'>100% secure transactions</p>
          </div>
        </div>
        <div className='flex items-center gap-3 p-4 bg-gray-50 rounded-lg'>
          <RefreshCw className='w-8 h-8 text-blue-600' />
          <div>
            <h4 className='font-semibold text-gray-900'>Easy Returns</h4>
            <p className='text-sm text-gray-500'>30-day return policy</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductDetailsClient
