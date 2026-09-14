import React from 'react'

type Props = {
  title: string
  value: number
  icon: JSX.Element
  sales?: boolean
}

const DashboardCard = ({ icon, title, value, sales }: Props) => {
  return (
    <div className="rounded-2xl flex flex-col gap-4 p-6 md:p-8 border border-border/60 bg-card hover:border-primary/30 transition-all duration-200 md:w-[260px] w-full shadow-sm hover:shadow-md group">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-105 transition-transform duration-200">
          {icon}
        </div>
        <h3 className="font-semibold text-sm text-muted-foreground">{title}</h3>
      </div>
      <p className="font-display font-bold text-3xl text-foreground mt-2">
        {sales && '$'}
        {value.toLocaleString()}
      </p>
    </div>
  )
}

export default DashboardCard
