import Image from 'next/image'
import React from 'react'

export const PortalBanner = () => {
  return (
    <div className="w-full bg-muted flex justify-center py-5">
      <Image
        src="/images/logo.png"
        alt="Domainly AI"
        width={100}
        height={40}
        className="h-auto w-[100px]"
        priority
      />
    </div>
  )
}
