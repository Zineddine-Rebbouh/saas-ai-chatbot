import { useToast } from '@/components/ui/use-toast'
import {
  onGetChatMessages,
  onGetDomainChatRooms,
  onOwnerSendMessage,
  onViewUnReadMessages,
} from '@/actions/conversation'
import { useChatContext } from '@/context/user-chat-context'
import { getMonthName, isPusherConfigured, pusherClient } from '@/lib/utils'
import {
  ChatBotMessageSchema,
  ConversationSearchSchema,
} from '@/schemas/conversation.schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'

export const useConversation = () => {
  const { toast } = useToast()
  const { register, watch } = useForm({
    resolver: zodResolver(ConversationSearchSchema),
    mode: 'onChange',
  })
  const {
    setLoading: loadMessages,
    setChats,
    setChatRoom,
    setHasOlder,
  } = useChatContext()
  const [chatRooms, setChatRooms] = useState<
    {
      chatRoom: {
        id: string
        createdAt: Date
        message: {
          message: string
          createdAt: Date
          seen: boolean
        }[]
      }[]
      email: string | null
    }[]
  >([])
  const [loading, setLoading] = useState<boolean>(false)
  useEffect(() => {
    const search = watch(async (value) => {
      setLoading(true)
      try {
        const rooms = await onGetDomainChatRooms(value.domain)
        if (rooms) {
          setLoading(false)
          setChatRooms(rooms.customer)
        }
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Could not search conversations — please try again.',
        })
      } finally {
        setLoading(false)
      }
    })
    return () => search.unsubscribe()
  }, [watch])

  const onGetActiveChatMessages = async (id: string) => {
    try {
      loadMessages(true)
      // Only the newest page of history is fetched; `hasOlder` tells the
      // messenger whether a "load earlier messages" control should appear.
      const page = await onGetChatMessages(id)
      if (page.messages.length > 0) {
        setChatRoom(id)
        setChats(page.messages)
        setHasOlder(page.hasMore)
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Could not load messages — please try again.',
      })
    } finally {
      loadMessages(false)
    }
  }
  return {
    register,
    chatRooms,
    loading,
    onGetActiveChatMessages,
  }
}

export const useChatTime = (createdAt: Date, roomId: string) => {
  const { chatRoom } = useChatContext()
  const [messageSentAt, setMessageSentAt] = useState<string>()
  const [urgent, setUrgent] = useState<boolean>(false)

  const onSetMessageRecievedDate = () => {
    const dt = new Date(createdAt)
    const current = new Date()
    const currentDate = current.getDate()
    const hr = dt.getHours()
    const min = dt.getMinutes()
    const date = dt.getDate()
    const month = dt.getMonth()
    const difference = currentDate - date

    if (difference <= 0) {
      setMessageSentAt(`${hr}:${min}${hr > 12 ? 'PM' : 'AM'}`)
      if (current.getHours() - dt.getHours() < 2) {
        setUrgent(true)
      }
    } else {
      setMessageSentAt(`${date} ${getMonthName(month)}`)
    }
  }

  const onSeenChat = async () => {
    if (chatRoom == roomId && urgent) {
      await onViewUnReadMessages(roomId)
      setUrgent(false)
    }
  }

  useEffect(() => {
    onSeenChat()
  }, [chatRoom])

  useEffect(() => {
    onSetMessageRecievedDate()
  }, [])

  return { messageSentAt, urgent, onSeenChat }
}

export const useChatWindow = () => {
  const { toast } = useToast()
  const { chats, loading, setChats, chatRoom, hasOlder, setHasOlder } =
    useChatContext()
  const [sending, setSending] = useState<boolean>(false)
  const [loadingOlder, setLoadingOlder] = useState<boolean>(false)
  const messageWindowRef = useRef<HTMLDivElement | null>(null)
  // Set just before prepending older history so the scroll effect below does
  // not jump the conversation back to the newest message.
  const skipAutoScrollRef = useRef<boolean>(false)
  const { register, handleSubmit, reset } = useForm({
    resolver: zodResolver(ChatBotMessageSchema),
    mode: 'onChange',
  })
  const onScrollToBottom = () => {
    messageWindowRef.current?.scroll({
      top: messageWindowRef.current.scrollHeight,
      left: 0,
      behavior: 'smooth',
    })
  }

  useEffect(() => {
    if (skipAutoScrollRef.current) {
      skipAutoScrollRef.current = false
      return
    }
    onScrollToBottom()
  }, [chats, messageWindowRef])

  /**
   * Pages backwards through history using the oldest message currently
   * rendered as the cursor.
   */
  const onLoadOlderMessages = async () => {
    if (!chatRoom || !hasOlder || loadingOlder) return
    const oldestMessageId = chats[0]?.id
    if (!oldestMessageId) return

    setLoadingOlder(true)
    try {
      const page = await onGetChatMessages(chatRoom, oldestMessageId)
      if (page.messages.length > 0) {
        skipAutoScrollRef.current = true
        setChats((prev) => [...page.messages, ...prev])
      }
      setHasOlder(page.hasMore)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Could not load earlier messages — please try again.',
      })
    } finally {
      setLoadingOlder(false)
    }
  }

  useEffect(() => {
    if (chatRoom && isPusherConfigured) {
      pusherClient.subscribe(chatRoom)
      pusherClient.bind('realtime-mode', (data: any) => {
        setChats((prev) => [...prev, data.chat])
      })

      return () => {
        pusherClient.unbind('realtime-mode')
        pusherClient.unsubscribe(chatRoom)
      }
    }
  }, [chatRoom])

  const onHandleSentMessage = handleSubmit(async (values) => {
    try {
      if (!chatRoom || sending) return
      setSending(true)
      // The server persists the message AND emits realtime in one action,
      // so there is no separate emit call here (it would double-deliver).
      const result = await onOwnerSendMessage(
        chatRoom,
        values.content,
        'assistant'
      )
      if (
        result &&
        'message' in result &&
        Array.isArray(result.message) &&
        result.message[0]
      ) {
        reset()
      } else {
        toast({
          title: 'Error',
          description:
            (result as { message?: string })?.message ??
            'Message could not be sent — please try again.',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Message could not be sent — please try again.',
      })
    } finally {
      setSending(false)
    }
  })

  return {
    messageWindowRef,
    register,
    onHandleSentMessage,
    chats,
    loading,
    sending,
    chatRoom,
    hasOlder,
    loadingOlder,
    onLoadOlderMessages,
  }
}
