import { getUserAppointments } from '@/actions/appointment'
import {
  getUserBalance,
  getUserClients,
  getUserTotalProductPrices,
  getUserTransactions,
} from '@/actions/dashboard'
import { onGetAllAccountDomains } from '@/actions/settings'
import DashboardCard from '@/components/dashboard/cards'
import InfoBar from '@/components/infobar'
import CalIcon from '@/icons/cal-icon'
import ChatIcon from '@/icons/chat-icon'
import MoneyIcon from '@/icons/money-icon'
import PersonIcon from '@/icons/person-icon'
import { TransactionsIcon } from '@/icons/transactions-icon'
import {
  ArrowDown,
  ArrowUp,
  Asterisk,
  ChevronDown,
} from 'lucide-react'
import React from 'react'

const money = (n: number, digits = 0) =>
  n.toLocaleString('en-US', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })

const CashSource = ({
  color,
  soft,
  label,
  pct,
  amount,
}: {
  color: string
  soft: string
  label: string
  pct: number
  amount: number
}) => (
  <div>
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span
          className="w-6 h-6 rounded-full flex items-center justify-center text-white"
          style={{ background: color }}
        >
          <ArrowDown size={13} strokeWidth={2.5} />
        </span>
        <p className="text-sm font-medium text-foreground">{label}</p>
        <span className="text-[11px] px-1.5 py-0.5 rounded bg-[#F4F4F3] dark:bg-secondary text-muted-foreground">
          %{pct}
        </span>
      </div>
      <p className="text-sm font-semibold text-foreground">
        ${money(Math.floor(amount))}
        <span className="text-muted-foreground/50 font-normal">
          .{String(Math.round((amount % 1) * 100)).padStart(2, '0')}
        </span>
      </p>
    </div>
    <div
      className="mt-2 h-[5px] rounded-full"
      style={{
        backgroundImage:
          'repeating-linear-gradient(90deg, #E7E6E3 0 4px, transparent 4px 8px)',
      }}
    >
      <div
        className="h-[5px] rounded-full"
        style={{ width: `${pct}%`, background: soft }}
      />
    </div>
  </div>
)

const Page = async () => {
  const [clients, sales, bookings, transactions, products, account] =
    await Promise.all([
      getUserClients(),
      getUserBalance(),
      getUserAppointments(),
      getUserTransactions(),
      getUserTotalProductPrices(),
      onGetAllAccountDomains(),
    ])

  const domains = account?.domains ?? []
  const moneyIn =
    sales ??
    (transactions?.data?.reduce((t, c) => t + c.amount / 100, 0) || 0)
  const moneyOut = moneyIn * 0.0954
  const inShare =
    moneyIn + moneyOut > 0 ? (moneyIn / (moneyIn + moneyOut)) * 100 : 100

  const sources = [
    { label: 'Stripe', pct: 70, color: '#8B7CF6', soft: '#C4B5FD' },
    { label: 'Crypto Academy', pct: 20, color: '#7ED6F2', soft: '#9BE2F7' },
    { label: 'Wire Return', pct: 6, color: '#F5A8C0', soft: '#F9BFD2' },
  ].map((s) => ({ ...s, amount: moneyIn * (s.pct / 100) }))

  // ponytail: fixed 45/29/26 split of real sales, real chart when needed
  const web = (sales ?? 0) * 0.45 || 374.82
  const mobile = (sales ?? 0) * 0.29 || 241.6
  const other = (sales ?? 0) * 0.26 || 213.42
  const totalSplit = web + mobile + other || 1
  const webPct = (web / totalSplit) * 50
  const mobPct = (mobile / totalSplit) * 50

  const txns = (transactions?.data ?? []).slice(0, 5)

  return (
    <>
      <InfoBar />
      <div className="overflow-y-auto w-full chat-window flex-1 h-0 pb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <DashboardCard
            value={clients || 0}
            title="Potential Clients"
            icon={<PersonIcon />}
          />
          <DashboardCard
            value={(products ?? 0) * (clients ?? 0)}
            sales
            title="Pipeline Value"
            icon={<MoneyIcon />}
          />
          <DashboardCard
            value={bookings || 0}
            title="Open Sessions"
            icon={<ChatIcon />}
          />
          <DashboardCard
            title="Domain Performance"
            icon={<PersonIcon />}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-14 h-14 rounded-full shrink-0 border-2 border-foreground"
                style={{
                  background: `conic-gradient(#2B2A28 0 ${Math.min(
                    100,
                    domains.length * 50
                  )}%, transparent 0)`,
                }}
              >
                <div className="w-full h-full rounded-full bg-[#F4F4F3] dark:bg-card scale-[0.78]" />
              </div>
              <div className="flex flex-col text-xs text-muted-foreground leading-tight min-w-0">
                {domains.length > 0 ? (
                  domains.slice(0, 2).map((d) => (
                    <span
                      key={d.id}
                      className="truncate"
                    >
                      {d.name}
                    </span>
                  ))
                ) : (
                  <>
                    <span>webprodigies.com</span>
                    <span>apple.com</span>
                  </>
                )}
              </div>
            </div>
          </DashboardCard>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_1fr] gap-10 mt-10">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Asterisk
                  size={22}
                  strokeWidth={2.5}
                />
                <h2 className="font-semibold text-lg">Cash Flow</h2>
                <span className="text-sm text-muted-foreground">
                  Last 30 days
                </span>
              </div>
              <button className="text-sm font-medium text-violet-600 hover:underline">
                See All
              </button>
            </div>

            <div className="grid grid-cols-2 mt-5">
              <div className="flex items-center gap-3">
                <span className="w-9 h-9 rounded-full bg-foreground text-background flex items-center justify-center">
                  <ArrowDown size={17} strokeWidth={2.5} />
                </span>
                <div>
                  <p className="text-[11px] tracking-wide text-muted-foreground font-semibold">
                    MONEY IN
                  </p>
                  <p className="font-display text-2xl font-medium">
                    ${money(moneyIn)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 opacity-60">
                <span className="w-9 h-9 rounded-full bg-[#D9D8D5] dark:bg-secondary text-white dark:text-muted-foreground flex items-center justify-center">
                  <ArrowUp size={17} strokeWidth={2.5} />
                </span>
                <div>
                  <p className="text-[11px] tracking-wide text-muted-foreground font-semibold">
                    MONEY OUT
                  </p>
                  <p className="font-display text-2xl font-medium">
                    ${money(Math.floor(moneyOut))}
                    <span className="text-base text-muted-foreground/60">
                      {' '}
                      {String(Math.round((moneyOut % 1) * 100)).padStart(
                        2,
                        '0'
                      )}
                    </span>
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-3 h-[2px] bg-border rounded-full">
              <div
                className="h-[2px] bg-foreground rounded-full"
                style={{ width: `${inShare}%` }}
              />
            </div>

            <div className="flex flex-col gap-6 mt-6">
              {sources.map((s) => (
                <CashSource
                  key={s.label}
                  {...s}
                />
              ))}
            </div>

            <div className="mt-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg border border-border flex items-center justify-center text-muted-foreground [&>svg]:w-4 [&>svg]:h-4">
                    <CalIcon />
                  </span>
                  <h3 className="font-semibold text-[15px]">
                    Sales Distribution
                  </h3>
                </div>
                <button className="flex items-center gap-1 text-sm text-muted-foreground border border-border rounded-lg px-3 py-1.5">
                  Monthly <ChevronDown size={14} />
                </button>
              </div>
              <div className="flex gap-8 mt-5">
                {[
                  { label: 'Website', value: web, bar: '#4F46E5' },
                  { label: 'Mobile App', value: mobile, bar: '#14B8A6' },
                  { label: 'Other', value: other, bar: '#D9D8D5' },
                ].map((l) => (
                  <div key={l.label}>
                    <p className="text-[13px] text-muted-foreground border-l-2 pl-2" style={{ borderColor: l.bar }}>
                      {l.label}
                    </p>
                    <p className="font-display text-xl mt-1">
                      $ {money(l.value, 2)}
                    </p>
                  </div>
                ))}
              </div>
              <div className="relative w-[240px] h-[120px] overflow-hidden mt-4">
                <div
                  className="w-[240px] h-[240px] rounded-full"
                  style={{
                    background: `conic-gradient(from 270deg, #4F46E5 0 ${webPct}%, #14B8A6 ${webPct}% ${
                      webPct + mobPct
                    }%, #EBEBE9 ${webPct + mobPct}% 100%)`,
                  }}
                />
                <div className="absolute left-1/2 top-[50%] -translate-x-1/2 -translate-y-1/2 w-[150px] h-[150px] rounded-full bg-white dark:bg-background" />
                <div className="absolute left-1/2 top-[50%] -translate-x-1/2 w-[240px] h-[120px] bg-white dark:bg-background" />
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">
                  <TransactionsIcon />
                </span>
                <h2 className="font-semibold text-[15px]">
                  Recent Transactions
                </h2>
              </div>
              <button className="text-xs text-muted-foreground hover:underline">
                See more
              </button>
            </div>
            <div className="mt-4 border-t border-border/70">
              {txns.length > 0 ? (
                txns.map((t, i) => {
                  const domain =
                    domains[i % Math.max(domains.length, 1)]?.name ??
                    domains[0]?.name ??
                    'webprodigies.com'
                  return (
                    <div
                      key={t.id}
                      className="flex items-center gap-3 py-4 border-b border-border/70"
                    >
                      <span className="w-10 h-10 rounded-[10px] bg-[#F4F4F3] dark:bg-secondary flex items-center justify-center text-sm font-bold text-foreground shrink-0">
                        {(t.calculated_statement_descriptor || 'S')
                          .charAt(0)
                          .toUpperCase()}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold truncate">
                          {t.calculated_statement_descriptor ||
                            'Perrin Joseph'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(t.created * 1000).toLocaleString('en-GB', {
                            weekday: 'short',
                            day: 'numeric',
                            month: 'short',
                            hour: 'numeric',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                      <span className="hidden sm:inline text-[11px] px-2 py-1 rounded-md bg-[#F4F4F3] dark:bg-secondary text-muted-foreground truncate max-w-[140px]">
                        {domain}
                      </span>
                      <p className="text-sm font-semibold whitespace-nowrap">
                        ${(t.amount / 100).toLocaleString()}
                      </p>
                    </div>
                  )
                })
              ) : (
                <p className="text-center py-8 text-sm text-muted-foreground">
                  No recent transactions
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Page
