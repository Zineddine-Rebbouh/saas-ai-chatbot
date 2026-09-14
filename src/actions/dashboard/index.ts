'use server'

import { client } from '@/lib/prisma'
import { getCurrentUser, getStripeAccountId } from '@/lib/current-user'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET!, {
  typescript: true,
  apiVersion: '2024-04-10',
})

export const getUserClients = async () => {
  try {
    const user = await getCurrentUser()
    if (!user) return 0

    const clients = await client.customer.count({
      where: {
        Domain: {
          User: {
            clerkId: user.clerkId,
          },
        },
      },
    })
    return clients
  } catch (error) {
    console.log(error)
    return 0
  }
}

export const getUserBalance = async () => {
  try {
    // Request-memoised: shared with getUserTransactions, so the stripeId is
    // looked up once per dashboard render instead of twice.
    const stripeId = await getStripeAccountId()
    if (!stripeId) return 0

    const transactions = await stripe.balance.retrieve({
      stripeAccount: stripeId,
    })

    if (transactions) {
      const sales = transactions.pending.reduce((total, next) => {
        return total + next.amount
      }, 0)

      return sales / 100
    }
    return 0
  } catch (error) {
    console.log(error)
    return 0
  }
}

export const getUserPlanInfo = async () => {
  try {
    const user = await getCurrentUser()
    if (!user) return

    const plan = await client.user.findUnique({
      where: {
        clerkId: user.clerkId,
      },
      select: {
        _count: {
          select: {
            domains: true,
          },
        },
        subscription: {
          select: {
            plan: true,
            credits: true,
          },
        },
      },
    })
    if (plan) {
      return {
        plan: plan.subscription?.plan,
        credits: plan.subscription?.credits,
        domains: plan._count.domains,
      }
    }
  } catch (error) {
    console.log(error)
  }
}

export const getUserTotalProductPrices = async () => {
  try {
    const user = await getCurrentUser()
    if (!user) return

    // Summed in PostgreSQL. The previous version pulled every product row of
    // the account into Node just to add up one column.
    const products = await client.product.aggregate({
      where: {
        Domain: {
          User: {
            clerkId: user.clerkId,
          },
        },
      },
      _sum: {
        price: true,
      },
    })

    return products._sum.price ?? 0
  } catch (error) {
    console.log(error)
    return 0
  }
}

export const getUserTransactions = async () => {
  try {
    const stripeId = await getStripeAccountId()
    if (!stripeId) return null

    // NOTE: kept byte-for-byte equivalent to the previous call. Stripe's
    // `charges.list` types treat a lone `stripeAccount` as RequestOptions, and
    // this is pre-existing billing semantics — not touched in a perf pass.
    const transactions = await stripe.charges.list({
      stripeAccount: stripeId,
    })
    if (transactions) {
      return transactions
    }
    return null
  } catch (error) {
    console.log(error)
    return null
  }
}
