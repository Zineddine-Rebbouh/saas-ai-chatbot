import { SIDE_BAR_MENU } from '@/constants/menu'
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
    <div className="py-3 px-4 flex flex-col h-full">
      <div className="flex justify-between items-center">
        <Logo
          width={110}
          height={22}
          className="animate-fade-in opacity-0 delay-300 fill-mode-forwards"
        />
        <Menu
          className="cursor-pointer animate-fade-in opacity-0 delay-300 fill-mode-forwards"
          onClick={onExpand}
        />
      </div>
      <div className="animate-fade-in opacity-0 delay-300 fill-mode-forwards flex flex-col justify-between h-full pt-10">
        <div className="flex flex-col">
          <p className="text-xs text-muted-foreground/60 mb-3 uppercase tracking-wider font-semibold">Menu</p>
          {SIDE_BAR_MENU.map((menu, key) => (
            <MenuItem
              size="max"
              {...menu}
              key={key}
              current={current}
            />
          ))}
          <DomainMenu domains={domains} />
        </div>
        <div className="flex flex-col">
          <p className="text-xs text-muted-foreground/60 mb-3 uppercase tracking-wider font-semibold">Options</p>
          <MenuItem
            size="max"
            label="Sign out"
            icon={<LogOut />}
            onSignOut={onSignOut}
          />
        </div>
      </div>
    </div>
  )
}

export default MaxMenu
