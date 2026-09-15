'use client'
import { useChatBot } from '@/hooks/chatbot/use-chatbot'
import React, { useEffect } from 'react'
import { BotWindow } from './window'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import { MessageSquare, X } from 'lucide-react'

type Props = {}

const AiChatBot = (props: Props) => {
  const {
    onOpenChatBot,
    botOpened,
    onChats,
    register,
    onStartChatting,
    onAiTyping,
    messageWindowRef,
    currentBot,
    loading,
    onRealTime,
    setOnChats,
    errors,
  } = useChatBot()

  // The widget lives in an iframe on target website: force embed document background transparent
  useEffect(() => {
    const html = document.documentElement
    const body = document.body
    html.style.setProperty('background', 'transparent', 'important')
    body.style.setProperty('background', 'transparent', 'important')
    return () => {
      html.style.removeProperty('background')
      body.style.removeProperty('background')
    }
  }, [])

  return (
    <div className="h-screen w-screen flex flex-col justify-end items-end p-4 sm:p-6 bg-transparent overflow-hidden">
      {botOpened && (
        <div className="mb-3 transition-all animate-in fade-in slide-in-from-bottom-5 duration-200">
          <BotWindow
            errors={errors}
            setChat={setOnChats}
            realtimeMode={onRealTime}
            helpdesk={currentBot?.helpdesk || []}
            domainName={currentBot?.name || 'AI Assistant'}
            botIcon={currentBot?.chatBot?.icon}
            ref={messageWindowRef}
            help={currentBot?.chatBot?.helpdesk}
            theme={currentBot?.chatBot?.background}
            textColor={currentBot?.chatBot?.textColor}
            chats={onChats}
            register={register}
            onChat={onStartChatting}
            onClose={onOpenChatBot}
            onResponding={onAiTyping}
          />
        </div>
      )}

      {/* Floating Action Button */}
      <button
        type="button"
        aria-label="Toggle Chatbot"
        className={cn(
          'rounded-full relative cursor-pointer shadow-2xl w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 hover:scale-105 active:scale-95 ring-4 ring-primary/20',
          loading ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'
        )}
        onClick={onOpenChatBot}
      >
        {botOpened ? (
          <X className="w-7 h-7 text-primary-foreground transition-transform rotate-0 hover:rotate-90 duration-200" />
        ) : currentBot?.chatBot?.icon ? (
          <div className="relative w-full h-full rounded-full overflow-hidden p-0.5">
            <Image
              src={`https://ucarecdn.com/${currentBot.chatBot.icon}/`}
              alt="bot icon"
              fill
              className="object-cover rounded-full"
            />
          </div>
        ) : (
          <MessageSquare className="w-7 h-7 text-primary-foreground" />
        )}

        {/* Pulse Dot when closed */}
        {!botOpened && (
          <span className="absolute top-0 right-0 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-primary"></span>
          </span>
        )}
      </button>
    </div>
  )
}

export default AiChatBot
