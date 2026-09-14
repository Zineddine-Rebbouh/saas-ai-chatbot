// Tenant/ownership guards for server actions. All checks reuse the
// request-cached identity above, so adding authorization never adds another
// Clerk round-trip or user lookup to the navigation path.
import { client } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/current-user'

export const requireUser = getCurrentUser

export const requireDomainOwner = async (
  domainId: string
): Promise<boolean> => {
  const user = await getCurrentUser()
  if (!user || !domainId) return false
  const domain = await client.domain.findFirst({
    where: { id: domainId, userId: user.userId },
    select: { id: true },
  })
  return !!domain
}

export const requireCampaignOwner = async (
  campaignId: string
): Promise<boolean> => {
  const user = await getCurrentUser()
  if (!user || !campaignId) return false
  const campaign = await client.campaign.findFirst({
    where: { id: campaignId, userId: user.userId },
    select: { id: true },
  })
  return !!campaign
}

export const requireCustomerOwner = async (
  customerId: string
): Promise<boolean> => {
  const user = await getCurrentUser()
  if (!user || !customerId) return false
  const customer = await client.customer.findFirst({
    where: { id: customerId, Domain: { userId: user.userId } },
    select: { id: true },
  })
  return !!customer
}
