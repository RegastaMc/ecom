// app/api/payhero/callback/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';


interface PayHeroCallbackData {
  reference: string;
  CheckoutRequestID?: string;
  status: 'success' | 'failed' | 'cancelled' | 'pending';
  amount?: number;
  phone_number?: string;
  transaction_id?: string;
  external_reference?: string;
  customer_name?: string;
  metadata?: {
    orderId?: string;
    userId?: string;
    [key: string]: any;
  };
  error?: string;
}


export async function POST(req: NextRequest) {
  try {
    // Get the raw body and headers
    const rawBody = await req.text();
    const authHeader = req.headers.get('authorization');
    const signatureHeader = req.headers.get('x-signature');
    
    console.log('PayHero callback received:', {
      authHeader,
      signatureHeader,
      rawBody,
    });

    // Parse the body
    let body: PayHeroCallbackData;
    try {
      body = JSON.parse(rawBody);
    } catch (e) {
      console.error('Failed to parse callback body:', e);
      return NextResponse.json({
        success: false,
        error: 'Invalid JSON payload',
      }, { status: 400 });
    }

    // Log the callback data for debugging
    console.log('PayHero callback data:', {
      reference: body.reference,
      checkoutId: body.CheckoutRequestID,
      status: body.status,
      amount: body.amount,
      phone: body.phone_number,
      transactionId: body.transaction_id,
      externalRef: body.external_reference,
    });

    // Validate required fields
    if (!body.reference && !body.CheckoutRequestID) {
      console.error('Missing reference or CheckoutRequestID');
      return NextResponse.json({
        success: false,
        error: 'Missing reference or CheckoutRequestID',
      }, { status: 400 });
    }

    const reference = body.reference || body.CheckoutRequestID;

    // Find the order using the reference
    let order = await db.order.findFirst({
      where: {
        OR: [
          { mpesaReceiptNumber: reference },
          { orderNumber: { contains: reference } },
          { mpesaResultCode: body.external_reference || '' },
        ],
      },
      include: {
        items: true,
        user: {
          select: {
            id: true,
            email: true,
           name: true,
          },
        },
      },
    });

    // If order not found, try to find by metadata
    // if (!order && body.metadata?.orderId) {
    //   order = await db.order.findUnique({
    //     where: { id: body.metadata.orderId },
    //     include: {
    //       items: true,
    //       user: {
    //         select: {
    //           id: true,
    //           email: true,
    //           name: true,

    //         },
    //       },
    //     },
    //   });
    // }

    // If still no order, log and acknowledge
    if (!order) {
      console.error('Order not found for callback:', { reference, body });
      
      // Still return success to acknowledge receipt
      return NextResponse.json({
        success: true,
        message: 'Callback received but order not found. Creating pending record.',
        data: {
          reference,
          status: 'pending',
        },
      });
    }

    // Process the callback based on status
    let orderUpdated = false;
    let statusMessage = '';

    switch (body.status) {
      case 'success':
        // Payment successful - update order
        await db.$transaction(async (tx) => {
          // Update order status
          await tx.order.update({
            where: { id: order.id },
            data: {
              paymentStatus: 'PAID',
              status: 'PROCESSING',
              mpesaReceiptNumber: body.transaction_id || reference,
              paidAt: new Date(),
              updatedAt: new Date(),
            },
          });

          // Log the successful payment
        });

        orderUpdated = true;
        statusMessage = 'Payment successful and order confirmed';
        break;

      case 'failed':
        // Payment failed - update order
        await db.$transaction(async (tx) => {
          await tx.order.update({
            where: { id: order.id },
            data: {
              paymentStatus: 'FAILED',
              status: 'CANCELLED',
              updatedAt: new Date(),
            },
          });

          // Log the failed payment
         
        });

        orderUpdated = true;
        statusMessage = 'Payment failed - order cancelled';
        break;

      case 'cancelled':
        // Payment cancelled by user
        await db.$transaction(async (tx) => {
          await tx.order.update({
            where: { id: order.id },
            data: {
              paymentStatus: 'FAILED',
              status: 'CANCELLED',
              updatedAt: new Date(),
            },
          });

         
        });

        orderUpdated = true;
        statusMessage = 'Payment cancelled by user';
        break;

      case 'pending':
      default:
        // Payment is still pending - update status
        await db.order.update({
          where: { id: order.id },
          data: {
            paymentStatus: 'PENDING',
            updatedAt: new Date(),
          },
        });

        statusMessage = 'Payment status updated to pending';
        break;
    }

    // Return success response
    return NextResponse.json({
      success: true,
      message: orderUpdated ? 'Order updated successfully' : 'Callback processed',
      data: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        reference,
        status: body.status,
        statusMessage,
        transactionId: body.transaction_id,
      },
    });

  } catch (error) {
    console.error('PayHero callback error:', error);
    
    // Always return success to acknowledge receipt
    // Even if we couldn't process, PayHero should know we received it
    return NextResponse.json({
      success: false,
      error: 'Failed to process callback',
      message: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}