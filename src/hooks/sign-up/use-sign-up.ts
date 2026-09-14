'use client'
import { useToast } from '@/components/ui/use-toast'
import {
  UserRegistrationProps,
  UserRegistrationSchema,
} from '@/schemas/auth.schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { useSignUp } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { onCompleteUserRegistration } from '@/actions/auth'

export const useSignUpForm = () => {
  const { toast } = useToast()
  const [loading, setLoading] = useState<boolean>(false)
  const { signUp, isLoaded, setActive } = useSignUp()
  const router = useRouter()
  const methods = useForm<UserRegistrationProps>({
    resolver: zodResolver(UserRegistrationSchema),
    defaultValues: {
      type: 'owner',
    },
    mode: 'onChange',
  })

  const onGenerateOTP = async (
    email: string,
    password: string,
    onNext: React.Dispatch<React.SetStateAction<number>>
  ) => {
    if (!isLoaded || loading) return

    try {
      setLoading(true)
      await signUp.create({
        emailAddress: email,
        password: password,
      })

      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' })

      onNext((prev) => prev + 1)
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.errors?.[0]?.longMessage ?? 'Something went wrong!',
      })
    } finally {
      setLoading(false)
    }
  }

  const onHandleSubmit = methods.handleSubmit(
    async (values: UserRegistrationProps) => {
      if (!isLoaded || loading) return

      try {
        setLoading(true)
        const completeSignUp = await signUp.attemptEmailAddressVerification({
          code: values.otp,
        })

        if (completeSignUp.status !== 'complete') {
          toast({
            title: 'Error',
            description: 'Verification failed — please try again.',
          })
          return
        }

        if (!signUp.createdUserId) {
          toast({
            title: 'Error',
            description: 'Something went wrong!',
          })
          return
        }

        const registered = await onCompleteUserRegistration(
          values.fullname,
          signUp.createdUserId,
          values.type
        )

        if (registered?.status == 200 && registered.user) {
          await setActive({
            session: completeSignUp.createdSessionId,
          })
          router.push('/dashboard')
        } else if (registered?.status == 400) {
          toast({
            title: 'Error',
            description: 'Something went wrong!',
          })
        } else {
          toast({
            title: 'Error',
            description: 'Account could not be created — please try again.',
          })
        }
      } catch (error: any) {
        toast({
          title: 'Error',
          description: error?.errors?.[0]?.longMessage ?? 'Something went wrong!',
        })
      } finally {
        setLoading(false)
      }
    }
  )
  return {
    methods,
    onHandleSubmit,
    onGenerateOTP,
    loading,
  }
}
