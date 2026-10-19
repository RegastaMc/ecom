// app/api/payhero/initiate/route.ts
import { NextRequest, NextResponse } from 'next/server';

const PAYHERO_API_URL = 'https://backend.payhero.co.ke/api/v2/payments';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate required fields
    const requiredFields = ['amount', 'phoneNumber', 'channel_id', 'provider'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json({
          success: false,
          error: `Missing required field: ${field}`,
        }, { status: 400 });
      }
    }

   
    const payload = {
      amount: body.amount, 
      phone_number: body.phoneNumber, 
      channel_id: body.channel_id, 
      provider: body.provider, 
      external_reference: body.external_reference || `ORD-${Date.now()}`,
      customer_name: body.customer_name || 'Customer',
      callback_url: body.callback_url || process.env.PAYHERO_CALLBACK_URL,
    };

    const response = await fetch(PAYHERO_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': "Basic bTdnRFNPQzhLWW5tdm42MXB2SWM6U3dORTlhYjFyeHNlb21jcVpxcWZjQ3UyU2VMbnFqRlhBcU5LSEVqdQ==",
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (response.status === 201 && data.success) {
      return NextResponse.json({
        success: true,
        data: {
          reference: data.reference,
          checkoutId: data.reference || data.CheckoutRequestID,
          status: data.status,
        },
      });
    } else {
      console.error('PayHero API error:', data);
      return NextResponse.json({
        success: false,
        error: data.error || data.message || 'Payment initiation failed',
        details: data,
      }, { status: response.status || 400 });
    }

  } catch (error) {
    console.error('PayHero initiation error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to initiate payment. Please try again.',
    }, { status: 500 });
  }
}