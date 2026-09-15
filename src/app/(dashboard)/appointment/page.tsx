import {
  onGetAllBookingsForCurrentUser,
  onGetTodaysBookings,
} from '@/actions/appointment'
import { onGetAllAccountDomains } from '@/actions/settings'
import { getCurrentUser } from '@/lib/current-user'
import AppointmentWorkspace from '@/components/appointment/appointment-workspace'
import React from 'react'

const Page = async () => {
  const user = await getCurrentUser()
  if (!user) return null

  const [allBookings, todaysBookings, account] = await Promise.all([
    onGetAllBookingsForCurrentUser(),
    onGetTodaysBookings(),
    onGetAllAccountDomains(),
  ])

  const bookings = allBookings?.bookings ?? []
  const today = todaysBookings?.bookings ?? []
  const domains =
    account?.domains?.map((d) => ({
      id: d.id,
      name: d.name,
      icon: d.icon,
    })) ?? []

  return (
    <div className="overflow-y-auto w-full flex-1 h-0 pr-4">
      <AppointmentWorkspace
        initialBookings={bookings}
        todaysBookings={today}
        domains={domains}
      />
    </div>
  )
}

export default Page
