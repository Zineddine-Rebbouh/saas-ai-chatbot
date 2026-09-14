'use server'

import { client } from '@/lib/prisma'
import { currentUser, redirectToSignIn } from '@clerk/nextjs'
import { onGetAllAccountDomains } from '../settings'

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

export const onLoginUser = async () => {
  const user = await currentUser()
  if (!user) redirectToSignIn()
  else {
    try {
      const authenticated = await client.user.findUnique({
        where: {
          clerkId: user.id,
        },
        select: {
          fullname: true,
          id: true,
          type: true,
        },
      })
      
      if (authenticated) {
        const domains = await onGetAllAccountDomains()
        return { status: 200, user: authenticated, domain: domains?.domains }
      }

      // Self-healing: If user is authenticated in Clerk but missing in the database
      const fullname = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.emailAddresses[0]?.emailAddress?.split('@')[0] || 'User'
      
      const provisionedUser = await client.user.create({
        data: {
          clerkId: user.id,
          fullname,
          type: 'owner',
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

      if (provisionedUser) {
        return { status: 200, user: provisionedUser, domain: [] }
      }
    } catch (error) {
      console.error('[Domainly AI] Auth self-healing error:', error)
      return { status: 400 }
    }
  }
}
