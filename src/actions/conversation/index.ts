'use server'

import { client } from '@/lib/prisma'
import { emitRealtime } from '@/lib/realtime'
import { requireChatRoomOwner, requireDomainOwner } from '@/lib/server-auth'

// Page sizes. The inbox used to load every room of a domain and the messenger
// used to load every message ever written into a room — both unbounded.
const CHAT_ROOM_PAGE_SIZE = 50
const MESSAGE_PAGE_SIZE = 50

export const onToggleRealtime = async (id: string, state: boolean) => {
  try {
    const owned = await requireChatRoomOwner(id)
    if (!owned) {
      return { status: 403, message: 'Not authorized for this chat' }
    }
    const chatRoom = await client.chatRoom.update({
      where: {
        id,
      },
      data: {
        live: state,
      },
      select: {
        id: true,
        live: true,
      },
    })

    if (chatRoom) {
      return {
        status: 200,
        message: chatRoom.live
          ? 'Realtime mode enabled'
          : 'Realtime mode disabled',
        chatRoom,
      }
    }
    return { status: 404, message: 'Chat room not found' }
  } catch (error) {
    console.log(error)
    return { status: 400, message: 'Could not update realtime mode' }
  }
}

export const onGetConversationMode = async (id: string) => {
  try {
    const owned = await requireChatRoomOwner(id)
    if (!owned) return null
    const mode = await client.chatRoom.findUnique({
      where: {
        id,
      },
      select: {
        live: true,
      },
    })
    return mode ?? null
  } catch (error) {
    console.log(error)
    return null
  }
}

export const onGetDomainChatRooms = async (id: string) => {
  try {
    const owned = await requireDomainOwner(id)
    if (!owned) return null
    const domains = await client.domain.findUnique({
      where: {
        id,
      },
      select: {
        customer: {
          select: {
            email: true,
            chatRoom: {
              select: {
                createdAt: true,
                id: true,
                message: {
                  select: {
                    message: true,
                    createdAt: true,
                    seen: true,
                  },
                  orderBy: {
                    createdAt: 'desc',
                  },
                  take: 1,
                },
              },
              // The UI renders a single conversation per customer
              // (`chatRoom[0]`) — take exactly that one, newest first, instead
              // of shipping every room the customer has ever had.
              orderBy: {
                createdAt: 'desc',
              },
              take: 1,
            },
          },
          // Deterministic order so the bounded page is stable between calls.
          orderBy: {
            email: 'asc',
          },
          take: CHAT_ROOM_PAGE_SIZE,
        },
      },
    })

    return domains ?? null
  } catch (error) {
    console.log(error)
    return null
  }
}

export type ChatMessagePage = {
  roomId: string | null
  live: boolean
  /** Oldest → newest, so the UI can render/replace the window directly. */
  messages: {
    id: string
    role: 'assistant' | 'user' | null
    message: string
    createdAt: Date
    seen: boolean
  }[]
  /** True when older messages exist before this page. */
  hasMore: boolean
}

const EMPTY_MESSAGE_PAGE: ChatMessagePage = {
  roomId: null,
  live: false,
  messages: [],
  hasMore: false,
}

/**
 * One page of a conversation's messages.
 *
 * Loads the newest `MESSAGE_PAGE_SIZE` messages (plus one extra row to detect
 * whether more history exists) and returns them in chronological order, which
 * is the order the messenger renders. Pass `before` (the id of the oldest
 * message currently on screen) to page backwards through history.
 */
export const onGetChatMessages = async (
  id: string,
  before?: string
): Promise<ChatMessagePage> => {
  try {
    const owned = await requireChatRoomOwner(id)
    if (!owned) return EMPTY_MESSAGE_PAGE

    const room = await client.chatRoom.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        live: true,
        message: {
          select: {
            id: true,
            role: true,
            message: true,
            createdAt: true,
            seen: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: MESSAGE_PAGE_SIZE + 1,
          ...(before
            ? {
                cursor: { id: before },
                skip: 1,
              }
            : {}),
        },
      },
    })

    if (!room) return EMPTY_MESSAGE_PAGE

    const page = room.message
    const hasMore = page.length > MESSAGE_PAGE_SIZE
    const newestFirst = hasMore ? page.slice(0, MESSAGE_PAGE_SIZE) : page

    return {
      roomId: room.id,
      live: room.live,
      // Queried newest-first for correct paging, rendered oldest-first.
      messages: [...newestFirst].reverse(),
      hasMore,
    }
  } catch (error) {
    console.log(error)
    return EMPTY_MESSAGE_PAGE
  }
}

export const onViewUnReadMessages = async (id: string) => {
  try {
    const owned = await requireChatRoomOwner(id)
    if (!owned) return { status: 403 }
    await client.chatMessage.updateMany({
      where: {
        chatRoomId: id,
      },
      data: {
        seen: true,
      },
    })
    return { status: 200 }
  } catch (error) {
    console.log(error)
    return { status: 400 }
  }
}

export const onRealTimeChat = async (
  chatroomId: string,
  message: string,
  id: string,
  role: 'assistant' | 'user'
) => {
  const owned = await requireChatRoomOwner(chatroomId)
  if (!owned) return false
  return emitRealtime(chatroomId, message, id, role)
}

export const onOwnerSendMessage = async (
  chatroom: string,
  message: string,
  role: 'assistant' | 'user'
) => {
  try {
    const owned = await requireChatRoomOwner(chatroom)
    if (!owned) {
      return { status: 403, message: 'Not authorized for this chat' }
    }
    if (!message || typeof message !== 'string') {
      return { status: 400, message: 'Message is required' }
    }
    const chat = await client.chatRoom.update({
      where: {
        id: chatroom,
      },
      data: {
        message: {
          create: {
            message,
            role,
          },
        },
      },
      select: {
        message: {
          select: {
            id: true,
            role: true,
            message: true,
            createdAt: true,
            seen: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
        },
      },
    })

    if (chat) {
      // Emit from the server right after persisting so DB and UI stay in sync
      // no matter which caller sends the message.
      await emitRealtime(chatroom, message, chat.message[0]?.id ?? '', role)
      return chat
    }
    return { status: 404, message: 'Chat room not found' }
  } catch (error) {
    console.log(error)
    return { status: 400, message: 'Could not send message' }
  }
}
