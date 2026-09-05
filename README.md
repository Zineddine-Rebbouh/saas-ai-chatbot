
<div align="center">

# 🤖 Corinna AI — SaaS AI Chatbot Platform

A multi-tenant SaaS platform that lets businesses spin up an AI-powered sales & support chatbot for their website, complete with lead capture, live handoff, appointment booking, checkout, and email marketing.

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5-2D3748?logo=prisma)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-336791?logo=postgresql)](https://www.postgresql.org/)
[![Clerk](https://img.shields.io/badge/Auth-Clerk-6C47FF)](https://clerk.com/)
[![Stripe](https://img.shields.io/badge/Payments-Stripe-635BFF?logo=stripe)](https://stripe.com/)
[![OpenAI](https://img.shields.io/badge/AI-OpenAI-412991?logo=openai)](https://openai.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](#license)

</div>

---

## 📖 Overview

**Corinna AI** is a Next.js 14 SaaS application that gives businesses an embeddable AI chatbot for their domain. Each customer ("user") can register one or more **domains**, customize a chatbot for each, and let the bot:

- Greet visitors and capture their email
- Ask a configurable list of qualifying questions
- Answer help-desk style FAQs
- Hand off to a **live human agent** in real time when the conversation needs it
- Book appointments
- Sell products through a Stripe-powered checkout
- Notify the business owner by email when a customer needs a real person

It's built as a real-world, production-shaped SaaS: authentication & billing plans, a Postgres data model via Prisma, real-time messaging via Pusher, transactional email via Nodemailer, and a component-driven dashboard UI built with shadcn/ui + Radix + Tailwind CSS.

---

## ✨ Key Features

| Area | Description |
|---|---|
| 🔐 **Authentication** | Clerk-based sign-up/sign-in, protected dashboard routes via middleware |
| 🌐 **Multi-domain / multi-tenant** | Each user can register multiple domains, each with its own chatbot, help desk, and customers |
| 🤖 **AI Chatbot** | OpenAI (GPT) powered conversational agent that qualifies leads, answers FAQs, and redirects to booking/checkout links |
| 🧑‍💻 **Live Chat Handoff** | Conversations can escalate from bot to a real-time human operator via Pusher channels |
| 📅 **Appointments** | Customers can book time slots directly from the chat |
| 🛒 **Checkout / Payments** | Stripe Connect integration lets each business accept payments for products sold via the bot |
| 📧 **Email Marketing** | Campaign creation and customer email templates |
| 🎨 **Chatbot customization** | Configurable welcome message, icon, background, and text color per domain |
| 📊 **Dashboard** | Conversations inbox, appointment calendar, integrations, and account settings |
| 💳 **Subscription Plans** | `STANDARD`, `PRO`, `ULTIMATE` billing plans that gate the number of domains a user can connect |
| 🌗 **Theming** | Light/dark mode via `next-themes` |
| 📎 **File uploads** | Uploadcare-powered image/icon uploads |

---

## 🏗️ Tech Stack

**Framework & Language**
- [Next.js 14](https://nextjs.org/) (App Router, Server Actions)
- [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)

**Database & ORM**
- [PostgreSQL](https://www.postgresql.org/)
- [Prisma ORM](https://www.prisma.io/)

**Auth & Payments**
- [Clerk](https://clerk.com/) — authentication & user management
- [Stripe](https://stripe.com/) (`stripe`, `@stripe/stripe-js`, `@stripe/react-stripe-js`) — payments & Stripe Connect

**AI & Realtime**
- [OpenAI SDK](https://www.npmjs.com/package/openai) — chatbot conversation engine
- [Pusher](https://pusher.com/) (`pusher`, `pusher-js`) — real-time chat/live handoff

**UI**
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/) + [Radix UI](https://www.radix-ui.com/) primitives
- [Lucide Icons](https://lucide.dev/)
- [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) for form validation
- [Embla Carousel](https://www.embla-carousel.com/), [Sonner](https://sonner.emilkowal.ski/) (toasts), [Vaul](https://vaul.emilkowal.ski/) (drawers)

**Other integrations**
- [Nodemailer](https://nodemailer.com/) — transactional email notifications
- [Uploadcare](https://uploadcare.com/) — file/image uploads
- [date-fns](https://date-fns.org/) / [react-day-picker](https://react-day-picker.js.org/) — scheduling utilities

---

## 🗂️ Project Structure

```
saas-ai-chatbot/
├── prisma/
│   └── schema.prisma          # Data model (User, Domain, ChatBot, Customer, ChatRoom, Bookings, Campaign, etc.)
├── public/                    # Static assets & images
├── src/
│   ├── actions/                # Server actions (business logic)
│   │   ├── auth/                # Sign-up / sign-in helpers
│   │   ├── bot/                 # AI chatbot conversation engine
│   │   ├── conversation/        # Realtime conversation (Pusher) logic
│   │   ├── dashboard/           # Dashboard data fetching
│   │   ├── landing/              # Landing page content
│   │   ├── mail / mailer/        # Email marketing & notification emails
│   │   ├── payments/             # Stripe checkout / product logic
│   │   ├── settings/             # Domain & chatbot settings
│   │   ├── stripe/               # Stripe Connect account logic
│   │   └── appointment/          # Booking logic
│   ├── app/
│   │   ├── (dashboard)/          # Authenticated dashboard routes
│   │   │   ├── dashboard/          # Overview
│   │   │   ├── conversation/       # Inbox / live chat
│   │   │   ├── appointment/        # Appointment calendar
│   │   │   ├── email-marketing/    # Campaigns
│   │   │   ├── integration/        # Third-party integrations
│   │   │   └── settings/           # Domain & billing settings
│   │   ├── api/stripe/           # Stripe Connect API route
│   │   ├── auth/                 # Sign-in / sign-up pages
│   │   ├── blogs/                # Marketing blog pages
│   │   ├── chatbot/               # Standalone embeddable chatbot widget
│   │   ├── portal/[domainid]/     # Public customer-facing portal (appointments, payments)
│   │   └── page.tsx               # Landing page
│   ├── components/               # UI building blocks (dashboard, chatbot, forms, tables, etc.)
│   ├── constants/                 # Static config/data
│   ├── context/                   # React context providers (e.g. theme)
│   ├── hooks/                      # Custom React hooks
│   ├── lib/                        # Prisma client, utils
│   ├── schemas/                    # Zod validation schemas
│   └── middleware.ts               # Clerk route protection
├── package.json
└── tailwind.config.ts
```

---

## 🧬 Data Model

The Prisma schema (`prisma/schema.prisma`) models a multi-tenant chatbot SaaS:

- **User** — the business owner; has a Clerk ID, subscription (`Billings`), domains, and campaigns.
- **Domain** — a website/business registered by a user; owns a `ChatBot`, `HelpDesk` entries, `FilterQuestions`, `Product`s, and `Customer`s.
- **ChatBot** — per-domain bot configuration (welcome message, icon, colors, live-help toggle).
- **Customer** — an end visitor who chatted with a domain's bot; has `CustomerResponses`, `ChatRoom`s, and `Bookings`.
- **ChatRoom / ChatMessage** — conversation threads and messages, with a `live` flag for human handoff.
- **Bookings** — appointment slots booked by customers.
- **Campaign** — email marketing campaigns tied to a user and set of domains.
- **Product** — items sold through a domain's chatbot checkout flow.
- **Billings** — subscription plan (`STANDARD` / `PRO` / `ULTIMATE`) and remaining credits.

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **PostgreSQL** database (local or hosted, e.g. Supabase/Neon/Railway)
- Accounts/API keys for: **Clerk**, **OpenAI**, **Stripe**, **Pusher**, **Uploadcare**, and an SMTP-capable email account (e.g. Gmail app password)

### 1. Clone the repository

```bash
git clone https://github.com/Zineddine-Rebbouh/saas-ai-chatbot.git
cd saas-ai-chatbot
```

### 2. Install dependencies

```bash
npm install
# or
bun install
```

### 3. Configure environment variables

Create a `.env` file in the project root:

```bash
# Database
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DBNAME"

# Clerk (Authentication)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/auth/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/auth/sign-up

# OpenAI
OPEN_AI_KEY=

# Stripe
STRIPE_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISH_KEY=

# Pusher (Realtime)
NEXT_PUBLIC_PUSHER_APP_ID=
NEXT_PUBLIC_PUSHER_APP_KEY=
NEXT_PUBLIC_PUSHER_APP_SECRET=
NEXT_PUBLIC_PUSHER_APP_CLUSTOR=

# Uploadcare
NEXT_PUBLIC_UPLOAD_CARE_PUBLIC_KEY=

# Email notifications (Nodemailer / Gmail SMTP)
NODE_MAILER_EMAIL=
NODE_MAILER_GMAIL_APP_PASSWORD=
```

> ⚠️ Double-check the exact Clerk env var names required by your installed `@clerk/nextjs` version, and make sure your OpenAI/Stripe/Pusher/Uploadcare keys correspond to the correct environment (test vs. live).

### 4. Set up the database

```bash
npx prisma generate
npx prisma migrate dev --name init
```

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

---

## 🧭 Core Flows

### Business owner flow
1. Sign up / sign in via Clerk.
2. Register a domain from the dashboard (gated by subscription plan limits).
3. Customize the chatbot (welcome message, colors, icon).
4. Add help-desk Q&As, filter/qualifying questions, and products.
5. Monitor conversations, respond in real time when escalated, and manage bookings & campaigns.

### End-customer flow
1. Visitor lands on the business's site and opens the embedded chatbot.
2. The AI bot greets them, collects their email, and asks qualifying questions.
3. Depending on intent, the bot can:
   - Continue answering FAQs / qualifying,
   - Hand off to a live human agent (via Pusher) if the conversation goes out of scope,
   - Provide an appointment booking link,
   - Provide a checkout link to purchase a product via Stripe.

---

## 📜 Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` | Build the app for production |
| `npm run start` | Start the production server |
| `npm run lint` | Run ESLint |

---

## 🗺️ Roadmap Ideas

- [ ] Automated tests (unit/e2e)
- [ ] Multi-language chatbot support
- [ ] Analytics dashboard for conversation/lead metrics
- [ ] Webhook-based Stripe event handling
- [ ] Dockerized deployment setup

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

1. Fork the project
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License — feel free to use it as a learning resource or a base for your own SaaS.

---

## 👤 Author

**Zineddine Rebbouh**
GitHub: [@Zineddine-Rebbouh](https://github.com/Zineddine-Rebbouh)

</div>
