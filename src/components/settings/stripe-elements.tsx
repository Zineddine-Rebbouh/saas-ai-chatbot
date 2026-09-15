'use client'

import { Elements } from '@stripe/react-stripe-js'
import React, { useEffect, useState } from 'react'
import { Loader } from '../loader'
import { useStripeElements } from '@/hooks/billing/use-billing'
import { PaymentForm } from './payment-form'
import { isStripeConfigured, getStripe } from '@/lib/utils'

type StripeElementsProps = {
  payment: 'STANDARD' | 'PRO' | 'ULTIMATE'
  currentPlan: 'STANDARD' | 'PRO' | 'ULTIMATE'
  onSuccess?: (plan: 'STANDARD' | 'PRO' | 'ULTIMATE') => void
}

export const StripeElements = ({
  payment,
  currentPlan,
  onSuccess,
}: StripeElementsProps) => {
  const [stripePromise, setStripePromise] = useState<any>(null)

  useEffect(() => {
    if (isStripeConfigured) {
      getStripe().then((stripe) => {
        if (stripe) setStripePromise(stripe)
      })
    }
  }, [])

  const { stripeSecret, loadForm } = useStripeElements(payment)

  if (payment !== 'PRO' && payment !== 'ULTIMATE') return null

  if (!isStripeConfigured) {
    return (
      <p className="text-sm text-muted-foreground">
        Stripe is not configured. Add NEXT_PUBLIC_STRIPE_PUBLISH_KEY to enable
        checkout.
      </p>
    )
  }

  if (loadForm || !stripeSecret || !stripePromise) {
    return (
      <Loader loading={loadForm || !stripeSecret}>
        <div className="h-24" />
      </Loader>
    )
  }

  // key forces Elements to remount on a new intent — otherwise Stripe keeps
  // charging the previous plan's amount and verification fails.
  return (
    <Elements
      key={stripeSecret}
      stripe={stripePromise}
      options={{
        clientSecret: stripeSecret,
      }}
    >
      <PaymentForm
        plan={payment}
        currentPlan={currentPlan}
        onSuccess={onSuccess}
      />
    </Elements>
  )
}
