# Government Faculty & Training Management System

A secure, role-based portal for faculty, training, participation and training database records.

## Requirements

- Node.js 20+
- PostgreSQL 14+

## Setup

```powershell
npm install
npm run install:all
Copy-Item backend\.env.example backend\.env
# Set DATABASE_URL, SESSION_SECRET, ADMIN_EMAIL, and ADMIN_PASSWORD in backend\.env
npm run db:generate --prefix backend
npm run db:migrate --prefix backend
npm run db:seed --prefix backend
npm run dev
```

The client runs at `http://localhost:5173` and the API at `http://localhost:4000`.
The seed command creates the administrator from `ADMIN_EMAIL` and `ADMIN_PASSWORD`; choose a unique, strong password and keep `.env` private.

## Security notes

- Sessions use an HTTP-only, SameSite cookie and are stored in PostgreSQL.
- Passwords use Argon2id.
- The initialization endpoint is administrator-only and can succeed only once.
- Financial fields are encrypted with AES-256-GCM when `FIELD_ENCRYPTION_KEY` is configured.
- Use HTTPS, a managed secret store, encrypted backups and department-approved infrastructure before production.
- The source repo intentionally excludes `backend/Dataset/`; it can contain personal and financial data. Import approved data through your secured deployment process.
- The seed command requires `ADMIN_EMAIL` and `ADMIN_PASSWORD`; no default administrator credentials are included in source.

## Vercel deployment

Import the repository root as one Vercel project. [vercel.json](./vercel.json) configures the `backend` and `frontend` services, routing `/api/*` to Express and other paths to the Vite app. The frontend service rewrites client-side routes such as `/login` to `index.html`. Both services share one public domain, so the browser uses the same-origin `/api` URL and session cookie.

Configure these production environment variables in Vercel: `DATABASE_URL`, `CLIENT_ORIGIN` (the exact production URL, such as `https://gov.vercel.app`), `SESSION_SECRET`, `FIELD_ENCRYPTION_KEY`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and `NODE_ENV=production`. Use a managed PostgreSQL database and enter secrets directly in Vercel, not in Git.

Before serving traffic, run `npm run db:deploy --prefix backend` and `npm run db:seed --prefix backend` from a secure environment configured with the production database URL and administrator credentials. Do not commit credentials, production workbooks, or financial data.

For client presentations, use `/demo` for a read-only frontend preview with fictional sample data. The preview does not call the backend; the real application remains protected by sign-in.

## Structure

- `frontend/` React, Vite, Tailwind CSS and React Router client
- `backend/` Express REST API and Prisma schema
