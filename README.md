# Visual Storage Organizer

A mobile-first web app for visually organizing your physical items. Take photos of your storage boxes, bags, and containers, then record what's inside each one — nested as deep as you need.

Never forget where you put something again.

## Features

- **Visual Card View** — Browse items as photo cards. Tap into a container to see what's inside, layer by layer.
- **Flat Search View** — See all items at once. Search by name, and the app shows the full storage path (e.g., `Closet > Top Shelf > Blue Box`).
- **Infinite Nesting** — Items inside items inside items. Just like real storage.
- **Photo Capture** — Take photos directly from your phone camera, or upload from gallery. Images are auto-compressed before upload.
- **Move Items** — Reorganized your stuff? Move items between containers with a few taps.
- **Share Links** — Generate a public link to share a container's contents with anyone — no login required.
- **Multi-Project** — Separate workspaces for different locations (home, office, etc.).
- **Google Login** — One tap to sign in. Email/password also available.
- **Works Everywhere** — Responsive design for phones, tablets, and desktops.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + TypeScript + Vite 7 |
| Styling | Tailwind CSS 4 |
| State | Zustand |
| Backend | Supabase (Auth + PostgreSQL + Storage) |
| Deployment | GitHub Pages + GitHub Actions |

**Cost: $0** — Everything runs on free tiers.

---

## Setup Guide

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up (free).
2. Click **New project**, give it a name, set a database password, choose a region.
3. Wait for the project to finish provisioning.

### 2. Set Up the Database

1. In your Supabase dashboard, go to **SQL Editor**.
2. Copy the entire contents of [`supabase_setup.sql`](supabase_setup.sql) and run it.
3. This creates the `projects`, `items`, and `shares` tables with all RLS policies, plus the `item-images` storage bucket.

### 3. Enable Google OAuth

1. In Supabase dashboard, go to **Authentication > Providers**.
2. Find **Google** and enable it.
3. You need a Google OAuth Client ID:
   - Go to [Google Cloud Console](https://console.cloud.google.com/).
   - Create a new project (or use an existing one).
   - Go to **APIs & Services > Credentials > Create Credentials > OAuth 2.0 Client ID**.
   - Application type: **Web application**.
   - Add **Authorized redirect URIs**: `https://<YOUR_SUPABASE_REF>.supabase.co/auth/v1/callback`
   - Copy the **Client ID** and **Client Secret**.
4. Paste them into the Supabase Google provider settings and save.

### 4. Get Your Supabase Keys

1. In Supabase dashboard, go to **Settings > API**.
2. Copy:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon public** key

### 5. Local Development

```bash
git clone https://github.com/<YOUR_USERNAME>/visual-storage-organizer.git
cd visual-storage-organizer
npm install
cp .env.example .env
```

Edit `.env` with your Supabase credentials:

```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...your_anon_key
```

```bash
npm run dev
```

Open `http://localhost:5173` in your browser.

To test on your phone (same Wi-Fi network):

```bash
npm run dev -- --host
```

### 6. Deploy to GitHub Pages

#### Set Up Repository Secrets

1. In your GitHub repo, go to **Settings > Secrets and variables > Actions**.
2. Add two repository secrets:
   - `VITE_SUPABASE_URL` — your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` — your Supabase anon key

#### Enable GitHub Pages

1. Go to **Settings > Pages**.
2. Set **Source** to **GitHub Actions**.

#### Deploy

Push to the `main` branch. GitHub Actions will automatically build and deploy:

```bash
git push origin main
```

Your app will be live at: `https://<YOUR_USERNAME>.github.io/visual-storage-organizer/`

#### Post-Deploy: Update Auth Redirect URLs

After deployment, update two places so authentication redirects work:

1. **Supabase Dashboard > Authentication > URL Configuration**:
   - Set **Site URL** to your GitHub Pages URL.
   - Add the same URL to **Redirect URLs**.

2. **Google Cloud Console** (if using Google OAuth):
   - Add `https://<YOUR_USERNAME>.github.io` to **Authorized JavaScript origins**.

---

## Project Structure

```
src/
├── components/
│   ├── auth/              # LoginView, AuthGuard
│   ├── AddItemModal.tsx   # Create items with photo capture
│   ├── ItemCard.tsx       # Visual card component
│   ├── ItemDetailModal.tsx# View, edit, share, move, delete
│   ├── Breadcrumbs.tsx    # Navigation path display
│   ├── FolderPicker.tsx   # Move-item destination picker
│   └── SearchModal.tsx    # Full-text search
├── views/
│   ├── ProjectListView.tsx  # Workspace selector
│   ├── ProjectDetailView.tsx
│   ├── HierarchyView.tsx    # Card browsing (folder mode)
│   ├── FlatView.tsx         # All-items grid (search mode)
│   └── SharedView.tsx       # Public share page (no auth)
├── layouts/
│   └── MobileLayout.tsx     # Bottom nav, FAB, search bar
├── store/
│   └── useStore.ts          # Zustand state management
├── lib/
│   ├── supabase.ts          # Supabase client init
│   └── imageUpload.ts       # Image compression + upload
└── types.ts                 # TypeScript interfaces
```

## License

MIT
