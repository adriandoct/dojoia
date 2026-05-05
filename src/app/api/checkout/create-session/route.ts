import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { createCheckoutSession } from '@/lib/services/stripe'
import { createClient } from '@/lib/supabase/server'

/**
 * POST /api/checkout/create-session
 * Creates a Stripe checkout session for subscription
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
    const { planId, successUrl, cancelUrl } = body as {
      planId: string
      successUrl?: string
      cancelUrl?: string
    }

    if (!planId) {
      return NextResponse.json(
        { error: 'Plan ID is required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', (session.user as any).id)
      .single()

    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

    const result = await createCheckoutSession(
      (profile as any).id,
      planId as any,
      successUrl || `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?success=true`,
      cancelUrl || `${process.env.NEXT_PUBLIC_APP_URL}/pricing?cancelled=true`
    )

    return NextResponse.json({
      sessionId: result.sessionId,
      url: result.url,
    })
  } catch (error: any) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
