'use client'
import { useChatWindow } from '@/hooks/conversation/use-conversation'
import React from 'react'
import { Loader } from '../loader'
import Bubble from '../chatbot/bubble'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { PaperclipIcon } from 'lucide-react'

type Props = {}

const Messenger = (props: Props) => {
  const {
    messageWindowRef,
    chats,
    loading,
    chatRoom,
    onHandleSentMessage,
    register,
  } = useChatWindow()
  return (
    <div className="flex-1 flex flex-col h-0 relative">
      <div className="flex-1 h-0 w-full flex flex-col">
        <Loader loading={loading}>
          <div
            ref={messageWindowRef}
            className="w-full flex-1 h-0 flex flex-col gap-3 pl-5 py-5 chat-window overflow-y-auto"
          >
            {chats.length ? (
              chats.map((chat) => (
                <Bubble
                  key={chat.id}
                  message={{
                    role: chat.role!,
                    content: chat.message,
                  }}
                  createdAt={chat.createdAt}
                />
              ))
            ) : (
              <div>No Chat Selected</div>
            )}
          </div>
        </Loader>
      </div>
      <div className="p-4 bg-background/50 border-t border-border/40 backdrop-blur-sm">
        <form
          onSubmit={onHandleSentMessage}
          className="flex items-center gap-3 bg-card border border-border/80 rounded-2xl p-2 pl-4 shadow-sm focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/20 transition-all duration-150"
        >
          {/* Attachment button */}
          <button
            type="button"
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-xl transition-all duration-100 flex-shrink-0"
            title="Attach file"
          >
            <PaperclipIcon size={18} />
          </button>

          {/* Input field */}
          <input
            {...register('content')}
            placeholder={chatRoom ? "Type your message..." : "Select a conversation to start chatting"}
            disabled={!chatRoom}
            className="flex-1 bg-transparent border-none outline-none text-sm text-foreground placeholder:text-muted-foreground/70 py-2.5 focus:ring-0 min-w-0"
          />

          {/* Send Button */}
          <Button
            type="submit"
            className="px-5 py-2.5 bg-primary hover:bg-primary/95 text-primary-foreground text-sm font-semibold rounded-xl transition-all duration-150 hover:-translate-y-px active:translate-y-0 disabled:opacity-50 disabled:pointer-events-none"
            disabled={!chatRoom}
          >
            Send
          </Button>
        </form>
      </div>
    </div>
  )
}

export default Messenger
