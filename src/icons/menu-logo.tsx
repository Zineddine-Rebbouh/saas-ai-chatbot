import React from 'react'

type MenuLogoProps = {
  onClick(): void
}

export const MenuLogo = ({ onClick }: MenuLogoProps) => {
  return (
    <svg
      onClick={onClick}
      width="30"
      height="30"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Domainly AI"
      role="img"
      className="cursor-pointer"
    >
      <rect
        width="32"
        height="32"
        rx="8"
        className="fill-navy-800"
      />
      <polyline
        points="2,16 8,16 12,5 16,27 20,16 28,16"
        stroke="#E8643A"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <circle cx="29.5" cy="16" r="1.5" fill="#E8643A" opacity="0.6" />
    </svg>
  )
}

