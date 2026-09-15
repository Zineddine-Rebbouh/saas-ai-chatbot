import Section from '@/components/section-label'
import UploadButton from '@/components/upload-button'
import { BotIcon } from '@/icons/bot-icon'
import Image from 'next/image'
import React from 'react'
import { FieldErrors, FieldValues, UseFormRegister } from 'react-hook-form'

type Props = {
  register: UseFormRegister<FieldValues>
  errors: FieldErrors<FieldValues>
  chatBot: {
    id: string
    icon: string | null
    welcomeMessage: string | null
  } | null
}

const EditChatbotIcon = ({ register, errors, chatBot }: Props) => {
  return (
    <div className="flex flex-col gap-4">
      <Section
        label="Chatbot icon"
        message="Upload a custom avatar for your chatbot."
      />
      <div className="flex items-center gap-5">
        {/* Avatar preview */}
        <div className="relative shrink-0">
          {chatBot?.icon ? (
            <div className="w-20 h-20 rounded-2xl overflow-hidden ring-2 ring-primary/20 shadow-lg shadow-primary/10">
              <Image
                src={`https://ucarecdn.com/${chatBot.icon}/`}
                alt="bot"
                width={80}
                height={80}
                className="object-cover w-full h-full"
              />
            </div>
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/10 to-violet-500/10 border border-primary/20 flex items-center justify-center shadow-inner">
              <BotIcon />
            </div>
          )}
          <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-primary rounded-full border-2 border-card flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-2.5 h-2.5 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </span>
        </div>

        {/* Upload control */}
        <div className="flex flex-col gap-1.5">
          <UploadButton label="Upload new icon" register={register} errors={errors} />
          <p className="text-xs text-muted-foreground">PNG, JPG or GIF · Max 2 MB</p>
        </div>
      </div>
    </div>
  )
}

export default EditChatbotIcon
