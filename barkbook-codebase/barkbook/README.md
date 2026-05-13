# BarkBook

**Simple business management for dog groomers.**

BarkBook is an all-in-one web app for independent dog groomers to manage customers, appointments, quotes, invoices, and payments — without the paper diaries or WhatsApp chaos.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-repo/barkbook)

---

## Features

### 🐾 Customer & Pet Management
Keep detailed profiles for every furry client. Store grooming notes, allergies, temperament, and contact details so you're always prepared.

### 📅 Effortless Scheduling
A clean, mobile-first calendar that lets you book appointments in seconds. See your week at a glance and never double-book again.

### 📝 Professional Quotes
Send branded PDF quotes via WhatsApp or email. Convert accepted quotes into appointments with a single click.

### 💰 Invoicing & Payments
Generate professional invoices immediately after a groom. Track paid, unpaid, and overdue invoices. Send PDF receipts directly to your clients.

### 📊 Dashboard
Get an instant overview of today's appointments, weekly/monthly revenue, outstanding invoices, and pending quotes — all on one screen.

---

## Quick Start

### 1. Clone the repository

```bash
git clone https://github.com/your-repo/barkbook.git
cd barkbook
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

If Supabase is not configured, the app runs in **demo mode** with sample data — no setup required to try it out.

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15 (React, TypeScript) |
| Styling | Tailwind CSS |
| Backend | Supabase (Auth + PostgreSQL) |
| PDF Generation | jsPDF |
| Payments | Stripe (optional, not yet wired) |

---

## Pricing

| Plan | Price | Description |
|------|-------|-------------|
| **Solo** | £49/mo | For independent, one-person grooming businesses. Unlimited customers, pets, appointments, and invoices. |
| **Salon** | £149/mo | For growing salons. Everything in Solo, plus multiple staff accounts (coming soon), advanced insights, and priority support. |

---

## Key Design Decisions

- **Mobile-first** — Large touch targets, explicit labels, no hover-dependent interactions
- **Clean & minimal** — No clunky menus; core actions are obvious without a tutorial
- **Demo mode** — Works out-of-the-box with sample data for instant exploration
- **PDF-first** — All quotes and invoices are exported as professional PDFs

---

## Project Structure

```
src/
├── app/
│   ├── (auth)/           # Login & Signup pages
│   ├── (dashboard)/       # Main app pages (dashboard, customers, calendar, quotes, invoices, settings)
│   ├── onboarding/       # 3-step onboarding wizard
│   └── page.tsx          # Landing page
└── lib/
    ├── data.ts           # Data access layer (mock + Supabase)
    ├── pdf.ts            # PDF generation utilities
    ├── supabase.ts       # Supabase client & types
    └── types.ts          # Shared TypeScript types
```

---

## Database Schema

Key tables: `profiles`, `customers`, `pets`, `jobs`, `quotes`, `quote_line_items`, `invoices`, `invoice_line_items`. Row Level Security (RLS) policies ensure users only see their own data.

See `supabase-schema.sql` for the full schema.

---

## License

Proprietary — All rights reserved.
