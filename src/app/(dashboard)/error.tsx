'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import { AlertTriangle } from 'lucide-react'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[Domainly AI] Dashboard error:', error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px] gap-6 text-center p-8">
      <div className="w-14 h-14 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center">
        <AlertTriangle size={24} className="text-destructive" />
      </div>

      <div>
        <h2 className="font-display font-bold text-2xl text-foreground mb-2">
          Something went wrong
        </h2>
        <p className="text-muted-foreground text-sm max-w-sm">
          An unexpected error occurred. Please try again — if the problem
          persists, contact support.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={reset}
          className="bg-primary text-primary-foreground text-sm font-medium px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
        >
          Try again
        </button>
        <Link
          href="/dashboard"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Go to dashboard
        </Link>
      </div>

      {error.digest && (
        <p className="text-xs text-muted-foreground/50 font-mono">
          Error ID: {error.digest}
        </p>
      )}
    </div>
  )
}
