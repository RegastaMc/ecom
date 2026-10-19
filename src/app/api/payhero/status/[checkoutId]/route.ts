import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

const PAYHERO_API_URL = 'https://backend.payhero.co.ke/api/v2/transaction-status';
const PAYHERO_AUTH_TOKEN = process.env.PAYHERO_AUTH_TOKEN;


export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ checkoutId: string }> }
) {
  try {
    const { checkoutId } = await params;

    if (!checkoutId) {
      return NextResponse.json({
        success: false,
        error: 'Checkout ID is required',
        status: 'error',
      }, { status: 400 });
    }

    // console.log(`Checking payment status for checkout ID: ${checkoutId}`);

    // Option 1: Check with PayHero API directly
    const payHeroResponse = await fetch(`${PAYHERO_API_URL}?reference=${checkoutId}`, {
      method: 'GET',
      headers: {
        'Authorization': 'Basic bTdnRFNPQzhLWW5tdm42MXB2SWM6U3dORTlhYjFyeHNlb21jcVpxcWZjQ3UyU2VMbnFqRlhBcU5LSEVqdQ==',
        'Content-Type': 'application/json',
      },
    });

    const payHeroData = await payHeroResponse.json();
    // console.log(`payhero data:`,payHeroData)

    // if (payHeroResponse.ok) {
    //   // Also check our local order status
    //   const order = await db.order.findFirst({
    //     where: {
    //       OR: [
    //         { mpesaReceiptNumber: checkoutId },
    //         { mpesaResultCode: payHeroData.CheckoutRequestID || '' },
    //       ],
    //     },
    //     select: {
    //       id: true,
    //       paymentStatus: true,
    //       status: true,
    //     },
    //   });

    //   // Combine both sources of truth
    //   const status = payHeroData.status || payHeroData.data?.status || 'unknown';
    //   const isCompleted = status === 'completed' || status === 'success';

    //   // If PayHero says completed but our order isn't, update it
    //   if (isCompleted && order && order.paymentStatus !== 'PAID') {
    //     await db.order.update({
    //       where: { id: order.id },
    //       data: {
    //         paymentStatus: 'PAID',
    //         status: 'PROCESSING',
    //         paidAt: new Date(),
    //       },
    //     });
    //   }

    //   return NextResponse.json({
    //     success: true,
    //     status: status,
    //     isCompleted,
    //     data: payHeroData.data || payHeroData,
    //     orderStatus: order?.paymentStatus || 'unknown',
    //   });
    // } else {
    //   // Option 2: Check our local database if PayHero API fails
    //   const order = await db.order.findFirst({
    //     where: {
    //       OR: [
    //         { mpesaReceiptNumber: checkoutId },
    //         { mpesaResultCode: checkoutId },
    //       ],
    //     },
    //     select: {
    //       id: true,
    //       paymentStatus: true,
    //       status: true,
    //       paidAt: true,
    //       orderNumber: true,
    //     },
    //   });

    //   if (order) {
    //     return NextResponse.json({
    //       success: true,
    //       status: order.paymentStatus.toLowerCase(),
    //       isCompleted: order.paymentStatus === 'PAID',
    //       data: {
    //         checkoutId,
    //         orderId: order.id,
    //         orderNumber: order.orderNumber,
    //         paidAt: order.paidAt,
    //       },
    //     });
    //   }

    // If not found anywhere
    //   return NextResponse.json({
    //     success: false,
    //     status: 'not_found',
    //     isCompleted: false,
    //     error: 'Payment checkout ID not found',
    //   }, { status: 404 });
    // }
    return NextResponse.json({
      success: true,
     data: payHeroData,
    });

  } catch (error) {
    console.error('Status check error:', error);
    return NextResponse.json({
      success: false,
      status: 'error',
      isCompleted: false,
      error: 'Failed to check payment status',
    }, { status: 500 });
  }
}