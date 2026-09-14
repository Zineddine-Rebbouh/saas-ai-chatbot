'use client'
import { useChatTime } from '@/hooks/conversation/use-conversation'
import React from 'react'
import { Card, CardContent, CardDescription } from '../ui/card'
import { Avatar, AvatarFallback } from '../ui/avatar'
import { User } from 'lucide-react'
import { UrgentIcon } from '@/icons/urgent-icon'

type Props = {
  title: string
  description?: string
  createdAt: Date
  id: string
  onChat(): void
  seen?: boolean
}

const ChatCard = ({
  title,
  description,
  createdAt,
  onChat,
  id,
  seen,
}: Props) => {
  const { messageSentAt, urgent } = useChatTime(createdAt, id)

  return (
    <Card
      onClick={onChat}
      className="rounded-xl border border-border/40 bg-card hover:bg-secondary cursor-pointer transition duration-150 ease-in-out my-1 mx-2"
    >
      <CardContent className="py-3 px-4 flex gap-3">
        <div>
          <Avatar className="w-10 h-10 border border-border/50">
            <AvatarFallback className="bg-secondary text-muted-foreground">
              <User size={18} />
            </AvatarFallback>
          </Avatar>
        </div>
        <div className="flex justify-between w-full min-w-0">
          <div className="flex flex-col gap-1 min-w-0">
            <div className="flex gap-2 items-center">
              <span className="font-semibold text-sm leading-none text-foreground truncate max-w-[140px]">
                {title}
              </span>
              {urgent && !seen && <UrgentIcon />}
            </div>
            <CardDescription className="text-xs text-muted-foreground truncate max-w-[180px]">
              {description
                ? description.substring(0, 30) + '...'
                : 'No messages yet'}
            </CardDescription>
          </div>
          <div className="flex flex-col items-end justify-between flex-shrink-0">
            <span className="text-[10px] text-muted-foreground font-mono">
              {createdAt ? messageSentAt : ''}
            </span>
            {!seen && (
              <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default ChatCard
