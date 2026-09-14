import React from 'react'
import { useRealTime } from '@/hooks/chatbot/use-chatbot'

type Props = {
  chatRoomId: string
  setChats: React.Dispatch<
    React.SetStateAction<
      {
        role: 'user' | 'assistant'
        content: string
        link?: string | undefined
      }[]
    >
  >
}

const RealTimeMode = ({ chatRoomId, setChats }: Props) => {
 useRealTime(chatRoomId, setChats)

  return (
    <div className="px-3 rounded-full py-1 bg-primary text-primary-foreground font-bold text-sm">
      Real Time
    </div>
  )
}

export default RealTimeMode
