// Request-scoped Clerk auth + Prisma user identity for authenticated routes.
// Uses React `cache` so every call in the same server render/request shares one
// Clerk lookup and at most one Prisma `user` query — never a global cache, so
// one user's row can never leak into another user's request.
import { cache } from 'react'
import { currentUser } from '@clerk/nextjs'
import { client } from '@/lib/prisma'

export type RequestUser = {
  clerkId: string
  userId: string
  fullname: string
  type: string
  stripeId: string | null
}

// Clerk's `currentUser()` performs an auth lookup on every call. Cache it per
// request so parallel dashboard actions do not repeat that work.
export const getClerkUserId = cache(async (): Promise<string | null> => {
  try {
    const user = await currentUser()
    return user?.id ?? null
  } catch {
    return null
  }
})

export const getCurrentUser = cache(async (): Promise<RequestUser | null> => {
  const clerkUser = await currentUser()
  if (!clerkUser) return null
  const row = await client.user.findUnique({
    where: { clerkId: clerkUser.id },
    select: {
      id: true,
      fullname: true,
      type: true,
      stripeId: true,
    },
  })
  if (!row) return null
  return {
    clerkId: clerkUser.id,
    userId: row.id,
    fullname: row.fullname,
    type: row.type,
    stripeId: row.stripeId,
  }
})
