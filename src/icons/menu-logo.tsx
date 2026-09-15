import React from 'react'
import { Logo } from './logo'

type MenuLogoProps = {
  onClick(): void
}

export const MenuLogo = ({ onClick }: MenuLogoProps) => {
  return (
    <Logo
      variant="mark"
      width={30}
      height={30}
      onClick={onClick}
      className="cursor-pointer"
    />
  )
}
