# IMS on Supabase (free)

Firebase has been replaced with **Supabase** (free tier):

- **Auth** — email/password login
- **Database** — PostgreSQL (replaces Firestore)
- **Storage** — file uploads (tutorials, PDFs, logos)

---

## 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and sign up (free).
2. **New project** → pick a name and database password.
3. Wait until the project is ready.

---

## 2. Run the database schema

1. Dashboard → **SQL Editor** → **New query**
2. Paste the full contents of `supabase/schema.sql`
3. Click **Run**

---

## 3. Create storage bucket

1. Dashboard → **Storage** → **New bucket**
2. Name: `ims`
3. Enable **Public bucket** (simplest for tutorial videos/PDFs on free tier)
4. Create

---

## 4. Auth settings (important)

Dashboard → **Authentication** → **Providers** → Email:

- Enable Email provider
- **Disable “Confirm email”** if admins create intern accounts from the app (otherwise new users must verify email first)

---

## 5. App environment variables

Copy `.env.example` to `.env`:

```powershell
copy .env.example .env
```

Fill in from Dashboard → **Project Settings** → **API**:

- `VITE_SUPABASE_URL` = Project URL
- `VITE_SUPABASE_ANON_KEY` = `anon` `public` key

Restart the dev server:

```powershell
npm run dev
```

---

## 6. First admin user

1. Dashboard → **Authentication** → **Add user** → email + password
2. Copy the user **UUID**
3. **Table Editor** → `users` → **Insert row**:

| Column | Value |
|--------|--------|
| id | (paste UUID) |
| email | admin@yourcompany.com |
| name | Admin |
| role | admin |
| department | Operations |
| is_active | true |

4. Open `http://localhost:5173` and log in.

---

## 7. Deploy (Vercel / Netlify)

Add the same `VITE_SUPABASE_*` variables in your host’s environment settings, then build as usual:

```powershell
npm run build
```

**SPA routing (required):** Direct links such as `/reset-password` must serve `index.html`. This repo includes:

- `vercel.json` — rewrites all routes to `index.html` on Vercel
- `public/_redirects` — same for Netlify

After deploy, in Supabase **Authentication → URL Configuration**, set **Site URL** to your production domain and add `https://your-domain.com/reset-password` under **Redirect URLs**.

---

## Migrating data from Firebase

There is no automatic migration script. Options:

1. **Fresh start** — create users again in Supabase (recommended for small teams).
2. **Manual export** — export Firestore JSON from Firebase Console and import into Supabase tables via CSV/SQL.
3. **Re-upload files** — upload tutorials and logos again from the admin UI.

---

## Free tier limits (typical)

- 500 MB database, 1 GB file storage, 50k monthly active users on Auth
- Enough for internship programs and small teams

See [Supabase pricing](https://supabase.com/pricing) for current limits.
