# ACS Business Suite — Complete Setup Guide

## Phase 1: Supabase Project Setup

### 1. Create Supabase Project
1. Go to https://supabase.com and sign up / log in
2. Click **New Project** → choose your org
3. Project name: `acs-business-suite`
4. Database password: (save it somewhere safe)
5. Region: `ap-south-1` (Mumbai — closest to Burdwan)
6. Wait ~2 minutes for project to provision

### 2. Run the Database Schema
1. In your Supabase dashboard, go to **SQL Editor**
2. Click **New query**
3. Copy the entire contents of `supabase/schema.sql` and paste it
4. Click **Run** — you should see "Success. No rows returned"

### 3. Seed the Product Data
1. In SQL Editor, click **New query** again
2. Copy the entire contents of `supabase/seed.sql` and paste it
3. Click **Run** — inserts ~90 products

### 4. Get Your API Keys
1. Go to **Project Settings** → **API**
2. Copy:
   - **Project URL** (looks like `https://abcxyz.supabase.co`)
   - **anon public** key (long JWT string)

### 5. Configure Auth Settings
1. Go to **Authentication** → **Settings**
2. Under **Email**, disable "Confirm email" for internal use (optional)
3. Under **URL Configuration**, add your domain:
   - Site URL: `https://quotes.advancedcomputersystem.in`
   - Redirect URLs: `https://quotes.advancedcomputersystem.in/*`

---

## Phase 2: Create the First Admin Account

### Method A — Via Supabase Dashboard (Recommended)
1. Go to **Authentication** → **Users** → **Add user**
2. Email: `admin@acsbdn.com` (or your preferred admin email)
3. Password: (set a strong password)
4. Click **Create user**
5. Copy the UUID of the newly created user
6. Go to **SQL Editor** and run:

```sql
UPDATE public.profiles 
SET role = 'admin', full_name = 'Admin', is_active = true
WHERE id = 'PASTE-UUID-HERE';
```

### Method B — Via the App
1. Start the app and sign up (if email confirmations are disabled)
2. Manually update the role in Supabase dashboard afterwards

---

## Phase 3: Local Development Setup

```bash
# Navigate to the app folder
cd acs-app

# Create environment file
copy .env.example .env

# Edit .env and fill in your Supabase credentials:
# VITE_SUPABASE_URL=https://your-project.supabase.co
# VITE_SUPABASE_ANON_KEY=your-anon-key

# Install dependencies
npm install

# Start development server
npm run dev
# Opens at http://localhost:5173
```

---

## Phase 4: Build & Deploy to Hostinger

### Build the App
```bash
cd acs-app
npm run build
# Creates /dist folder with all static files
```

### Hostinger Subdomain Setup
1. Log in to Hostinger hPanel
2. Go to **Domains** → your domain `advancedcomputersystem.in`
3. Click **Subdomains** → Add new subdomain
   - Subdomain: `quotes`
   - Document root: `/public_html/quotes`
4. Wait for DNS propagation (up to 30 min)

### Upload Files
1. In hPanel, go to **File Manager**
2. Navigate to `/public_html/quotes/`
3. Upload all contents of your `/dist` folder here
   - You should see: `index.html`, `assets/` folder, `vite.svg`

### Fix SPA Routing (Important!)
Create a `.htaccess` file in `/public_html/quotes/` with this content:

```apache
Options -MultiViews
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteRule ^ index.html [QSA,L]
```

This ensures React Router works correctly when users refresh the page.

### SSL Certificate
1. In hPanel, go to **SSL** → **SSL/TLS Status**
2. Enable **Let's Encrypt** for `quotes.advancedcomputersystem.in`

---

## Phase 5: Add Staff Accounts

For each staff member, repeat:
1. **Authentication** → **Users** → **Add user** (email + password)
2. Run SQL to set their role:

```sql
-- Sales staff
UPDATE public.profiles SET role = 'sales', full_name = 'Staff Name', is_active = true
WHERE email = 'staff@acsbdn.com';

-- Telecaller
UPDATE public.profiles SET role = 'telecaller', full_name = 'Caller Name', is_active = true
WHERE email = 'caller@acsbdn.com';

-- Support
UPDATE public.profiles SET role = 'support', full_name = 'Support Name', is_active = true
WHERE email = 'support@acsbdn.com';
```

Or use the **Admin Panel → Staff** tab in the app to manage staff after logging in as admin.

---

## Secret Features

### Profit View Unlock
- **Method 1**: On any screen, double-click the clock widget on the Dashboard
- **Method 2**: Click the "Profit" button in Quote Builder or Admin Panel
- **PIN**: `2529`
- Once unlocked, all cost prices, margins, and profit per line are visible
- Resets on page reload (by design)

### Admin-only
- Admin Panel (product manager, staff, reports)
- Profit/margin visibility everywhere
- Delete clients and tickets
- View all call logs and staff stats

---

## Role Permissions Summary

| Feature              | Admin | Sales | Telecaller | Support |
|---------------------|-------|-------|-----------|---------|
| Call Mode           | ✅    | ✅    | ❌        | ❌      |
| Quote Builder       | ✅    | ✅    | ❌        | ❌      |
| Renewals Dashboard  | ✅    | ✅    | ❌        | ❌      |
| Client Tracker      | ✅    | ✅    | ❌        | ❌      |
| Telecalling         | ✅    | ❌    | ✅        | ❌      |
| Tickets             | ✅    | ✅    | ✅        | ✅      |
| Admin Panel         | ✅    | ❌    | ❌        | ❌      |
| See Cost/Margins    | ✅*   | ❌    | ❌        | ❌      |

*Admin + PIN 2529

---

## Environment Variables Reference

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

These go in `.env` file (local dev) — for production builds, set them before running `npm run build`.

---

## Troubleshooting

**Login fails:**
- Check Supabase URL and anon key in `.env`
- Ensure user exists in Supabase Auth → Users
- Check profile row exists with `is_active = true`

**Page 404 on reload:**
- Make sure `.htaccess` file is in place with RewriteRule

**Products not showing in search:**
- They come from `src/lib/products.js` (local, always available)
- Products table in Supabase is for admin-managed overrides

**WhatsApp links not working:**
- Ensure phone numbers are stored without spaces/dashes
- Format: `919876543210` (country code + number, no +)

**PDF download not triggering:**
- Check browser popup blocker isn't blocking downloads
- Works best on desktop Chrome/Firefox

---

## Company Details (Embedded in App & PDFs)

- **Name**: Advanced Computer System
- **Address**: Burdwan, West Bengal
- **Est**: 1995
- **Phone**: +91 81700 18080
- **Email**: acsbdn@gmail.com
- **Website**: advancedcomputersystem.in
- **Hosting**: quotes.advancedcomputersystem.in

To update these, edit `src/modules/QuoteBuilder/generatePDF.js` (ACS constant at top) and `src/modules/Auth/LoginPage.jsx`.
