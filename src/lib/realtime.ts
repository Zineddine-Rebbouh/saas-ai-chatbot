import { pusherServer } from '@/lib/utils'

// Server-only emit helper (not a server action): triggers a realtime event
// on a chat-room channel. Ownership checks live in the calling action
// (`onRealTimeChat`) or flow (`onAiChatBotAssistant`, which already resolved
// the customer through its domain).
export const emitRealtime = async (
  chatroomId: string,
  message: string,
  id: string,
  role: 'assistant' | 'user'
) => {
  try {
    await pusherServer.trigger(chatroomId, 'realtime-mode', {
      chat: {
        message,
        id,
        role,
      },
    })
    return true
  } catch (error) {
    console.log(error)
    return false
  }
}
