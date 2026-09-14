// Minimal, request-cached sidebar domain list. The dashboard layout runs on
// every dashboard navigation, so this must stay cheap: id/name/icon only,
// never customers / chatRooms / messages.
import { cache } from 'react'
import { client } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/current-user'

export type SidebarDomain = {
  id: string
  name: string
  icon: string | null
}

export const getSidebarDomains = cache(
  async (): Promise<SidebarDomain[]> => {
    const user = await getCurrentUser()
    if (!user) return []
    const row = await client.user.findUnique({
      where: { clerkId: user.clerkId },
      select: {
        domains: {
          select: {
            id: true,
            name: true,
            icon: true,
          },
          orderBy: { name: 'asc' },
        },
      },
    })
    return row?.domains ?? []
  }
)

// Ownership-scoped domain id lookup by the URL slug (`settings/[domain]` uses
// the part before the first dot). Returns null for foreign/missing domains.
export const getOwnedDomainIdBySlug = async (
  slug: string
): Promise<string | null> => {
  const user = await getCurrentUser()
  if (!user || !slug) return null
  const domains = await getSidebarDomains()
  const match = domains.find((d) => d.name.split('.')[0] === slug)
  return match?.id ?? null
}
