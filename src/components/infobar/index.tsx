import React from 'react'
import BreadCrumb from './bread-crumb'
import { UserButton } from '@clerk/nextjs'
import { Headphones } from 'lucide-react'
import { Avatar, AvatarFallback } from '../ui/avatar'

type Props = {}

const InfoBar = (props: Props) => {
  return (
    <div className="flex w-full justify-between items-center py-1 mb-8">
      <BreadCrumb />
      <div className="flex gap-3 items-center">
        <Avatar className="w-9 h-9 border-0">
          <AvatarFallback className="bg-[#F5A623] text-white">
            <Headphones size={18} />
          </AvatarFallback>
        </Avatar>
        <UserButton afterSignOutUrl="/" />
      </div>
    </div>
  )
}

export default InfoBar
