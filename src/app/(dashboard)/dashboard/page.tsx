import React from 'react'
import {
  getUserBalance,
  getUserClients,
  getUserConversationsCount,
  getDashboardRecentConversations,
} from '@/actions/dashboard'
import {
  getUserAppointments,
  onGetUpcomingBookingsForCurrentUser,
} from '@/actions/appointment'
import { onGetAllAccountDomains } from '@/actions/settings'
import { getCurrentUser } from '@/lib/current-user'
import CommandCenter from '@/components/dashboard/command-center'

const Page = async () => {
  const [
    user,
    clients,
    balance,
    appointmentsCount,
    allBookings,
    account,
    totalConversations,
    recentConversations,
  ] = await Promise.all([
    getCurrentUser(),
    getUserClients(),
    getUserBalance(),
    getUserAppointments(),
    onGetUpcomingBookingsForCurrentUser(5),
    onGetAllAccountDomains(),
    getUserConversationsCount(),
    getDashboardRecentConversations(),
  ])

  const domains =
    account?.domains?.map((d) => ({
      id: d.id,
      name: d.name,
      icon: d.icon,
    })) ?? []

  const upcomingBookings = (allBookings?.bookings ?? []).map((b) => ({
    id: b.id,
    slot: b.slot,
    date: b.date,
    email: b.email,
    domainName: b.Domain?.name,
  }))

  return (
    <div className="overflow-y-auto w-full flex-1 h-0 pr-4">
      <CommandCenter
        userName={user?.fullname || 'Zineddine'}
        domains={domains}
        clientsCount={clients || 0}
        balance={balance || 0}
        appointmentsCount={appointmentsCount || 0}
        totalConversations={totalConversations || 0}
        upcomingAppointments={upcomingBookings}
        recentConversations={recentConversations}
      />
    </div>
  )
}

export default Page
