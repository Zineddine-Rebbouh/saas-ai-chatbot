'use server'

import { client } from '@/lib/prisma'
import { getClerkUserId, getCurrentUser } from '@/lib/current-user'
import { getSidebarDomains } from '@/lib/domains'
import { redirectToSignIn } from '@clerk/nextjs/server'

export const onCompleteUserRegistration = async (
  fullname: string,
  clerkId: string,
  type: string
) => {
  try {
    const registered = await client.user.create({
      data: {
        fullname,
        clerkId,
        type,
        subscription: {
          create: {},
        },
      },
      select: {
        fullname: true,
        id: true,
        type: true,
      },
    })

    if (registered) {
      return { status: 200, user: registered }
    }
  } catch (error) {
    return { status: 400 }
  }
}

/**
 * Resolves the signed-in user and the domains the dashboard shell needs.
 *
 * Runs on every dashboard navigation, so it is deliberately cheap:
 * - one session read (`auth()`, local JWT verification — no Clerk HTTP call)
 * - one Prisma user lookup
 * - one minimal domains query (`id`, `name`, `icon`)
 *
 * All three are request-memoised, so pages and server actions rendered in the
 * same request reuse them instead of repeating the work.
 */
export const onLoginUser = async () => {
  const clerkUserId = await getClerkUserId()
  if (!clerkUserId) {
    redirectToSignIn()
    return null
  }

  const user = await getCurrentUser()
  if (!user) return null

  const domain = await getSidebarDomains()
  return { status: 200, user, domain }
}
