'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { Bot, MessageSquare, HelpCircle, Send, Sparkles, Paperclip, X } from 'lucide-react'
import Logo from '@/icons/logo'

type Props = {
  domainName: string
  icon?: string | null
  welcomeMessage?: string | null
  background?: string | null
  textColor?: string | null
}

export const BotPreview = ({
  domainName,
  icon,
  welcomeMessage,
  background,
  textColor,
}: Props) => {
  const [activeTab, setActiveTab] = useState<'chat' | 'helpdesk'>('chat')
  const [previewMsg, setPreviewMsg] = useState('')
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: welcomeMessage || 'Hey there! Have a question? Text us here!',
    },
  ])

  // Sync welcome message if prop changes
  React.useEffect(() => {
    setMessages((prev) => [
      {
        role: 'assistant',
        content: welcomeMessage || 'Hey there! Have a question? Text us here!',
      },
      ...prev.slice(1),
    ])
  }, [welcomeMessage])

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault()
    if (!previewMsg.trim()) return
    setMessages((prev) => [
      ...prev,
      { role: 'user', content: previewMsg },
      { role: 'assistant', content: 'This is a live preview of how your chatbot responds!' },
    ])
    setPreviewMsg('')
  }

  const bgColor = background || '#09090b'
  const textCol = textColor || '#ffffff'

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary animate-pulse" />
          <span className="text-xs font-semibold tracking-wide uppercase text-muted-foreground">
            Live Chatbot Preview
          </span>
        </div>
        <span className="text-[11px] text-emerald-500 font-medium flex items-center gap-1.5 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
          Interactive Demo
        </span>
      </div>

      {/* Mock Chatbot Window */}
      <div className="w-full max-w-[380px] mx-auto rounded-2xl border border-border/80 shadow-2xl overflow-hidden flex flex-col h-[520px] bg-card transition-all">
        {/* Header */}
        <div className="px-4 py-3 border-b border-border/40 bg-card/80 backdrop-blur-md flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative">
              {icon ? (
                <div className="w-9 h-9 rounded-full overflow-hidden ring-2 ring-primary/30">
                  <Image
                    src={`https://ucarecdn.com/${icon}/`}
                    alt="bot"
                    width={36}
                    height={36}
                    className="object-cover w-full h-full"
                  />
                </div>
              ) : (
                <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                  <Logo variant="mark" width={18} height={18} />
                </div>
              )}
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-card" />
            </div>

            <div className="flex flex-col">
              <h4 className="text-sm font-semibold leading-tight text-foreground">
                Domainly AI
              </h4>
              <span className="text-[11px] text-muted-foreground">
                {domainName || 'yourdomain.com'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 text-muted-foreground">
            <button
              type="button"
              className="w-7 h-7 rounded-lg hover:bg-muted/80 flex items-center justify-center transition-colors text-xs"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="px-3 pt-2 pb-1 bg-card/40 border-b border-border/30 flex gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('chat')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'chat'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:bg-muted/50'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            Chat
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('helpdesk')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'helpdesk'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:bg-muted/50'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            Helpdesk
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'chat' ? (
          <div className="flex-1 flex flex-col min-h-0">
            {/* Chat Messages Body with Theme Customization */}
            <div
              className="flex-1 min-h-0 p-3.5 flex flex-col gap-3 overflow-y-auto"
              style={{ backgroundColor: bgColor, color: textCol }}
            >
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex gap-2 items-end text-xs max-w-[85%] ${
                    msg.role === 'user' ? 'self-end flex-row-reverse' : 'self-start'
                  }`}
                >
                  {msg.role === 'assistant' ? (
                    <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                      <Bot className="w-3 h-3 text-primary" />
                    </div>
                  ) : null}

                  <div
                    className={`px-3 py-2 rounded-2xl ${
                      msg.role === 'user'
                        ? 'bg-primary text-primary-foreground rounded-br-none shadow-sm'
                        : 'bg-card/90 text-card-foreground border border-border/60 rounded-bl-none shadow-sm'
                    }`}
                  >
                    <p className="leading-relaxed break-words font-medium">{msg.content}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Input Form */}
            <form
              onSubmit={handleSend}
              className="p-2.5 bg-card border-t border-border/40 flex items-center gap-2 shrink-0"
            >
              <div className="flex-1 relative flex items-center">
                <input
                  type="text"
                  value={previewMsg}
                  onChange={(e) => setPreviewMsg(e.target.value)}
                  placeholder="Type a message..."
                  className="w-full text-xs pl-3 pr-8 py-2 bg-muted/50 border border-border/60 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary text-foreground placeholder:text-muted-foreground"
                />
                <button
                  type="button"
                  className="absolute right-2 text-muted-foreground hover:text-foreground"
                >
                  <Paperclip className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                type="submit"
                disabled={!previewMsg.trim()}
                className="w-8 h-8 rounded-xl bg-primary text-primary-foreground flex items-center justify-center hover:opacity-90 disabled:opacity-50 transition-opacity shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        ) : (
          <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3">
            <h5 className="text-xs font-semibold text-foreground">Frequently Asked Questions</h5>
            <div className="p-3 rounded-xl border border-border/60 bg-muted/30 text-xs flex flex-col gap-1">
              <span className="font-medium text-foreground">What are your support hours?</span>
              <span className="text-muted-foreground">We are available 24/7 via live chat.</span>
            </div>
            <div className="p-3 rounded-xl border border-border/60 bg-muted/30 text-xs flex flex-col gap-1">
              <span className="font-medium text-foreground">How do I request a demo?</span>
              <span className="text-muted-foreground">Simply message us here or book an appointment!</span>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="py-1.5 text-center bg-card border-t border-border/30 shrink-0">
          <span className="text-[10px] text-muted-foreground/60 tracking-wider">
            Powered by Domainly AI
          </span>
        </div>
      </div>
    </div>
  )
}

export default BotPreview
