import type { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import { Plus_Jakarta_Sans, Outfit } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'
import { ThemeProvider } from '@/context/them-provider'

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
})

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Domainly AI — AI Email Marketing Chatbot',
    template: '%s | Domainly AI',
  },
  description:
    'Domainly AI turns every website visitor into a qualified lead. Embed an AI-powered chatbot, capture emails, and run automated campaigns — all from one dashboard.',
  keywords: ['AI chatbot', 'email marketing', 'lead capture', 'sales automation', 'SaaS'],
  authors: [{ name: 'Domainly AI' }],
  creator: 'Domainly AI',
  metadataBase: new URL('https://domainly.ai'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://domainly.ai',
    title: 'Domainly AI — AI Email Marketing Chatbot',
    description: 'Every conversation becomes a customer. Embed Domainly AI on any website in minutes.',
    siteName: 'Domainly AI',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Domainly AI — AI Email Marketing Chatbot',
    description: 'Every conversation becomes a customer.',
    creator: '@domainlyai',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider>
      <html
        lang="en"
        className={`${outfit.variable} ${jakarta.variable}`}
        suppressHydrationWarning
      >
        <body className={jakarta.className}>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem={false}
            disableTransitionOnChange
          >
            {children}
            <Toaster />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}

