import { onGetAllCampaigns, onGetAllCustomers } from '@/actions/mail'
import EmailMarketing from '@/components/email-marketing'
import InfoBar from '@/components/infobar'
import { getCurrentUser } from '@/lib/current-user'
import React from 'react'

type Props = {}

const Page = async (props: Props) => {
  const user = await getCurrentUser()

  if (!user) return null
  // Independent queries run concurrently instead of back to back.
  const [customers, campaigns] = await Promise.all([
    onGetAllCustomers(),
    onGetAllCampaigns(),
  ])

  return (
    <>
      <InfoBar></InfoBar>
      <EmailMarketing
        campaign={campaigns?.campaign ?? []}
        subscription={customers?.subscription ?? null}
        domains={customers?.domains ?? []}
      />
    </>
  )
}

export default Page
