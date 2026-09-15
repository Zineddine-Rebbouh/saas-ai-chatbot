import { ChatBotMessageProps } from '@/schemas/conversation.schema'
import React, { forwardRef } from 'react'
import { UseFormRegister } from 'react-hook-form'
import Logo from '@/icons/logo'
import { Avatar, AvatarFallback } from '../ui/avatar'
import RealTimeMode from './real-time'
import Image from 'next/image'
import TabsMenu from '../tabs/intex'
import { BOT_TABS_MENU } from '@/constants/menu'
import { TabsContent } from '../ui/tabs'
import { Separator } from '../ui/separator'
import Bubble from './bubble'
import { Responding } from './responding'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { Paperclip, Send, X } from 'lucide-react'
import { Label } from '../ui/label'
import { CardDescription, CardTitle } from '../ui/card'
import Accordion from '../accordian'

type Props = {
  errors: any
  register: UseFormRegister<ChatBotMessageProps>
  chats: { role: 'assistant' | 'user'; content: string; link?: string }[]
  onChat(): void
  onClose?: () => void
  onResponding: boolean
  domainName?: string
  botIcon?: string | null
  theme?: string | null
  textColor?: string | null
  help?: boolean
  realtimeMode:
    | {
        chatroom: string
        mode: boolean
      }
    | undefined
  helpdesk?: {
    id: string
    question: string
    answer: string
    domainId: string | null
  }[]
  setChat: React.Dispatch<
    React.SetStateAction<
      {
        role: 'user' | 'assistant'
        content: string
        link?: string | undefined
      }[]
    >
  >
}

export const BotWindow = forwardRef<HTMLDivElement, Props>(
  (
    {
      errors,
      register,
      chats,
      onChat,
      onClose,
      onResponding,
      domainName,
      botIcon,
      helpdesk = [],
      realtimeMode,
      setChat,
      textColor,
      theme,
      help,
    },
    ref
  ) => {
    const cleanDomain = domainName ? domainName.replace(/\.[^/.]+$/, '') : 'Assistant'

    return (
      <div className="h-[min(620px,calc(100vh-6rem))] w-[min(420px,calc(100vw-1.5rem))] flex flex-col bg-card rounded-3xl border border-border/80 overflow-hidden shadow-2xl transition-all animate-in fade-in zoom-in-95 duration-200">
        {/* ── Header Bar ── */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border/60 bg-card/95 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative">
              {botIcon ? (
                <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-primary/30">
                  <Image
                    src={`https://ucarecdn.com/${botIcon}/`}
                    alt="bot"
                    width={40}
                    height={40}
                    className="object-cover w-full h-full"
                  />
                </div>
              ) : (
                <Avatar className="w-10 h-10 ring-2 ring-primary/20">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    <Logo variant="mark" width={20} height={20} />
                  </AvatarFallback>
                </Avatar>
              )}
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-card" />
            </div>

            <div className="flex flex-col items-start">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-foreground leading-tight">
                  Domainly AI
                </h3>
                {realtimeMode?.mode && (
                  <RealTimeMode
                    setChats={setChat}
                    chatRoomId={realtimeMode.chatroom}
                  />
                )}
              </div>
              <p className="text-xs text-muted-foreground font-medium">{cleanDomain}</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full hover:bg-muted/80 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Close Chatbot"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* ── Body & Navigation Tabs ── */}
        <div className="flex-1 flex flex-col min-h-0 w-full overflow-hidden">
          <TabsMenu
            triggers={BOT_TABS_MENU}
            className="bg-muted/40 border-b border-border/40 px-3 py-1 text-xs"
          >
            {/* ── Chat Tab ── */}
            <TabsContent value="chat" className="flex-1 flex flex-col min-h-0 w-full overflow-hidden mt-0 data-[state=inactive]:hidden">
              <div
                style={{
                  background: theme || undefined,
                  color: textColor || undefined,
                }}
                className="px-4 py-4 flex-1 min-h-0 flex flex-col gap-3 chat-window overflow-y-auto scrollbar-thin scrollbar-thumb-muted-foreground/20"
                ref={ref}
              >
                {chats.map((chat, key) => (
                  <Bubble
                    key={key}
                    message={chat}
                  />
                ))}
                {onResponding && <Responding />}
              </div>

              {/* Input Form Bar */}
              <form
                onSubmit={onChat}
                className="p-3 bg-card border-t border-border/60 shrink-0 flex items-center gap-2"
              >
                <div className="flex-1 relative flex items-center bg-muted/50 border border-border/60 rounded-2xl px-3 py-1.5 focus-within:ring-1 focus-within:ring-primary transition-all">
                  <Input
                    {...register('content')}
                    placeholder="Type a message..."
                    className="focus-visible:ring-0 text-xs p-0 focus-visible:ring-offset-0 bg-transparent rounded-none outline-none border-none h-7 text-foreground placeholder:text-muted-foreground"
                  />

                  <Label
                    htmlFor="bot-image"
                    className="cursor-pointer text-muted-foreground hover:text-foreground p-1 transition-colors ml-1"
                  >
                    <Paperclip className="w-4 h-4" />
                    <Input
                      {...register('image')}
                      type="file"
                      id="bot-image"
                      className="hidden"
                    />
                  </Label>
                </div>

                <Button
                  type="submit"
                  size="icon"
                  className="w-9 h-9 rounded-2xl bg-primary text-primary-foreground hover:opacity-90 shrink-0 shadow-md shadow-primary/20 transition-all"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </TabsContent>

            {/* ── Helpdesk Tab ── */}
            <TabsContent value="helpdesk" className="flex-1 min-h-0 overflow-y-auto p-4 flex flex-col gap-4 mt-0 data-[state=inactive]:hidden">
              <div>
                <CardTitle className="text-base font-semibold">Help Desk</CardTitle>
                <CardDescription className="text-xs">
                  Browse answers to frequently asked questions.
                </CardDescription>
              </div>
              <Separator orientation="horizontal" />

              {helpdesk && helpdesk.length > 0 ? (
                helpdesk.map((desk) => (
                  <Accordion
                    key={desk.id}
                    trigger={desk.question}
                    content={desk.answer}
                  />
                ))
              ) : (
                <div className="py-8 text-center text-xs text-muted-foreground">
                  No helpdesk questions configured yet.
                </div>
              )}
            </TabsContent>
          </TabsMenu>
        </div>

        {/* ── Footer Branding ── */}
        <div className="flex justify-center py-2 bg-card border-t border-border/40 shrink-0">
          <p className="text-muted-foreground/60 text-[10px] tracking-wider font-medium">
            Powered by Domainly AI
          </p>
        </div>
      </div>
    )
  }
)

BotWindow.displayName = 'BotWindow'
