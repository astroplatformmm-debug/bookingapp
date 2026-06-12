# Appointment Booking App — Setup & Deployment Guide

## Stack Overview

| Layer | Tech |
|-------|------|
| Frontend | Next.js 14 (App Router) + Tailwind CSS |
| Backend | Next.js API Routes (serverless) |
| Database | PostgreSQL via Prisma ORM |
| Payments | Razorpay |
| Email | Nodemailer (Gmail/SMTP) |
| Auth | JWT (httpOnly cookie) |
| Hosting | Vercel (app) + Neon/Supabase (DB) |

---

## STEP 1 — Clone & Install

```bash
git clone <your-repo>
cd booking-app
npm install
```

---

## STEP 2 — Set Up PostgreSQL Database

### Option A: Neon (Recommended — Free tier, serverless Postgres)
1. Go to https://neon.tech → Create account → New project
2. Copy the **Connection string** (it looks like `postgresql://user:pass@host/dbname?sslmode=require`)
3. Paste it as `DATABASE_URL` in your `.env.local`

### Option B: Supabase
1. Go to https://supabase.com → New project
2. Go to Settings → Database → Connection string (URI mode)
3. Replace `[YOUR-PASSWORD]` with your DB password

### Option C: Railway
1. Go to https://railway.app → New → Database → PostgreSQL
2. Copy the connection URL from the Variables tab

---

## STEP 3 — Razorpay Setup

1. Go to https://dashboard.razorpay.com → Sign up
2. Go to **Settings → API Keys → Generate Test Key**
3. You'll get `Key ID` and `Key Secret`
4. For production: complete KYC, then generate **Live keys**
5. Set both in `.env.local`:
   ```
   RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxx
   RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxx
   NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxx
   ```

---

## STEP 4 — Email (Gmail App Password)

1. Go to your Google Account → Security → **2-Step Verification** (enable it)
2. Go to Security → **App passwords** → Create new app password
3. Copy the 16-character password
4. Set in `.env.local`:
   ```
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=xxxx xxxx xxxx xxxx   # (the 16-char app password, spaces OK)
   EMAIL_FROM=Rahul Raj Astro <your-email@gmail.com>
   ```

---

## STEP 5 — Environment Variables

Create `.env.local` in the project root:

```bash
cp .env.example .env.local
# Then fill in all values
```

Generate JWT secret:
```bash
openssl rand -base64 32
# Copy output to JWT_SECRET
```

---

## STEP 6 — Database Setup

```bash
# Push schema to your database
npx prisma generate
npx prisma db push

# Seed with services, slots, and admin user
npm run db:seed
```

After seeding:
- **Admin login:** `admin@yourbusiness.com` / `admin123`
- **Change this immediately** in the admin dashboard or via:
  ```bash
  npx prisma studio
  # Navigate to Admin table → edit email/password
  ```

To generate a new bcrypt password hash:
```bash
node -e "const b = require('bcryptjs'); b.hash('yournewpassword', 12).then(console.log)"
```

---

## STEP 7 — Local Development

```bash
npm run dev
# Open http://localhost:3000
```

Test the full flow:
1. Visit http://localhost:3000 → Book Now
2. Select service → slot → fill details → pay with Razorpay test card
3. Test card: `4111 1111 1111 1111`, any future expiry, any CVV
4. Check http://localhost:3000/admin for the dashboard

---

## STEP 8 — Deploy to Vercel

### Via Vercel CLI (fastest):
```bash
npm install -g vercel
vercel login
vercel --prod
```

### Via GitHub (recommended for teams):
1. Push your code to a GitHub repository
2. Go to https://vercel.com → New Project → Import from GitHub
3. Select your repo → Framework: **Next.js** (auto-detected)
4. Click **Deploy** — Vercel handles the build

### Add Environment Variables on Vercel:
1. Go to your project → **Settings → Environment Variables**
2. Add ALL variables from `.env.local`:
   - `DATABASE_URL`
   - `RAZORPAY_KEY_ID`
   - `RAZORPAY_KEY_SECRET`
   - `NEXT_PUBLIC_RAZORPAY_KEY_ID`
   - `JWT_SECRET`
   - `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `EMAIL_FROM`
   - `NEXT_PUBLIC_BUSINESS_NAME`
   - `NEXT_PUBLIC_BUSINESS_PHONE`
   - `ADMIN_EMAIL`
   - `NEXT_PUBLIC_APP_URL` → set to your Vercel URL (e.g., `https://your-app.vercel.app`)

3. **Redeploy** after adding env vars

---

## STEP 9 — Custom Domain (Optional)

1. Vercel → Your Project → Settings → Domains
2. Add your domain (e.g., `book.rahulrajastro.com`)
3. Update your DNS: add a CNAME record pointing to `cname.vercel-dns.com`
4. Update `NEXT_PUBLIC_APP_URL` to your custom domain and redeploy

---

## STEP 10 — Go Live with Razorpay

1. Complete Razorpay KYC (takes 1–3 business days)
2. Replace test keys with **Live keys** in Vercel env vars
3. Change key prefix from `rzp_test_` to `rzp_live_`
4. Redeploy

---

## Customizing the App

### Change services & pricing
```bash
# Edit prisma/seed.ts — change name, description, price (in paise)
# ₹1100 = 110000 paise
npx prisma db push
npm run db:seed
```

Or use Prisma Studio:
```bash
npx prisma studio
# Visually edit the Service table
```

### Change business name/phone
Update in Vercel env vars:
- `NEXT_PUBLIC_BUSINESS_NAME`
- `NEXT_PUBLIC_BUSINESS_PHONE`

### Add more time slots
Use the Admin Dashboard → Manage Slots tab to add availability visually.

### Extend slot generation range
Edit `prisma/seed.ts` → change `i <= 14` to `i <= 30` for 30-day lookahead.

---

## Project Structure

```
src/
├── app/
│   ├── page.tsx                    # Landing page
│   ├── book/page.tsx               # 4-step booking flow
│   ├── confirm/[id]/page.tsx       # Confirmation page
│   ├── admin/
│   │   ├── page.tsx                # Admin login
│   │   └── dashboard/page.tsx      # Admin dashboard
│   └── api/
│       ├── services/route.ts        # GET services
│       ├── slots/route.ts           # GET available slots
│       ├── bookings/[id]/route.ts   # GET single booking
│       ├── payments/
│       │   ├── create-order/route.ts  # POST → Razorpay order
│       │   └── verify/route.ts        # POST → verify + confirm
│       └── admin/
│           ├── login/route.ts
│           ├── logout/route.ts
│           ├── bookings/route.ts
│           ├── bookings/[id]/route.ts
│           ├── stats/route.ts
│           └── slots/route.ts
├── lib/
│   ├── prisma.ts       # DB client singleton
│   ├── auth.ts         # JWT utilities
│   ├── email.ts        # Nodemailer email sender
│   ├── razorpay.ts     # Payment verification
│   └── utils.ts        # Formatting helpers
├── types/index.ts      # Shared TypeScript types
└── middleware.ts        # Admin route protection
```

---

## Security Notes

- Payments are verified server-side using Razorpay HMAC signature — never trust client-side payment status
- Admin routes are protected by httpOnly JWT cookies (no XSS access)
- Slot booking uses a DB transaction to prevent double-booking
- Never expose `RAZORPAY_KEY_SECRET` or `JWT_SECRET` client-side
- All API routes validate input before DB operations

---

## Common Issues

| Problem | Fix |
|---------|-----|
| `DATABASE_URL` error on Vercel | Check env vars are added in Vercel dashboard, then redeploy |
| Razorpay popup blocked | Must call `rzp.open()` in a direct user click handler |
| Emails not sending | Check Gmail has 2FA + App Password, not your regular password |
| "Slot already booked" | Expected — another user booked it first. Refresh and pick another |
| `prisma generate` failing | Run `npm install` first, then `npx prisma generate` |

---

## Generating Slots Automatically (Cron Job)

To auto-generate new slots weekly, add a cron API route and use Vercel Cron:

```json
// vercel.json
{
  "crons": [
    {
      "path": "/api/cron/generate-slots",
      "schedule": "0 9 * * MON"
    }
  ]
}
```

Then create `/api/cron/generate-slots/route.ts` that programmatically creates slots for the coming 2 weeks.
