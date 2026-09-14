'use client'

import { Elements } from '@stripe/react-stripe-js'
import React, { useEffect, useState } from 'react'
import { Loader } from '../loader'
import { useStripeElements } from '@/hooks/billing/use-billing'
import { PaymentForm } from './payment-form'
import { isStripeConfigured, getStripe } from '@/lib/utils'

type StripeElementsProps = {
  payment: 'STANDARD' | 'PRO' | 'ULTIMATE'
}

export const StripeElements = ({ payment }: StripeElementsProps) => {
  const [stripePromise, setStripePromise] = useState<any>(null)

  useEffect(() => {
    if (isStripeConfigured) {
      getStripe().then((stripe) => {
        if (stripe) setStripePromise(stripe)
      })
    }
  }, [])

  const { stripeSecret, loadForm } = useStripeElements(payment)
  return (
    stripeSecret &&
    stripePromise &&
    (payment == 'PRO' || payment == 'ULTIMATE') && (
      <Loader loading={loadForm}>
        <Elements
          stripe={stripePromise}
          options={{
            clientSecret: stripeSecret,
          }}
        >
          <PaymentForm plan={payment} />
        </Elements>
      </Loader>
    )
  )
}
