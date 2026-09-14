import { client } from '@/lib/prisma'
import { getClerkUserId } from '@/lib/current-user'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'

export const dynamic = 'force-dynamic'

const stripe = new Stripe(process.env.STRIPE_SECRET!, {
  typescript: true,
  apiVersion: '2024-04-10',
})

const getAppUrl = () =>
  process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

// Starts (or resumes) Stripe Connect onboarding for the current user.
// Uses Express accounts so Stripe itself collects identity/KYC information —
// no business or personal data is hardcoded or stored by us.
export async function POST() {
  try {
    const clerkUserId = await getClerkUserId()
    if (!clerkUserId)
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 })

    const existing = await client.user.findUnique({
      where: { clerkId: clerkUserId },
      select: { stripeId: true },
    })
    if (!existing) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Resume onboarding when the user already has a Connect account instead
    // of creating a new one on every click (which orphans accounts).
    let accountId = existing.stripeId
    if (!accountId) {
      const account = await stripe.accounts.create({
        type: 'express',
        country: 'US',
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
      })
      accountId = account.id
      await client.user.update({
        where: {
          clerkId: clerkUserId,
        },
        data: {
          stripeId: account.id,
        },
      })
    }

    const appUrl = getAppUrl()
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${appUrl}/callback/stripe/refresh`,
      return_url: `${appUrl}/callback/stripe/success`,
      type: 'account_onboarding',
    })

    return NextResponse.json({
      url: accountLink.url,
    })
  } catch (error) {
    console.error(
      'An error occurred when calling the Stripe API to create an account:',
      error
    )
    return NextResponse.json(
      { error: 'Could not start Stripe onboarding' },
      { status: 500 }
    )
  }
}
