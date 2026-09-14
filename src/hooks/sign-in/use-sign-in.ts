import { useToast } from '@/components/ui/use-toast'
import { UserLoginProps, UserLoginSchema } from '@/schemas/auth.schema'
import { useSignIn } from '@clerk/nextjs'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

export const useSignInForm = () => {
  const { isLoaded, setActive, signIn } = useSignIn()
  const [loading, setLoading] = useState<boolean>(false)
  const router = useRouter()
  const { toast } = useToast()
  const methods = useForm<UserLoginProps>({
    resolver: zodResolver(UserLoginSchema),
    mode: 'onChange',
  })
  const onHandleSubmit = methods.handleSubmit(
    async (values: UserLoginProps) => {
      if (!isLoaded || loading) return

      try {
        setLoading(true)
        const authenticated = await signIn.create({
          identifier: values.email,
          password: values.password,
        })

        if (authenticated.status === 'complete') {
          await setActive({ session: authenticated.createdSessionId })
          toast({
            title: 'Success',
            description: 'Welcome back!',
          })
          router.push('/dashboard')
        } else {
          toast({
            title: 'Error',
            description:
              'Additional verification is required — please complete the sign-in flow.',
          })
        }
      } catch (error: any) {
        toast({
          title: 'Error',
          description:
            error?.errors?.[0]?.code === 'form_password_incorrect'
              ? 'email/password is incorrect try again'
              : error?.errors?.[0]?.longMessage ??
                'Something went wrong — please try again.',
        })
      } finally {
        setLoading(false)
      }
    }
  )

  return {
    methods,
    onHandleSubmit,
    loading,
  }
}
