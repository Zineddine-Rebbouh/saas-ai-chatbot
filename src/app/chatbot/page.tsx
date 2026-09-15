import AiChatBot from '@/components/chatbot'
import React from 'react'

type Props = {}

const ChatBot = (props: Props) => {
  return (
    <>
      <style>{`html,body{background:transparent!important}html{color-scheme:light!important}`}</style>
      <AiChatBot />
    </>
  )
}

export default ChatBot
