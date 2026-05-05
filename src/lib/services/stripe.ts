import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
  typescript: true,
})

export type PlanType = 'family_basic' | 'family_plus' | 'school' | 'premium_sensei'

export interface Plan {
  id: PlanType
  name: string
  description: string
  price: number
  currency: string
  interval: 'month' | 'year'
  features: string[]
  maxStudents: number
  hasAICoach: boolean
  hasParentPanel: boolean
  hasTeacherPanel: boolean
  hasLiveClasses: boolean
}

export const PLANS: Plan[] = [
  {
    id: 'family_basic',
    name: 'Familiar Básico',
    description: 'Perfecto para empezar',
    price: 199,
    currency: 'MXN',
    interval: 'month',
    maxStudents: 1,
    hasAICoach: true,
    hasParentPanel: false,
    hasTeacherPanel: false,
    hasLiveClasses: false,
    features: [
      'Acceso a todos los módulos',
      'AI Coach 24/7',
      'Gamificación completa',
      'Reportes básicos',
      '1 estudiante',
    ],
  },
  {
    id: 'family_plus',
    name: 'Familiar Plus',
    description: 'Para familias con múltiples hijos',
    price: 349,
    currency: 'MXN',
    interval: 'month',
    maxStudents: 3,
    hasAICoach: true,
    hasParentPanel: true,
    hasTeacherPanel: false,
    hasLiveClasses: false,
    features: [
      'Todo del plan básico',
      'Panel para padres',
      'Reportes semanales detallados',
      'Hasta 3 estudiantes',
      'Recomendaciones IA',
    ],
  },
  {
    id: 'school',
    name: 'Escolar',
    description: 'Para instituciones educativas',
    price: 999,
    currency: 'MXN',
    interval: 'month',
    maxStudents: 100,
    hasAICoach: true,
    hasParentPanel: true,
    hasTeacherPanel: true,
    hasLiveClasses: false,
    features: [
      'Todo del plan familiar plus',
      'Panel para maestros',
      'Gestión de clases',
      'Hasta 100 estudiantes',
      'Soporte prioritario',
      'Personalización de marca',
    ],
  },
  {
    id: 'premium_sensei',
    name: 'Premium Sensei',
    description: 'Experiencia completa con mentoría',
    price: 599,
    currency: 'MXN',
    interval: 'month',
    maxStudents: 1,
    hasAICoach: true,
    hasParentPanel: true,
    hasTeacherPanel: true,
    hasLiveClasses: true,
    features: [
      'Todo del plan escolar',
      'Clases en vivo semanales',
      'Mentoría personalizada',
      'Preparación de torneos',
      'Acceso a contenidos exclusivos',
      'Certificaciones DOJO',
    ],
  },
]

/**
 * Create a Stripe Checkout Session for subscription
 */
export async function createCheckoutSession(
  userId: string,
  planId: PlanType,
  successUrl: string,
  cancelUrl: string
) {
  const plan = PLANS.find((p) => p.id === planId)
  if (!plan) {
    throw new Error('Invalid plan selected')
  }

  // For one-time purchases or family plans, we'll use a simplified approach
  // In production, you'd have price IDs in database
  const priceId = getPriceIdForPlan(planId)

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer_email: await getCustomerEmail(userId),
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      metadata: {
        user_id: userId,
        plan_id: planId,
      },
      success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl,
      allow_promotion_codes: true,
      subscription_data: {
        trial_period_days: 7, // 7-day free trial
      },
    })

    return { sessionId: session.id, url: session.url }
  } catch (error) {
    console.error('Stripe checkout error:', error)
    throw error
  }
}

/**
 * Create a one-time purchase session for shop items
 */
export async function createShopCheckoutSession(
  userId: string,
  itemId: string,
  quantity: number = 1
) {
  // Get item from database
  const { data: item } = await supabase
    .from('shop_items')
    .select('*')
    .eq('id', itemId)
    .single()

  if (!item || !item.is_active) {
    throw new Error('Item not available')
  }

  // Create a Stripe Price for the item (in production, store Stripe Price ID)
  const price = await stripe.prices.create({
    unit_amount: item.price_dojicoins * 100, // Convert to cents
    currency: 'mxn',
    product_data: {
      name: item.name,
      description: item.description,
      images: item.image_url ? [item.image_url] : [],
    },
    metadata: {
      item_id: itemId,
      is_dojicoin: 'false', // Real money purchase
    },
  })

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    customer_email: await getCustomerEmail(userId),
    line_items: [
      {
        price: price.id,
        quantity,
      },
    ],
    metadata: {
      user_id: userId,
      item_id: itemId,
      purchase_type: 'shop_item',
    },
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/student/shop?purchase=success`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/student/shop?purchase=cancelled`,
  })

  return { sessionId: session.id, url: session.url }
}

/**
 * Handle Stripe webhook events
 */
export async function handleStripeWebhook(payload: Buffer, signature: string) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret)
  } catch (error) {
    console.error('Webhook signature verification failed:', error)
    throw new Error('Invalid signature')
  }

  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session)
      break

    case 'invoice.paid':
      await handleInvoicePaid(event.data.object as Stripe.Invoice)
      break

    case 'invoice.payment_failed':
      await handlePaymentFailed(event.data.object as Stripe.Invoice)
      break

    case 'customer.subscription.deleted':
      await handleSubscriptionCancelled(event.data.object as Stripe.Subscription)
      break

    case 'customer.subscription.updated':
      await handleSubscriptionUpdated(event.data.object as Stripe.Subscription)
      break

    default:
      console.log(`Unhandled event type: ${event.type}`)
  }

  return { received: true, type: event.type }
}

/**
 * Handle successful checkout session
 */
async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.user_id
  const planId = session.metadata?.plan_id
  const subscriptionId = session.subscription as string

  if (!userId || !planId || !subscriptionId) {
    console.error('Missing metadata in checkout session')
    return
  }

  try {
    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (!profile) {
      console.error('Profile not found for user:', userId)
      return
    }

    // Create subscription record
    const { error } = await supabase.from('subscriptions').insert({
      user_id: userId,
      plan: planId,
      stripe_subscription_id: subscriptionId,
      status: 'active',
      current_period_start: new Date(session.current_period_start * 1000).toISOString(),
      current_period_end: new Date(session.current_period_end * 1000).toISOString(),
    })

    if (error) {
      console.error('Error creating subscription:', error)
      return
    }

    // Add family members if plan allows
    if (planId === 'family_plus' || planId === 'school') {
      await createFamilyForParent(userId, planId)
    }

    // Send welcome email
    await sendSubscriptionConfirmationEmail(userId, planId)

    console.log(`✅ Subscription created for user ${userId}, plan: ${planId}`)
  } catch (error) {
    console.error('Error handling checkout completion:', error)
  }
}

/**
 * Handle successful payment (recurring)
 */
async function handleInvoicePaid(invoice: Stripe.Invoice) {
  const subscriptionId = invoice.subscription as string

  if (!subscriptionId) return

  // Find subscription by Stripe ID
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('stripe_subscription_id', subscriptionId)
    .single()

  if (!subscription) return

  // Record payment
  await supabase.from('payments').insert({
    user_id: subscription.user_id,
    amount: invoice.amount_paid / 100, // Convert from cents
    currency: invoice.currency.toUpperCase(),
    status: 'succeeded',
    payment_method: 'card',
    description: `Monthly subscription - ${subscription.plan}`,
    stripe_payment_id: invoice.payment_intent as string,
  })

  // Update subscription period
  await supabase
    .from('subscriptions')
    .update({
      current_period_start: new Date(invoice.period_start * 1000).toISOString(),
      current_period_end: new Date(invoice.period_end * 1000).toISOString(),
    })
    .eq('id', subscription.id)

  console.log(`✅ Payment received for subscription ${subscriptionId}`)
}

/**
 * Handle failed payment
 */
async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const subscriptionId = invoice.subscription as string

  if (!subscriptionId) return

  // Record failed payment
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('stripe_subscription_id', subscriptionId)
    .single()

  if (!subscription) return

  await supabase.from('payments').insert({
    user_id: subscription.user_id,
    amount: invoice.amount_due / 100,
    currency: invoice.currency.toUpperCase(),
    status: 'failed',
    payment_method: 'card',
    description: 'Failed payment attempt',
  })

  // Update subscription status
  await supabase
    .from('subscriptions')
    .update({ status: 'past_due' })
    .eq('id', subscription.id)

  // Send email notification
  await sendPaymentFailedEmail(subscription.user_id)

  console.log(`❌ Payment failed for subscription ${subscriptionId}`)
}

/**
 * Handle subscription cancellation
 */
async function handleSubscriptionCancelled(subscription: Stripe.Subscription) {
  const { data: dbSubscription } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('stripe_subscription_id', subscription.id)
    .single()

  if (!dbSubscription) return

  await supabase
    .from('subscriptions')
    .update({
      status: 'canceled',
      cancel_at_period_end: true,
    })
    .eq('id', dbSubscription.id)

  // Downgrade user permissions
  await downgradeUserAccess(dbSubscription.user_id, dbSubscription.plan)

  console.log(`📢 Subscription cancelled: ${subscription.id}`)
}

/**
 * Helper: Get Stripe Price ID for plan
 * In production, store these in database or env vars
 */
function getPriceIdForPlan(planId: PlanType): string {
  const priceIds: Record<PlanType, string> = {
    family_basic: process.env.STRIPE_PRICE_FAMILY_BASIC!,
    family_plus: process.env.STRIPE_PRICE_FAMILY_PLUS!,
    school: process.env.STRIPE_PRICE_SCHOOL!,
    premium_sensei: process.env.STRIPE_PRICE_PREMIUM_SENSEI!,
  }

  return priceIds[planId] || priceIds.family_basic
}

/**
 * Helper: Get customer email from user ID
 */
async function getCustomerEmail(userId: string): Promise<string> {
  const { data: user } = await supabase
    .from('users')
    .select('email')
    .eq('id', userId)
    .single()

  return user?.email || ''
}

/**
 * Helper: Create family for parent
 */
async function createFamilyForParent(parentId: string, planId: PlanType) {
  const maxChildren = planId === 'family_plus' ? 3 : 1

  // Check if family already exists
  const { data: existing } = await supabase
    .from('families')
    .select('id')
    .eq('parent_id', parentId)
    .maybeSingle()

  if (!existing) {
    await supabase.from('families').insert({
      parent_id: parentId,
      family_name: 'Mi Familia',
      metadata: { max_children: maxChildren },
    })
  }
}

/**
 * Helper: Downgrade user access when subscription ends
 */
async function downgradeUserAccess(userId: string, oldPlan: string) {
  // Remove family members if not school
  if (oldPlan === 'family_plus') {
    const { data: family } = await supabase
      .from('families')
      .select('id')
      .eq('parent_id', userId)
      .single()

    if (family) {
      await supabase
        .from('family_members')
        .delete()
        .eq('family_id', family.id)
    }
  }

  // Send notification
  await supabase.from('notifications').insert({
    user_id: userId,
    type: 'alert',
    title: 'Suscripción cancelada',
    message: 'Tu suscripción ha sido cancelada. Algunas funciones pueden estar limitadas.',
    action_url: '/dashboard/billing',
  })
}

/**
 * Helper: Send emails (implement with Resend/SendGrid)
 */
async function sendSubscriptionConfirmationEmail(userId: string, planId: string) {
  // TODO: Implement email service
  console.log(`📧 Welcome email for ${userId}, plan: ${planId}`)
}

async function sendPaymentFailedEmail(userId: string) {
  // TODO: Implement email service
  console.log(`📧 Payment failed notification for ${userId}`)
}
