import React from 'react'
import BreadCrumb from './bread-crumb'
import { Card } from '../ui/card'
import { UserButton } from '@clerk/nextjs'
import { Headphones, Star, Trash } from 'lucide-react'
import { Avatar, AvatarFallback } from '../ui/avatar'

type Props = {}

const InfoBar = (props: Props) => {
  return (
    <div className="flex w-full justify-between items-center py-1 mb-8">
      <BreadCrumb />
      <div className="flex gap-3 items-center">
        <Card className="rounded-xl flex gap-3 py-3 px-4 border-border bg-card">
          <button className="text-muted-foreground hover:text-primary transition-colors" title="Trash" aria-label="Delete selected">
            <Trash size={18} />
          </button>
          <button className="text-muted-foreground hover:text-amber-400 transition-colors" title="Star" aria-label="Star selected">
            <Star size={18} />
          </button>
        </Card>
        <Avatar className="w-9 h-9 border border-border">
          <AvatarFallback className="bg-primary/10 text-primary">
            <Headphones size={16} />
          </AvatarFallback>
        </Avatar>
        <UserButton afterSignOutUrl="/" />
      </div>
    </div>
  )
}

export default InfoBar
