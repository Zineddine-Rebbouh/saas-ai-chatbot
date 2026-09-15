import React from 'react'
import { FieldErrors, FieldValues, UseFormRegister } from 'react-hook-form'
import FormGenerator from '../form-generator'
import { Globe } from 'lucide-react'

type DomainUpdateProps = {
  name: string
  register: UseFormRegister<FieldValues>
  errors: FieldErrors<FieldValues>
}

export const DomainUpdate = ({ name, register, errors }: DomainUpdateProps) => {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
        <Globe size={13} className="text-primary/70" />
        <span>Domain name</span>
      </div>
      <div className="w-full max-w-md">
        <FormGenerator
          label=""
          register={register}
          name="domain"
          errors={errors}
          type="text"
          inputType="input"
          placeholder={name}
        />
      </div>
    </div>
  )
}
