'use client'
import * as React from 'react'
import Link from 'next/link'
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs'
import { Menu, X } from 'lucide-react'
import Logo from '@/icons/logo'

const LINKS = [
  { href: '#features', label: 'Features' },
  { href: '#pricing', label: 'Pricing' },
  { href: '/blogs', label: 'Blog' },
  { href: '/changelog', label: 'Docs' },
]

function NavBar() {
  const [open, setOpen] = React.useState(false)

  return (
    <nav className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md relative">
      <div className="container mx-auto grid grid-cols-[1fr_auto_1fr] items-center h-16 px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group" aria-label="Domainly AI home">
          <Logo width={150} height={28} />
        </Link>

        {/* Nav Links - truly centered */}
        <ul className="hidden md:flex items-center justify-center gap-8 text-sm text-muted-foreground">
          {LINKS.map((link) => (
            <li key={link.label}>
              <Link
                href={link.href}
                className="hover:text-foreground transition-colors duration-150"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* CTA */}
        <div className="flex items-center justify-end gap-2 sm:gap-4">
          <SignedOut>
            <Link
              href="/auth/sign-in"
              className="hidden md:block text-sm text-muted-foreground hover:text-foreground transition-colors duration-150"
            >
              Sign in
            </Link>
            <Link
              href="/auth/sign-up"
              className="inline-flex items-center gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium px-4 py-2 rounded-lg transition-all duration-150 hover:-translate-y-px"
            >
              Start free
            </Link>
          </SignedOut>
          <SignedIn>
            <Link
              href="/dashboard"
              className="hidden sm:inline-flex items-center gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium px-4 py-2 rounded-lg transition-all duration-150 hover:-translate-y-px"
            >
              Dashboard
            </Link>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
          <button
            className="md:hidden p-2 -mr-2 text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu - mobile only, never on desktop */}
      {open && (
        <div className="md:hidden border-t border-border/50 bg-background/95 backdrop-blur-md">
          <ul className="container mx-auto px-6 py-4 flex flex-col gap-1 text-sm">
            {LINKS.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block py-2.5 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <SignedOut>
              <li>
                <Link
                  href="/auth/sign-in"
                  onClick={() => setOpen(false)}
                  className="block py-2.5 text-muted-foreground hover:text-foreground transition-colors"
                >
                  Sign in
                </Link>
              </li>
            </SignedOut>
            <SignedIn>
              <li className="sm:hidden">
                <Link
                  href="/dashboard"
                  onClick={() => setOpen(false)}
                  className="block py-2.5 text-muted-foreground hover:text-foreground transition-colors"
                >
                  Dashboard
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

