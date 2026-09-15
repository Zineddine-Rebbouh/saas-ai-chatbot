import { onGetAllCampaigns, onGetAllCustomers } from '@/actions/mail'
import CampaignWorkspace from '@/components/email-marketing/campaign-workspace'
import { getCurrentUser } from '@/lib/current-user'
import React from 'react'

const Page = async () => {
  const user = await getCurrentUser()

  if (!user) return null

  const [customers, campaigns] = await Promise.all([
    onGetAllCustomers(),
    onGetAllCampaigns(),
  ])

  return (
    <div className="overflow-y-auto w-full flex-1 h-0 pr-4">
      <CampaignWorkspace
        campaign={campaigns?.campaign ?? []}
        subscription={customers?.subscription ?? null}
        domains={customers?.domains ?? []}
      />
    </div>
  )
}

export default Page
