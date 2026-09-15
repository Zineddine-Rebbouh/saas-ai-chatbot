'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { UserButton } from '@clerk/nextjs'
import {
  Bell,
  ChevronDown,
  Globe,
  Headphones,
  Sparkles,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'

export type DomainItem = {
  id: string
  name: string
  icon?: string | null
}

type Props = {
  title: string
  description?: string
  icon?: React.ReactNode
  domains?: DomainItem[]
  selectedDomain?: string | null
  onSelectDomain?: (domainId: string | null) => void
  actions?: React.ReactNode
  showDomainSelector?: boolean
  showNotification?: boolean
  className?: string
}

export const PageHeader = ({
  title,
  description,
  icon,
  domains = [],
  selectedDomain,
  onSelectDomain,
  actions,
  showDomainSelector = false,
  showNotification = true,
  className,
}: Props) => {
  const activeDomain = domains.find((d) => d.id === selectedDomain)

  return (
    <header
      className={cn(
        'w-full flex flex-col md:flex-row md:items-center md:justify-between gap-4 py-4 mb-6 border-b border-border/60 pb-5',
        className
      )}
    >
      {/* Left: Icon & Title & Description */}
      <div className="flex items-start gap-3.5 min-w-0">
        {icon && (
          <div className="w-10 h-10 rounded-xl bg-secondary/80 border border-border/80 flex items-center justify-center text-foreground shrink-0 mt-0.5 shadow-sm">
            {icon}
          </div>
        )}
        <div className="flex flex-col min-w-0">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground truncate">
            {title}
          </h1>
          {description && (
            <p className="text-sm text-muted-foreground mt-0.5 font-normal line-clamp-1">
              {description}
            </p>
          )}
        </div>
      </div>

      {/* Right: Domain Selector, Custom Actions & Account Info */}
      <div className="flex items-center flex-wrap gap-2.5 sm:gap-3 shrink-0">
        {showDomainSelector && domains && domains.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-9 gap-2 px-3 font-medium bg-background border-border/80 text-foreground hover:bg-secondary/60 text-xs shadow-xs"
              >
                <Globe size={14} className="text-muted-foreground" />
                <span className="max-w-[120px] truncate">
                  {activeDomain ? activeDomain.name : 'All Domains'}
                </span>
                <ChevronDown size={13} className="text-muted-foreground ml-0.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem
                onClick={() => onSelectDomain?.(null)}
                className="text-xs cursor-pointer"
              >
                All Domains
              </DropdownMenuItem>
              {domains.map((d) => (
                <DropdownMenuItem
                  key={d.id}
                  onClick={() => onSelectDomain?.(d.id)}
                  className="text-xs cursor-pointer truncate"
                >
                  {d.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* Custom Actions (e.g. [+ New appointment], [+ Create campaign], [View report]) */}
        {actions}

        {/* Support & Notification */}
        {showNotification && (
          <button
            type="button"
            title="Notifications"
            aria-label="Notifications"
            className="w-9 h-9 rounded-lg border border-border/70 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors shadow-xs"
          >
            <Bell size={16} />
          </button>
        )}

        {/* User profile */}
        <div className="pl-1 border-l border-border/60 ml-0.5 flex items-center">
          <UserButton afterSignOutUrl="/" />
        </div>
      </div>
    </header>
  )
}

export default PageHeader
