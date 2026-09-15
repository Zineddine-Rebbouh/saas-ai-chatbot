'use client'
import { useChatBot } from '@/hooks/chatbot/use-chatbot'
import React, { useEffect } from 'react'
import { BotWindow } from './window'
import { cn } from '@/lib/utils'
import Image from 'next/image'

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

  // The widget lives in a tiny iframe on someone else's page: force the
  // embed document transparent (beats the dark-theme body bg + color-scheme).
  useEffect(() => {
    const html = document.documentElement
    const body = document.body
    html.style.setProperty('background', 'transparent', 'important')
    body.style.setProperty('background', 'transparent', 'important')
    html.style.setProperty('color-scheme', 'light', 'important')
    return () => {
      html.style.removeProperty('background')
      body.style.removeProperty('background')
      html.style.removeProperty('color-scheme')
    }
  }, [])

  return (
    <div className="h-screen flex flex-col justify-end items-end gap-4 bg-transparent">
      {botOpened && (
        <BotWindow
          errors={errors}
          setChat={setOnChats}
          realtimeMode={onRealTime}
          helpdesk={currentBot?.helpdesk!}
          domainName={currentBot?.name!}
          ref={messageWindowRef}
          help={currentBot?.chatBot?.helpdesk}
          theme={currentBot?.chatBot?.background}
          textColor={currentBot?.chatBot?.textColor}
          chats={onChats}
          register={register}
          onChat={onStartChatting}
          onResponding={onAiTyping}
        />
      )}
      <div
        className={cn(
          'rounded-full relative cursor-pointer shadow-xl w-16 h-16 flex items-center justify-center bg-primary hover:bg-primary/90 transition-all duration-150 hover:scale-105 active:scale-95',
          loading ? 'invisible' : 'visible'
        )}
        onClick={onOpenChatBot}
      >
        {currentBot?.chatBot?.icon ? (
          <Image
            src={`https://ucarecdn.com/${currentBot.chatBot.icon}/`}
            alt="bot"
            fill
          />
        ) : (
          <Image
            src="/chat-bot-logo.png"
            alt="chat"
            fill
            className="object-cover rounded-full"
            priority
          />
        )}
      </div>
    </div>
  )
}

export default AiChatBot
