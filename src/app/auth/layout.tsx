import { currentUser } from '@clerk/nextjs'
import Image from 'next/image'
import Logo from '@/icons/logo'
import { redirect } from 'next/navigation'
import React from 'react'

type Props = {
  children: React.ReactNode
}

const Layout = async ({ children }: Props) => {
  const user = await currentUser()

  if (user) redirect('/dashboard')

  return (
    <div className="h-screen flex w-full bg-background">
      {/* Left: Auth Form */}
      <div className="w-full max-w-[520px] flex flex-col p-8 lg:p-12">
        {/* Logo */}
        <div className="mb-10">
          <Logo width={140} height={26} />
        </div>
        {children}
      </div>

      {/* Right: Brand Panel */}
      <div className="hidden lg:flex flex-1 bg-navy-800 flex-col justify-center px-16 relative overflow-hidden border-l border-border">
        {/* Background glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_50%,_hsl(14_78%_57%_/_0.12)_0%,_transparent_60%)]" />

        <div className="relative z-10 max-w-lg">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary text-xs font-medium px-3 py-1.5 rounded-full mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            AI-powered email marketing
          </div>

          <h2 className="text-4xl font-display font-bold text-foreground leading-tight mb-4">
            Your AI sales assistant,
            <span className="text-primary"> always on.</span>
          </h2>

          <p className="text-muted-foreground text-base leading-relaxed mb-10">
            Domainly AI captures leads, qualifies prospects, and books appointments —
            without a form, without friction, without you lifting a finger.
          </p>

          {/* Feature bullets */}
          <ul className="flex flex-col gap-4">
            {[
              'Embed on any website in under 2 minutes',
              'AI that qualifies leads and captures emails automatically',
              'Trigger email campaigns from real conversations',
              'Real-time takeover when you want to step in',
            ].map((feat) => (
              <li key={feat} className="flex items-center gap-3 text-sm text-muted-foreground">
                <span className="w-5 h-5 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center flex-shrink-0">
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 4L3.5 6.5L9 1" stroke="#E8643A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
                {feat}
              </li>
            ))}
          </ul>
        </div>

        {/* Decorative pulse line */}
        <div className="absolute bottom-12 right-12 opacity-10">
          <svg width="200" height="60" viewBox="0 0 200 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <polyline
              points="0,30 40,30 55,5 70,55 85,30 200,30"
              stroke="#E8643A"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </svg>
        </div>
      </div>
    </div>
  )
}

export default Layout

