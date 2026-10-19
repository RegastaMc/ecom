import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Trash2, ArrowRight, ShoppingCart, X, Minus, Plus } from 'lucide-react';
import useCartStore from '@/stores/cartStore';
import { CartItemsType } from '@/types';


interface CartSlideProps {
  onOpen?: () => void;
  onClose?: () => void;
  className?: string;
}


const Icons = {
  Cart: () => (
    <ShoppingCart className="h-6 w-6 text-[#DBA39A]" />
  ),
  Close: () => (
    <X className="w-5 h-5 text-[#3d2c28]" />
  ),
  Trash: () => (
    <Trash2 className="w-4 h-4" />
  ),
  Minus: () => (
    <Minus className="w-3 h-3" />
  ),
  Plus: () => (
    <Plus className="w-3 h-3" />
  ),
  Shopping: () => (
    <ShoppingCart className="w-12 h-12 text-[#DBA39A]/40" />
  ),
  ArrowRight: () => (
    <ArrowRight className="w-4 h-4" />
  ),
};


const CartSlide: React.FC<CartSlideProps> = ({ onOpen, onClose, className = '' }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const cartRef = useRef<HTMLDivElement>(null);
  
  // Use cart store
  const { cart, removeFromCart, clearCart } = useCartStore();

  // Handle cart open/close with animation
  const openCart = () => {
    setIsOpen(true);
    setIsAnimating(true);
    document.body.style.overflow = 'hidden';
    onOpen?.();
  };

  const closeCart = () => {
    setIsOpen(false);
    setTimeout(() => {
      setIsAnimating(false);
      document.body.style.overflow = 'auto';
    }, 300);
    onClose?.();
  };

  // Handle animation states
  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      document.body.style.overflow = 'hidden';
    } else {
      const timer = setTimeout(() => {
        setIsAnimating(false);
        document.body.style.overflow = 'auto';
      }, 300);
      return () => clearTimeout(timer);
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        closeCart();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (cartRef.current && !cartRef.current.contains(e.target as Node)) {
        closeCart();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Update quantity
  const handleUpdateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    const updatedCart = cart.map((item) =>
      item.id === id ? { ...item, quantity: newQuantity } : item
    );
    useCartStore.setState({ cart: updatedCart });
  };

  // Remove item
  const handleRemoveItem = (item: any) => {
    // if (window.confirm(`Remove "${item.name}" from your cart?`)) {
    //   removeFromCart(item.id);
    // }
    removeFromCart(item );
  };

  // Clear cart
  const handleClearCart = () => {
    if (window.confirm('Clear all items from your cart?')) {
      clearCart();
    }
  };

  // Calculate totals
  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const tax = subtotal * 0.16; // 16% VAT
  const shippingFee = subtotal < 5000 ? 200 : 0;
  const total = subtotal  
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <>
      {/* Cart Trigger Button */}
      <div
        onClick={openCart}
        className={`flex items-center gap-1 relative cursor-pointer p-2 hover:bg-[#F5EBEO] rounded-xl transition-colors ${className}`}
        role="button"
        aria-label="Open cart"
        aria-expanded={isOpen}
      >
        <span className="text-[#DBA39A]">
          <Icons.Cart />
        </span>
        <span className="absolute -top-1 -right-2 bg-[#DBA39A] text-white text-xs font-bold rounded-full min-w-[20px] h-5 px-1.5 flex items-center justify-center shadow-md">
          {itemCount}
        </span>
        <span className="hidden lg:inline text-sm font-medium ml-1 text-[#3d2c28]">Cart</span>
      </div>

      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={closeCart}
        aria-hidden="true"
      />

      {/* Cart Panel */}
      {isAnimating && (
        <div
          ref={cartRef}
          className={`fixed top-0 right-0 h-full w-full sm:w-105 md:w-120 bg-white shadow-2xl z-50 transition-transform duration-300 ease-in-out ${
            isOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
          role="dialog"
          aria-label="Shopping cart"
          aria-modal="true"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-[#F5EBEO] bg-[#FEFCF3]">
            <div>
              <h2 className="text-xl font-bold text-[#3d2c28]">Your Cart</h2>
              <p className="text-sm text-[#3d2c28]/60">
                {itemCount} {itemCount === 1 ? 'item' : 'items'}
              </p>
            </div>
            <button
              onClick={closeCart}
              className="p-2 hover:bg-[#F5EBEO] rounded-xl transition-colors"
              aria-label="Close cart"
            >
              <span className="text-[#3d2c28]">
                <Icons.Close />
              </span>
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6" style={{ maxHeight: 'calc(100vh - 280px)' }}>
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <Icons.Shopping />
                <p className="text-lg font-semibold text-[#3d2c28] mt-4">Your cart is empty</p>
                <p className="text-sm text-[#3d2c28]/60 mt-2 max-w-xs">
                  Go Back and continue Shopping...
                </p>
                <button
                  onClick={closeCart}
                  className="mt-6 px-6 py-2 bg-[#DBA39A] cursor-pointer hover:bg-[#c49087] text-white font-medium rounded-xl transition-colors shadow-md hover:shadow-lg"
                >
                  Continue Shopping
                </button>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {cart.map((item) => {
                    const itemTotal = item.price * item.quantity;
                    const imageUrl = typeof item.images === 'string'
                      ? item.images
                      : Array.isArray(item.images) && item.images.length > 0 && typeof item.images[0] === 'string'
                      ? item.images[0]
                      : '/placeholder.jpg';

                    return (
                      <div
                        key={item.id}
                        className="flex gap-4 p-3 rounded-xl border border-[#F5EBEO] hover:border-[#DBA39A]/30 transition-all bg-white"
                      >
                        {/* Image */}
                        <div className="shrink-0 w-20 h-20 bg-[#FEFCF3] rounded-xl overflow-hidden border border-[#F5EBEO] relative">
                          <Image
                            src={imageUrl}
                            alt={item.name}
                            fill
                            className="object-contain"
                          />
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-[#3d2c28] text-sm truncate">{item.name}</h3>
                              {item.category && (
                                <p className="text-xs text-[#DBA39A] font-medium">{item.category}</p>
                              )}
                              <p className="text-xs font-medium text-[#DBA39A] mt-1">
                                Ksh.{item.price.toFixed(2)}
                              </p>
                            </div>
                            <button
                              onClick={() => handleRemoveItem(item)}
                              className="p-1 hover:bg-red-50 rounded-lg transition-colors cursor-pointer text-[#3d2c28]/40 hover:text-red-500"
                              aria-label={`Remove ${item.name}`}
                            >
                              <Icons.Trash />
                            </button>
                          </div>

                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                                disabled={item.quantity <= 1}
                                className={`w-7 h-7 rounded-full border transition-colors flex items-center justify-center ${
                                  item.quantity <= 1
                                    ? 'border-[#F5EBEO] text-[#3d2c28]/30 cursor-not-allowed'
                                    : 'border-[#F5EBEO] hover:border-[#DBA39A] hover:bg-[#F5EBEO]'
                                }`}
                              >
                                <Icons.Minus />
                              </button>
                              <span className="w-6 text-center font-medium text-sm">{item.quantity}</span>
                              <button
                                onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                                className="w-7 h-7 rounded-full border border-[#F5EBEO] hover:border-[#DBA39A] hover:bg-[#F5EBEO] transition-colors flex items-center justify-center"
                              >
                                <Icons.Plus />
                              </button>
                            </div>
                            <p className="font-semibold text-[#DBA39A] text-sm">
                              Ksh.{itemTotal.toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Clear cart button */}
                {cart.length > 0 && (
                  <button
                    onClick={handleClearCart}
                    className="text-sm text-[#3d2c28]/40 hover:text-red-500 transition-colors underline underline-offset-2 mt-4"
                  >
                    Clear Cart
                  </button>
                )}
              </>
            )}
          </div>

          {/* Footer / Checkout */}
          {cart.length > 0 && (
            <div className="border-t border-[#F5EBEO] p-4 sm:p-6 bg-[#FEFCF3]">
              {/* Totals */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-[#3d2c28]/60">
                  <span>Subtotal</span>
                  <span>Ksh.{subtotal.toFixed(2)}</span>
                </div>
                {/* <div className="flex justify-between text-[#3d2c28]/60">
                  <span>Tax (16%)</span>
                  <span>Ksh.{tax.toFixed(2)}</span>
                </div> */}
                <div className="flex justify-between text-[#3d2c28]/60">
                  <span>Shipping Fee</span>
                  <span>{shippingFee === 0 ? 'To be Negotiated' : `To be Negotiated`}</span>
                </div>
                {/* {subtotal > 0 && subtotal < 5000 && (
                  <p className="text-xs text-[#DBA39A]">
                    Add Ksh.{(5000 - subtotal).toFixed(2)} more for free shipping
                  </p>
                )} */}
                <div className="border-t border-[#F5EBEO] pt-3 flex justify-between font-bold text-[#3d2c28]">
                  <span>Total</span>
                  <span className="text-[#DBA39A] text-lg">Ksh.{total.toFixed(2)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 mt-4">
                <button
                  onClick={() => {
                    closeCart();
                    window.location.href = '/cart';
                  }}
                  className="flex-1 px-6 py-3 border-2 border-[#DBA39A] text-[#DBA39A] hover:bg-[#DBA39A] hover:text-white font-semibold rounded-xl transition-all"
                >
                  View Cart
                </button>
                <button
                  onClick={() => {
                    closeCart();
                    window.location.href = '/cart?step=2';
                  }}
                  className="flex-1 px-6 py-3 bg-[#DBA39A] hover:bg-[#c49087] text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2"
                >
                  Checkout
                  <Icons.ArrowRight />
                </button>
              </div>

              {/* Secure checkout note */}
              {/* <p className="text-center text-xs text-[#3d2c28]/40 mt-3 flex items-center justify-center gap-1">
                <span>🔒</span>
                Secure checkout - Free shipping over Ksh.5,000
              </p> */}
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default CartSlide;