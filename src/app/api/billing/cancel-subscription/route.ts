import { type NextRequest, type NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

/**
 * POST /api/billing/cancel-subscription
 * Cancel a user's subscription (sets it to cancel at period end)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { subscriptionId } = body as { subscriptionId: string }

    if (!subscriptionId) {
      return NextResponse.json(
        { error: 'Subscription ID required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    await stripe.subscriptions.update(
      subscriptionId,
      {
        cancel_at_period_end: true,
      }
    )

    await supabase
      .from('subscriptions')
      .update({
        cancel_at_period_end: true,
        status: 'canceled',
      })
      .eq('stripe_subscription_id', subscriptionId)

    return NextResponse.json({
      success: true,
      message: 'Subscription will be canceled at the end of the current period',
    })
  } catch (error: any) {
    console.error('Cancel subscription error:', error)

    if (error.statusCode === 404) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to cancel subscription' },
      { status: 500 }
    )
  }
}
