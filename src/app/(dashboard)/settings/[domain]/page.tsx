import { onGetCurrentDomainInfo } from '@/actions/settings'
import BotTrainingForm from '@/components/forms/settings/bot-training'
import SettingsForm from '@/components/forms/settings/form'
import InfoBar from '@/components/infobar'
import ProductTable from '@/components/products'
import { redirect } from 'next/navigation'
import React from 'react'

type Props = { params: { domain: string } }

const DomainSettingsPage = async ({ params }: Props) => {
  const domain = await onGetCurrentDomainInfo(params.domain)
  if (!domain) redirect('/dashboard')

  return (
    <>
      <InfoBar />
      <div className="overflow-y-auto w-full chat-window flex-1 h-0 py-4 pr-4 space-y-6">
        {/* Header Title */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Domain & Bot Settings</h1>
            <span className="bg-primary/10 text-primary text-xs font-semibold px-2.5 py-0.5 rounded-full border border-primary/20">
              {domain.domains[0].name}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            Manage your domain configuration, customize your chatbot avatar & behavior, and train FAQ models.
          </p>
        </div>

        {/* Form Sections */}
        <SettingsForm
          plan={domain.subscription?.plan!}
          chatBot={domain.domains[0].chatBot}
          id={domain.domains[0].id}
          name={domain.domains[0].name}
        />
        <BotTrainingForm id={domain.domains[0].id} />
        <ProductTable
          id={domain.domains[0].id}
          products={domain.domains[0].products || []}
        />
      </div>
    </>
  )
}

export default DomainSettingsPage
