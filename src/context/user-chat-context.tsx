'use client'

import { createContext, useContext, useState } from 'react'

type ChatInitialValuesProps = {
  realtime: boolean
  setRealtime: React.Dispatch<React.SetStateAction<boolean>>
  chatRoom: string | undefined
  setChatRoom: React.Dispatch<React.SetStateAction<string | undefined>>
  chats: {
    message: string
    id: string
    role: 'assistant' | 'user' | null
    createdAt: Date
    seen: boolean
  }[]
  setChats: React.Dispatch<
    React.SetStateAction<
      {
        message: string
        id: string
        role: 'assistant' | 'user' | null
        createdAt: Date
        seen: boolean
      }[]
    >
  >
  loading: boolean
  setLoading: React.Dispatch<React.SetStateAction<boolean>>
  /**
   * True when the loaded conversation window has older messages that were
   * not fetched yet (messages are paginated, newest page first).
   */
  hasOlder: boolean
  setHasOlder: React.Dispatch<React.SetStateAction<boolean>>
}

const ChatInitialValues: ChatInitialValuesProps = {
  chatRoom: undefined,
  setChatRoom: () => undefined,
  chats: [],
  setChats: () => undefined,
  loading: false,
  setLoading: () => undefined,
  realtime: false,
  setRealtime: () => undefined,
  hasOlder: false,
  setHasOlder: () => undefined,
}

const chatContext = createContext(ChatInitialValues)
const { Provider } = chatContext

export const ChatProvider = ({ children }: { children: React.ReactNode }) => {
  const [chats, setChats] = useState(ChatInitialValues.chats)
  const [loading, setLoading] = useState(ChatInitialValues.loading)
  const [chatRoom, setChatRoom] = useState(ChatInitialValues.chatRoom)
  const [realtime, setRealtime] = useState(ChatInitialValues.realtime)
  const [hasOlder, setHasOlder] = useState(ChatInitialValues.hasOlder)

  const values = {
    chats,
    setChats,
    loading,
    setLoading,
    chatRoom,
    setChatRoom,
    realtime,
    setRealtime,
    hasOlder,
    setHasOlder,
  }

  return <Provider value={values}>{children}</Provider>
}

export const useChatContext = () => {
  const state = useContext(chatContext)
  return state
}
