import React from 'react'

type SectionProps = {
  label: string
  message: string
}

const Section = ({ label, message }: SectionProps) => {
  return (
    <div className="flex flex-col gap-0.5 pl-3 border-l-2 border-primary/60">
      <p className="text-sm font-semibold text-foreground tracking-tight">{label}</p>
      <p className="text-xs text-muted-foreground leading-relaxed">{message}</p>
    </div>
  )
}

export default Section
