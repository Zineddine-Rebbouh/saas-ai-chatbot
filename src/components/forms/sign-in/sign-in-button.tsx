'use client'
import { Loader } from '@/components/loader'
import { Button } from '@/components/ui/button'
import { useSignInForm } from '@/hooks/sign-in/use-sign-in'
import React from 'react'

const SignInButton = () => {
  const { loading } = useSignInForm()
  return (
    <Button type="submit" className="w-full" disabled={loading}>
      <Loader loading={loading}>Sign in</Loader>
    </Button>
  )
}

export default SignInButton