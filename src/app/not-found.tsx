import Link from 'next/link'
import { ArrowLeft, Radio } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_50%,_hsl(14_78%_57%_/_0.08)_0%,_transparent_70%)] pointer-events-none" />

      {/* Decorative pulse */}
      <div className="absolute opacity-5">
        <svg width="400" height="120" viewBox="0 0 400 120" fill="none">
          <polyline
            points="0,60 80,60 110,10 140,110 170,60 400,60"
            stroke="#E8643A"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </svg>
      </div>

      <div className="relative z-10 text-center max-w-md">
        {/* Logo mark */}
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-center">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <polyline
                points="2,16 8,16 12,5 16,27 20,16 28,16"
                stroke="#E8643A"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
              <circle cx="29.5" cy="16" r="1.5" fill="#E8643A" opacity="0.6" />
            </svg>
          </div>
        </div>

        {/* 404 */}
        <div className="font-display font-bold text-8xl text-primary/20 leading-none mb-4 select-none">
          404
        </div>

        <h1 className="font-display font-bold text-2xl text-foreground mb-3">
          Page not found
        </h1>

        <p className="text-muted-foreground mb-8 leading-relaxed">
          This page doesn&apos;t exist — or it was moved. Let&apos;s get you back
          somewhere useful.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-primary/90 transition-all hover:-translate-y-px"
          >
            <ArrowLeft size={15} />
            Back to home
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 bg-secondary text-secondary-foreground text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-secondary/80 transition-colors"
          >
            Go to dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
