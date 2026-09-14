'use server'

import { client } from '@/lib/prisma'
import { requireCampaignOwner, requireUser } from '@/lib/server-auth'
import { getClerkUserId, getCurrentUser } from '@/lib/current-user'
import nodemailer from 'nodemailer'

// Hard cap per send call so one request can't queue an unbounded blast.
const MAX_BATCH_SIZE = 500

export const onGetAllCustomers = async () => {
  try {
    const user = await requireUser()
    if (!user) return null
    const customers = await client.user.findUnique({
      where: {
        clerkId: user.clerkId,
      },
      select: {
        subscription: {
          select: {
            credits: true,
            plan: true,
          },
        },
        domains: {
          select: {
            customer: {
              select: {
                id: true,
                email: true,
                Domain: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    })

    return customers ?? null
  } catch (error) {
    console.log(error)
    return null
  }
}

export const onGetAllCampaigns = async () => {
  try {
    const user = await requireUser()
    if (!user) return null
    const campaigns = await client.user.findUnique({
      where: {
        clerkId: user.clerkId,
      },
      select: {
        campaign: {
          select: {
            name: true,
            id: true,
            customers: true,
            createdAt: true,
          },
        },
      },
    })

    return campaigns ?? null
  } catch (error) {
    console.log(error)
    return null
  }
}

export const onCreateMarketingCampaign = async (name: string) => {
  try {
    const clerkId = await getClerkUserId()
    if (!clerkId) return null

    const trimmed = name?.trim()
    if (!trimmed || trimmed.length > 120) {
      return { status: 400, message: 'Campaign name is required' }
    }

    const campaign = await client.user.update({
      where: {
        clerkId,
      },
      data: {
        campaign: {
          create: {
            name: trimmed,
          },
        },
      },
    })

    if (campaign) {
      return { status: 200, message: 'You campaign was created' }
    }
    return { status: 400, message: 'Campaign could not be created' }
  } catch (error) {
    console.log(error)
    return { status: 400, message: 'Campaign could not be created' }
  }
}

export const onSaveEmailTemplate = async (
  template: string,
  campainId: string
) => {
  try {
    const owned = await requireCampaignOwner(campainId)
    if (!owned) {
      return { status: 403, message: 'Not authorized for this campaign' }
    }
    if (!template || typeof template !== 'string' || template.length > 100_000) {
      return { status: 400, message: 'Invalid email template' }
    }
    // Must be the JSON-encoded string the editor produces; fail here —
    // not at send time — if it can't round-trip.
    try {
      JSON.parse(template)
    } catch {
      return { status: 400, message: 'Invalid email template' }
    }
    await client.campaign.update({
      where: {
        id: campainId,
      },
      data: {
        template,
      },
    })

    return { status: 200, message: 'Email template created' }
  } catch (error) {
    console.log(error)
    return { status: 400, message: 'Email template could not be saved' }
  }
}

export const onAddCustomersToEmail = async (
  customers: string[],
  id: string
) => {
  try {
    const owned = await requireCampaignOwner(id)
    if (!owned) {
      return { status: 403, message: 'Not authorized for this campaign' }
    }
    if (!Array.isArray(customers) || customers.length === 0) {
      return { status: 400, message: 'No customers selected' }
    }
    const customerAdd = await client.campaign.update({
      where: {
        id,
      },
      data: {
        customers,
      },
    })

    if (customerAdd) {
      return { status: 200, message: 'Customer added to campaign' }
    }
    return { status: 400, message: 'Could not update campaign' }
  } catch (error) {
    console.log(error)
    return { status: 400, message: 'Could not update campaign' }
  }
}

export const onBulkMailer = async (email: string[], campaignId: string) => {
  try {
    const clerkId = await getClerkUserId()
    if (!clerkId) return null

    const owned = await requireCampaignOwner(campaignId)
    if (!owned) {
      return { status: 403, message: 'Not authorized for this campaign' }
    }

    if (!Array.isArray(email) || email.length === 0) {
      return { status: 400, message: 'No recipients selected' }
    }
    if (email.length > MAX_BATCH_SIZE) {
      return {
        status: 400,
        message: `At most ${MAX_BATCH_SIZE} recipients per send`,
      }
    }

    // Recipients must be customers of the sender's own domains —
    // client-supplied addresses outside the tenant are dropped, not sent.
    const known = await client.customer.findMany({
      where: {
        email: { in: email },
        Domain: { User: { clerkId } },
      },
      select: { email: true },
    })
    const allowed = new Set(
      known.map((c) => c.email).filter((e): e is string => !!e)
    )
    const recipients = email.filter((e) => allowed.has(e))
    if (recipients.length === 0) {
      return { status: 400, message: 'No valid recipients for your account' }
    }

    //get the template for this campaign
    const template = await client.campaign.findUnique({
      where: {
        id: campaignId,
      },
      select: {
        name: true,
        template: true,
      },
    })

    if (template && template.template) {
      let body: string
      try {
        body = JSON.parse(template.template)
      } catch {
        return { status: 400, message: 'Email template is invalid' }
      }

      const subscription = await client.billings.findFirst({
        where: { User: { clerkId } },
        select: { credits: true },
      })
      if (!subscription || subscription.credits < recipients.length) {
        return {
          status: 400,
          message: 'Not enough email credits for this send',
        }
      }

      const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
          user: process.env.NODE_MAILER_EMAIL,
          pass: process.env.NODE_MAILER_GMAIL_APP_PASSWORD,
        },
      })

      const mailOptions = {
        to: recipients,
        subject: template.name,
        text: body,
      }

      // Awaited: credits move only when the mail actually leaves.
      await transporter.sendMail(mailOptions)

      const creditsUsed = await client.user.update({
        where: {
          clerkId,
        },
        data: {
          subscription: {
            update: {
              credits: { decrement: recipients.length },
            },
          },
        },
      })
      if (creditsUsed) {
        return { status: 200, message: 'Campaign emails sent' }
      }
      return { status: 400, message: 'Emails sent but credits update failed' }
    }
    return { status: 400, message: 'Campaign has no email template' }
  } catch (error) {
    console.log(error)
    return { status: 400, message: 'Emails could not be sent' }
  }
}

export const onGetAllCustomerResponses = async (id: string) => {
  try {
    const user = await getCurrentUser()
    if (!user) return null
    const answers = await client.user.findUnique({
      where: {
        clerkId: user.clerkId,
      },
      select: {
        domains: {
          select: {
            customer: {
              select: {
                questions: {
                  where: {
                    customerId: id,
                    answered: {
                      not: null,
                    },
                  },
                  select: {
                    question: true,
                    answered: true,
                  },
                },
              },
            },
          },
        },
      },
    })

    if (answers) {
      return answers.domains
    }
    return null
  } catch (error) {
    console.log(error)
    return null
  }
}

export const onGetEmailTemplate = async (id: string) => {
  try {
    const owned = await requireCampaignOwner(id)
    if (!owned) return null
    const template = await client.campaign.findUnique({
      where: {
        id,
      },
      select: {
        template: true,
      },
    })

    return template?.template ?? null
  } catch (error) {
    console.log(error)
    return null
  }
}
