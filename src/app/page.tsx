import { onGetBlogPosts } from '@/actions/landing'
import NavBar from '@/components/navbar'
import { pricingCards } from '@/constants/landing-page'
import Logo from '@/icons/logo'
import clsx from 'clsx'
import {
  ArrowRight,
  Check,
  Zap,
  Mail,
  MessageSquare,
  TrendingUp,
  Shield,
  Clock,
  ChevronRight,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { getMonthName } from '@/lib/utils'

const features = [
  {
    icon: <MessageSquare size={20} className="text-primary" />,
    title: 'AI Chat That Converts',
    description:
      'Your chatbot understands intent, captures contact info, and qualifies leads — without a single form field.',
  },
  {
    icon: <Mail size={20} className="text-primary" />,
    title: 'Automated Email Campaigns',
    description:
      'Turn every conversation into a campaign. Send targeted emails triggered by what customers actually said.',
  },
  {
    icon: <TrendingUp size={20} className="text-primary" />,
    title: 'Real-Time Analytics',
    description:
      'See every conversation, every lead captured, every email opened — in a dashboard built for clarity.',
  },
  {
    icon: <Zap size={20} className="text-primary" />,
    title: 'Two-Minute Embed',
    description:
      'One script tag. Any website. Domainly AI is live on your site before your coffee gets cold.',
  },
  {
    icon: <Shield size={20} className="text-primary" />,
    title: 'Live Takeover Mode',
    description:
      'Spot a hot lead? Take over the conversation in real-time with a single toggle. Pusher-powered, instant.',
  },
  {
    icon: <Clock size={20} className="text-primary" />,
    title: 'Appointment Booking',
    description:
      'Let the AI book meetings directly from chat. Customers pick a slot. You just show up.',
  },
]

const stats = [
  { value: '2 min', label: 'to deploy on any site' },
  { value: '3×', label: 'more leads than forms' },
  { value: '500+', label: 'emails per campaign' },
  { value: '99.9%', label: 'uptime SLA' },
]

export default async function Home() {
  const posts:
    | {
        id: string
        title: string
        image: string
        content: string
        createdAt: Date
      }[]
    | undefined = await onGetBlogPosts()

  return (
    <main className="min-h-screen bg-background">
      <NavBar />

      {/* ── Hero ──────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-24 pb-32">
        {/* Background radial glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,_hsl(14_78%_57%_/_0.15)_0%,_transparent_60%)] pointer-events-none" />

        <div className="container mx-auto px-6 text-center relative z-10">
          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary text-xs font-medium px-4 py-2 rounded-full mb-8 animate-fade-in">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            AI-powered email marketing for businesses
          </div>

          {/* Headline */}
          <h1 className="font-display font-bold text-5xl md:text-6xl lg:text-7xl text-foreground leading-[1.08] tracking-tight mb-6 animate-slide-up">
            Every conversation
            <br />
            <span className="text-gradient-ember">becomes a customer.</span>
          </h1>

          {/* Subheading */}
          <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed animate-slide-up">
            Embed Domainly AI on any website in minutes. Your AI captures leads,
            qualifies prospects, and fires off targeted email campaigns —
            automatically, while you focus on what matters.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up">
            <Link
              href="/auth/sign-up"
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6 py-3 rounded-xl transition-all duration-150 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/20 text-base"
            >
              Start for free
              <ArrowRight size={16} />
            </Link>
            <Link
              href="#pricing"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground text-base transition-colors duration-150"
            >
              See pricing
              <ChevronRight size={16} />
            </Link>
          </div>

          {/* Social proof */}
          <p className="mt-8 text-xs text-muted-foreground animate-fade-in">
            No credit card required · Deploy in 2 minutes · Cancel anytime
          </p>
        </div>
      </section>

      {/* ── Stats bar ─────────────────────────────────────────── */}
      <section className="border-y border-border bg-card/50">
        <div className="container mx-auto px-6 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="font-display font-bold text-3xl text-primary mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────────── */}
      <section id="features" className="py-24">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-display font-bold text-4xl md:text-5xl text-foreground mb-4">
              Everything you need to{' '}
              <span className="text-primary">close more deals</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Domainly AI isn&apos;t just a chatbot. It&apos;s your full-stack email
              marketing engine, powered by AI.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group bg-card border border-border rounded-2xl p-6 hover:border-primary/30 hover:bg-card/80 transition-all duration-200 hover:-translate-y-1"
              >
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary/15 transition-colors duration-200">
                  {feature.icon}
                </div>
                <h3 className="font-display font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ───────────────────────────────────────────── */}
      <section id="pricing" className="py-24 bg-card/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-display font-bold text-4xl md:text-5xl text-foreground mb-4">
              Simple, honest pricing
            </h2>
            <p className="text-muted-foreground text-lg max-w-lg mx-auto">
              Start free. Scale when you&apos;re ready. No surprises, no hidden fees.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-6 max-w-5xl mx-auto">
            {pricingCards.map((card) => {
              const isHighlighted = card.title === 'Ultimate'
              return (
                <div
                  key={card.title}
                  className={clsx(
                    'relative flex flex-col w-[300px] bg-card border rounded-2xl p-6 transition-all duration-200',
                    isHighlighted
                      ? 'border-primary shadow-xl shadow-primary/10 scale-105'
                      : 'border-border hover:border-border/80'
                  )}
                >
                  {isHighlighted && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                        Most Popular
                      </span>
                    </div>
                  )}

                  <div className="mb-4">
                    <h3
                      className={clsx(
                        'font-display font-bold text-lg mb-1',
                        isHighlighted ? 'text-primary' : 'text-foreground'
                      )}
                    >
                      {card.title}
                    </h3>
                    <p className="text-muted-foreground text-sm">{card.description}</p>
                  </div>

                  <div className="mb-6">
                    <span className="font-display font-bold text-4xl text-foreground">
                      {card.price}
                    </span>
                    {card.duration && (
                      <span className="text-muted-foreground text-sm ml-1">
                        / {card.duration}
                      </span>
                    )}
                  </div>

                  <ul className="flex flex-col gap-3 mb-8 flex-1">
                    {card.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="w-4 h-4 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0">
                          <Check size={10} className="text-primary" />
                        </div>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <Link
                    href={`/dashboard?plan=${card.title}`}
                    className={clsx(
                      'w-full text-center text-sm font-semibold py-3 rounded-xl transition-all duration-150',
                      isHighlighted
                        ? 'bg-primary text-primary-foreground hover:bg-primary/90 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/20'
                        : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                    )}
                  >
                    Get started
                  </Link>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ────────────────────────────────────────── */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="relative bg-card border border-border rounded-3xl p-12 md:p-16 text-center overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_80%_at_50%_50%,_hsl(14_78%_57%_/_0.08)_0%,_transparent_70%)] pointer-events-none" />
            <div className="relative z-10">
              <h2 className="font-display font-bold text-4xl md:text-5xl text-foreground mb-4">
                Start converting visitors{' '}
                <span className="text-primary">today</span>
              </h2>
              <p className="text-muted-foreground text-lg max-w-lg mx-auto mb-8">
                Join businesses already using Domainly AI to turn every website
                conversation into a qualified lead.
              </p>
              <Link
                href="/auth/sign-up"
                className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 py-4 rounded-xl transition-all duration-150 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/25 text-base"
              >
                Get started free
                <ArrowRight size={18} />
              </Link>
              <p className="mt-4 text-xs text-muted-foreground">
                No credit card required
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Blog / News Room ──────────────────────────────────── */}
      {posts && posts.length > 0 && (
        <section className="py-24 border-t border-border">
          <div className="container mx-auto px-6">
            <div className="flex items-end justify-between mb-12">
              <div>
                <h2 className="font-display font-bold text-3xl text-foreground mb-2">
                  From the blog
                </h2>
                <p className="text-muted-foreground">
                  Insights on AI, marketing, and growing your business.
                </p>
              </div>
              <Link
                href="/blogs"
                className="hidden md:inline-flex items-center gap-1 text-sm text-primary hover:text-primary/80 transition-colors"
              >
                View all
                <ChevronRight size={14} />
              </Link>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {posts.map((post) => (
                <Link
                  href={`/blogs/${post.id}`}
                  key={post.id}
                  className="group"
                >
                  <article className="bg-card border border-border rounded-2xl overflow-hidden hover:border-border/80 transition-all duration-200 hover:-translate-y-1 h-full flex flex-col">
                    <div className="relative w-full aspect-video overflow-hidden">
                      <Image
                        src={
                          post.image.startsWith('/')
                            ? post.image
                            : `${process.env.CLOUDWAYS_UPLOADS_URL}${post.image}`
                        }
                        alt={post.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-6 flex flex-col gap-3 flex-1">
                      <p className="text-xs text-muted-foreground">
                        {getMonthName(post.createdAt.getMonth())}{' '}
                        {post.createdAt.getDate()}, {post.createdAt.getFullYear()}
                      </p>
                      <h3 className="font-display font-semibold text-foreground group-hover:text-primary transition-colors duration-150">
                        {post.title}
                      </h3>
                      <div className="text-sm text-muted-foreground line-clamp-2">
                        {post.content
                          .replace(/<[^>]*>/g, ' ')
                          .replace(/\s+/g, ' ')
                          .trim()
                          .slice(0, 120)}
                        ...
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Footer ────────────────────────────────────────────── */}
      <footer className="border-t border-border py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Logo */}
            <Logo width={120} height={22} />

            <p className="text-sm text-muted-foreground text-center">
              © {new Date().getFullYear()} Domainly AI. All rights reserved.
            </p>

            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link href="#" className="hover:text-foreground transition-colors">Privacy</Link>
              <Link href="#" className="hover:text-foreground transition-colors">Terms</Link>
              <Link href="#" className="hover:text-foreground transition-colors">Contact</Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}
