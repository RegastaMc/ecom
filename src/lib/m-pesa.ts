// M-Pesa API Configuration
const MPESA_CONSUMER_KEY = process.env.MPESA_CONSUMER_KEY!
const MPESA_CONSUMER_SECRET = process.env.MPESA_CONSUMER_SECRET!
const MPESA_PASSKEY = process.env.MPESA_PASSKEY!
const MPESA_SHORTCODE = process.env.MPESA_SHORTCODE!
const MPESA_ENVIRONMENT = process.env.MPESA_ENVIRONMENT || 'sandbox' // sandbox or production

// Get M-Pesa Access Token
export async function getMpesaAccessToken() {
  const auth = Buffer.from(
    `${MPESA_CONSUMER_KEY}:${MPESA_CONSUMER_SECRET}`,
  ).toString('base64')

  const url =
    MPESA_ENVIRONMENT === 'production'
      ? 'https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials'
      : 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials'

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Basic ${auth}`,
      },
    })
    const data = await response.json()
    return data.access_token
  } catch (error) {
    console.error('Error getting M-Pesa token:', error)
    throw new Error('Failed to get M-Pesa access token')
  }
}

// Initiate STK Push (Lipa Na M-Pesa Online)
export async function initiateStkPush(
  phoneNumber: string,
  amount: number,
  accountReference: string,
  transactionDesc: string,
) {
  const accessToken = await getMpesaAccessToken()
  console.log(`access token:`, accessToken)

  const timestamp = new Date()
    .toISOString()
    .replace(/[^0-9]/g, '')
    .slice(0, 14)

  const password = Buffer.from(
    `${MPESA_SHORTCODE}${MPESA_PASSKEY}${timestamp}`,
  ).toString('base64')

  const url =
    MPESA_ENVIRONMENT === 'production'
      ? 'https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest'
      : 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest'

  // Format phone number (remove 0 or +254, ensure 254XXXXXXXXX)
  let formattedPhone = phoneNumber.toString()
  if (formattedPhone.startsWith('0')) {
    formattedPhone = '254' + formattedPhone.slice(1)
    console.log(`phone:`, formattedPhone)
  } else if (formattedPhone.startsWith('+')) {
    formattedPhone = formattedPhone.slice(1)
    console.log(`phone:`, formattedPhone)
  }

  const data = {
    BusinessShortCode: MPESA_SHORTCODE,
    Password: password,
    Timestamp: timestamp,
    TransactionType: 'CustomerPayBillOnline',
    Amount: Math.round(amount),
    PartyA: formattedPhone,
    PartyB: MPESA_SHORTCODE,
    PhoneNumber: formattedPhone,
    CallBackURL: `${process.env.NEXT_PUBLIC_BASE_URL}/api/mpesa/callback`,
    AccountReference: accountReference,
    TransactionDesc: transactionDesc,
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    console.log(`response from stkpush:`, response)
    return response.json()
  } catch (error) {
    console.error('Error initiating STK push:', error)
    throw new Error('Failed to initiate M-Pesa payment')
  }
}

// Query STK Push Status
export async function queryStkPushStatus(checkoutRequestId: string) {
  const accessToken = await getMpesaAccessToken()

  const timestamp = new Date()
    .toISOString()
    .replace(/[^0-9]/g, '')
    .slice(0, 14)

  const password = Buffer.from(
    `${MPESA_SHORTCODE}${MPESA_PASSKEY}${timestamp}`,
  ).toString('base64')

  const url =
    MPESA_ENVIRONMENT === 'production'
      ? 'https://api.safaricom.co.ke/mpesa/stkpushquery/v1/query'
      : 'https://sandbox.safaricom.co.ke/mpesa/stkpushquery/v1/query'

  const data = {
    BusinessShortCode: MPESA_SHORTCODE,
    Password: password,
    Timestamp: timestamp,
    CheckoutRequestID: checkoutRequestId,
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    return response.json()
  } catch (error) {
    console.error('Error querying STK push:', error)
    throw new Error('Failed to query payment status')
  }
}
