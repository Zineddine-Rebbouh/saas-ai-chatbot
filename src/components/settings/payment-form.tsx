'use client'
import React from 'react'
import { CardDescription } from '../ui/card'
import { Loader } from '../loader'
import { PaymentElement } from '@stripe/react-stripe-js'
import { Button } from '../ui/button'
import { useCompletePayment } from '@/hooks/billing/use-billing'


type PaymentFormProps = {
  plan: 'STANDARD' | 'PRO' | 'ULTIMATE'
  currentPlan?: 'STANDARD' | 'PRO' | 'ULTIMATE'
  onSuccess?: (plan: 'STANDARD' | 'PRO' | 'ULTIMATE') => void
}

export const PaymentForm = ({ plan, currentPlan, onSuccess }: PaymentFormProps) => {
  const { processing, onMakePayment } = useCompletePayment(plan, onSuccess)
  const isCurrent = currentPlan !== undefined && currentPlan === plan
  return (
    <form
      onSubmit={onMakePayment}
      className="flex flex-col gap-5"
    >
      <div>
        <h2 className="font-semibold text-xl text-foreground">Payment Method</h2>
        <CardDescription>
          {currentPlan && currentPlan !== plan
            ? `Upgrading from ${currentPlan} to ${plan}. Enter your card details.`
            : 'Enter your card details'}
        </CardDescription>
      </div>
      {isCurrent ? (
        <p className="text-sm text-muted-foreground">
          You&apos;re already on {plan}. Pick a different plan to change.
        </p>
      ) : (
        <>
          <PaymentElement />
          <Button
            type="submit"
            disabled={processing}
          >
            <Loader loading={processing}>Pay</Loader>
          </Button>
        </>
      )}
    </form>
  )
}
