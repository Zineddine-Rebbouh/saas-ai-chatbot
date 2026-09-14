import {
  onGetAllBookingsForCurrentUser,
  onGetTodaysBookings,
} from '@/actions/appointment'
import AllAppointments from '@/components/appointment/all-appointments'
import InfoBar from '@/components/infobar'
import Section from '@/components/section-label'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { getCurrentUser } from '@/lib/current-user'
import React from 'react'

type Props = {}

const Page = async (props: Props) => {
  // Request-memoised: shared with the actions below, so this guard costs no
  // extra Clerk/Prisma round trip.
  const user = await getCurrentUser()
  if (!user) return null

  // Independent queries run concurrently; "today" is filtered by PostgreSQL.
  const [allBookings, todaysBookings] = await Promise.all([
    onGetAllBookingsForCurrentUser(),
    onGetTodaysBookings(),
  ])

  const bookings = allBookings.bookings
  const bookingsExistToday = todaysBookings.bookings

  if (!bookings.length)
    return (
      <div className="w-full flex justify-center">
        <p>No Appointments</p>
      </div>
    )

  return (
    <>
      <InfoBar />
      <div className="grid grid-cols-1 lg:grid-cols-3 flex-1 h-0 gap-5">
        <div className="lg:col-span-2 overflow-y-auto">
          <AllAppointments bookings={bookings} />
        </div>
        <div className="col-span-1">
          <Section
            label="Bookings For Today"
            message="All your bookings for today are mentioned below."
          />
          {bookingsExistToday.length ? (
            bookingsExistToday.map((booking) => (
              <Card
                key={booking.id}
                className="rounded-xl overflow-hidden mt-4"
              >
                <CardContent className="p-0 flex">
                  <div className="w-4/12 text-xl bg-peach py-10 flex justify-center items-center font-bold">
                    {booking.slot}
                  </div>
                  <div className="flex flex-col flex-1">
                    <div className="flex justify-between w-full p-3">
                      <p className="text-sm">
                        created
                        <br />
                        {booking.createdAt.getHours() % 12 || 12}:
                        {booking.createdAt
                          .getMinutes()
                          .toString()
                          .padStart(2, '0')}{' '}
                        {booking.createdAt.getHours() >= 12 ? 'PM' : 'AM'}
                      </p>
                      <p className="text-sm">
                        Domain <br />
                        {booking.Domain?.name}
                      </p>
                    </div>
                    <Separator orientation="horizontal" />
                    <div className="w-full flex items-center p-3 gap-2">
                      <Avatar>
                        <AvatarFallback>
                          {booking.email?.[0] ?? '?'}
                        </AvatarFallback>
                      </Avatar>
                      <p className="text-sm">{booking.email}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="w-full flex justify-center">
              <p>No Appointments For Today</p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default Page
