import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import PusherClient from 'pusher-js'
import PusherServer from 'pusher'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const extractUUIDFromString = (url: string) => {
  return url.match(
    /^[0-9a-f]{8}-?[0-9a-f]{4}-?[1-5][0-9a-f]{3}-?[89ab][0-9a-f]{3}-?[0-9a-f]{12}$/i
  )
}

const pusherAppId = process.env.NEXT_PUBLIC_PUSHER_APP_ID
const pusherAppKey = process.env.NEXT_PUBLIC_PUSHER_APP_KEY
const pusherAppSecret = process.env.NEXT_PUBLIC_PUSHER_APP_SECRET
const pusherAppCluster = process.env.NEXT_PUBLIC_PUSHER_APP_CLUSTER

export const isPusherConfigured = Boolean(pusherAppKey && pusherAppCluster)

const stripePublishKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISH_KEY

export const isStripeConfigured = Boolean(stripePublishKey)

export const getStripe = (stripeAccount?: string): Promise<any> => {
  if (!isStripeConfigured) return Promise.resolve(null)
  return import('@stripe/stripe-js').then(({ loadStripe }) =>
    loadStripe(stripePublishKey!, stripeAccount ? { stripeAccount } : undefined)
  )
}

export const pusherServer = new PusherServer({
  appId: pusherAppId ?? '',
  key: pusherAppKey ?? '',
  secret: pusherAppSecret ?? '',
  cluster: pusherAppCluster ?? '',
  useTLS: true,
})

export const pusherClient = new PusherClient(pusherAppKey ?? '', {
  cluster: pusherAppCluster ?? '',
})

export const postToParent = (message: string) => {
  window.parent.postMessage(message, '*')
}

export const extractURLfromString = (url: string) => {
  return url.match(/https?:\/\/[^\s"<>]+/)
}

export const extractEmailsFromString = (text: string) => {
  return text.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi)
}

export const getMonthName = (month: number) => {
  // JS Date.getMonth() is 0-indexed (0 = Jan) — array lookup is correct
  return (
    [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ][month] ?? ''
  )
}
