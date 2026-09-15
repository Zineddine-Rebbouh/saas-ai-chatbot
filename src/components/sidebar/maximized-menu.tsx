import { GROUPED_SIDE_BAR_MENU } from '@/constants/menu'
import { LogOut, Menu } from 'lucide-react'
import Image from 'next/image'
import React from 'react'
import DomainMenu from './domain-menu'
import MenuItem from './menu-item'
import Logo from '@/icons/logo'

type Props = {
  onExpand(): void
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

const MaxMenu = ({ current, domains, onExpand, onSignOut }: Props) => {
  return (
    <div className="py-4 px-3 flex flex-col h-full select-none">
      <div className="flex justify-between items-center px-1">
        <Logo
          width={110}
          height={22}
          className="animate-fade-in opacity-0 delay-150 fill-mode-forwards"
        />
        <button
          onClick={onExpand}
          title="Collapse sidebar"
          aria-label="Collapse sidebar"
          className="cursor-pointer text-muted-foreground hover:text-foreground rounded-lg p-1.5 hover:bg-secondary transition-colors"
        >
          <Menu size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto mt-6 pr-1 space-y-5">
        {GROUPED_SIDE_BAR_MENU.map((group) => (
          <div key={group.group} className="flex flex-col">
            <p className="text-[10px] tracking-wider text-muted-foreground/60 px-3 mb-1 uppercase font-semibold">
              {group.group}
            </p>
            {group.items.map((menu, key) => (
              <MenuItem
                size="max"
                {...menu}
                key={key}
                current={current}
              />
            ))}
          </div>
        ))}
        <DomainMenu domains={domains} />
      </div>

      <div className="pt-3 border-t border-border mt-auto">
        <MenuItem
          size="max"
          label="Sign out"
          icon={<LogOut size={16} />}
          onSignOut={onSignOut}
        />
      </div>
    </div>
  )
}

export default MaxMenu

