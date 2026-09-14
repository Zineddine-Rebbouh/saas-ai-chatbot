import React from 'react'
import { FieldErrors, FieldValues, UseFormRegister } from 'react-hook-form'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { Edit } from 'lucide-react'
import { ErrorMessage } from '@hookform/error-message'

type Props = {
  register: UseFormRegister<any>
  errors: FieldErrors<FieldValues>
  label: string
}

const UploadButton = ({ errors, label, register }: Props) => {
  return (
    <>
      <div className="flex gap-2 items-center">
        <Label
          htmlFor="upload-button"
          className="flex gap-2 p-3 rounded-lg bg-secondary border border-border text-foreground cursor-pointer font-semibold text-sm items-center hover:border-primary/50 transition-colors"
        >
          <Input
            {...register('image')}
            className="hidden"
            type="file"
            id="upload-button"
          />
          <Edit />
          {label}
        </Label>
        <p className="text-sm text-muted-foreground ml-6">
          Recommended size 300×300px, max 2MB
        </p>
      </div>
      <ErrorMessage
        errors={errors}
        name="image"
        render={({ message }) => (
          <p className="text-destructive mt-2">
            {message === 'Required' ? '' : message}
          </p>
        )}
      />
    </>
  )
}

export default UploadButton
