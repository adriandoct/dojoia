import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { headers } from 'next/headers'
import { handleStripeWebhook } from '@/lib/services/stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
})

/**
 * POST /api/webhooks/stripe
 * Handles Stripe webhook events
 */
export async function POST(request: NextRequest) {
  const body = await request.text()
  const headersList = await headers()
  const signature = headersList.get('stripe-signature') || ''

  try {
    const event = await handleStripeWebhook(Buffer.from(body), signature)

    return NextResponse.json(
      { received: true, event: event.type },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Webhook error:', error)

    if (error.message === 'Invalid signature') {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/webhooks/stripe
 * Stripe webhook verification endpoint
 */
export async function GET() {
  return NextResponse.json({
    message: 'Stripe webhook endpoint is active',
    timestamp: new Date().toISOString(),
  })
}
