import React from 'react'
import { cn, extractUUIDFromString, getMonthName } from '@/lib/utils'
import { Avatar, AvatarFallback } from '../ui/avatar'
import { User } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

type Props = {
  message: {
    role: 'assistant' | 'user'
    content: string
    link?: string
  }
  createdAt?: Date
}

const Bubble = ({ message, createdAt }: Props) => {
  let d = new Date()
  const image = extractUUIDFromString(message.content)

  return (
    <div
      className={cn(
        'flex gap-2 items-end',
        message.role == 'assistant' ? 'self-start' : 'self-end flex-row-reverse'
      )}
    >
      {message.role == 'assistant' ? (
        <Avatar className="w-5 h-5">
          <AvatarFallback className="bg-primary/10">
            <svg width="10" height="10" viewBox="0 0 32 32" fill="none" aria-hidden="true">
              <polyline
                points="2,16 8,16 12,5 16,27 20,16 28,16"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </svg>
          </AvatarFallback>
        </Avatar>
      ) : (
        <Avatar className="w-5 h-5">
          <AvatarFallback>
            <User />
          </AvatarFallback>
        </Avatar>
      )}
      <div
        className={cn(
          'chat-bubble text-sm md:text-[14px] flex flex-col gap-1.5 shadow-sm max-w-[80%]',
          message.role === 'assistant'
            ? 'chat-bubble-assistant border border-border bg-card text-foreground rounded-tl-none rounded-br-2xl rounded-tr-2xl rounded-bl-2xl'
            : 'chat-bubble-user bg-primary text-primary-foreground rounded-tr-none rounded-bl-2xl rounded-tl-2xl rounded-br-2xl'
        )}
      >
        {image ? (
          <div className="relative aspect-square w-64 rounded-lg overflow-hidden border border-border/30">
            <Image
              src={`https://ucarecdn.com/${image[0]}/`}
              fill
              className="object-cover"
              alt="Uploaded context"
            />
          </div>
        ) : (
          <div className="leading-relaxed break-words font-medium">
            {message.content.replace('(complete)', ' ')}
            {message.link && (
              <Link
                className={cn(
                  'underline font-bold pl-2 hover:opacity-85 transition-opacity',
                  message.role === 'assistant' ? 'text-primary' : 'text-white'
                )}
                href={message.link}
                target="_blank"
              >
                Link
              </Link>
            )}
          </div>
        )}
        
        {/* Timestamp */}
        <span className={cn(
          'text-[10px] self-end mt-1 block font-mono opacity-60',
          message.role === 'assistant' ? 'text-muted-foreground' : 'text-primary-foreground/80'
        )}>
          {createdAt ? (
            `${createdAt.getHours()}:${String(createdAt.getMinutes()).padStart(2, '0')} ${createdAt.getHours() >= 12 ? 'PM' : 'AM'}`
          ) : (
            `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')} ${d.getHours() >= 12 ? 'PM' : 'AM'}`
          )}
        </span>
      </div>
    </div>
  )
}

export default Bubble
