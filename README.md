# InternHub — Full-Stack Internship Board

> **EdVyro Full Stack Development Task 3: Secure Application Integration**
>
> A React and Express internship board with server-side validation, parameterized SQLite queries, security middleware, and automated API tests.

- **Live Frontend**: [https://kannan-it-24.github.io/internship-board/](https://kannan-it-24.github.io/internship-board/)
- **Live Backend**: [https://internship-board-goud.onrender.com](https://internship-board-goud.onrender.com/)
- **API Health Check**: [https://internship-board-goud.onrender.com/api/health](https://internship-board-goud.onrender.com/api/health)
- **Internships API**: [https://internship-board-goud.onrender.com/api/internships](https://internship-board-goud.onrender.com/api/internships)
- **GitHub Repository**: [https://github.com/kannan-IT-24/internship-board](https://github.com/kannan-IT-24/internship-board)

---

## 1. Project Overview & Task 3 Satisfaction

**InternHub** is a full-stack internship portal where students and graduates can browse internship listings and submit applications.

### How this project fulfills EdVyro Task 3:
1. **API Data Fetching with Visible States**: React frontend asynchronously fetches internship data from the Express REST API, rendering an animated loading spinner during in-flight requests and an accessible `ErrorState` with a **Try Again** retry mechanism upon failure.
2. **Dual-Layer Application Validation**: Application submission checks name length (2–100 characters) and email format in both the React modal and Express middleware. The API rejects duplicate submissions, closed internships, and nonexistent positions with appropriate HTTP status codes (`400`, `404`, `409`).
3. **Multi-Tier API Protection**:
   - **Rate Limiting**: Configurable global limiter (200 req/15 min) and strict submission limiter (10 req/15 min).
   - **Secure Headers**: Full Helmet suite (`X-Content-Type-Options: nosniff`, CSP frame protection, HSTS, Referrer-Policy, `x-powered-by` disabled).
   - **Administrative Authentication**: Internship mutation endpoints (`POST`, `PUT`, `DELETE /api/internships`) use `requireAdminAuth`. When `ADMIN_API_KEY` is set, callers must send it using `x-api-key` or `Authorization: Bearer <key>`. In production, mutations are disabled (403 Forbidden) if no key is configured.
   - **Parameterized SQL**: All database operations use `node:sqlite` parameter binding with `?` placeholders to prevent SQL injection.
4. **Automated Testing & Public Submission**: 61 automated backend tests across 2 test suites verify API behavior, validation, error envelopes, rate limits, headers, applicant privacy, CORS, and authorization. The frontend is deployed on GitHub Pages and the backend on Render.

---

## 2. Key Features

### Backend security
- **Helmet Security Headers**: `X-Content-Type-Options`, `X-Frame-Options`, `Content-Security-Policy`, `Strict-Transport-Security`, `Referrer-Policy`, `X-DNS-Prefetch-Control`.
- **Rate Limiting**: General limiter on all `/api/*` routes (200 req/15 min). Strict limiter on `POST /api/applications` (10 req/15 min). Both fully configurable via environment variables.
- **Query Parameter Validation**: Enforces maximum character lengths on `q` (200), `domain` (100), and `mode` (20) to prevent oversized inputs.
- **Body Size Limits**: All request bodies capped at 100 KB.
- **CORS**: Production allows the exact hosted frontend origin and additional exact origins in `FRONTEND_ORIGIN` (comma-separated); local development also allows the documented localhost origins.
- **No Secret Leakage**: `x-powered-by` suppressed. Internal errors and malformed JSON details are sanitized in every environment. Applicant names/emails are omitted from application listings and are not written to server logs.

### Backend
- **Persistent Storage**: SQLite enforcing foreign keys and `UNIQUE(internship_id, applicant_email)` constraint.
- **Full CRUD**: `GET`, `POST`, `PUT`, `DELETE` for internships; application submission (`POST`); listing (`GET`); health check.
- **Parameterized Queries**: All user-controlled values bound via `?` placeholders — no string interpolation into SQL.
- **Duplicate / Closed / Nonexistent Protection**: `409 Conflict` for duplicates and closed internships; `404 Not Found` for nonexistent targets.
- **Idempotent Seeding**: Re-running seed skips existing records without overwriting them.
- **Uniform Error Envelope**: `{ status: "error", error: { code, message } }` for all failures.

### Frontend (preserved and integrated)
- **Live API Data Fetching**: React fetches from Express API via `src/services/api.js`. Uses `VITE_API_BASE_URL` env var.
- **Loading / Error / Empty States**: Visible spinner on load; friendly error banner with **Try Again** button; empty state with **Clear Filters** button.
- **Application Form**: Client validates name length and email format using the same validation rules as the server. Prevents double-submission while a request is in flight.
- **Closed Internship Guard**: Apply button disabled; locked message shown for closed positions.

---

## 3. Technologies

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, Vite 8, JavaScript (ES6+), Vanilla CSS3 |
| **Backend** | Node.js v24, Express.js 4, SQLite (`node:sqlite` built-in) |
| **Security** | Helmet 8, express-rate-limit 7, CORS (env-driven), body size limits |
| **Testing** | Node.js Test Runner (`node --test`), Supertest |
| **Deployment** | GitHub Pages (frontend), Render (backend) |

---

## 4. Architecture

```text
[ Browser (React + Vite) ]
         │
         │ HTTP / JSON — CORS-restricted to allowed origins
         ▼
[ Express.js REST API (Port 5000 locally; Render in production) ]
   ├── Helmet Middleware   ──── Security headers on every response
   ├── CORS Middleware     ──── Exact frontend origin and configured allowlist
   ├── Body Parser         ──── JSON, urlencoded (100 KB max)
   ├── General Rate Limiter ─── /api/*: 200 req / 15 min per IP
   ├── Routing Layer
   │    ├── /api/internships  → Read + authenticated create/update/delete
   │    └── /api/applications → Submit Limiter → Submit + paginated list
   ├── Validation Middleware
   ├── Controller Layer
   ├── Service Layer (parameterized SQL)
   └── Centralized Error Handler (no stack trace leakage)
         │
         ▼
[ SQLite Database (data/internships.db) ]
   ├── internships (PRAGMA foreign_keys = ON)
   └── applications (UNIQUE internship_id + applicant_email)
```

---

## 5. Project Folder Structure

```text
internship-board/
├── server/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js             # SQLite connection & schema init
│   │   ├── controllers/
│   │   │   ├── applicationsController.js
│   │   │   └── internshipsController.js
│   │   ├── db/
│   │   │   ├── init.js                 # Schema initializer script
│   │   │   ├── schema.sql              # DDL with foreign keys & UNIQUE
│   │   │   └── seed.js                 # Idempotent seed (4 records)
│   │   ├── middleware/
│   │   │   ├── errorHandler.js         # Centralized safe error mapper
│   │   │   ├── adminAuth.js            # Protects internship mutations
│   │   │   └── rateLimiter.js          # Factory fns: general + submit limiters
│   │   ├── routes/
│   │   │   ├── applications.js         # Factory router (inject limiter)
│   │   │   └── internships.js
│   │   ├── services/
│   │   │   ├── applicationService.js
│   │   │   └── internshipService.js
│   │   ├── utils/
│   │   │   └── errors.js               # AppError, ValidationError, etc.
│   │   ├── validators/
│   │   │   ├── applicationValidator.js # name, email, internship_id rules
│   │   │   └── internshipValidator.js  # pagination + query length limits
│   │   ├── app.js                      # Express app factory (Helmet, CORS, limiters)
│   │   └── server.js                   # HTTP server entry point
│   ├── tests/
│   │   ├── api.test.js                 # API integration tests
│   │   └── security.test.js            # Security and validation tests
│   ├── .env.example
│   └── package.json
├── src/                                # React frontend
│   ├── assets/
│   ├── data/
│   │   └── internships.js              # Static details joined to API records by ID
│   ├── components/
│   │   ├── EmptyState.jsx
│   │   ├── ErrorState.jsx
│   │   ├── Footer.jsx
│   │   ├── Header.jsx
│   │   ├── Hero.jsx
│   │   ├── InternshipCard.jsx
│   │   ├── InternshipList.jsx
│   │   ├── InternshipModal.jsx         # RFC 5322 email validation
│   │   └── SearchFilters.jsx
│   ├── services/api.js                 # Centralized API client
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── public/                             # Static public assets
├── .env.example
├── .github/workflows/deploy.yml        # GitHub Pages frontend build/deploy
├── index.html
├── package.json
└── vite.config.js
```

---

## 6. Prerequisites

- **Node.js**: `v22.12.0` or newer (the project uses `node:sqlite` and Vite 8; tested on `v24.21.0`).
- **npm**: `v10` or newer (tested on `11.19.0`).
- No native compilation required — uses `node:sqlite` built-in driver.

---

## 7. Installation & Setup

### 1. Clone the repository
```bash
git clone https://github.com/kannan-IT-24/internship-board.git
cd internship-board
```

### 2. Install frontend dependencies
```bash
npm ci
```

### 3. Install backend dependencies
```bash
npm --prefix server ci
```

### 4. Configure environment variables

**Frontend** — copy `.env.example` to `.env` in the project root:
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

**Backend** — copy `server/.env.example` to `server/.env`:
```env
PORT=5000
NODE_ENV=development
DATABASE_PATH=./data/internships.db
FRONTEND_ORIGIN=http://localhost:5173

# Rate limiting (optional — defaults shown)
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=200
APPLY_RATE_LIMIT_WINDOW_MS=900000
APPLY_RATE_LIMIT_MAX=10
```

The backend loads `server/.env` when it starts. The root `.env` is read by Vite when building or running the frontend.

> **Never commit `.env` files or real admin keys.** Environment files are ignored by Git. `VITE_API_BASE_URL` is included in the browser bundle, so it must contain only a public API URL, never a secret.

---

## 8. Database Initialization & Seeding

The backend initializes the schema and inserts any missing sample internships automatically when it starts. You can also run these commands from the **project root**:

### Initialize schema (creates tables)
```bash
npm run db:init
```

### Seed initial records
```bash
npm run db:seed
```

**Output example**:
```
Database seeded successfully: 4 inserted, 0 already existed (preserved).
```

> **Idempotency**: Re-running seed skips existing IDs. Existing data is never overwritten.

**Seeded internships**:

| ID | Title | Domain | Mode | Weeks | Open |
|----|-------|--------|------|-------|------|
| INT-001 | Frontend Practice Internship | Web Development | Remote | 4 | ✅ |
| INT-002 | Data Dashboard Internship | Data Analytics | Remote | 6 | ✅ |
| INT-003 | Product Design Internship | UI/UX | Hybrid | 4 | ✅ |
| INT-004 | C++ Utility Internship | C++ Programming | Remote | 5 | ❌ |

---

## 9. Running the Application

### Start the backend server
```bash
# From project root
npm run server:dev      # Development (auto-restarts on changes)
npm run server          # Start without watch mode
```

Console output:
```
Database connected and initialized.
===============================================
🚀 InternHub Backend Server running on port 5000
📍 Base URL: http://localhost:5000
💓 Health:   http://localhost:5000/api/health
📋 API:      http://localhost:5000/api/internships
===============================================
```

### Start the frontend (separate terminal)
```bash
npm run dev
```
Opens at `http://localhost:5173`.

The live frontend uses the Render backend. GitHub Actions gets the frontend API URL from the repository variable `VITE_API_BASE_URL` (or a secret with that name) when it builds the site.

---

## 10. API Endpoint Reference

### Health Check
```http
GET /api/health
```
```json
{ "status": "success", "data": { "status": "healthy", "message": "..." } }
```

### List Internships
```http
GET /api/internships?page=1&limit=10&q=frontend&domain=Web+Development&mode=Remote
```
Query params: `page` (default: 1), `limit` (1–100, default: 10), `q` (max 200 chars), `domain` (max 100 chars), `mode` (max 20 chars).

### Get Internship by ID
```http
GET /api/internships/:id
```

### Create Internship
```http
POST /api/internships
Content-Type: application/json
x-api-key: <ADMIN_API_KEY>

{
  "id": "INT-005",
  "title": "DevOps Cloud Internship",
  "domain": "Cloud Computing",
  "mode": "Remote",
  "duration_weeks": 8,
  "applications_open": 1
}
```

### Update Internship
```http
PUT /api/internships/:id
Content-Type: application/json
x-api-key: <ADMIN_API_KEY>

{ "title": "...", "domain": "...", "mode": "Remote", "duration_weeks": 6, "applications_open": 1 }
```

### Delete Internship
```http
DELETE /api/internships/:id
```
Create, update, and delete requests need admin credentials when `ADMIN_API_KEY` is configured. In production, these operations return `403 Forbidden` when the key is not configured. The same key can be sent as `Authorization: Bearer <ADMIN_API_KEY>`. Deleting an internship returns `409 Conflict` if applications exist for it.

### Submit Application
```http
POST /api/applications
Content-Type: application/json

{
  "internship_id": "INT-001",
  "applicant_name": "Kannan G",
  "applicant_email": "kannan@example.com"
}
```

**Validation rules**:
- `applicant_name`: required, 2–100 characters
- `applicant_email`: required, valid RFC 5322 format, max 255 chars
- `internship_id`: required, must exist and have `applications_open = 1`
- Duplicate `(internship_id, applicant_email)` → `409 Conflict`

A successful submission response includes the submitted applicant fields and its reference ID. `GET /api/applications` intentionally omits applicant names and email addresses.

### List Applications
```http
GET /api/applications?page=1&limit=10
```
Returns application IDs, internship IDs, and creation timestamps only; applicant names and email addresses are not included.

### Standard Error Envelope
```json
{
  "status": "error",
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human-readable explanation"
  }
}
```

---

## 11. Tests & Results

### Running tests
```bash
# From project root — runs all server tests
npm test

# From server/ directory
node --test tests/api.test.js tests/security.test.js
```

### Actual test results (verified on 2026-10-18, Node v24.21.0, npm 11.19.0)

```
npm test
ℹ tests 61
ℹ suites 2
ℹ pass 61
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
```

Coverage includes:
- **26 REST API integration tests**: health checks, internship and application endpoints, query filtering, pagination, SQL injection protection, and constraint enforcement.
- **35 security & integration tests**: Helmet headers, CORS and preflight, `x-powered-by` suppression, query bounds, applicant validation, duplicate and closed-internship guards, rate limits, body size limits, error envelope consistency, applicant privacy, and administrative authentication.

The frontend does not currently have an automated UI test script. Its build and lint checks are run separately.

### Frontend Build
`npm run build` passed: Vite transformed 27 modules and completed without build errors.

### Frontend lint
```bash
npm run lint
```

Actual result: `oxlint` exited successfully without reporting warnings or errors.

---

## 12. Security Checklist

| Feature | Status | Details |
|---------|--------|---------|
| **Helmet security headers** | ✅ | `X-Content-Type-Options`, `X-Frame-Options`, `CSP`, `HSTS`, `Referrer-Policy` |
| **Administrative authentication** | ✅ | With `ADMIN_API_KEY`, mutation routes require `x-api-key` or `Authorization: Bearer <key>`; in production they are disabled when the key is not configured |
| **Rate limiting — general** | ✅ | 200 req / 15 min per IP on all `/api/*` (configurable) |
| **Rate limiting — submissions** | ✅ | 10 req / 15 min per IP on `POST /api/applications` (configurable) |
| **CORS origin control** | ✅ | Production allows the exact hosted frontend and configured origins; no wildcard origins |
| **Body size limit** | ✅ | All requests capped at 100 KB |
| **Parameterized SQL** | ✅ | All user values bound via `?` — no string interpolation |
| **Query param length limits** | ✅ | `q` ≤ 200, `domain` ≤ 100, `mode` ≤ 20 chars |
| **Server-side name validation** | ✅ | Required, 2–100 chars |
| **Server-side email validation** | ✅ | Email-format regex, max 255 chars |
| **Client-side email validation** | ✅ | Uses the same email-format regex as the server |
| **Duplicate application guard** | ✅ | DB UNIQUE constraint + pre-check with clear 409 |
| **Closed internship guard** | ✅ | `applications_open = 0` check before insert |
| **Nonexistent internship guard** | ✅ | Lookup before insert, returns 404 |
| **Foreign key enforcement** | ✅ | `PRAGMA foreign_keys = ON`, `ON DELETE RESTRICT` |
| **No stack trace in responses** | ✅ | Error handler strips internal details in development and production |
| **No SQL internals in responses** | ✅ | SQLite errors mapped to safe user messages |
| **PII not logged** | ✅ | Server error logs contain only the HTTP method and generic error code; error messages, paths, query strings, and request bodies are omitted |
| **PII omitted from application listings** | ✅ | `GET /api/applications` excludes applicant names and emails |
| **`x-powered-by` removed** | ✅ | Helmet + `app.disable('x-powered-by')` |
| **No hardcoded secrets** | ✅ | Admin credentials are read from environment; frontend API URL is public build-time configuration |
| **Duplicate submit prevention** | ✅ | `isSubmitting` state flag in React form |
| **Form keyboard accessibility** | ✅ | Labeled inputs, focus trap in modal, ARIA attributes |

---

## 13. Frontend / Backend Configuration

### Frontend (`src/services/api.js`)
The API base URL is read from:
```javascript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
```
Set `VITE_API_BASE_URL` in the root `.env` file before building.

### Backend (`server/src/app.js`)
Production allows the exact hosted frontend origin (`https://kannan-it-24.github.io`) and any additional exact origins configured in `FRONTEND_ORIGIN` as a comma-separated list. Localhost origins are allowed automatically only outside production. CORS permits `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, and `OPTIONS`, and allows `Content-Type` and `Authorization` headers. `PATCH` is allowed through CORS preflight but is not currently implemented as an API route. CORS controls browser access; it is not authentication. Rate limits are read from:
- `RATE_LIMIT_WINDOW_MS` / `RATE_LIMIT_MAX` — general limiter
- `APPLY_RATE_LIMIT_WINDOW_MS` / `APPLY_RATE_LIMIT_MAX` — submission limiter

---

## 14. Deployment Requirements & Limitations

| Concern | Details |
|---------|---------|
| **Frontend** | Deployed as a static site on GitHub Pages: `https://kannan-it-24.github.io/internship-board/`. `vite.config.js` sets the `/internship-board/` base path. |
| **Backend** | Deployed separately on Render: `https://internship-board-goud.onrender.com`; local development uses `http://localhost:5000` |
| **GitHub Actions** | `.github/workflows/deploy.yml` builds and deploys the frontend on pushes to `main` or manual dispatch. It reads `VITE_API_BASE_URL` from a repository variable, falling back to a repository secret. |
| **Render configuration** | The repository has no checked-in Render service manifest. Configure the backend service in Render using the steps below. |
| **CORS** | The backend allows the exact GitHub Pages frontend origin plus exact origins in `FRONTEND_ORIGIN`. CORS is not authentication. |
| **Database** | SQLite is stored at `server/data/internships.db` locally (or `data/internships.db` when the Render root directory is `server`). Render filesystem persistence depends on the service plan and disk configuration; use persistent storage for data that must survive restarts/redeploys. |
| **Rate limiting** | Uses an in-memory store — counters reset on server restart and are not shared across multiple backend instances. |
| **HTTPS** | Both public deployments use HTTPS. Local development uses HTTP. |
| **Secrets/configuration** | Keep admin credentials in backend environment variables. `VITE_API_BASE_URL` is public client configuration and must not contain secrets. |

---

## 15. Where to Find the Implementation

| Category | File(s) | Responsibility |
|----------|----------------|--------------|
| **Express app and middleware** | `server/src/app.js` | Registers Helmet, CORS, body parsing, rate limiting, API routes, and error handlers |
| **Administrative auth** | `server/src/middleware/adminAuth.js`, `server/src/routes/internships.js` | Protects internship create/update/delete routes |
| **Validation and errors** | `server/src/validators/`, `server/src/middleware/errorHandler.js` | Validates API input and formats safe error responses |
| **Database** | `server/src/config/database.js`, `server/src/db/`, `server/src/services/` | Opens SQLite, initializes/seeds data, and executes parameterized queries |
| **Frontend integration** | `src/App.jsx`, `src/services/api.js`, `src/components/` | Fetches and displays internships, handles loading/error states, and submits applications |
| **Automated tests** | `server/tests/api.test.js`, `server/tests/security.test.js` | Tests API behavior, security middleware, validation, privacy, and CORS |

---

## 16. Deploying the Backend to Render

The frontend is deployed by `.github/workflows/deploy.yml`; the backend is a separate Render web service. The currently published API is [https://internship-board-goud.onrender.com](https://internship-board-goud.onrender.com/).

For a new or reconfigured Render service:
1. Connect this GitHub repository as a Render **Web Service**.
2. Set **Root Directory** to `server`, **Build Command** to `npm ci`, and **Start Command** to `npm start`. Select Node.js `v22.12.0` or newer to meet the backend package requirement.
3. Set these backend environment variables:
   - `NODE_ENV`: `production`
   - `DATABASE_PATH`: `./data/internships.db`
   - `ADMIN_API_KEY`: generate a private random value if admin internship mutations should be enabled. If it is absent in production, those mutation routes return `403 Forbidden`.
   - `FRONTEND_ORIGIN`: optional comma-separated additional exact origins. The GitHub Pages origin is already allowed by the backend.
   - Do not manually set `PORT` unless your hosting configuration requires it; Render supplies the port.
4. To connect the Pages site, set the GitHub repository variable `VITE_API_BASE_URL` to `https://internship-board-goud.onrender.com/api`. The workflow can also read a repository secret of that name. Push to `main` or run the workflow manually to rebuild and deploy the frontend.
5. Check `https://internship-board-goud.onrender.com/api/health` after deploying the backend.

The SQLite path is relative to the backend root directory. Attach and configure persistent disk storage in Render if database contents must survive restarts or redeployments.

## 17. Operational Notes and Limitations

1. **Local vs. hosted URLs**: Local Vite uses `http://localhost:5000/api` by default. The deployed frontend needs `VITE_API_BASE_URL` set during its build because Vite embeds this value in the static JavaScript bundle.
2. **In-memory rate limiter**: Counters reset on server restart and are not shared between backend instances. A shared store such as Redis is needed for distributed deployments.
3. **SQLite persistence**: Locally, the database is stored in `server/data/internships.db`. Hosted persistence depends on the Render disk configuration; without persistent storage, database files may not survive service changes.
4. **Skills display data**: The `skills` array shown in the frontend comes from `src/data/internships.js` and is joined to API records by ID. It is not stored in SQLite. The database stores `id`, `title`, `domain`, `mode`, `duration_weeks`, and `applications_open` for internships.
5. **Reverse proxies**: The app enables `trust proxy` automatically in production. `TRUST_PROXY` can also enable it explicitly for local proxy testing.
