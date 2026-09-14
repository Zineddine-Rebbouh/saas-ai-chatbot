'use server'

import { client } from '@/lib/prisma'
import { getClerkUserId } from '@/lib/current-user'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET!, {
  typescript: true,
  apiVersion: '2024-04-10',
})

const PLAN_AMOUNTS = {
  STANDARD: 0,
  PRO: 1500,
  ULTIMATE: 3500,
} as const

type Plan = keyof typeof PLAN_AMOUNTS

const isPlan = (value: unknown): value is Plan =>
  value === 'STANDARD' || value === 'PRO' || value === 'ULTIMATE'

// Portal checkout is unauthenticated by design, but the charge amount and
// the destination Connect account both resolve server-side from the domain.
// Client-supplied amounts/accounts are never trusted.
export const onCreateCustomerPaymentIntentSecret = async (
  domainId: string
) => {
  try {
    if (!domainId) return null
    const data = await client.domain.findUnique({
      where: { id: domainId },
      select: {
        products: { select: { price: true } },
        User: { select: { stripeId: true } },
      },
    })
    const stripeId = data?.User?.stripeId
    const total = (data?.products ?? []).reduce((sum, p) => sum + p.price, 0)
    if (!stripeId || total <= 0) return null

    const paymentIntent = await stripe.paymentIntents.create(
      {
        currency: 'usd',
        amount: total * 100,
        automatic_payment_methods: {
          enabled: true,
        },
        metadata: { domainId },
      },
      { stripeAccount: stripeId }
    )

    if (paymentIntent) {
      return { secret: paymentIntent.client_secret }
    }
    return null
  } catch (error) {
    console.log(error)
    return null
  }
}

export const onUpdateSubscription = async (
  plan: 'STANDARD' | 'PRO' | 'ULTIMATE',
  paymentIntentId?: string
) => {
  try {
    if (!isPlan(plan)) return
    const clerkUserId = await getClerkUserId()
    if (!clerkUserId) return

    // Paid plans require a verified, succeeded Stripe payment intent owned by
    // this user for exactly this plan's amount. The browser claiming success
    // is not sufficient — the intent is re-read from Stripe here.
    if (plan !== 'STANDARD') {
      if (!paymentIntentId) {
        return { status: 402, message: 'Payment is required for this plan' }
      }
      let intent: Stripe.PaymentIntent
      try {
        intent = await stripe.paymentIntents.retrieve(paymentIntentId)
      } catch {
        return { status: 402, message: 'Payment could not be verified' }
      }
      if (
        intent.status !== 'succeeded' ||
        intent.amount !== PLAN_AMOUNTS[plan] ||
        intent.currency !== 'usd' ||
        intent.metadata.plan !== plan ||
        intent.metadata.clerkId !== clerkUserId
      ) {
        return { status: 402, message: 'Payment could not be verified' }
      }
    }

    const update = await client.user.update({
      where: {
        clerkId: clerkUserId,
      },
      data: {
        subscription: {
          update: {
            data: {
              plan,
              credits: plan == 'PRO' ? 50 : plan == 'ULTIMATE' ? 500 : 10,
            },
          },
        },
      },
      select: {
        subscription: {
          select: {
            plan: true,
          },
        },
      },
    })
    if (update) {
      return {
        status: 200,
        message: 'subscription updated',
        plan: update.subscription?.plan,
      }
    }
  } catch (error) {
    console.log(error)
  }
}

export const onGetStripeClientSecret = async (
  item: 'STANDARD' | 'PRO' | 'ULTIMATE'
) => {
  try {
    if (!isPlan(item)) return
    const clerkUserId = await getClerkUserId()
    if (!clerkUserId) return
    // STANDARD is free — there is no $0 intent (Stripe rejects those).
    const amount = PLAN_AMOUNTS[item]
    if (amount <= 0) return null
    const paymentIntent = await stripe.paymentIntents.create({
      currency: 'usd',
      amount: amount,
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: { plan: item, clerkId: clerkUserId },
    })

    if (paymentIntent) {
      return { secret: paymentIntent.client_secret }
    }
    return null
  } catch (error) {
    console.log(error)
    return null
  }
}
