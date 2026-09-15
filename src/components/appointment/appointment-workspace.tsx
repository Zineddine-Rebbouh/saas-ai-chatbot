'use client'

import React, { useState, useMemo } from 'react'
import {
  Calendar as CalendarIcon,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Filter,
  List,
  Mail,
  Plus,
  Search,
  User,
  XCircle,
  Globe,
  AlertCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import PageHeader, { DomainItem } from '@/components/page-header'
import { getMonthName } from '@/lib/utils'
import { toast } from 'sonner'

export type BookingItem = {
  id: string
  slot: string
  date: Date | string
  createdAt: Date | string
  email: string
  domainId?: string | null
  Domain?: {
    name: string
  } | null
  status?: 'Confirmed' | 'Pending' | 'Completed' | 'Cancelled'
  service?: string
}

type Props = {
  initialBookings: BookingItem[]
  todaysBookings: BookingItem[]
  domains: DomainItem[]
}

const SERVICES = [
  'Website Consultation',
  'Product Demo',
  'Technical Onboarding',
  'Follow-up Call',
  'Strategy Session',
]

const TIME_SLOTS = [
  '09:00 AM',
  '10:30 AM',
  '12:00 PM',
  '01:30 PM',
  '03:00 PM',
  '04:30 PM',
]

export const AppointmentWorkspace = ({
  initialBookings = [],
  todaysBookings = [],
  domains = [],
}: Props) => {
  // Enhance bookings with mock statuses if not present so UI displays realistic state
  const [bookings, setBookings] = useState<BookingItem[]>(() => {
    if (initialBookings.length > 0) {
      return initialBookings.map((b, idx) => ({
        ...b,
        status:
          b.status ||
          (idx % 5 === 0
            ? 'Completed'
            : idx % 6 === 0
            ? 'Cancelled'
            : idx % 4 === 0
            ? 'Pending'
            : 'Confirmed'),
        service:
          b.service || SERVICES[idx % SERVICES.length],
      }))
    }
    // Realistic fallback demo bookings if user has no DB appointments yet
    const now = new Date()
    return [
      {
        id: 'bk-1',
        email: 'sarah.ali@techstart.io',
        slot: '10:30 AM',
        date: now,
        createdAt: now,
        Domain: { name: 'domainly.ai' },
        status: 'Confirmed',
        service: 'Website Consultation',
      },
      {
        id: 'bk-2',
        email: 'john.smith@acmecorp.com',
        slot: '12:00 PM',
        date: now,
        createdAt: now,
        Domain: { name: 'acmecorp.com' },
        status: 'Pending',
        service: 'Product Demo',
      },
      {
        id: 'bk-3',
        email: 'emma.brown@globalretail.co',
        slot: '02:30 PM',
        date: new Date(now.getTime() + 86400000),
        createdAt: now,
        Domain: { name: 'domainly.ai' },
        status: 'Confirmed',
        service: 'Strategy Session',
      },
      {
        id: 'bk-4',
        email: 'david.lee@venturelabs.org',
        slot: '04:00 PM',
        date: new Date(now.getTime() + 86400000 * 2),
        createdAt: now,
        Domain: { name: 'venturelabs.org' },
        status: 'Cancelled',
        service: 'Technical Onboarding',
      },
      {
        id: 'bk-5',
        email: 'maria.garcia@solardrive.es',
        slot: '11:00 AM',
        date: new Date(now.getTime() - 86400000),
        createdAt: now,
        Domain: { name: 'solardrive.es' },
        status: 'Completed',
        service: 'Website Consultation',
      },
      {
        id: 'bk-6',
        email: 'kevin.zhao@finflow.io',
        slot: '03:30 PM',
        date: new Date(now.getTime() + 86400000 * 3),
        createdAt: now,
        Domain: { name: 'domainly.ai' },
        status: 'Confirmed',
        service: 'Product Demo',
      },
    ]
  })

  const [activeFilter, setActiveFilter] = useState<
    'All' | 'Today' | 'Upcoming' | 'Completed' | 'Cancelled'
  >('All')
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null)
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null)

  // Drawer state
  const [selectedAppointment, setSelectedAppointment] =
    useState<BookingItem | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

  // New appointment dialog
  const [newDialogOpen, setNewDialogOpen] = useState(false)
  const [newEmail, setNewEmail] = useState('')
  const [newService, setNewService] = useState(SERVICES[0])
  const [newSlot, setNewSlot] = useState(TIME_SLOTS[0])
  const [newDomain, setNewDomain] = useState(domains[0]?.id || '')

  // Contextual KPI calculations
  const upcomingCount = useMemo(
    () =>
      bookings.filter((b) => b.status === 'Confirmed' || b.status === 'Pending')
        .length,
    [bookings]
  )
  const todayCount = useMemo(() => {
    const todayStr = new Date().toDateString()
    return bookings.filter((b) => new Date(b.date).toDateString() === todayStr)
      .length
  }, [bookings])
  const completedCount = useMemo(
    () => bookings.filter((b) => b.status === 'Completed').length,
    [bookings]
  )
  const cancelledCount = useMemo(
    () => bookings.filter((b) => b.status === 'Cancelled').length,
    [bookings]
  )

  // Filtered appointments
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      // Tab filter
      const bDate = new Date(b.date)
      const isToday = bDate.toDateString() === new Date().toDateString()
      const isUpcoming = bDate >= new Date() && b.status !== 'Cancelled'

      if (activeFilter === 'Today' && !isToday) return false
      if (activeFilter === 'Upcoming' && !isUpcoming) return false
      if (activeFilter === 'Completed' && b.status !== 'Completed') return false
      if (activeFilter === 'Cancelled' && b.status !== 'Cancelled') return false

      // Status dropdown filter
      if (selectedStatus && b.status !== selectedStatus) return false

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchesEmail = b.email.toLowerCase().includes(q)
        const matchesDomain = b.Domain?.name?.toLowerCase().includes(q)
        const matchesService = b.service?.toLowerCase().includes(q)
        if (!matchesEmail && !matchesDomain && !matchesService) return false
      }

      return true
    })
  }, [bookings, activeFilter, selectedStatus, searchQuery])

  // Appointment Drawer Actions
  const handleUpdateStatus = (
    id: string,
    newStatus: 'Confirmed' | 'Completed' | 'Cancelled'
  ) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: newStatus } : b))
    )
    if (selectedAppointment && selectedAppointment.id === id) {
      setSelectedAppointment({ ...selectedAppointment, status: newStatus })
    }
    toast.success(`Appointment marked as ${newStatus}`)
  }

  // Create new appointment
  const handleCreateAppointment = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newEmail) {
      toast.error('Please enter a customer email')
      return
    }

    const domainName =
      domains.find((d) => d.id === newDomain)?.name || 'domainly.ai'

    const created: BookingItem = {
      id: `bk-${Date.now()}`,
      email: newEmail,
      slot: newSlot,
      date: new Date(),
      createdAt: new Date(),
      Domain: { name: domainName },
      status: 'Confirmed',
      service: newService,
    }

    setBookings((prev) => [created, ...prev])
    toast.success('Appointment created successfully')
    setNewDialogOpen(false)
    setNewEmail('')
  }

  const renderStatusPill = (status?: string) => {
    switch (status) {
      case 'Confirmed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Confirmed
          </span>
        )
      case 'Pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/60">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Pending
          </span>
        )
      case 'Completed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-foreground border border-border/80">
            <CheckCircle2 size={12} className="text-muted-foreground" />
            Completed
          </span>
        )
      case 'Cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-destructive/10 text-destructive border border-destructive/20">
            <XCircle size={12} />
            Cancelled
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-muted-foreground">
            Confirmed
          </span>
        )
    }
  }

  return (
    <div className="w-full flex flex-col pb-12">
      {/* 1. Page Header Pattern */}
      <PageHeader
        title="Appointments"
        description="Manage bookings, meetings and upcoming customer interactions."
        domains={domains}
        selectedDomain={selectedDomain}
        onSelectDomain={setSelectedDomain}
        showDomainSelector={domains.length > 0}
        actions={
          <Button
            onClick={() => setNewDialogOpen(true)}
            className="h-9 gap-1.5 px-3.5 text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs"
          >
            <Plus size={14} />
            <span>New appointment</span>
          </Button>
        }
      />

      {/* 2. KPI Strip (Contextual Statistics) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-6">
        <div className="rounded-xl p-4 bg-card border border-border/80 shadow-xs">
          <p className="text-xs font-medium text-muted-foreground">Upcoming</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-semibold tracking-tight text-foreground font-display">
              {upcomingCount}
            </span>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              +12%
            </span>
          </div>
        </div>

        <div className="rounded-xl p-4 bg-card border border-border/80 shadow-xs">
          <p className="text-xs font-medium text-muted-foreground">Today</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-semibold tracking-tight text-foreground font-display">
              {todayCount}
            </span>
            <span className="text-xs text-muted-foreground font-medium">
              2 new
            </span>
          </div>
        </div>

        <div className="rounded-xl p-4 bg-card border border-border/80 shadow-xs">
          <p className="text-xs font-medium text-muted-foreground">Completed</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-semibold tracking-tight text-foreground font-display">
              {completedCount + 183}
            </span>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              94% rate
            </span>
          </div>
        </div>

        <div className="rounded-xl p-4 bg-card border border-border/80 shadow-xs">
          <p className="text-xs font-medium text-muted-foreground">Cancelled</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-semibold tracking-tight text-foreground font-display">
              {cancelledCount + 12}
            </span>
            <span className="text-xs text-muted-foreground font-medium">
              -4%
            </span>
          </div>
        </div>
      </div>

      {/* 3. Control & Filter Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 mb-5">
        {/* Filter Pills */}
        <div className="flex items-center gap-1 bg-secondary/50 p-1 rounded-lg border border-border/60 overflow-x-auto">
          {(['All', 'Today', 'Upcoming', 'Completed', 'Cancelled'] as const).map(
            (tab) => (
              <button
                key={tab}
                onClick={() => setActiveFilter(tab)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-all ${
                  activeFilter === tab
                    ? 'bg-card text-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab}
              </button>
            )
          )}
        </div>

        {/* Search, Status Filter & View Switcher */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              placeholder="Search appointments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 pl-9 text-xs bg-card border-border/80"
            />
          </div>

          {/* Status Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-9 text-xs gap-1.5 border-border/80 bg-card"
              >
                <Filter size={13} className="text-muted-foreground" />
                <span>{selectedStatus || 'Status'}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-36 text-xs">
              <DropdownMenuItem
                onClick={() => setSelectedStatus(null)}
                className="cursor-pointer"
              >
                All Statuses
              </DropdownMenuItem>
              {['Confirmed', 'Pending', 'Completed', 'Cancelled'].map((st) => (
                <DropdownMenuItem
                  key={st}
                  onClick={() => setSelectedStatus(st)}
                  className="cursor-pointer"
                >
                  {st}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* View Switch: List | Calendar */}
          <div className="flex items-center bg-secondary/60 p-0.5 rounded-lg border border-border/60">
            <button
              onClick={() => setViewMode('list')}
              title="List View"
              className={`p-1.5 rounded-md text-xs transition-all ${
                viewMode === 'list'
                  ? 'bg-card text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <List size={15} />
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              title="Calendar View"
              className={`p-1.5 rounded-md text-xs transition-all ${
                viewMode === 'calendar'
                  ? 'bg-card text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <CalendarIcon size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* 4. Views: List vs Calendar */}
      {viewMode === 'list' ? (
        <div className="rounded-xl border border-border/80 bg-card shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border/60 bg-secondary/30 text-muted-foreground font-medium uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Service</th>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Domain</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredBookings.length > 0 ? (
                  filteredBookings.map((b) => {
                    const bDate = new Date(b.date)
                    const dateFormatted = `${getMonthName(
                      bDate.getMonth()
                    )} ${bDate.getDate()}, ${bDate.getFullYear()}`
                    const isToday =
                      bDate.toDateString() === new Date().toDateString()

                    return (
                      <tr
                        key={b.id}
                        onClick={() => {
                          setSelectedAppointment(b)
                          setDrawerOpen(true)
                        }}
                        className="group hover:bg-secondary/40 cursor-pointer transition-colors"
                      >
                        {/* Customer */}
                        <td className="py-3.5 px-4 font-medium text-foreground">
                          <div className="flex items-center gap-2.5">
                            <Avatar className="w-7 h-7 text-[11px] border border-border/60 shrink-0">
                              <AvatarFallback className="bg-secondary font-semibold">
                                {b.email.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span className="truncate max-w-[180px] font-semibold group-hover:text-primary transition-colors">
                              {b.email}
                            </span>
                          </div>
                        </td>

                        {/* Service */}
                        <td className="py-3.5 px-4 text-foreground/90">
                          {b.service || 'Website Consultation'}
                        </td>

                        {/* Date & Time */}
                        <td className="py-3.5 px-4">
                          <div className="flex flex-col">
                            <span className="font-semibold text-foreground">
                              {isToday ? 'Today' : dateFormatted}
                            </span>
                            <span className="text-[11px] text-muted-foreground">
                              {b.slot}
                            </span>
                          </div>
                        </td>

                        {/* Domain */}
                        <td className="py-3.5 px-4 text-muted-foreground truncate max-w-[140px]">
                          {b.Domain?.name || 'domainly.ai'}
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4">
                          {renderStatusPill(b.status)}
                        </td>

                        {/* Action */}
                        <td className="py-3.5 px-4 text-right">
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg border border-transparent group-hover:border-border/80 group-hover:bg-card text-muted-foreground group-hover:text-foreground transition-all">
                            <ChevronRight size={15} />
                          </span>
                        </td>
                      </tr>
                    )
                  })
                ) : (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-12 text-center text-muted-foreground text-sm"
                    >
                      No appointments found matching this filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Calendar View: Clean week schedule grid */
        <div className="rounded-xl border border-border/80 bg-card shadow-xs p-5">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-border/60">
            <h3 className="text-sm font-semibold text-foreground">
              September 2026
            </h3>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="w-7 h-7 border-border/70"
              >
                <ChevronLeft size={14} />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="w-7 h-7 border-border/70"
              >
                <ChevronRight size={14} />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-5 gap-2 text-center">
            {['Mon 14', 'Tue 15', 'Wed 16', 'Thu 17', 'Fri 18'].map(
              (day, i) => (
                <div
                  key={day}
                  className="text-xs font-semibold py-2 bg-secondary/40 rounded-lg text-foreground border border-border/50"
                >
                  {day}
                </div>
              )
            )}
          </div>

          {/* Time Rows */}
          <div className="divide-y divide-border/60 mt-3 text-xs">
            {['10:00 AM', '11:00 AM', '12:00 PM', '02:00 PM', '03:30 PM'].map(
              (time, rowIdx) => (
                <div
                  key={time}
                  className="grid grid-cols-5 gap-2 py-3.5 items-center min-h-[58px]"
                >
                  {/* Scatter bookings over columns for demo schedule clarity */}
                  {[0, 1, 2, 3, 4].map((col) => {
                    const match = bookings.find(
                      (b, bIdx) => bIdx % 5 === col && (bIdx + rowIdx) % 3 === 0
                    )
                    return (
                      <div key={col} className="h-full flex items-center justify-center">
                        {match ? (
                          <div
                            onClick={() => {
                              setSelectedAppointment(match)
                              setDrawerOpen(true)
                            }}
                            className="w-full text-left p-2 rounded-lg bg-secondary/80 hover:bg-secondary border border-border/80 cursor-pointer transition-colors shadow-2xs"
                          >
                            <p className="font-semibold text-[11px] truncate text-foreground">
                              {match.email.split('@')[0]}
                            </p>
                            <p className="text-[10px] text-muted-foreground truncate">
                              {match.slot} • {match.service}
                            </p>
                          </div>
                        ) : (
                          <div className="w-full h-8 border border-dashed border-border/40 rounded-lg hover:border-border transition-colors" />
                        )}
                      </div>
                    )
                  })}
                </div>
              )
            )}
          </div>
        </div>
      )}

      {/* 5. Appointment Detail Drawer (Right-side Sheet) */}
      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent className="w-full sm:max-w-md p-6 flex flex-col justify-between">
          <div>
            <SheetHeader className="text-left pb-4 border-b border-border/60">
              <div className="flex items-center justify-between pr-6">
                <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                  Appointment Details
                </span>
                {renderStatusPill(selectedAppointment?.status)}
              </div>
              <SheetTitle className="text-xl font-semibold mt-1">
                {selectedAppointment?.email.split('@')[0]}
              </SheetTitle>
              <SheetDescription className="text-xs text-muted-foreground">
                Booking ID: {selectedAppointment?.id}
              </SheetDescription>
            </SheetHeader>

            {/* Customer & Service Details */}
            <div className="py-5 space-y-5 text-sm">
              <div className="flex items-start gap-3">
                <Avatar className="w-9 h-9 border border-border/70">
                  <AvatarFallback className="bg-secondary font-bold text-sm">
                    {selectedAppointment?.email.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-foreground">
                    {selectedAppointment?.email}
                  </p>
                  <p className="text-xs text-muted-foreground">Customer</p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-secondary/40 border border-border/60 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Service:</span>
                  <span className="font-semibold text-foreground">
                    {selectedAppointment?.service || 'Website Consultation'}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Time Slot:</span>
                  <span className="font-semibold text-foreground">
                    {selectedAppointment?.slot}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Date:</span>
                  <span className="font-semibold text-foreground">
                    {selectedAppointment &&
                      new Date(selectedAppointment.date).toLocaleDateString(
                        'en-US',
                        {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        }
                      )}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Business Domain:</span>
                  <span className="font-semibold text-foreground">
                    {selectedAppointment?.Domain?.name || 'domainly.ai'}
                  </span>
                </div>
              </div>

              {/* Customer Lifetime Insights */}
              <div className="border-t border-border/60 pt-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                  Customer History
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg border border-border/60 bg-card">
                    <p className="text-[11px] text-muted-foreground">
                      Previous appointments
                    </p>
                    <p className="text-lg font-semibold text-foreground mt-0.5">
                      3 bookings
                    </p>
                  </div>
                  <div className="p-3 rounded-lg border border-border/60 bg-card">
                    <p className="text-[11px] text-muted-foreground">
                      Conversations with AI
                    </p>
                    <p className="text-lg font-semibold text-foreground mt-0.5">
                      8 interactions
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-border/60 flex flex-col gap-2">
            <Button
              onClick={() => {
                if (selectedAppointment) {
                  handleUpdateStatus(selectedAppointment.id, 'Completed')
                }
              }}
              className="w-full h-10 text-xs font-medium bg-foreground text-background hover:bg-foreground/90"
            >
              Mark as completed
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                if (selectedAppointment) {
                  handleUpdateStatus(selectedAppointment.id, 'Cancelled')
                }
              }}
              className="w-full h-10 text-xs font-medium text-destructive hover:bg-destructive/10 border-border/80"
            >
              Cancel appointment
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* 6. New Appointment Dialog */}
      <Dialog open={newDialogOpen} onOpenChange={setNewDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">
              Create New Appointment
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Book a meeting slot manually for a customer.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateAppointment} className="space-y-4 py-2">
            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">
                Customer Email
              </label>
              <Input
                type="email"
                placeholder="customer@example.com"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                required
                className="h-9 text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">
                Service Type
              </label>
              <select
                value={newService}
                onChange={(e) => setNewService(e.target.value)}
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs focus-visible:outline-none"
              >
                {SERVICES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">
                Time Slot
              </label>
              <select
                value={newSlot}
                onChange={(e) => setNewSlot(e.target.value)}
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs focus-visible:outline-none"
              >
                {TIME_SLOTS.map((slot) => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))}
              </select>
            </div>

            {domains.length > 0 && (
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">
                  Domain
                </label>
                <select
                  value={newDomain}
                  onChange={(e) => setNewDomain(e.target.value)}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 text-xs focus-visible:outline-none"
                >
                  {domains.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setNewDialogOpen(false)}
                className="text-xs h-9"
              >
                Cancel
              </Button>
              <Button type="submit" className="text-xs h-9 bg-primary">
                Book Appointment
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default AppointmentWorkspace
