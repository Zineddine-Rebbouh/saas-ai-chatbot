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

export const pusherServer = new PusherServer({
  appId: process.env.NEXT_PUBLIC_PUSHER_APP_ID as string,
  key: process.env.NEXT_PUBLIC_PUSHER_APP_KEY as string,
  secret: process.env.NEXT_PUBLIC_PUSHER_APP_SECRET as string,
  cluster: process.env.NEXT_PUBLIC_PUSHER_APP_CLUSTOR as string,
  useTLS: true,
})

export const pusherClient = new PusherClient(
  process.env.NEXT_PUBLIC_PUSHER_APP_KEY as string,
  {
    cluster: process.env.NEXT_PUBLIC_PUSHER_APP_CLUSTOR as string,
  }
)

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
