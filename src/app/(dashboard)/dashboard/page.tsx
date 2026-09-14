import { getUserAppointments } from '@/actions/appointment'
import {
  getUserBalance,
  getUserClients,
  getUserPlanInfo,
  getUserTotalProductPrices,
  getUserTransactions,
} from '@/actions/dashboard'
import DashboardCard from '@/components/dashboard/cards'
import { PlanUsage } from '@/components/dashboard/plan-usage'
import InfoBar from '@/components/infobar'
import { Separator } from '@/components/ui/separator'
import CalIcon from '@/icons/cal-icon'
import EmailIcon from '@/icons/email-icon'
import PersonIcon from '@/icons/person-icon'
import { TransactionsIcon } from '@/icons/transactions-icon'
import { DollarSign } from 'lucide-react'
import React from 'react'

type Props = {}

const Page = async (props: Props) => {
  const clients = await getUserClients()
  const sales = await getUserBalance()
  const bookings = await getUserAppointments()
  const plan = await getUserPlanInfo()
  const transactions = await getUserTransactions()
  const products = await getUserTotalProductPrices()

  return (
    <>
      <InfoBar />
      <div className="overflow-y-auto w-full chat-window flex-1 h-0">
        <div className="flex gap-5 flex-wrap">
          <DashboardCard
            value={clients || 0}
            title="Potential Clients"
            icon={<PersonIcon />}
          />
          <DashboardCard
            value={(products ?? 0) * (clients ?? 0)}
            sales
            title="Pipeline Value"
            icon={<DollarSign />}
          />
          <DashboardCard
            value={bookings || 0}
            title="Appointments"
            icon={<CalIcon />}
          />
          <DashboardCard
            value={sales || 0}
            sales
            title="Total Sales"
            icon={<DollarSign />}
          />
        </div>
        <div className="w-full grid grid-cols-1 lg:grid-cols-2 py-10">
          <div>
            <div>
              <h2 className="font-bold text-2xl">Plan Usage</h2>
              <p className="text-sm font-light">
                A detailed overview of your metrics, usage, customers and more
              </p>
            </div>
            <PlanUsage
              plan={plan?.plan!}
              credits={plan?.credits || 0}
              domains={plan?.domains || 0}
              clients={clients || 0}
            />
          </div>
          <div className="flex flex-col bg-card border border-border/60 rounded-2xl p-6 shadow-sm">
            <div className="w-full flex justify-between items-center mb-6">
              <div className="flex gap-3 items-center">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <TransactionsIcon />
                </div>
                <p className="font-semibold text-foreground">Recent Transactions</p>
              </div>
              <button className="text-xs text-primary hover:underline font-medium">See more</button>
            </div>
            
            <div className="flex flex-col divide-y divide-border/40">
              {transactions && transactions.data.length > 0 ? (
                transactions.data.map((transaction) => (
                  <div
                    className="flex w-full justify-between items-center py-4 first:pt-0 last:pb-0 hover:bg-secondary/40 transition-colors px-2 rounded-lg"
                    key={transaction.id}
                  >
                    <div className="flex flex-col gap-0.5">
                      <p className="font-medium text-sm text-foreground">
                        {transaction.calculated_statement_descriptor || 'Subscription Upgrade'}
                      </p>
                      <p className="text-[10px] text-muted-foreground font-mono">
                        {new Date(transaction.created * 1000).toLocaleDateString()}
                      </p>
                    </div>
                    <p className="font-display font-bold text-base text-foreground">
                      +${(transaction.amount / 100).toFixed(2)}
                    </p>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  No recent transactions
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Page
