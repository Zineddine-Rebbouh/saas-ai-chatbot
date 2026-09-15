'use client'
import * as React from 'react'
import Link from 'next/link'
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs'
import { ArrowRight, Menu, X } from 'lucide-react'
import Logo from '@/icons/logo'
import { cn } from '@/lib/utils'

const LINKS = [
  { href: '#features', label: 'Features' },
  { href: '#pricing', label: 'Pricing' },
  { href: '/blogs', label: 'Blog' },
  { href: '/changelog', label: 'Changelog' },
]

function NavBar() {
  const [open, setOpen] = React.useState(false)
  const [scrolled, setScrolled] = React.useState(false)

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // ponytail: single Escape/resize effect, no focus-trap lib needed for 4-link menu
  React.useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    const onResize = () => window.innerWidth >= 1024 && setOpen(false)
    window.addEventListener('keydown', onKey)
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('resize', onResize)
    }
  }, [open])

  return (
    <nav
      className={cn(
        'sticky top-0 z-50 overflow-x-clip backdrop-blur-md transition-all duration-200',
        scrolled || open
          ? 'border-b border-border/60 bg-background/85 shadow-[0_8px_30px_-12px_hsl(var(--foreground)/0.15)]'
          : 'border-b border-transparent bg-background/60'
      )}
    >
      {/* 3 equal columns = logo left, links truly centered, CTA right — even spacing at any width */}
      <div className="mx-auto grid h-16 max-w-6xl grid-cols-[1fr_auto_1fr] items-center px-4 sm:px-6">
        <Link href="/" className="flex items-center justify-self-start" aria-label="Domainly AI home">
          <Logo width={140} height={28} />
        </Link>

        {/* Desktop links — pill group (lg+ only: at md widths logo+links+CTA overflow → horizontal scrollbar) */}
        <ul className="hidden items-center justify-self-center gap-1 rounded-full border border-border/60 bg-muted/40 p-1 text-sm lg:flex">
          {LINKS.map((link) => (
            <li key={link.label}>
              <Link
                href={link.href}
                className="rounded-full px-4 py-1.5 text-muted-foreground transition-colors duration-150 hover:bg-background hover:text-foreground hover:shadow-sm"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center justify-self-end gap-3">
          <SignedOut>
            <Link
              href="/auth/sign-in"
              className="hidden px-2 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground lg:block"
            >
              Sign in
            </Link>
            <Link
              href="/auth/sign-up"
              className="group inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm shadow-primary/20 transition-all duration-150 hover:bg-primary/90 hover:shadow-md hover:shadow-primary/25"
            >
              Start free
              <ArrowRight size={15} className="transition-transform duration-150 group-hover:translate-x-0.5" />
            </Link>
          </SignedOut>
          <SignedIn>
            <Link
              href="/dashboard"
              className="hidden items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm shadow-primary/20 transition-all duration-150 hover:bg-primary/90 sm:inline-flex"
            >
              Dashboard
              <ArrowRight size={15} />
            </Link>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
          <button
            className="flex min-h-10 min-w-10 items-center justify-center rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground lg:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            aria-controls="mobile-nav"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div id="mobile-nav" className="border-t border-border/60 bg-background/95 backdrop-blur-md animate-fade-in lg:hidden">
          <ul className="mx-auto max-w-6xl space-y-1 px-4 py-4 text-[15px] sm:px-6">
            {LINKS.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-3 py-2.5 font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <SignedOut>
              <li className="pt-2">
                <Link
                  href="/auth/sign-up"
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-center gap-1.5 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground"
                >
                  Start free
                  <ArrowRight size={15} />
                </Link>
              </li>
              <li>
                <Link
                  href="/auth/sign-in"
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-3 py-2.5 text-center font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  Sign in
                </Link>
              </li>
            </SignedOut>
            <SignedIn>
              <li className="pt-2 sm:hidden">
                <Link
                  href="/dashboard"
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-center gap-1.5 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground"
                >
                  Dashboard
                  <ArrowRight size={15} />
                </Link>
              </li>
            </SignedIn>
          </ul>
        </div>
      )}
    </nav>
  )
}

export default NavBar

