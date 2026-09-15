import Section from '@/components/section-label'
import React from 'react'
import { FieldErrors, FieldValues, UseFormRegister } from 'react-hook-form'
import FormGenerator from '../form-generator'

type GreetingMessageProps = {
  message: string
  register: UseFormRegister<FieldValues>
  errors: FieldErrors<FieldValues>
}

const GreetingsMessage = ({
  message,
  register,
  errors,
}: GreetingMessageProps) => {
  return (
    <div className="flex flex-col gap-3">
      <Section
        label="Greeting message"
        message="Customize the first message your customers see when opening the chat."
      />
      <div className="w-full">
        <FormGenerator
          placeholder={message}
          inputType="textarea"
          lines={3}
          register={register}
          errors={errors}
          name="welcomeMessage"
          type="text"
        />
      </div>
    </div>
  )
}

export default GreetingsMessage
