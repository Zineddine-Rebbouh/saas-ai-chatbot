import { useEffect, useState } from 'react'
import {
  onCreateCustomerPaymentIntentSecret,
  onGetStripeClientSecret,
  onUpdateSubscription,
} from '@/actions/stripe'
import { useToast } from '@/components/ui/use-toast'
import axios from 'axios'
import { getAppUrl } from '@/lib/utils'
import {
  useElements,
  useStripe as useStripeHook,
} from '@stripe/react-stripe-js'
import { useRouter } from 'next/navigation'

export const useStripe = () => {
  const [onStripeAccountPending, setOnStripeAccountPending] =
    useState<boolean>(false)
  const { toast } = useToast()

  const onStripeConnect = async () => {
    try {
      setOnStripeAccountPending(true)
      const account = await axios.post(`/api/stripe/connect`)
      if (account?.data?.url) {
        window.location.href = account.data.url
      } else {
        toast({
          title: 'Error',
          description: 'Could not start Stripe onboarding — please try again.',
        })
      }
    } catch (error) {
      console.log(error)
      toast({
        title: 'Error',
        description: 'Could not start Stripe onboarding — please try again.',
      })
    } finally {
      setOnStripeAccountPending(false)
    }
  }
  return { onStripeConnect, onStripeAccountPending }
}

export const useStripeCustomer = (domainId: string) => {
  const [stripeSecret, setStripeSecret] = useState<string>('')
  const [loadForm, setLoadForm] = useState<boolean>(false)

  const onGetCustomerIntent = async (domainId: string) => {
    try {
      setLoadForm(true)
      // Amount + destination account resolve server-side from the domain.
      const intent = await onCreateCustomerPaymentIntentSecret(domainId)
      if (intent?.secret) {
        setStripeSecret(intent.secret)
      }
    } catch (error) {
      console.log(error)
    } finally {
      setLoadForm(false)
    }
  }

  useEffect(() => {
    if (domainId) onGetCustomerIntent(domainId)
  }, [domainId])

  return { stripeSecret, loadForm }
}

export const useCompleteCustomerPayment = (onNext: () => void) => {
  const [processing, setProcessing] = useState<boolean>(false)
  const { toast } = useToast()
  const stripe = useStripeHook()
  const elements = useElements()

  const onMakePayment = async (e: React.MouseEvent) => {
    e.preventDefault()
    if (!stripe || !elements) {
      return null
    }

    try {
      setProcessing(true)

      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${getAppUrl()}/settings`,
        },
        redirect: 'if_required',
      })

      if (error) {
        console.log(error)
        toast({
          title: 'Payment failed',
          description: error.message ?? 'Please try again.',
        })
      }

      if (paymentIntent?.status === 'succeeded') {
        toast({
          title: 'Success',
          description: 'Payment complete',
        })
        onNext()
      }
    } catch (error) {
      console.log(error)
      toast({
        title: 'Payment failed',
        description: 'Please try again.',
      })
    } finally {
      setProcessing(false)
    }
  }

  return { processing, onMakePayment }
}

export const useSubscriptions = (plan: 'STANDARD' | 'PRO' | 'ULTIMATE') => {
  const [loading, setLoading] = useState<boolean>(false)
  const [payment, setPayment] = useState<'STANDARD' | 'PRO' | 'ULTIMATE'>(plan)
  const { toast } = useToast()
  const router = useRouter()

  // After a successful upgrade + router.refresh(), the server sends the new
  // plan as a prop — sync the selection so the form shows the update.
  useEffect(() => {
    setPayment(plan)
  }, [plan])

  const onUpdatetToFreTier = async () => {
    try {
      setLoading(true)
      const free = await onUpdateSubscription('STANDARD')
      if (free && (free as { status?: number }).status !== 402) {
        toast({
          title: 'Success',
          description: free.message,
        })
        router.refresh()
      } else {
        toast({
          title: 'Downgrade failed',
          description: 'Please try again.',
        })
      }
    } catch (error) {
      console.log(error)
      toast({
        title: 'Downgrade failed',
        description: 'Please try again.',
      })
    } finally {
      setLoading(false)
    }
  }

  const onSetPayment = (payment: 'STANDARD' | 'PRO' | 'ULTIMATE') =>
    setPayment(payment)

  return {
    loading,
    onSetPayment,
    payment,
    onUpdatetToFreTier,
  }
}

export const useStripeElements = (payment: 'STANDARD' | 'PRO' | 'ULTIMATE') => {
  const [stripeSecret, setStripeSecret] = useState<string>('')
  const [loadForm, setLoadForm] = useState<boolean>(false)

  const onGetBillingIntent = async (plans: 'STANDARD' | 'PRO' | 'ULTIMATE') => {
    try {
      // STANDARD is free — no payment intent to fetch. Clear any stale
      // secret so a previous PRO/ULTIMATE form doesn't linger.
      if (plans === 'STANDARD') {
        setStripeSecret('')
        return
      }
      setLoadForm(true)
      // Clear first: otherwise Elements keeps rendering the previous plan's
      // intent and the server rejects the amount as unverified.
      setStripeSecret('')
      const intent = await onGetStripeClientSecret(plans)
      if (intent?.secret) {
        setStripeSecret(intent.secret)
      }
    } catch (error) {
      console.log(error)
      setStripeSecret('')
    } finally {
      setLoadForm(false)
    }
  }

  useEffect(() => {
    onGetBillingIntent(payment)
  }, [payment])

  return { stripeSecret, loadForm }
}

export const useCompletePayment = (
  payment: 'STANDARD' | 'PRO' | 'ULTIMATE',
  onSuccess?: (plan: 'STANDARD' | 'PRO' | 'ULTIMATE') => void
) => {
  const [processing, setProcessing] = useState<boolean>(false)
  const router = useRouter()
  const { toast } = useToast()
  const stripe = useStripeHook()
  const elements = useElements()

  const onMakePayment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements) {
      return null
    }

    try {
      setProcessing(true)

      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${getAppUrl()}/settings`,
        },
        redirect: 'if_required',
      })

      if (error) {
        console.log(error)
        toast({
          title: 'Payment failed',
          description: error.message ?? 'Please try again.',
        })
        return
      }

      if (paymentIntent?.status === 'succeeded') {
        // The server re-reads the intent from Stripe before granting the
        // plan, so a forged client callback can't upgrade for free.
        const plan = await onUpdateSubscription(payment, paymentIntent.id)
        if (plan && plan.status === 200) {
          toast({
            title: 'Success',
            description: `Plan updated to ${payment}`,
          })
          onSuccess?.(payment)
          router.refresh()
        } else {
          toast({
            title: 'Payment failed',
            description:
              (plan as { message?: string })?.message ??
              'Payment could not be verified.',
          })
        }
      } else if (paymentIntent) {
        toast({
          title: 'Payment not completed',
          description: `Status: ${paymentIntent.status}`,
        })
      }
    } catch (error) {
      console.log(error)
      toast({
        title: 'Payment failed',
        description: 'Please try again.',
      })
    } finally {
      setProcessing(false)
    }
  }

  return { processing, onMakePayment }
}
