'use server'

import { client } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/current-user'
import { requireUser } from '@/lib/server-auth'

// Public by design (customer portal is unauthenticated), but bound to the
// domain: a customer record is only returned when it belongs to `domainId`.
export const onDomainCustomerResponses = async (
  customerId: string,
  domainId: string
) => {
  try {
    if (!customerId || !domainId) return null
    const customerQuestions = await client.customer.findFirst({
      where: {
        id: customerId,
        domainId,
      },
      select: {
        email: true,
        questions: {
          select: {
            id: true,
            question: true,
            answered: true,
          },
        },
      },
    })

    return customerQuestions ?? null
  } catch (error) {
    console.log(error)
    return null
  }
}

export const onGetAllDomainBookings = async (domainId: string) => {
  try {
    if (!domainId) return []
    const bookings = await client.bookings.findMany({
      where: {
        domainId,
      },
      select: {
        slot: true,
        date: true,
      },
    })

    return bookings ?? []
  } catch (error) {
    console.log(error)
    return []
  }
}

export const onBookNewAppointment = async (
  domainId: string,
  customerId: string,
  slot: string,
  date: string,
  email: string
) => {
  try {
    if (!domainId || !customerId || !slot || !date || !email) {
      return { status: 400, message: 'Missing booking details' }
    }
    const parsedDate = new Date(date)
    if (Number.isNaN(parsedDate.getTime())) {
      return { status: 400, message: 'Invalid booking date' }
    }

    // The customer must belong to the domain being booked on.
    const customer = await client.customer.findFirst({
      where: { id: customerId, domainId },
      select: { id: true },
    })
    if (!customer) {
      return { status: 404, message: 'Customer not found for this business' }
    }

    // Prevent double-booking the same slot (checked again at the DB level
    // via @@unique([domainId, date, slot]); this gives the friendly error).
    const taken = await client.bookings.findFirst({
      where: { domainId, date: parsedDate, slot },
      select: { id: true },
    })
    if (taken) {
      return { status: 409, message: 'This time slot is already booked' }
    }

    const booking = await client.customer.update({
      where: {
        id: customerId,
      },
      data: {
        booking: {
          create: {
            domainId,
            slot,
            date: parsedDate,
            email,
          },
        },
      },
    })

    if (booking) {
      return { status: 200, message: 'Booking created' }
    }
    return { status: 400, message: 'Booking failed — please try again.' }
  } catch (error) {
    console.log(error)
    // Unique-violation from the slot guard reads as a friendly conflict.
    return { status: 409, message: 'This time slot is already booked' }
  }
}

export const saveAnswers = async (
  questions: Record<string, string>,
  customerId: string
) => {
  try {
    if (!questions || typeof questions !== 'object' || !customerId) {
      return { status: 400, message: 'Invalid answers' }
    }
    const ids = Object.keys(questions).filter(
      (id) => typeof questions[id] === 'string'
    )
    if (ids.length === 0) {
      return { status: 400, message: 'No answers to save' }
    }

    // Only update responses that actually belong to this customer —
    // client-supplied IDs outside the tenant are ignored, not applied.
    const owned = await client.customerResponses.findMany({
      where: { id: { in: ids }, customerId },
      select: { id: true },
    })
    const ownedIds = new Set(owned.map((r) => r.id))
    const writes = ids
      .filter((id) => ownedIds.has(id))
      .map((id) =>
        client.customerResponses.update({
          where: { id },
          data: { answered: questions[id] },
        })
      )
    if (writes.length === 0) {
      return { status: 404, message: 'No matching questions for this customer' }
    }
    await client.$transaction(writes)
    return {
      status: 200,
      message: 'Updated Responses',
    }
  } catch (error) {
    console.log(error)
    return { status: 400, message: 'Could not save answers — please try again.' }
  }
}

// Fields every appointment view needs — `Domain` is read straight off the
// booking instead of walking `Customer → Domain` for the same value.
const BOOKING_SELECT = {
  id: true,
  slot: true,
  createdAt: true,
  date: true,
  email: true,
  domainId: true,
  Domain: {
    select: {
      name: true,
    },
  },
} as const

export const onGetAllBookingsForCurrentUser = async () => {
  try {
    const user = await requireUser()
    if (!user) return { bookings: [] }
    const bookings = await client.bookings.findMany({
      where: {
        Customer: {
          Domain: {
            User: {
              clerkId: user.clerkId,
            },
          },
        },
      },
      select: BOOKING_SELECT,
      orderBy: {
        date: 'desc',
      },
    })

    return { bookings: bookings ?? [] }
  } catch (error) {
    console.log(error)
    return { bookings: [] }
  }
}

/**
 * Today's bookings, filtered by PostgreSQL on the indexed `date` column.
 *
 * The page used to fetch every booking the account ever had and then discard
 * all but today's in JavaScript.
 */
export const onGetTodaysBookings = async () => {
  try {
    const user = await requireUser()
    if (!user) return { bookings: [] }

    const startOfToday = new Date()
    startOfToday.setHours(0, 0, 0, 0)
    const startOfTomorrow = new Date(startOfToday)
    startOfTomorrow.setDate(startOfTomorrow.getDate() + 1)

    const bookings = await client.bookings.findMany({
      where: {
        date: {
          gte: startOfToday,
          lt: startOfTomorrow,
        },
        Customer: {
          Domain: {
            User: {
              clerkId: user.clerkId,
            },
          },
        },
      },
      select: BOOKING_SELECT,
      orderBy: {
        date: 'asc',
      },
    })

    return { bookings: bookings ?? [] }
  } catch (error) {
    console.log(error)
    return { bookings: [] }
  }
}

export const getUserAppointments = async () => {
  try {
    const user = await getCurrentUser()
    if (!user) return 0
    const bookings = await client.bookings.count({
      where: {
        Customer: {
          Domain: {
            User: {
              clerkId: user.clerkId,
            },
          },
        },
      },
    })

    return bookings
  } catch (error) {
    console.log(error)
    return 0
  }
}
