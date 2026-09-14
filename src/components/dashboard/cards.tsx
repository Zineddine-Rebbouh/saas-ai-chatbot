import React from 'react'

type Props = {
  title: string
  value?: number
  icon: JSX.Element
  sales?: boolean
  children?: React.ReactNode
}

const DashboardCard = ({ icon, title, value, sales, children }: Props) => {
  return (
    <div className="rounded-2xl flex flex-col gap-3 p-6 bg-[#F4F4F3] dark:bg-card border border-transparent dark:border-border/60 min-w-0 flex-1">
      <div className="flex items-center gap-2 text-[#55534F] dark:text-muted-foreground">
        <span className="[&>svg]:w-5 [&>svg]:h-5">{icon}</span>
        <h3 className="font-semibold text-[15px] text-[#55534F] dark:text-muted-foreground truncate">
          {title}
        </h3>
      </div>
      {children ? (
        children
      ) : (
        <p className="font-display font-bold text-[2rem] leading-none tracking-tight text-[#2B2A28] dark:text-foreground">
          {sales && '$'}
          {(value ?? 0).toLocaleString()}
        </p>
      )}
    </div>
  )
}

export default DashboardCard
