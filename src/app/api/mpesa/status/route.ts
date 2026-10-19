import { NextResponse } from 'next/server'
import { queryStkPushStatus } from '@/lib/m-pesa'
import { db } from '@/lib/db'

export async function POST(request: Request) {
  try {
    const { checkoutRequestId } = await request.json()

    const order = await db.order.findFirst({
      where: { mpesaTransactionId: checkoutRequestId },
    })

    if (!order) {
      return NextResponse.json({ status: 'not_found' })
    }

    if (order.paymentStatus === 'PAID') {
      return NextResponse.json({ status: 'completed' })
    }

    if (order.paymentStatus === 'FAILED') {
      return NextResponse.json({ status: 'failed', message: 'Payment failed' })
    }

    // Query M-Pesa for status
    const result = await queryStkPushStatus(checkoutRequestId)

    if (result.ResultCode === '0') {
      return NextResponse.json({ status: 'completed' })
    } else if (result.ResultCode !== '1037') {
      // 1037 means pending
      return NextResponse.json({ status: 'failed', message: result.ResultDesc })
    }

    return NextResponse.json({ status: 'pending' })
  } catch (error) {
    console.error('Error checking payment status:', error)
    return NextResponse.json(
      { status: 'error', message: 'Internal server error' },
      { status: 500 },
    )
  }
}
