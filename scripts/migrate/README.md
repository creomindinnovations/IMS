# Migrate IMS from old Firebase → new Firebase

This copies **Authentication users**, **Firestore data**, and **Storage files** from your old project (`trackify-7de79`) to your new project (`internship-management-sy-54089`).

User **UIDs stay the same**, so `users/{uid}` documents still match Auth accounts.

---

## Before you start

1. **New project is ready**
   - Authentication → Email/Password enabled
   - Firestore + Storage created
   - Rules deployed: `firebase deploy --only firestore:rules,firestore:indexes,storage`

2. **Old project still exists** and you can open it in Firebase Console.

3. **Backup** (recommended): Firebase Console → Firestore → Import/Export, or export Auth manually.

4. **Do not delete the old project** until you have verified the new one.

---

## Step 1 — Service account keys (both projects)

For **each** Firebase project:

1. [Firebase Console](https://console.firebase.google.com/) → Project → ⚙️ Project settings → **Service accounts**
2. **Generate new private key** → save JSON

Place files here (never commit them):

```
scripts/migrate/keys/old-service-account.json   ← old project (trackify-7de79)
scripts/migrate/keys/new-service-account.json   ← new project (internship-management-sy-54089)
```

---

## Step 2 — Config

```powershell
cd "C:\Users\bhanu\OneDrive\Desktop\ims\scripts\migrate"
copy config.example.json config.json
```

Edit `config.json` if your project IDs or bucket names differ.

---

## Step 3 — Install & dry run

```powershell
cd "C:\Users\bhanu\OneDrive\Desktop\ims\scripts\migrate"
npm install

# Preview counts (no writes)
node migrate.mjs --dry-run
```

---

## Step 4 — Run migration (order matters)

```powershell
npm run migrate
```

This runs:

| Step | What |
|------|------|
| 1. Auth | `firebase auth:export` → `auth:import` (same UIDs + passwords) |
| 2. Storage | Copies all files to the new bucket (same paths) |
| 3. Firestore | Copies all collections; rewrites old bucket URLs in fields |

Or run steps separately:

```powershell
npm run migrate:auth
npm run migrate:storage
npm run migrate:firestore
```

**Auth requires** [Firebase CLI](https://firebase.google.com/docs/cli) and access to **both** projects:

```powershell
firebase login
```

---

## Step 5 — Verify

1. `.env` uses the **new** `VITE_FIREBASE_*` values (already set for `internship-management-sy-54089`).
2. Restart dev server: `npm run dev`
3. Log in with an **existing** admin email/password.
4. Check: interns list, attendance, tutorials, certificates, settings logo.

---

## Collections migrated

- `users`
- `attendance`
- `tutorials`
- `progress`
- `leave_requests`
- `offer_letters`
- `certificates`
- `announcements`
- `settings`

---

## If something fails

| Issue | Fix |
|-------|-----|
| Auth import error | Old export must include `passwordHash`. Re-export with Firebase CLI (not manual user list). |
| Permission denied | Service account needs **Firebase Admin** / Editor on that project. |
| Tutorial video/PDF won’t play | Storage token URLs may differ. Re-upload from Admin → Tutorials, or copy file again in Console. |
| Missing admin login | Create user in new Auth + `users/{uid}` doc with `"role": "admin"` (see `src/firebase/README.md`). |

---

## After migration

- Point hosting/Vercel env vars to the **new** Firebase config.
- Keep the old project read-only for a few weeks, then delete if everything works.
