'use client'
import { cn } from '@/lib/utils'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import React from 'react'

type Props = {
  size: 'max' | 'min'
  label: string
  icon: JSX.Element
  path?: string
  current?: string
  onSignOut?(): void
}

const MenuItem = ({ size, path, icon, label, current, onSignOut }: Props) => {
  const pathname = usePathname()
  // Highlights top-level routes (/dashboard) and nested ones (/settings/mydomain)
  const isActive = path
    ? pathname === `/${path}` || pathname.startsWith(`/${path}/`)
    : false

  switch (size) {
    case 'max':
      return (
        <Link
          onClick={onSignOut}
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-xl my-1 text-sm font-medium transition-all duration-150',
            isActive
              ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20 font-semibold'
              : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
          )}
          href={path ? `/${path}` : '#'}
          aria-label={label}
        >
          <span className={cn('transition-colors', isActive ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-foreground')}>{icon}</span>
          {label}
        </Link>
      )
    case 'min':
      return (
        <Link
          onClick={onSignOut}
          className={cn(
            'flex items-center justify-center rounded-xl p-2.5 my-1 transition-all duration-150',
            isActive
              ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
              : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
          )}
          href={path ? `/${path}` : '#'}
          title={label}
          aria-label={label}
        >
          <span className={cn('transition-colors', isActive ? 'text-primary-foreground' : 'text-muted-foreground')}>{icon}</span>
        </Link>
      )
    default:
      return null
  }
}

export default MenuItem
