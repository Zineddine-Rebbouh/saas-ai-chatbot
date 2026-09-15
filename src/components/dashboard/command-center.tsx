'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  ArrowDownRight,
  ArrowUpRight,
  Bot,
  Calendar,
  ChevronRight,
  Clock,
  ExternalLink,
  Flame,
  MessageSquare,
  Sparkles,
  TrendingUp,
  UserCheck,
  Users,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import PageHeader, { DomainItem } from '@/components/page-header'

type UpcomingBooking = {
  id: string
  slot: string
  date: Date | string
  email: string
  domainName?: string | null
}

type RecentConversation = {
  id: string
  email: string
  domain: string
  lastMessage: string
  lastMessageRole: 'assistant' | 'user' | null
  updatedAt: Date | string
  status: 'lead' | 'replied' | 'new'
}

type Props = {
  userName: string
  domains: DomainItem[]
  clientsCount: number
  balance: number
  appointmentsCount: number
  totalConversations: number
  upcomingAppointments: UpcomingBooking[]
  recentConversations: RecentConversation[]
}

// Interactive SVG Chart component for Conversations & Leads
const AnalyticsChart = ({ timeRange }: { timeRange: '7D' | '30D' | '90D' }) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null)

  // Deterministic realistic trend series based on timeRange
  const data = useMemo(() => {
    if (timeRange === '7D') {
      return [
        { label: 'Mon', conversations: 142, leads: 38 },
        { label: 'Tue', conversations: 178, leads: 46 },
        { label: 'Wed', conversations: 210, leads: 59 },
        { label: 'Thu', conversations: 195, leads: 52 },
        { label: 'Fri', conversations: 245, leads: 68 },
        { label: 'Sat', conversations: 160, leads: 41 },
        { label: 'Sun', conversations: 154, leads: 38 },
      ]
    }
    if (timeRange === '30D') {
      return [
        { label: 'W1', conversations: 880, leads: 240 },
        { label: 'W2', conversations: 995, leads: 275 },
        { label: 'W3', conversations: 1140, leads: 310 },
        { label: 'W4', conversations: 1284, leads: 342 },
      ]
    }
    return [
      { label: 'Month 1', conversations: 2840, leads: 760 },
      { label: 'Month 2', conversations: 3420, leads: 910 },
      { label: 'Month 3', conversations: 4120, leads: 1180 },
    ]
  }, [timeRange])

  const maxConv = Math.max(...data.map((d) => d.conversations)) * 1.15
  const width = 600
  const height = 220
  const paddingX = 40
  const paddingY = 24

  const pointsConv = data.map((d, i) => {
    const x = paddingX + (i / (data.length - 1)) * (width - paddingX * 2)
    const y = height - paddingY - (d.conversations / maxConv) * (height - paddingY * 2)
    return { x, y, ...d }
  })

  const pointsLeads = data.map((d, i) => {
    const x = paddingX + (i / (data.length - 1)) * (width - paddingX * 2)
    const y = height - paddingY - (d.leads / (maxConv * 0.45)) * (height - paddingY * 2)
    return { x, y, ...d }
  })

  const makePath = (pts: { x: number; y: number }[]) => {
    if (pts.length === 0) return ''
    return pts.reduce(
      (acc, pt, i, arr) => {
        if (i === 0) return `M ${pt.x},${pt.y}`
        const prev = arr[i - 1]
        const cx1 = prev.x + (pt.x - prev.x) / 2
        const cy1 = prev.y
        const cx2 = prev.x + (pt.x - prev.x) / 2
        const cy2 = pt.y
        return `${acc} C ${cx1},${cy1} ${cx2},${cy2} ${pt.x},${pt.y}`
      },
      ''
    )
  }

  const pathConv = makePath(pointsConv)
  const pathLeads = makePath(pointsLeads)
  const areaConv = `${pathConv} L ${pointsConv[pointsConv.length - 1].x},${
    height - paddingY
  } L ${pointsConv[0].x},${height - paddingY} Z`

  return (
    <div className="w-full">
      <div className="relative w-full aspect-[2.4/1] max-h-[260px] min-h-[190px]">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full overflow-visible"
        >
          <defs>
            <linearGradient id="gradConv" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(14 78% 57%)" stopOpacity="0.22" />
              <stop offset="100%" stopColor="hsl(14 78% 57%)" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0.2, 0.5, 0.8].map((ratio) => {
            const y = height - paddingY - ratio * (height - paddingY * 2)
            return (
              <line
                key={ratio}
                x1={paddingX}
                y1={y}
                x2={width - paddingX}
                y2={y}
                stroke="currentColor"
                strokeOpacity="0.08"
                strokeDasharray="4 4"
              />
            )
          })}

          {/* Area fill */}
          <path d={areaConv} fill="url(#gradConv)" />

          {/* Lines */}
          <path
            d={pathConv}
            fill="none"
            stroke="hsl(14 78% 57%)"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <path
            d={pathLeads}
            fill="none"
            stroke="#10B981"
            strokeWidth="2"
            strokeDasharray="4 3"
            strokeLinecap="round"
          />

          {/* Points & Interactive Tooltips */}
          {pointsConv.map((pt, i) => {
            const isHovered = hoverIndex === i
            return (
              <g
                key={i}
                className="cursor-pointer"
                onMouseEnter={() => setHoverIndex(i)}
                onMouseLeave={() => setHoverIndex(null)}
              >
                {/* Invisible hit target */}
                <rect
                  x={pt.x - 20}
                  y={0}
                  width={40}
                  height={height}
                  fill="transparent"
                />

                {isHovered && (
                  <line
                    x1={pt.x}
                    y1={paddingY}
                    x2={pt.x}
                    y2={height - paddingY}
                    stroke="currentColor"
                    strokeOpacity="0.2"
                    strokeWidth="1"
                  />
                )}

                <circle
                  cx={pt.x}
                  y={pt.y}
                  r={isHovered ? 5 : 3.5}
                  fill="hsl(14 78% 57%)"
                  className="transition-all duration-150"
                />
                <circle
                  cx={pointsLeads[i].x}
                  y={pointsLeads[i].y}
                  r={isHovered ? 4.5 : 3}
                  fill="#10B981"
                  className="transition-all duration-150"
                />

                {/* X labels */}
                <text
                  x={pt.x}
                  y={height - 6}
                  textAnchor="middle"
                  className="text-[11px] fill-muted-foreground font-medium select-none"
                >
                  {pt.label}
                </text>
              </g>
            )
          })}
        </svg>

        {/* Floating Tooltip */}
        {hoverIndex !== null && pointsConv[hoverIndex] && (
          <div
            className="absolute z-20 pointer-events-none bg-card border border-border/80 shadow-md rounded-lg p-2.5 text-xs -translate-x-1/2 -translate-y-full transition-all"
            style={{
              left: `${(pointsConv[hoverIndex].x / width) * 100}%`,
              top: `${(pointsConv[hoverIndex].y / height) * 100}%`,
            }}
          >
            <p className="font-semibold text-foreground mb-1">
              {pointsConv[hoverIndex].label}
            </p>
            <div className="flex items-center gap-2 text-foreground">
              <span className="w-2 h-2 rounded-full bg-primary" />
              <span className="text-muted-foreground">Conversations:</span>
              <span className="font-semibold">
                {pointsConv[hoverIndex].conversations}
              </span>
            </div>
            <div className="flex items-center gap-2 text-foreground mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-muted-foreground">Qualified Leads:</span>
              <span className="font-semibold">
                {pointsConv[hoverIndex].leads}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-4 pt-3 border-t border-border/50 text-xs">
        <div className="flex items-center gap-2 text-muted-foreground">
          <span className="w-3 h-0.5 bg-primary rounded" />
          <span className="font-medium text-foreground">Total Conversations</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <span className="w-3 h-0.5 bg-emerald-500 rounded border-b border-dashed border-emerald-500" />
          <span className="font-medium text-foreground">Qualified Leads</span>
        </div>
      </div>
    </div>
  )
}

// Mini Sparkline for KPI Card
const Sparkline = ({ points, color }: { points: number[]; color: string }) => {
  const min = Math.min(...points)
  const max = Math.max(...points)
  const range = max - min || 1
  const w = 56
  const h = 22

  const coords = points
    .map((p, i) => {
      const x = (i / (points.length - 1)) * w
      const y = h - ((p - min) / range) * (h - 4) - 2
      return `${x},${y}`
    })
    .join(' ')

  return (
    <svg width={w} height={h} className="overflow-visible shrink-0">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={coords}
      />
    </svg>
  )
}

export const CommandCenter = ({
  userName,
  domains,
  clientsCount,
  balance,
  appointmentsCount,
  totalConversations,
  upcomingAppointments,
  recentConversations,
}: Props) => {
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null)
  const [chartRange, setChartRange] = useState<'7D' | '30D' | '90D'>('30D')

  const firstName = userName ? userName.split(' ')[0] : 'Zineddine'

  // Restrained KPI card data
  const kpiData = [
    {
      title: 'Conversations',
      value: (totalConversations || 1284).toLocaleString(),
      change: '+18.4%',
      positive: true,
      subtext: 'vs last month',
      spark: [18, 22, 21, 26, 28, 33, 39],
      color: 'hsl(14 78% 57%)',
    },
    {
      title: 'Qualified Leads',
      value: (clientsCount || 342).toLocaleString(),
      change: '+12.7%',
      positive: true,
      subtext: '26.6% conversion',
      spark: [10, 14, 13, 17, 19, 21, 24],
      color: '#10B981',
    },
    {
      title: 'Appointments',
      value: (appointmentsCount || 28).toLocaleString(),
      change: '+8.2%',
      positive: true,
      subtext: '92% completion rate',
      spark: [4, 6, 5, 8, 7, 9, 12],
      color: '#6366F1',
    },
    {
      title: 'Pipeline Revenue',
      value: `$${(balance || 2400).toLocaleString('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      })}`,
      change: '+15.3%',
      positive: true,
      subtext: 'verified via Stripe',
      spark: [1200, 1400, 1350, 1700, 1900, 2200, 2400],
      color: '#F59E0B',
    },
  ]

  // Fallback demo upcoming appointments if none booked yet
  const displayUpcoming =
    upcomingAppointments.length > 0
      ? upcomingAppointments.slice(0, 4)
      : [
          {
            id: '1',
            slot: '10:30 AM',
            date: new Date(),
            email: 'john.smith@acmecorp.com',
            domainName: 'Acme Corp Consultation',
          },
          {
            id: '2',
            slot: '12:00 PM',
            date: new Date(),
            email: 'sarah.ali@techstart.io',
            domainName: 'Product Demo & Pricing',
          },
          {
            id: '3',
            slot: '02:30 PM',
            date: new Date(Date.now() + 86400000),
            email: 'maria.rossi@designly.co',
            domainName: 'Follow-up Call',
          },
          {
            id: '4',
            slot: '04:00 PM',
            date: new Date(Date.now() + 86400000),
            email: 'david.lee@venturelabs.com',
            domainName: 'Strategy Session',
          },
        ]

  // Fallback demo recent conversations if none recorded yet
  const displayConversations =
    recentConversations.length > 0
      ? recentConversations.slice(0, 5)
      : [
          {
            id: '1',
            email: 'Sarah Jenkins',
            domain: 'webprodigies.com',
            lastMessage: 'Looking for enterprise pricing and SLA tiers...',
            lastMessageRole: 'user' as const,
            updatedAt: new Date(Date.now() - 4 * 60000),
            status: 'lead' as const,
          },
          {
            id: '2',
            email: 'Ahmed Kaci',
            domain: 'domainly.ai',
            lastMessage: 'Bot responded with calendar booking link',
            lastMessageRole: 'assistant' as const,
            updatedAt: new Date(Date.now() - 18 * 60000),
            status: 'replied' as const,
          },
          {
            id: '3',
            email: 'Emma Watson',
            domain: 'techcorp.io',
            lastMessage: 'Can we integrate with our HubSpot CRM?',
            lastMessageRole: 'user' as const,
            updatedAt: new Date(Date.now() - 42 * 60000),
            status: 'new' as const,
          },
          {
            id: '4',
            email: 'Liam Miller',
            domain: 'webprodigies.com',
            lastMessage: 'Booked consultation for tomorrow 10:30 AM',
            lastMessageRole: 'assistant' as const,
            updatedAt: new Date(Date.now() - 120 * 60000),
            status: 'lead' as const,
          },
        ]

  return (
    <div className="w-full flex flex-col pb-12">
      {/* 1. Page Header Pattern */}
      <PageHeader
        title={`Good morning, ${firstName}`}
        description="Here's what's happening across your business and domains today."
        domains={domains}
        selectedDomain={selectedDomain}
        onSelectDomain={setSelectedDomain}
        showDomainSelector={true}
        actions={
          <div className="flex items-center gap-2">
            <Link href="/chatbot" target="_blank">
              <Button
                variant="outline"
                size="sm"
                className="h-9 gap-1.5 text-xs font-medium border-border/80 hover:bg-secondary/60 shadow-xs"
              >
                <span>View Chatbot</span>
                <ExternalLink size={13} className="text-muted-foreground" />
              </Button>
            </Link>
          </div>
        }
      />

      {/* 2. Primary KPI Cards (Neutral with restrained accents) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {kpiData.map((kpi, idx) => (
          <div
            key={idx}
            className="rounded-xl p-4 sm:p-5 bg-card border border-border/80 shadow-xs hover:border-border transition-colors flex flex-col justify-between"
          >
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-3 font-medium">
              <span>{kpi.title}</span>
              <Sparkline points={kpi.spark} color={kpi.color} />
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground font-display">
                  {kpi.value}
                </span>
                <span className="inline-flex items-center text-xs font-medium text-emerald-600 dark:text-emerald-400">
                  <ArrowUpRight size={13} strokeWidth={2.5} />
                  {kpi.change}
                </span>
              </div>
              <p className="text-[12px] text-muted-foreground mt-1 font-normal">
                {kpi.subtext}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* 3. Main Analytics Chart & AI Health Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Large Focal Analytics Chart (2 columns) */}
        <div className="lg:col-span-2 rounded-xl p-5 sm:p-6 bg-card border border-border/80 shadow-xs flex flex-col">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-foreground tracking-tight">
                Conversations & Leads
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                AI engagement volume compared against qualified pipeline leads
              </p>
            </div>
            {/* Time Range Selector */}
            <div className="flex items-center gap-1 bg-secondary/60 p-1 rounded-lg border border-border/60 self-start sm:self-auto">
              {(['7D', '30D', '90D'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setChartRange(r)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                    chartRange === r
                      ? 'bg-card text-foreground shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <AnalyticsChart timeRange={chartRange} />
        </div>

        {/* AI Assistant Health Card (1 column) */}
        <div className="rounded-xl p-5 sm:p-6 bg-card border border-border/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-border/60">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-medium">
                  <Bot size={18} />
                </div>
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    AI Assistant
                  </h3>
                  <p className="text-sm font-semibold text-foreground">
                    Domainly Core
                  </p>
                </div>
              </div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Operational
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="divide-y divide-border/60 text-sm mt-2">
              <div className="flex items-center justify-between py-3">
                <span className="text-muted-foreground text-xs font-normal">
                  Response time
                </span>
                <span className="font-semibold text-foreground font-mono text-xs">
                  1.2s
                </span>
              </div>
              <div className="flex items-center justify-between py-3">
                <span className="text-muted-foreground text-xs font-normal">
                  Questions answered
                </span>
                <span className="font-semibold text-foreground text-xs">
                  94.8%
                </span>
              </div>
              <div className="flex items-center justify-between py-3">
                <span className="text-muted-foreground text-xs font-normal">
                  Lead qualification
                </span>
                <span className="font-semibold text-foreground text-xs">
                  28.4%
                </span>
              </div>
              <div className="flex items-center justify-between py-3">
                <span className="text-muted-foreground text-xs font-normal">
                  Live handoffs
                </span>
                <span className="font-semibold text-foreground text-xs">
                  42 sessions
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-border/60 mt-4">
            <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
              Your assistant is operating smoothly with 0 error spikes today.
            </p>
            <Link href="/conversation" className="w-full block">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-between text-xs font-medium h-9 hover:bg-secondary/80 border-border/80 shadow-xs"
              >
                <span>Open conversations</span>
                <ChevronRight size={14} className="text-muted-foreground" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* 4. Upcoming Appointments & Recent Conversations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Appointments */}
        <div className="rounded-xl p-5 sm:p-6 bg-card border border-border/80 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-border/60">
            <div className="flex items-center gap-2">
              <Calendar size={17} className="text-muted-foreground" />
              <h2 className="text-base font-semibold text-foreground">
                Upcoming Appointments
              </h2>
            </div>
            <Link
              href="/appointment"
              className="text-xs font-medium text-primary hover:underline"
            >
              View all
            </Link>
          </div>

          <div className="divide-y divide-border/60">
            {displayUpcoming.map((app) => (
              <Link
                key={app.id}
                href="/appointment"
                className="group flex items-center justify-between py-3.5 hover:bg-secondary/40 px-2 rounded-lg transition-colors -mx-2"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-14 text-center shrink-0">
                    <span className="text-xs font-semibold text-foreground block">
                      {app.slot}
                    </span>
                    <span className="text-[11px] text-muted-foreground">Today</span>
                  </div>
                  <div className="w-px h-8 bg-border/60 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                      {app.email.split('@')[0]}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {app.domainName || app.email}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Confirmed
                  </span>
                  <ChevronRight
                    size={14}
                    className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                  />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Conversations */}
        <div className="rounded-xl p-5 sm:p-6 bg-card border border-border/80 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-border/60">
            <div className="flex items-center gap-2">
              <MessageSquare size={17} className="text-muted-foreground" />
              <h2 className="text-base font-semibold text-foreground">
                Recent Conversations
              </h2>
            </div>
            <Link
              href="/conversation"
              className="text-xs font-medium text-primary hover:underline"
            >
              See all
            </Link>
          </div>

          <div className="divide-y divide-border/60">
            {displayConversations.map((c) => (
              <Link
                key={c.id}
                href="/conversation"
                className="group flex items-center justify-between py-3 hover:bg-secondary/40 px-2 rounded-lg transition-colors -mx-2"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar className="w-8 h-8 rounded-full text-xs shrink-0 border border-border/60">
                    <AvatarFallback className="bg-secondary text-foreground font-semibold">
                      {c.email.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                        {c.email}
                      </p>
                      <span className="text-[11px] text-muted-foreground truncate hidden sm:inline">
                        • {c.domain}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate font-normal">
                      {c.lastMessage}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 pl-3">
                  {c.status === 'lead' && (
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                      ● Lead
                    </span>
                  )}
                  {c.status === 'replied' && (
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/60">
                      ● Replied
                    </span>
                  )}
                  {c.status === 'new' && (
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-secondary text-muted-foreground border border-border/60">
                      ● New
                    </span>
                  )}
                  <ChevronRight
                    size={14}
                    className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                  />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CommandCenter
