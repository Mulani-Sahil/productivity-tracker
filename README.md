# Productivity Tracker

A full-stack productivity dashboard with email/password auth, synced across all your devices.

---

## Tech Stack
- **Next.js 14** (App Router)
- **NextAuth.js** — email + password authentication
- **Prisma** — database ORM
- **PostgreSQL** — via Neon (free tier, works with Vercel)
- **Tailwind CSS** — styling
- **Vercel** — deployment

---

## Deploy to Vercel (Step by Step)

### Step 1 — Get a free PostgreSQL database (Neon)

1. Go to **https://neon.tech** and sign up for free
2. Create a new project (any name, e.g. "productivity-tracker")
3. Copy the **Connection string** — it looks like:
   `postgresql://user:password@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require`

### Step 2 — Push this project to GitHub

1. Create a new repo at **https://github.com/new** (name it "productivity-tracker")
2. In your terminal, run:
   ```bash
   git init
   git add .
   git commit -m "initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/productivity-tracker.git
   git push -u origin main
   ```

### Step 3 — Deploy on Vercel

1. Go to **https://vercel.com** and sign in with GitHub
2. Click **Add New → Project**
3. Import your `productivity-tracker` GitHub repo
4. In the **Environment Variables** section, add these three:

   | Key | Value |
   |-----|-------|
   | `DATABASE_URL` | Your Neon connection string from Step 1 |
   | `NEXTAUTH_SECRET` | Any random 32-char string (generate at https://generate-secret.vercel.app/32) |
   | `NEXTAUTH_URL` | `https://your-app-name.vercel.app` (use your actual Vercel URL after deploy) |

5. Click **Deploy**

### Step 4 — Run database migrations

After the first deploy, open Vercel → your project → **Settings → Functions** and note your URL.

Then run this locally (with your DATABASE_URL set in `.env.local`):
```bash
npm install
npx prisma db push
```

Or connect to Neon's SQL editor and run the migration directly.

### Step 5 — Done!

Visit your Vercel URL, register an account, and start tracking.
Your data is synced — log in from your phone or laptop with the same email.

---

## Local Development

```bash
# 1. Clone the repo
git clone https://github.com/YOUR_USERNAME/productivity-tracker.git
cd productivity-tracker

# 2. Install dependencies
npm install

# 3. Set up environment
cp .env.example .env.local
# Edit .env.local with your actual values

# 4. Push database schema
npx prisma db push

# 5. Start dev server
npm run dev
```

Open http://localhost:3000

---

## Features

- **Email + password auth** — register once, access from any device
- **Today tab** — live clock, schedule with tap-to-complete blocks, auto-highlights current time slot
- **Tasks** — add/complete/delete tasks tagged by project
- **Hours log** — log 30-min sessions per project, progress bars vs daily goals
- **Weekly** — weekly hour summary and rhythm reference
- **Motivation** — rotating mantras + priority reminders
- **Fully synced** — all data stored in PostgreSQL, accessible from phone and laptop

---

## Projects & Goals

| Project | Daily goal |
|---------|-----------|
| GraphMind | 5+ hours |
| CRM Documentation | 2+ hours |
| Azure AI Certification | 2 hours |
| n8n Automation | 1.5 hours |
