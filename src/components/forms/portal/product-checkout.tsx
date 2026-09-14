'use client'
import React, { useEffect, useState } from 'react'
import { useStripeCustomer } from '@/hooks/billing/use-billing'
import { Loader } from '@/components/loader'
import { Card } from '@/components/ui/card'
import { Elements } from '@stripe/react-stripe-js'
import Image from 'next/image'
import { CustomerPaymentForm } from './payment-form'
import { isStripeConfigured, getStripe } from '@/lib/utils'

type Props = {
  onBack(): void
  products?:
    | {
        name: string
        image: string
        price: number
      }[]
    | undefined
  amount?: number
  onNext(): void
  stripeId?: string
}

const PaymentCheckout = ({
  onBack,
  onNext,
  amount,
  products,
  stripeId,
}: Props) => {
  const [stripePromise, setStripePromise] = useState<any>(null)

  useEffect(() => {
    if (isStripeConfigured) {
      getStripe(stripeId).then((stripe) => {
        if (stripe) setStripePromise(stripe)
      })
    }
  }, [stripeId])

  const { stripeSecret, loadForm } = useStripeCustomer(amount!, stripeId!)

  if (!isStripeConfigured) {
    return (
      <div className="flex flex-col gap-5 justify-center">
        <div className="flex justify-center">
          <h2 className="text-4xl font-bold mb-5">Payment</h2>
        </div>
        <p className="text-center text-muted-foreground">
          Payment processing is not available at this time.
        </p>
      </div>
    )
  }

  return (
    <Loader loading={loadForm}>
      <div className="flex flex-col gap-5 justify-center">
        <div className="flex justify-center">
          <h2 className="text-4xl font-bold mb-5">Payment</h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2">
          <div className="col-span-1 border-r-2 pr-5 flex flex-col">
            <h2 className="text-3xl font-bold mb-5">${amount}</h2>
            {products &&
              products.map((product, key) => (
                <Card
                  key={key}
                  className="w-full flex gap-2 p-3"
                >
                  <div className="w-2/12 aspect-square relative">
                    <Image
                      src={`https://ucarecdn.com/${product.image}/`}
                      alt={product.name}
                      fill
                    />
                  </div>
                  <div className="flex-1 flex justify-between">
                    <p className="text-xl font-semibold">{product.name}</p>
                    <p className="text-2xl font-bold">${product.price}</p>
                  </div>
                </Card>
              ))}
          </div>
          <div className="col-span-1 pl-5">
            {stripeSecret && stripePromise && (
              <Elements
                stripe={stripePromise}
                options={{
                  clientSecret: stripeSecret,
                }}
              >
                <CustomerPaymentForm onNext={onNext} />
              </Elements>
            )}
          </div>
        </div>
      </div>
    </Loader>
  )
}

export default PaymentCheckout
