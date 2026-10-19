'use client';

import useCartStore from '@/stores/cartStore';
import { ProductType } from '@/types';
import { ShoppingCart, Heart, Eye } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'react-toastify';

const ProductCard = ({ product }: { product: any }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const { addToCart } = useCartStore();

  const images =
    Array.isArray(product.images) && product.images.length > 0
      ? product.images
      : ['/placeholder-image.jpg'];

  const hasOffer = product.offerPrice && product.offerPrice < product.price;
  const displayPrice = hasOffer ? product.offerPrice! : product.price;
  const discountPercentage = hasOffer
    ? Math.round(((product.price - product.offerPrice!) / product.price) * 100)
    : 0;

  const handleAddToCart = () => {
    if (!product.isAvailable) {
      toast.error(`${product.name} is out of stock`);
      return;
    }

    setIsAdding(true);

    addToCart({
      id: product.id,
      name: product.name,
      price: displayPrice,
      quantity: 1,
      images: images[0],
      selectedSize: product.sizes ? product.sizes[0] : undefined,
      selectedColor: product.colors ? product.colors[0] : undefined,
      shortDescription: product.shortDescription,
      description: product.description,
      colors: product.colors,
      sizes: product.sizes,
    });

    toast.success(`${product.name} added to cart`);

    setTimeout(() => {
      setIsAdding(false);
    }, 600);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
    toast.success(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist');
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Navigate to product detail or open modal
    window.location.href = `/products/${product.id}`;
  };

  return (
    <div
      className='group relative bg-white rounded-2xl overflow-hidden border border-[#F5EBEO] hover:border-[#DBA39A]/30 hover:shadow-xl transition-all duration-300'
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* IMAGE SECTION */}
      <Link href={`/products/${product.id}`}>
        <div className='relative aspect-square overflow-hidden bg-[#FEFCF3]'>
          <Image
            src={images[currentImageIndex]}
            alt={product.name}
            fill
            className={`object-cover transition-all duration-700 ${
              isHovered ? 'scale-105' : 'scale-100'
            }`}
            sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
          />

          {/* Image Navigation Dots (visible on hover) */}
          {images.length > 1 && isHovered && (
            <div className='absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5'>
              {images.slice(0, 4).map((_: any, idx: number) => (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setCurrentImageIndex(idx);
                  }}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    currentImageIndex === idx
                      ? 'w-4 bg-[#DBA39A]'
                      : 'w-1.5 bg-white/60 hover:bg-white/80'
                  }`}
                  aria-label={`View image ${idx + 1}`}
                />
              ))}
            </div>
          )}

          {/* Badges */}
          <div className='absolute top-3 left-3 flex flex-col gap-1.5'>
            {hasOffer && product.isAvailable && (
              <span className='bg-[#F0DBDB] text-[#3d2c28] text-xs font-bold px-2.5 py-1 rounded-full shadow-md'>
                -{discountPercentage}%
              </span>
            )}
            {!product.isAvailable && (
              <span className='bg-[#3d2c28]/80 backdrop-blur-sm text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-md'>
                Out of Stock
              </span>
            )}
          </div>

          {/* Wishlist Button */}
          <button
            onClick={handleWishlist}
            className={`absolute top-3 right-3 p-2 rounded-full bg-white/80 backdrop-blur-sm shadow-md transition-all duration-300 ${
              isHovered ? 'opacity-100' : 'opacity-0 sm:opacity-100'
            } hover:bg-white`}
            aria-label="Add to wishlist"
          >
            <Heart
              className={`h-4 w-4 transition-colors ${
                isWishlisted
                  ? 'fill-[#DBA39A] text-[#DBA39A]'
                  : 'text-[#3d2c28]/40'
              }`}
            />
          </button>

          {/* Quick View Button */}
          <button
            onClick={handleQuickView}
            className={`absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[2px] transition-all duration-300 ${
              isHovered ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
            aria-label="Quick view"
          >
            <span className='flex items-center gap-2 bg-white/90 text-[#3d2c28] px-4 py-2 rounded-xl text-sm font-medium shadow-lg transform transition-all duration-300 hover:scale-105'>
              <Eye className='h-4 w-4' />
              Quick View
            </span>
          </button>
        </div>
      </Link>

      {/* PRODUCT DETAILS */}
      <div className='p-4 space-y-1.5'>
        {/* Category */}
        {product.category && (
          <p className='text-xs text-[#DBA39A] font-medium uppercase tracking-wider'>
            {product.category}
          </p>
        )}

        {/* Product Name */}
        <Link href={`/products/${product.id}`}>
          <h3 className='font-semibold text-[#3d2c28] hover:text-[#DBA39A] transition-colors line-clamp-1 text-sm'>
            {product.name}
          </h3>
        </Link>

        {/* Price */}
        <div className='flex items-baseline gap-2'>
          <span className='text-lg font-bold text-[#DBA39A]'>
            Ksh.{displayPrice.toFixed(0).toLocaleString()}
          </span>
          {hasOffer && (
            <span className='text-xs text-[#3d2c28]/40 line-through'>
              Ksh.{product.price.toFixed(0).toLocaleString()}
            </span>
          )}
        </div>

        {/* Add to Cart Button - Minimalist */}
        <button
          onClick={handleAddToCart}
          disabled={!product.isAvailable || isAdding}
          className={`w-full mt-2 py-2.5 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2 text-sm ${
            product.isAvailable && !isAdding
              ? 'bg-[#F5EBEO] text-[#3d2c28] hover:bg-[#DBA39A] hover:text-white hover:shadow-md active:scale-[0.98]'
              : 'bg-[#F5EBEO] text-[#3d2c28]/40 cursor-not-allowed'
          }`}
        >
          {isAdding ? (
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 border-2 border-[#DBA39A] border-t-transparent rounded-full animate-spin" />
              <span>Adding...</span>
            </div>
          ) : (
            <>
              <ShoppingCart className='h-4 w-4' />
              {product.isAvailable ? 'Add to Cart' : 'Out of Stock'}
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;