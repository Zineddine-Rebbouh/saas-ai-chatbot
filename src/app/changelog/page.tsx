import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Changelog',
  description: 'Product updates, new features, and improvements to Domainly AI.',
}

const releases = [
  {
    version: '1.2.0',
    date: 'May 2025',
    tag: 'Feature',
    tagColor: 'bg-primary/10 text-primary border-primary/20',
    items: [
      'Added real-time live takeover mode — toggle any conversation to human support instantly via Pusher',
      'Introduced email campaign builder with per-domain customer segmentation',
      'New appointment booking flow integrated directly into the chatbot',
      'Stripe billing portal now accessible from Settings → Subscription',
    ],
  },
  {
    version: '1.1.0',
    date: 'March 2025',
    tag: 'Improvement',
    tagColor: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    items: [
      'Redesigned dashboard with cleaner data hierarchy and usage stats',
      'Filter questions now support branching conversation logic',
      'Chatbot embed widget respects user-configured color themes',
      'Improved lead capture — email extracted from natural conversation, no form needed',
    ],
  },
  {
    version: '1.0.1',
    date: 'February 2025',
    tag: 'Fix',
    tagColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    items: [
      'Fixed chatroom message ordering on high-frequency Pusher events',
      'Resolved Stripe webhook signature mismatch on plan upgrades',
      'Corrected OTP input focus behavior on mobile',
      'Fixed avatar upload occasionally returning null icon URL',
    ],
  },
  {
    version: '1.0.0',
    date: 'January 2025',
    tag: 'Launch',
    tagColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    items: [
      'Initial release of Domainly AI — AI-powered email marketing chatbot',
      'Multi-domain support with per-domain chatbot configuration',
      'OpenAI GPT-4 powered responses with custom training via help desk Q&A',
      'Stripe payment integration with three-tier subscription model',
      'Clerk authentication with role-based access control',
      'Pusher-powered real-time messaging infrastructure',
      'Neon serverless PostgreSQL with Prisma ORM',
    ],
  },
]

export default function ChangelogPage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border">
        <div className="container mx-auto px-6 py-6 flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={14} />
            Back
          </Link>
          <span className="text-border">|</span>
          <span className="text-sm text-muted-foreground">Changelog</span>
        </div>
      </div>

      <div className="container mx-auto px-6 py-16 max-w-3xl">
        {/* Title */}
        <div className="mb-16">
          <h1 className="font-display font-bold text-4xl md:text-5xl text-foreground mb-4">
            Changelog
          </h1>
          <p className="text-muted-foreground text-lg">
            Every update to Domainly AI, documented. New features, fixes, and improvements.
          </p>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-0 top-0 bottom-0 w-px bg-border" />

          <div className="flex flex-col gap-16 pl-8">
            {releases.map((release) => (
              <div key={release.version} className="relative">
                {/* Timeline dot */}
                <div className="absolute -left-[2.125rem] top-1.5 w-3 h-3 rounded-full bg-primary border-2 border-background" />

                {/* Release header */}
                <div className="flex items-center gap-3 mb-5">
                  <span className="font-display font-bold text-xl text-foreground">
                    v{release.version}
                  </span>
                  <span
                    className={`text-xs font-medium border px-2 py-0.5 rounded-full ${release.tagColor}`}
                  >
                    {release.tag}
                  </span>
                  <span className="text-sm text-muted-foreground ml-auto">
                    {release.date}
                  </span>
                </div>

                {/* Items */}
                <ul className="flex flex-col gap-2.5">
                  {release.items.map((item) => (
                    <li key={item} className="flex items-start gap-3 text-sm text-muted-foreground">
                      <span className="mt-2 w-1 h-1 rounded-full bg-primary/50 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
