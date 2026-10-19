'use client'

import { AlertTriangle, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

interface DeleteConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  productName?: string
  isDeleting?: boolean
}

const DeleteConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  productName,
  isDeleting = false,
}: DeleteConfirmModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  // Prevent body scroll when modal is open and fix position
  useEffect(() => {
    if (isOpen) {
      // Save current scroll position
      const scrollY = window.scrollY

      // Prevent scrolling on body
      document.body.style.position = 'fixed'
      document.body.style.top = `-${scrollY}px`
      document.body.style.left = '0'
      document.body.style.right = '0'
      document.body.style.width = '100%'
      document.body.style.overflow = 'hidden'

      return () => {
        // Restore scrolling
        const scrollY = document.body.style.top
        document.body.style.position = ''
        document.body.style.top = ''
        document.body.style.left = ''
        document.body.style.right = ''
        document.body.style.width = ''
        document.body.style.overflow = ''

        // Restore scroll position
        if (scrollY) {
          window.scrollTo(0, parseInt(scrollY || '0', 10) * -1)
        }
      }
    }
  }, [isOpen])

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen && !isDeleting) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, isDeleting, onClose])

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node) &&
        !isDeleting
      ) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, isDeleting, onClose])

  if (!isOpen || !mounted) return null

  // Render modal using portal to body
  return createPortal(
    <div
      className='fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm'
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
      }}
    >
      {/* Modal Container - Centered */}
      <div
        ref={modalRef}
        className='relative w-full max-w-md mx-4 transform transition-all duration-300'
        style={{
          position: 'relative',
          margin: '0 auto',
        }}
      >
        <div className='rounded-lg bg-white p-6 shadow-xl'>
          {/* Header */}
          <div className='flex items-center justify-between mb-4'>
            <div className='flex items-center gap-2'>
              <div className='rounded-full bg-red-100 p-2'>
                <AlertTriangle className='h-5 w-5 text-red-600' />
              </div>
              <h2 className='text-lg font-semibold text-gray-900'>
                Delete Product
              </h2>
            </div>
            <button
              onClick={onClose}
              disabled={isDeleting}
              className='rounded-full p-1 hover:bg-gray-100 transition disabled:opacity-50'
            >
              <X className='h-5 w-5 text-gray-500' />
            </button>
          </div>

          {/* Content */}
          <p className='text-gray-600 mb-2'>
            Are you sure you want to delete this product?
          </p>

          {productName && (
            <p className='text-sm font-medium text-red-600 bg-red-50 rounded-lg p-2 mb-4 break-words'>
              {productName}
            </p>
          )}

          <p className='text-xs text-gray-500 mb-6'>
            ⚠️ This action cannot be undone.
          </p>

          {/* Actions */}
          <div className='flex gap-3'>
            <button
              onClick={onClose}
              disabled={isDeleting}
              className='flex-1 rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed'
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isDeleting}
              className='flex-1 rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'
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
    </div>,
    document.body,
  )
}

export default DeleteConfirmModal
