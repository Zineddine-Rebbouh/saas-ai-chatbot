# Domainly AI

**AI-powered email marketing chatbot for businesses.**  
Every conversation becomes a customer.

---

## What is Domainly AI?

Domainly AI is a full-stack SaaS application that embeds an AI chatbot on any website, captures lead information naturally through conversation, and automatically fires targeted email marketing campaigns — all without a single form field.

Built with the modern SaaS stack: Next.js 14, Prisma, Neon, Clerk, Stripe, and Pusher.

---

## Features

- **AI Chat Engine** — OpenAI GPT-4 powered conversations that qualify leads and capture contact info naturally
- **Multi-Domain Support** — Manage multiple websites from a single dashboard
- **Email Marketing** — Segment captured leads and fire campaigns directly from the dashboard
- **Real-Time Takeover** — Switch any AI conversation to human support instantly (Pusher-powered)
- **Appointment Booking** — Let the AI schedule meetings. Customers pick a slot, you just show up.
- **Stripe Billing** — Three-tier subscription model (Standard / Plus / Ultimate) with checkout and webhooks
- **Clerk Auth** — Full authentication with role-based access
- **Chatbot Customization** — Theme, welcome message, help desk Q&A, and filter questions per domain

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Database | PostgreSQL via Neon (serverless) |
| ORM | Prisma |
| Auth | Clerk |
| Payments | Stripe |
| Real-time | Pusher |
| AI | OpenAI GPT-4 |
| Styling | Tailwind CSS |
| Email | Nodemailer |
| File uploads | Uploadcare |
| UI Components | Radix UI + shadcn/ui |

---

## Getting Started

### Prerequisites

- Node.js 18+
- A Neon database
- Clerk account
- Stripe account
- Pusher account
- OpenAI API key

### Setup

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Fill in your environment variables (see .env.example for all required keys)

# Push Prisma schema to your database
npx prisma db push

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

---

## Environment Variables

See `.env.example` for the full list of required environment variables. Key integrations:

- `DATABASE_URL` — Neon PostgreSQL connection string
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` / `CLERK_SECRET_KEY` — Clerk auth
- `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` — Stripe payments
- `NEXT_PUBLIC_PUSHER_*` / `PUSHER_*` — Pusher real-time
- `OPENAI_API_KEY` — OpenAI GPT-4

---

## Deployment

### Vercel (recommended)

1. Push to GitHub
2. Import to Vercel
3. Add all environment variables from `.env.example`
4. Deploy

### Post-deployment checklist

- [ ] Update Clerk allowed redirect URLs in Clerk dashboard
- [ ] Add Vercel deployment URL to Clerk allowed origins
- [ ] Update Stripe webhook endpoint URL to `https://yourdomain.com/api/stripe`
- [ ] Test Stripe webhook with `stripe trigger payment_intent.succeeded`
- [ ] Verify Pusher app credentials match production environment

---

## Architecture

```
src/
├── app/
│   ├── (dashboard)/      # Authenticated dashboard routes
│   ├── api/              # API routes (Stripe webhooks, health check)
│   ├── auth/             # Clerk auth pages
│   ├── blogs/            # Public blog
│   ├── changelog/        # Product changelog
│   ├── chatbot/          # Embeddable chatbot widget
│   └── portal/           # Customer-facing portal
├── actions/              # Next.js Server Actions
├── components/           # React components
├── constants/            # App-wide constants
├── context/              # React context providers
├── hooks/                # Custom React hooks
├── lib/                  # Utilities (Prisma client, utils)
└── schemas/              # Zod validation schemas
```

---

## License

MIT — see [LICENSE](LICENSE)