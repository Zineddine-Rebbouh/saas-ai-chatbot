'use client'
import { Loader } from '@/components/loader'
import { StripeElements } from '@/components/settings/stripe-elements'
import SubscriptionCard from '@/components/settings/subscription-card'
import { Button } from '@/components/ui/button'
import { useSubscriptions } from '@/hooks/billing/use-billing'
import React, { useState } from 'react'

type Props = {
  plan: 'STANDARD' | 'PRO' | 'ULTIMATE'
}

const SubscriptionForm = ({ plan }: Props) => {
  const { loading, onSetPayment, payment, onUpdatetToFreTier } =
    useSubscriptions(plan)
  const [updatedTo, setUpdatedTo] = useState<
    'STANDARD' | 'PRO' | 'ULTIMATE' | null
  >(null)

  const handleSelect = (next: string) => {
    setUpdatedTo(null)
    onSetPayment(next as 'STANDARD' | 'PRO' | 'ULTIMATE')
  }

  return (
    <Loader loading={loading}>
      <div className="flex flex-col gap-5">
        <p className="text-sm text-muted-foreground">
          Current plan: <span className="font-semibold text-foreground">{plan}</span>
        </p>
        {updatedTo && (
          <div className="rounded-md border border-primary/30 bg-primary/10 p-3 text-sm">
            Plan updated to{' '}
            <span className="font-semibold">{updatedTo}</span>. Close this
            dialog to see your updated billing settings.
          </div>
        )}
        <div className="flex flex-col gap-3">
          <SubscriptionCard
            title="STANDARD"
            description="Start free — no credit card required. Perfect for getting started."
            price="0"
            payment={payment}
            onPayment={handleSelect}
            id="STANDARD"
          />

          <SubscriptionCard
            title="PRO"
            description="For growing teams that need more domains and higher volume."
            price="15"
            payment={payment}
            onPayment={handleSelect}
            id="PRO"
          />

          <SubscriptionCard
            title="ULTIMATE"
            description="Unlimited scale. For agencies and high-volume businesses."
            price="35"
            payment={payment}
            onPayment={handleSelect}
            id="ULTIMATE"
          />
        </div>
        <StripeElements
          payment={payment}
          currentPlan={plan}
          onSuccess={setUpdatedTo}
        />
        {payment === 'STANDARD' && plan !== 'STANDARD' && (
          <Button
            onClick={onUpdatetToFreTier}
            disabled={loading}
          >
            <Loader loading={loading}>Confirm</Loader>
          </Button>
        )}
      </div>
    </Loader>
  )
}

export default SubscriptionForm
