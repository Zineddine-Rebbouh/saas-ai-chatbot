'use server'
import { client } from '@/lib/prisma'
import { requireDomainOwner } from '@/lib/server-auth'
import { getClerkUserId, getCurrentUser } from '@/lib/current-user'
import { getSidebarDomains } from '@/lib/domains'
import { clerkClient } from '@clerk/nextjs/server'

export const onIntegrateDomain = async (domain: string, icon: string) => {
  const clerkId = await getClerkUserId()
  if (!clerkId) return
  try {
    const subscription = await client.user.findUnique({
      where: {
        clerkId,
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
          },
        },
      },
    })
    const domainExists = await client.user.findFirst({
      where: {
        clerkId,
        domains: {
          some: {
            name: domain,
          },
        },
      },
    })

    if (!domainExists) {
      if (
        (subscription?.subscription?.plan == 'STANDARD' &&
          subscription._count.domains < 1) ||
        (subscription?.subscription?.plan == 'PRO' &&
          subscription._count.domains < 5) ||
        (subscription?.subscription?.plan == 'ULTIMATE' &&
          subscription._count.domains < 10)
      ) {
        const newDomain = await client.user.update({
          where: {
            clerkId,
          },
          data: {
            domains: {
              create: {
                name: domain,
                icon,
                chatBot: {
                  create: {
                    welcomeMessage: 'Hey there, have  a question? Text us here',
                  },
                },
              },
            },
          },
        })

        if (newDomain) {
          return { status: 200, message: 'Domain successfully added' }
        }
      }
      return {
        status: 400,
        message:
          "You've reached the maximum number of domains, upgrade your plan",
      }
    }
    return {
      status: 400,
      message: 'Domain already exists',
    }
  } catch (error) {
    console.log(error)
    // P2002 covers the double-submit race once @@unique([userId, name]) lands.
    return { status: 400, message: 'Domain could not be added' }
  }
}

export const onGetSubscriptionPlan = async () => {
  try {
    const user = await getCurrentUser()
    if (!user) return
    const plan = await client.user.findUnique({
      where: {
        clerkId: user.clerkId,
      },
      select: {
        subscription: {
          select: {
            plan: true,
          },
        },
      },
    })
    if (plan) {
      return plan.subscription?.plan
    }
  } catch (error) {
    console.log(error)
  }
}

/**
 * The user's domains for the sidebar and the domain pickers.
 *
 * Returns `id`, `name` and `icon` only — the nested customer/chatRoom graph
 * the old implementation loaded was never read by any caller. Memoised per
 * request so the layout, the dashboard page and the conversation page share
 * one query instead of running it three times per navigation.
 */
export const onGetAllAccountDomains = async () => {
  return { domains: await getSidebarDomains() }
}
export const onUpdatePassword = async (password: string) => {
  try {
    const clerkId = await getClerkUserId()

    if (!clerkId) return null
    const update = await clerkClient.users.updateUser(clerkId, { password })
    if (update) {
      return { status: 200, message: 'Password updated' }
    }
    return { status: 400, message: 'Password could not be updated' }
  } catch (error) {
    console.log(error)
    return { status: 400, message: 'Password could not be updated' }
  }
}

export const onGetCurrentDomainInfo = async (domain: string) => {
  const user = await getCurrentUser()
  if (!user) return
  try {
    const userDomain = await client.user.findUnique({
      where: {
        clerkId: user.clerkId,
      },
      select: {
        subscription: {
          select: {
            plan: true,
          },
        },
        domains: {
          where: {
            name: {
              contains: domain,
            },
          },
          select: {
            id: true,
            name: true,
            icon: true,
            userId: true,
            products: true,
            chatBot: {
              select: {
                id: true,
                welcomeMessage: true,
                icon: true,
              },
            },
          },
        },
      },
    })
    if (userDomain) {
      return userDomain
    }
  } catch (error) {
    console.log(error)
  }
}

export const onUpdateDomain = async (id: string, name: string) => {
  try {
    const owned = await requireDomainOwner(id)
    if (!owned) {
      return { status: 403, message: 'Not authorized for this domain' }
    }
    const trimmed = name?.trim()
    if (!trimmed) {
      return { status: 400, message: 'Domain name is required' }
    }
    //check if domain with name exists (within the owner's own domains)
    const domainExists = await client.domain.findFirst({
      where: {
        name: {
          contains: trimmed,
        },
        NOT: { id },
        User: { clerkId: owned.clerkId },
      },
    })

    if (!domainExists) {
      const domain = await client.domain.update({
        where: {
          id,
        },
        data: {
          name: trimmed,
        },
      })

      if (domain) {
        return {
          status: 200,
          message: 'Domain updated',
        }
      }

      return {
        status: 400,
        message: 'Oops something went wrong!',
      }
    }

    return {
      status: 400,
      message: 'Domain with this name already exists',
    }
  } catch (error) {
    console.log(error)
    return { status: 400, message: 'Domain could not be updated' }
  }
}

export const onChatBotImageUpdate = async (id: string, icon: string) => {
  const owned = await requireDomainOwner(id)

  if (!owned) return { status: 403, message: 'Not authorized for this domain' }

  try {
    const domain = await client.domain.update({
      where: {
        id,
      },
      data: {
        chatBot: {
          update: {
            data: {
              icon,
            },
          },
        },
      },
    })

    if (domain) {
      return {
        status: 200,
        message: 'Domain updated',
      }
    }

    return {
      status: 400,
      message: 'Oops something went wrong!',
    }
  } catch (error) {
    console.log(error)
    return { status: 400, message: 'Chatbot icon could not be updated' }
  }
}

export const onUpdateWelcomeMessage = async (
  message: string,
  domainId: string
) => {
  try {
    const owned = await requireDomainOwner(domainId)
    if (!owned) {
      return { status: 403, message: 'Not authorized for this domain' }
    }
    if (!message || typeof message !== 'string' || message.length > 500) {
      return { status: 400, message: 'Invalid welcome message' }
    }
    const update = await client.domain.update({
      where: {
        id: domainId,
      },
      data: {
        chatBot: {
          update: {
            data: {
              welcomeMessage: message,
            },
          },
        },
      },
    })

    if (update) {
      return { status: 200, message: 'Welcome message updated' }
    }
    return { status: 400, message: 'Welcome message could not be updated' }
  } catch (error) {
    console.log(error)
    return { status: 400, message: 'Welcome message could not be updated' }
  }
}

export const onDeleteUserDomain = async (id: string) => {
  // One request-memoised lookup instead of `currentUser()` + `user.findUnique`.
  const user = await getCurrentUser()

  if (!user) return

  try {
    //check that domain belongs to this user and delete
    const deletedDomain = await client.domain.delete({
      where: {
        userId: user.id,
        id,
      },
      select: {
        name: true,
      },
    })

    if (deletedDomain) {
      return {
        status: 200,
        message: `${deletedDomain.name} was deleted successfully`,
      }
    }
    return { status: 404, message: 'Domain not found' }
  } catch (error) {
    console.log(error)
    return { status: 400, message: 'Domain could not be deleted' }
  }
}

export const onCreateHelpDeskQuestion = async (
  id: string,
  question: string,
  answer: string
) => {
  try {
    const owned = await requireDomainOwner(id)
    if (!owned) {
      return {
        status: 403,
        message: 'Not authorized for this domain',
        questions: [],
      }
    }
    if (!question?.trim() || !answer?.trim()) {
      return {
        status: 400,
        message: 'Question and answer are required',
        questions: [],
      }
    }
    const helpDeskQuestion = await client.domain.update({
      where: {
        id,
      },
      data: {
        helpdesk: {
          create: {
            question,
            answer,
          },
        },
      },
      include: {
        helpdesk: {
          select: {
            id: true,
            question: true,
            answer: true,
          },
        },
      },
    })

    if (helpDeskQuestion) {
      return {
        status: 200,
        message: 'New help desk question added',
        questions: helpDeskQuestion.helpdesk,
      }
    }

    return {
      status: 400,
      message: 'Oops! something went wrong',
    }
  } catch (error) {
    console.log(error)
    return {
      status: 400,
      message: 'Help desk question could not be added',
      questions: [],
    }
  }
}

export const onGetAllHelpDeskQuestions = async (id: string) => {
  try {
    const owned = await requireDomainOwner(id)
    if (!owned) {
      return {
        status: 403,
        message: 'Not authorized for this domain',
        questions: [],
      }
    }
    const questions = await client.helpDesk.findMany({
      where: {
        domainId: id,
      },
      select: {
        question: true,
        answer: true,
        id: true,
      },
    })

    return {
      status: 200,
      message: 'New help desk question added',
      questions: questions,
    }
  } catch (error) {
    console.log(error)
    return {
      status: 400,
      message: 'Could not load help desk questions',
      questions: [],
    }
  }
}

export const onCreateFilterQuestions = async (id: string, question: string) => {
  try {
    const owned = await requireDomainOwner(id)
    if (!owned) {
      return {
        status: 403,
        message: 'Not authorized for this domain',
        questions: [],
      }
    }
    if (!question?.trim()) {
      return { status: 400, message: 'Question is required', questions: [] }
    }
    const filterQuestion = await client.domain.update({
      where: {
        id,
      },
      data: {
        filterQuestions: {
          create: {
            question,
          },
        },
      },
      include: {
        filterQuestions: {
          select: {
            id: true,
            question: true,
          },
        },
      },
    })

    if (filterQuestion) {
      return {
        status: 200,
        message: 'Filter question added',
        questions: filterQuestion.filterQuestions,
      }
    }
    return {
      status: 400,
      message: 'Oops! something went wrong',
    }
  } catch (error) {
    console.log(error)
    return {
      status: 400,
      message: 'Filter question could not be added',
      questions: [],
    }
  }
}

export const onGetAllFilterQuestions = async (id: string) => {
  try {
    const owned = await requireDomainOwner(id)
    if (!owned) {
      return { status: 403, message: 'Not authorized for this domain', questions: [] }
    }
    const questions = await client.filterQuestions.findMany({
      where: {
        domainId: id,
      },
      select: {
        question: true,
        id: true,
      },
      orderBy: {
        question: 'asc',
      },
    })

    return {
      status: 200,
      message: '',
      questions: questions,
    }
  } catch (error) {
    console.log(error)
    return {
      status: 400,
      message: 'Could not load filter questions',
      questions: [],
    }
  }
}

export const onGetPaymentConnected = async () => {
  try {
    const user = await getCurrentUser()
    if (user) {
      const connected = await client.user.findUnique({
        where: {
          clerkId: user.clerkId,
        },
        select: {
          stripeId: true,
        },
      })
      if (connected) {
        return connected.stripeId
      }
    }
  } catch (error) {
    console.log(error)
  }
}

export const onCreateNewDomainProduct = async (
  id: string,
  name: string,
  image: string,
  price: string
) => {
  try {
    const owned = await requireDomainOwner(id)
    if (!owned) {
      return { status: 403, message: 'Not authorized for this domain' }
    }
    const amount = Number(price)
    if (!name?.trim() || !image || !Number.isFinite(amount) || amount <= 0) {
      return { status: 400, message: 'Valid name, image and price are required' }
    }
    const product = await client.domain.update({
      where: {
        id,
      },
      data: {
        products: {
          create: {
            name: name.trim(),
            image,
            price: Math.round(amount),
          },
        },
      },
    })

    if (product) {
      return {
        status: 200,
        message: 'Product successfully created',
      }
    }
    return { status: 400, message: 'Product could not be created' }
  } catch (error) {
    console.log(error)
    return { status: 400, message: 'Product could not be created' }
  }
}
