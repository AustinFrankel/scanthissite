# ScanThisSite

A modern website safety scanner that helps users check if a website is safe before they trust it. Built with Next.js, Supabase, Stripe, and OpenAI.

## Features

- **Website Safety Analysis**: Evaluate websites for scam risk, malware suspicion, and content trustworthiness
- **Three Subscription Tiers**: Essential (5 scans/month), Plus (10 scans/month), Pro (50 scans/month)
- **Live Website Preview**: View the target website in an embedded iframe
- **Scan History**: Track all your past scans
- **Shareable Reports**: Generate public links to share scan results
- **Secure Authentication**: Email/password and OAuth via Supabase Auth
- **Subscription Management**: Powered by Stripe Checkout and Billing Portal

## Tech Stack

- **Framework**: Next.js 14 with App Router and TypeScript
- **Database & Auth**: Supabase (PostgreSQL + Auth)
- **Payments**: Stripe
- **AI Analysis**: OpenAI GPT-4o
- **Styling**: Tailwind CSS
- **Deployment**: Vercel (recommended)

## Prerequisites

Before you begin, make sure you have:

- Node.js 18+ installed
- A Supabase account and project
- A Stripe account
- An OpenAI API key
- A Vercel account (for deployment)

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
git clone <your-repo-url>
cd scanthissite
npm install
```

### 2. Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to your project settings and copy:
   - Project URL (NEXT_PUBLIC_SUPABASE_URL)
   - Anon/Public Key (NEXT_PUBLIC_SUPABASE_ANON_KEY)
   - Service Role Key (SUPABASE_SERVICE_ROLE_KEY) - Keep this secret!

3. Run the database migration:
   - Go to the SQL Editor in your Supabase dashboard
   - Copy the contents of `supabase/migrations/001_initial_schema.sql`
   - Execute the SQL

4. Configure authentication providers:
   - Go to Authentication > Providers
   - Enable Email provider
   - (Optional) Enable Google OAuth for social login

### 3. Stripe Setup

1. Create a Stripe account at [stripe.com](https://stripe.com)
2. Get your API keys from the Developers section:
   - Publishable Key (NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
   - Secret Key (STRIPE_SECRET_KEY)

3. Create three subscription products with monthly and yearly prices:

   **Essential Plan:**
   - Name: Essential
   - Monthly: $9.99/month
   - Yearly: $99.00/year
   - Copy the Price IDs for both

   **Plus Plan:**
   - Name: Plus
   - Monthly: $14.99/month
   - Yearly: $149.00/year
   - Copy the Price IDs for both

   **Pro Plan:**
   - Name: Pro
   - Monthly: $19.99/month
   - Yearly: $199.00/year
   - Copy the Price IDs for both

4. Set up webhooks:
   - For local development: Use Stripe CLI
     ```bash
     stripe listen --forward-to localhost:3000/api/stripe/webhook
     ```
   - For production: Add webhook endpoint at your-domain.com/api/stripe/webhook
   - Select these events:
     - `checkout.session.completed`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
   - Copy the webhook signing secret (STRIPE_WEBHOOK_SECRET)

### 4. OpenAI Setup

1. Create an account at [platform.openai.com](https://platform.openai.com)
2. Generate an API key
3. Copy your API key (OPENAI_API_KEY)

### 5. Environment Variables

Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Stripe Product Price IDs
STRIPE_ESSENTIAL_MONTHLY_PRICE_ID=price_...
STRIPE_ESSENTIAL_YEARLY_PRICE_ID=price_...
STRIPE_PLUS_MONTHLY_PRICE_ID=price_...
STRIPE_PLUS_YEARLY_PRICE_ID=price_...
STRIPE_PRO_MONTHLY_PRICE_ID=price_...
STRIPE_PRO_YEARLY_PRICE_ID=price_...

# OpenAI Configuration
OPENAI_API_KEY=sk-...

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 6. Run Locally

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see your app.

## Deployment to Vercel

### Step 1: Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-github-repo-url>
git push -u origin main
```

### Step 2: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Import Project"
3. Select your GitHub repository
4. Configure your project:
   - Framework Preset: Next.js
   - Root Directory: ./
5. Add all environment variables from your `.env.local` file
6. Update `NEXT_PUBLIC_APP_URL` to your Vercel deployment URL
7. Click "Deploy"

### Step 3: Update Stripe Webhook

1. Go to Stripe Dashboard > Developers > Webhooks
2. Add a new endpoint: `https://your-vercel-domain.com/api/stripe/webhook`
3. Select the same events as before
4. Copy the new webhook signing secret
5. Update `STRIPE_WEBHOOK_SECRET` in Vercel environment variables
6. Redeploy your app

### Step 4: Configure Supabase Auth Redirect URLs

1. Go to Supabase Dashboard > Authentication > URL Configuration
2. Add your Vercel domain to:
   - Site URL: `https://your-vercel-domain.com`
   - Redirect URLs: `https://your-vercel-domain.com/**`

## Project Structure

```
scanthissite/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── scan/route.ts          # Main scanning endpoint
│   │   │   ├── history/route.ts       # Fetch scan history
│   │   │   ├── share/route.ts         # Create share links
│   │   │   └── stripe/                # Stripe integration
│   │   ├── login/page.tsx             # Authentication page
│   │   ├── scan/page.tsx              # Main scan interface
│   │   ├── history/page.tsx           # Scan history page
│   │   ├── layout.tsx                 # Root layout
│   │   └── globals.css                # Global styles
│   ├── components/
│   │   ├── Header.tsx                 # App header with nav
│   │   ├── UrlScanForm.tsx            # URL input form
│   │   ├── ScanResultView.tsx         # Display scan results
│   │   ├── SitePreviewFrame.tsx       # Website preview iframe
│   │   ├── HistoryList.tsx            # List of past scans
│   │   └── PricingSection.tsx         # Subscription plans
│   └── lib/
│       ├── supabase/                  # Supabase clients and types
│       ├── stripe.ts                  # Stripe configuration
│       ├── openai.ts                  # OpenAI integration
│       ├── website-fetcher.ts         # Website HTML fetching
│       └── auth.ts                    # Auth utilities
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql     # Database schema
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.js
```

## Key Features Explained

### Scan Quota Management

- Users are limited by their subscription plan's monthly scan limit
- Scans that return "not enough data" don't count against the quota
- Quotas reset based on the Stripe billing cycle dates

### Sharing Scans

- Users can generate public share links for any successful scan
- Shared scans are accessible without login
- Share links use a unique token stored in the `share_id` column

### Website Analysis

- Fetches website HTML and extracts title, meta description, and visible text
- Sends structured data to OpenAI GPT-4o with a detailed system prompt
- Returns structured JSON with safety scores and explanations
- Handles cases where there's insufficient data to analyze

### Security

- Row Level Security (RLS) enabled on all Supabase tables
- Server-side API routes validate authentication and subscription status
- Stripe webhook signatures are verified
- Service role key only used server-side for admin operations

## Troubleshooting

### "No active subscription" error

- Ensure the subscription was successfully created in Stripe
- Check that the webhook endpoint is receiving events
- Verify the subscription status in your Supabase `subscriptions` table

### Scan fails with timeout

- The website might be slow or blocking automated requests
- Default timeout is 15 seconds (configurable in `website-fetcher.ts`)

### OpenAI returns "not enough data"

- The website might have very little visible content
- The page might be mostly JavaScript-rendered
- This is expected behavior and won't count against the user's quota

### Iframe preview shows "Preview not available"

- The target website has X-Frame-Options set to block embedding
- This is a security feature of the target site and cannot be bypassed

## Support

For issues and questions:
- Check the [GitHub Issues](your-repo-url/issues)
- Review Supabase logs in your dashboard
- Check Stripe webhook event logs
- Review OpenAI API usage and errors

## License

MIT

