import { GROUPED_SIDE_BAR_MENU } from '@/constants/menu'
import React from 'react'
import { LogOut } from 'lucide-react'
import { MenuLogo } from '@/icons/menu-logo'
import MenuItem from './menu-item'
import DomainMenu from './domain-menu'

type MinMenuProps = {
  onShrink(): void
  current: string
  onSignOut(): void
  domains:
    | {
        id: string
        name: string
        icon: string | null
      }[]
    | null
    | undefined
}

export const MinMenu = ({
  onShrink,
  current,
  onSignOut,
  domains,
}: MinMenuProps) => {
  return (
    <div className="py-4 px-2 flex flex-col items-center h-full select-none">
      <span
        role="button"
        tabIndex={0}
        title="Expand sidebar"
        aria-label="Expand sidebar"
        onClick={onShrink}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') onShrink()
        }}
        className="cursor-pointer rounded-lg p-1.5 hover:bg-secondary transition-colors focus-visible:outline-none"
      >
        <MenuLogo onClick={onShrink} />
      </span>

      <div className="flex-1 overflow-y-auto overflow-x-hidden chat-window w-full flex flex-col items-center mt-6 space-y-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {GROUPED_SIDE_BAR_MENU.map((group, idx) => (
          <div key={group.group} className="w-full flex flex-col items-center">
            {idx > 0 && <div className="w-6 h-px bg-border/60 my-1" />}
            {group.items.map((menu, key) => (
              <MenuItem
                size="min"
                {...menu}
                key={key}
                current={current}
              />
            ))}
          </div>
        ))}
        <DomainMenu
          min
          domains={domains}
        />
      </div>

      <div className="pt-3 border-t border-border w-full flex justify-center mt-auto">
        <MenuItem
          size="min"
          label="Sign out"
          icon={<LogOut size={16} />}
          onSignOut={onSignOut}
        />
      </div>
    </div>
  )
}
