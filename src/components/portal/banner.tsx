import Image from 'next/image'
import React from 'react'

export const PortalBanner = () => {
  return (
    <div className="w-full bg-muted flex justify-center py-5">
      <Image
        src="/logo.png"
        alt="Domainly AI"
        width={64}
        height={64}
        className="h-16 w-16 object-contain"
        priority
      />
    </div>
  )
}
