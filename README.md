# Internship Management System (IMS)

Web platform for managing interns — attendance, tutorials, offer letters, and certificates. Built per IMS PRD v1.0 MVP.

## Stack

- React 18 + Vite + Tailwind CSS
- Firebase Auth, Firestore, Storage
- Zustand, Recharts, jsPDF, html2canvas, qrcode

## Setup

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Firebase project**

   - Create a project at [Firebase Console](https://console.firebase.google.com)
   - Enable Email/Password authentication
   - Create Firestore database and Storage bucket
   - Deploy rules: `firebase deploy --only firestore:rules,storage` (with Firebase CLI)

3. **Environment**

   Copy `.env.example` to `.env` and fill in Firebase config:

   ```bash
   cp .env.example .env
   ```

4. **First admin user**

   - Create a user in Firebase Authentication (email/password)
   - In Firestore, add document `users/{uid}`:

   ```json
   {
     "uid": "<auth-uid>",
     "name": "Admin",
     "email": "admin@example.com",
     "role": "admin",
     "department": "Operations",
     "isActive": true,
     "createdAt": "<server timestamp>"
   }
   ```

5. **Run**

   ```bash
   npm run dev
   ```

   Open http://localhost:5173

## Roles

| Role      | Route prefix |
|-----------|--------------|
| admin     | `/admin`     |
| teamlead  | `/lead`      |
| intern    | `/intern`    |

## Build

```bash
npm run build
npm run preview
```

Deploy `dist/` to Vercel and set the same `VITE_*` environment variables.
