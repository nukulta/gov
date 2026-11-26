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

Deploy `frontend/` and `backend/` as separate Vercel projects. Set `VITE_API_BASE_URL` in the frontend project to the backend URL ending in `/api`. In the backend project, configure `DATABASE_URL`, `CLIENT_ORIGIN` (the exact frontend origin), `SESSION_SECRET`, `FIELD_ENCRYPTION_KEY`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` as Vercel environment variables. Use a managed PostgreSQL database and run Prisma migrations before serving traffic.

The session cookie is `SameSite=Lax`; use frontend and backend custom domains under the same site (for example, `portal.example.com` and `api.example.com`) so authenticated browser requests can send the cookie. Do not commit credentials, production workbooks, or financial data.

## Structure

- `frontend/` React, Vite, Tailwind CSS and React Router client
- `backend/` Express REST API and Prisma schema
