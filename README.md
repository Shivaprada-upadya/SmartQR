# SmartQR

SmartQR is a full-stack QR code management application. Users can create and manage static and dynamic QR codes, download QR images, and review scan analytics.

## Features

- Register and sign in to a JWT-authenticated workspace.
- Create static QR codes for URLs or text, and dynamic QR codes that redirect through a short link.
- Edit, activate, deactivate, delete, and bulk-manage QR codes.
- Search and filter the QR list, with server-side pagination and sorting, in a desktop table or mobile-friendly cards.
- Navigate a responsive dashboard with account-aware page titles, mobile navigation, keyboard focus states, and QR workspace sections.
- Download QR images as PNG or SVG.
- Review per-QR scan trends, device, browser, operating system, and recent scan data.
- Use a shared dark SaaS design system across authentication, dashboard, QR creation, QR management, analytics, and dialogs.

Bulk selection applies to the QR codes shown on the current page. Dynamic QR scans are recorded by the backend before redirecting.

## Application experience

- **Authentication:** Responsive login and registration workspace with shared form controls, loading states, validation errors, and session restoration.
- **Dashboard:** Account-wide QR totals, active QR totals, scan totals, daily averages, and account-aware navigation.
- **QR creation:** Static and dynamic mode selection, URL and text content modes, live preview, export sizing, and PNG/SVG downloads.
- **QR library:** Search, type/status filters, pagination, desktop table, mobile cards, row actions, edit/delete dialogs, and bulk activation/deactivation/deletion.
- **Analytics:** Date-range and QR-code filters, scan summary, daily trend chart, device/browser/OS breakdowns, and recent scan activity.

The frontend presentation is separated into shared UI primitives, layout components, QR components, dashboard components, hooks, and API services. Business logic remains in existing hooks and services, while [frontend/src/index.css](frontend/src/index.css) and [frontend/src/App.css](frontend/src/App.css) provide design tokens and application styles.

## Technology

- **Frontend:** React 19, JavaScript, Vite, Tailwind CSS 4, custom CSS, and `qrcode`.
- **Backend:** Node.js, Express 5, PostgreSQL, and `pg`.
- **Security and validation:** JWT, `bcryptjs`, Zod, Helmet, CORS, and rate limiting.
- **Tests:** Vitest and Supertest for the backend; Vitest and React Testing Library for the frontend.

## Repository layout

```text
backend/src/controllers/  HTTP request handlers
backend/src/middleware/  Authentication, validation, and security middleware
backend/src/routes/      API and redirect routes
backend/src/services/    PostgreSQL operations and business logic
backend/src/validators/  Zod request schemas
backend/src/tests/       Backend integration tests
database/schema.sql      PostgreSQL schema
frontend/src/App.jsx     Session, API orchestration, and dashboard state
frontend/src/components/Auth.jsx  Registration and sign-in form
frontend/src/components/dashboard/  Analytics and statistics presentation
frontend/src/components/layout/     Dashboard navigation and header
frontend/src/components/qr/          QR creation, editing, and management UI
frontend/src/components/ui/          Shared accessible UI primitives and variants
frontend/src/services/               Frontend API clients
frontend/src/hooks/                  Session, dashboard navigation, QR list and controls, selection, management, analytics, overview, creation, editing, and export workflows
```

The shared frontend theme and global styles are in `frontend/src/index.css`; shared component styles are in `frontend/src/components/ui/ui.css`; dashboard, authentication, QR, analytics, modal, and responsive styles are in `frontend/src/App.css`. Prefer the shared design tokens and UI primitives when adding or updating UI styles.

## Local development

### Requirements

- Node.js `^20.19.0` or `>=22.12.0`, and npm (the installed Vite 8 requirement).
- PostgreSQL 17 (the checked-in schema targets PostgreSQL 17).

### 1. Create and initialize the database

From the repository root in PowerShell, create a PostgreSQL database and apply the schema:

```powershell
psql -U postgres -c "CREATE DATABASE smartqr;"
psql -U postgres -d smartqr -f .\database\schema.sql
```

### 2. Configure and start the backend

```powershell
cd .\backend
npm install
Copy-Item .env.example .env
```

Update `backend/.env` with a valid `DATABASE_URL` and a strong `JWT_SECRET`. The example also sets `PORT` (5000), `CLIENT_URL` (the Vite development origin), `JWT_EXPIRES_IN`, and `NODE_ENV`. `CLIENT_URL` must match the frontend's actual origin; if Vite uses another port, update it and restart the API.

Start the API:

```powershell
npm run dev
```

The API defaults to `http://localhost:5000`. Health checks are available at `/api/health` and `/api/health/db`.

### 3. Start the frontend

In a second terminal:

```powershell
cd .\frontend
npm install
npm run dev
```

Vite defaults to `http://localhost:5173`. The frontend API base URL defaults to `http://localhost:5000/api`; set `VITE_API_BASE_URL` in a local Vite environment file if the API runs elsewhere.

For example, `frontend/.env.local` can contain:

```text
VITE_API_BASE_URL=http://localhost:5000/api
```

## Tests and checks

Run frontend checks from `frontend/`:

```powershell
npm test
npm run lint
npm run build
```

The frontend currently includes 62 Vitest and React Testing Library tests covering authentication, session behavior, navigation, QR creation/export, QR management, analytics, and accessibility-oriented components.

Run backend tests from `backend/`:

```powershell
npm test
```

The backend currently includes 73 Vitest and Supertest tests. Backend tests load their database configuration from `backend/.env.test`. Configure it to use a local test database before running the suite. Do not commit `.env` or `.env.test` files.

Before frontend pushes, also run `git diff --check` and inspect `git diff` for unintended source, generated, or environment-file changes.

## API overview

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/api/auth/register` | Register an account |
| `POST` | `/api/auth/login` | Sign in and receive a JWT |
| `GET` | `/api/auth/me` | Get the authenticated user |
| `GET`, `POST` | `/api/qr` | List or create QR codes |
| `GET`, `PATCH`, `DELETE` | `/api/qr/:id` | Read, update, or delete one QR code |
| `POST` | `/api/qr/bulk` | Activate, deactivate, or delete selected QR codes |
| `GET` | `/api/qr/overview` | Get owner-scoped all-time QR and scan totals |
| `GET` | `/api/qr/:id/analytics` | Get analytics for one QR code |
| `GET` | `/r/:shortCode` | Record a scan and redirect a dynamic QR code |

QR management endpoints require authentication. The QR list supports pagination, title/destination search, type/status filters, and sorting. The dashboard overview shows account-wide QR totals and all-time scans; its daily average uses the period since the earliest owned QR code was created. Per-QR analytics accepts the `7d`, `30d`, `90d`, and `all` ranges.

## Project status

The application UI is complete across authentication, dashboard, QR creation, QR management, analytics, responsive navigation, and accessibility polish. Existing API contracts and QR behavior must be preserved when extending the application.
