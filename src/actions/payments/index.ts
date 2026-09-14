'use server'

import { client } from '@/lib/prisma'

export const onGetDomainProductsAndConnectedAccountId = async (id: string) => {
  try {
    if (!id) return null
    // Independent reads run concurrently; products use the new domainId index
    // and only the columns the portal checkout renders.
    const [connectedAccount, products] = await Promise.all([
      client.domain.findUnique({
        where: {
          id,
        },
        select: {
          User: {
            select: {
              stripeId: true,
            },
          },
        },
      }),
      client.product.findMany({
        where: {
          domainId: id,
        },
        select: {
          price: true,
          name: true,
          image: true,
        },
        take: 100,
      }),
    ])

    if (products) {
      // Summed over the same bounded rows the UI renders, not over the full
      // product table.
      const totalAmount = products.reduce((current, next) => {
        return current + next.price
      }, 0)
      return {
        products: products,
        amount: totalAmount,
        stripeId: connectedAccount?.User?.stripeId,
      }
    }
    return null
  } catch (error) {
    console.log(error)
  }
}


