'use client'

import { useState, useEffect } from 'react'
import { Smartphone, Loader2, CheckCircle, XCircle } from 'lucide-react'

interface MpesaPaymentModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  phoneNumber: string
  amount: number
  checkoutRequestId?: string
}

const MpesaPaymentModal = ({
  isOpen,
  onClose,
  onSuccess,
  phoneNumber,
  amount,
  checkoutRequestId,
}: MpesaPaymentModalProps) => {
  const [status, setStatus] = useState<'pending' | 'success' | 'failed'>(
    'pending',
  )
  const [message, setMessage] = useState('Waiting for payment confirmation...')

  useEffect(() => {
    if (!isOpen || !checkoutRequestId) return

    // Poll for payment status
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch('/api/mpesa/status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ checkoutRequestId }),
        })

        const data = await response.json()

        if (data.status === 'completed') {
          setStatus('success')
          setMessage('Payment successful! Redirecting...')
          clearInterval(pollInterval)
          setTimeout(() => {
            onSuccess()
          }, 10000)
        } else if (data.status === 'failed') {
          setStatus('failed')
          setMessage(data.message || 'Payment failed. Please try again.')
          clearInterval(pollInterval)
        }
      } catch (error) {
        console.error('Error checking payment status:', error)
      }
    }, 5000) // Check every 3 seconds

    // Timeout after 5 minutes
    const timeout = setTimeout(() => {
      if (status === 'pending') {
        setStatus('failed')
        setMessage('Payment timeout. Please try again.')
        clearInterval(pollInterval)
      }
    }, 300000)

    return () => {
      clearInterval(pollInterval)
      clearTimeout(timeout)
    }
  }, [isOpen, checkoutRequestId, onSuccess])

  if (!isOpen) return null

  return (
    <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50'>
      <div className='bg-white rounded-lg p-6 max-w-md w-full mx-4'>
        <div className='text-center'>
          {status === 'pending' && (
            <>
              <div className='w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                <Smartphone className='w-8 h-8 text-green-600' />
              </div>
              <h3 className='text-xl font-semibold mb-2'>M-Pesa Payment</h3>
              <p className='text-gray-600 mb-4'>
                Enter your M-Pesa PIN on your phone to complete payment
              </p>
              <div className='bg-gray-50 p-4 rounded-lg mb-4'>
                <p className='text-sm text-gray-600'>Amount to pay:</p>
                <p className='text-2xl font-bold'>
                  KSh {amount.toLocaleString()}
                </p>
                <p className='text-sm text-gray-600 mt-2'>
                  Phone: {phoneNumber}
                </p>
              </div>
              <div className='flex items-center justify-center gap-2 text-gray-600'>
                <Loader2 className='w-5 h-5 animate-spin' />
                <span>{message}</span>
              </div>
            </>
          )}

          <div className='w-full h-px bg-gray-200 my-6' />
          <div className='text-center'>
            <button
              onClick={onClose}
              className='w-full bg-gray-800 text-white py-2 rounded-lg hover:bg-gray-900'
            >
              Cancel
            </button>
          </div>

          {status === 'success' && (
            <>
              <div className='w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                <CheckCircle className='w-8 h-8 text-green-600' />
              </div>
              <h3 className='text-xl font-semibold mb-2'>
                Payment Successful!
              </h3>
              <p className='text-gray-600'>{message}</p>
            </>
          )}

          {status === 'failed' && (
            <>
              <div className='w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                <XCircle className='w-8 h-8 text-red-600' />
              </div>
              <h3 className='text-xl font-semibold mb-2'>Payment Failed</h3>
              <p className='text-gray-600 mb-4'>{message}</p>
              <button
                onClick={onClose}
                className='w-full bg-gray-800 text-white py-2 rounded-lg hover:bg-gray-900'
              >
                Close
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default MpesaPaymentModal
