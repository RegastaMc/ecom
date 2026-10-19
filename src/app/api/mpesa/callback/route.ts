import { NextResponse } from 'next/server'
import { updateOrderPayment } from '@/app/actions/order'
import { db } from '@/lib/db'

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Extract callback data
    const { Body } = body
    const { stkCallback } = Body
    const {
      MerchantRequestID,
      CheckoutRequestID,
      ResultCode,
      ResultDesc,
      CallbackMetadata,
    } = stkCallback

    // Get order by transaction ID
    const order = await db.order.findFirst({
      where: { mpesaTransactionId: CheckoutRequestID },
    })

    if (!order) {
      console.error('Order not found for transaction:', CheckoutRequestID)
      return NextResponse.json({ success: false, error: 'Order not found' })
    }

    if (ResultCode === 0) {
      let mpesaReceiptNumber = ''
      if (CallbackMetadata?.Item) {
        const receiptItem = CallbackMetadata.Item.find(
          (item: any) => item.Name === 'MpesaReceiptNumber',
        )
        if (receiptItem) {
          mpesaReceiptNumber = receiptItem.Value
        }
      }

      await updateOrderPayment(
        order.orderNumber,
        'PAID',
        mpesaReceiptNumber,
        ResultCode.toString(),
      )

      // clear cart for user

      console.log(`Payment successful for order ${order.orderNumber}`)
    } else {
      // Payment failed
      await updateOrderPayment(
        order.orderNumber,
        'FAILED',
        undefined,
        ResultCode.toString(),
      )
      console.error(
        `Payment failed for order ${order.orderNumber}: ${ResultDesc}`,
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error processing M-Pesa callback:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 },
    )
  }
}
