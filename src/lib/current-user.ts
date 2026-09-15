// Request-scoped Clerk auth + Prisma user identity for authenticated routes.
// `auth()` is a synchronous local session read, and `auth().userId` is stable
// across calls in the same request. Prisma identity is React-cached so every
// call in the same server render shares it — never a global cache, so one
// user's row can never leak into another user's request.
import { cache } from 'react'
import { auth } from '@clerk/nextjs/server'
import { client } from '@/lib/prisma'

export type RequestUser = {
  clerkId: string
  userId: string
  fullname: string
  type: string
  stripeId: string | null
}

// The Clerk userId for this request. `auth()` reads the session locally
// (JWT verification), so this performs no Clerk HTTP call unlike the old
// `currentUser()` path that fetched the full profile on every call.
export const getClerkUserId = async (): Promise<string | null> => {
  try {
    return auth().userId ?? null
  } catch {
    return null
  }
}

export const getCurrentUser = cache(async (): Promise<RequestUser | null> => {
  const clerkId = await getClerkUserId()
  if (!clerkId) return null
  const row = await client.user.findUnique({
    where: { clerkId },
    select: {
      id: true,
      fullname: true,
      type: true,
      stripeId: true,
    },
  })
  if (!row) return null
  return {
    clerkId,
    userId: row.id,
    fullname: row.fullname,
    type: row.type,
    stripeId: row.stripeId,
  }
})

// Memoised Stripe Connect account id. `getUserBalance` and
// `getUserTransactions` call this, so one dashboard render does one user
// lookup instead of two.
export const getStripeAccountId = cache(
  async (): Promise<string | null> => {
    const user = await getCurrentUser()
    return user?.stripeId ?? null
  }
)
