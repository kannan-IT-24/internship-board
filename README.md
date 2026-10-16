# InternHub — Full-Stack Internship Board

> **EdVyro Full Stack Development Task 3: Secure Application Integration**
>
> Complete, production-grade integration featuring Helmet security headers, configurable rate limiting, administrative authentication, robust server + client validation, parameterized SQLite operations, 60 automated tests, and deployment readiness.

- **Live Frontend**: [https://kannan-IT-24.github.io/internship-board/](https://kannan-IT-24.github.io/internship-board/)
- **GitHub Repository**: [https://github.com/kannan-IT-24/internship-board](https://github.com/kannan-IT-24/internship-board)

---

## 1. Project Overview & Task 3 Satisfaction

**InternHub** is a secure, accessible, full-stack internship portal enabling students and graduates to discover verified internships and submit job applications.

### How this project fulfills EdVyro Task 3:
1. **API Data Fetching with Visible States**: React frontend asynchronously fetches internship data from the Express REST API, rendering an animated loading spinner during in-flight requests and an accessible `ErrorState` with a **Try Again** retry mechanism upon failure.
2. **Dual-Layer Application Validation**: Application submission enforces strict name (2–100 chars) and email (RFC 5322 regex) validation in both the React modal and Express middleware. Rejects duplicate submissions, closed internships, and nonexistent positions with appropriate HTTP status codes (`400`, `404`, `409`).
3. **Multi-Tier API Protection**:
   - **Rate Limiting**: Configurable global limiter (200 req/15 min) and strict submission limiter (10 req/15 min).
   - **Secure Headers**: Full Helmet suite (`X-Content-Type-Options: nosniff`, CSP frame protection, HSTS, Referrer-Policy, `x-powered-by` disabled).
   - **Administrative Authentication**: Mutation endpoints (`POST`, `PUT`, `DELETE /api/internships`) are protected by `requireAdminAuth` using `x-api-key` or Bearer tokens. In production, unauthenticated mutations are safely disabled (403 Forbidden).
   - **Parameterized SQL**: All database operations use `node:sqlite` parameter binding with `?` placeholders to prevent SQL injection.
4. **Automated Testing & Public Submission**: 60 automated tests across 2 test suites verifying all functional endpoints, error envelopes, rate limits, headers, applicant privacy, and authorization. Deployed publicly via GitHub Pages with full source code on GitHub.

---

## 2. Key Features

### Backend Security (Task 4 additions)
- **Helmet Security Headers**: `X-Content-Type-Options`, `X-Frame-Options`, `Content-Security-Policy`, `Strict-Transport-Security`, `Referrer-Policy`, `X-DNS-Prefetch-Control`.
- **Rate Limiting**: General limiter on all `/api/*` routes (200 req/15 min). Strict limiter on `POST /api/applications` (10 req/15 min). Both fully configurable via environment variables.
- **Query Parameter Validation**: Enforces maximum character lengths on `q` (200), `domain` (100), and `mode` (20) to prevent oversized inputs.
- **Body Size Limits**: All request bodies capped at 100 KB.
- **Environment-Driven CORS**: Production accepts only exact origins in `FRONTEND_ORIGIN` (comma-separated for multiple origins); local development allows the documented localhost origins.
- **No Secret Leakage**: `x-powered-by` suppressed. Internal errors and malformed JSON details are sanitized in every environment. Applicant names/emails are omitted from application listings and are not written to server logs.

### Backend (Task 3 preserved)
- **Persistent Storage**: SQLite enforcing foreign keys and `UNIQUE(internship_id, applicant_email)` constraint.
- **Full CRUD**: `GET`, `POST`, `PUT`, `DELETE` for internships; application submission (`POST`); listing (`GET`); health check.
- **Parameterized Queries**: All user-controlled values bound via `?` placeholders — no string interpolation into SQL.
- **Duplicate / Closed / Nonexistent Protection**: `409 Conflict` for duplicates and closed internships; `404 Not Found` for nonexistent targets.
- **Idempotent Seeding**: Re-running seed skips existing records without overwriting them.
- **Uniform Error Envelope**: `{ status: "error", error: { code, message } }` for all failures.

### Frontend (preserved and integrated)
- **Live API Data Fetching**: React fetches from Express API via `src/services/api.js`. Uses `VITE_API_BASE_URL` env var.
- **Loading / Error / Empty States**: Visible spinner on load; friendly error banner with **Try Again** button; empty state with **Clear Filters** button.
- **Application Form**: Client validates name (≥2 chars) and email (RFC 5322 regex matching server). Prevents double-submission while request is in-flight.
- **Closed Internship Guard**: Apply button disabled; locked message shown for closed positions.

---

## 3. Technologies

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, Vite 8, JavaScript (ES6+), Vanilla CSS3 |
| **Backend** | Node.js v24, Express.js 4, SQLite (`node:sqlite` built-in) |
| **Security** | Helmet 8, express-rate-limit 7, CORS (env-driven), body size limits |
| **Testing** | Node.js Test Runner (`node --test`), Supertest |
| **Deployment** | GitHub Pages (frontend), Local Node.js (backend) |

---

## 4. Architecture

```text
[ Browser (React + Vite) ]
         │
         │ HTTP / JSON — CORS-restricted to allowed origins
         ▼
[ Express.js REST API (Port 5000) ]
   ├── Helmet Middleware   ──── Security headers on every response
   ├── CORS Middleware     ──── Origin allowlist (env-configured)
   ├── Body Parser         ──── JSON, urlencoded (100 KB max)
   ├── General Rate Limiter ─── /api/*: 200 req / 15 min per IP
   ├── Routing Layer
   │    ├── /api/internships  → Internship CRUD
   │    └── /api/applications → Submit Limiter → Application CRUD
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
│   │   ├── api.test.js                 # 26 Task 3 integration tests
│   │   └── security.test.js            # 29 Task 4 security tests
│   ├── .env.example
│   └── package.json
├── src/                                # React frontend
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
│   ├── data/internships.js
│   ├── services/api.js                 # Centralized API client
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── .env.example
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
npm install
```

### 3. Install backend dependencies
```bash
cd server
npm install
cd ..
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

> ⚠️ **Never commit `.env` files to source control.** Both are listed in `.gitignore`.

---

## 8. Database Initialization & Seeding

Run from the **project root** (uses npm workspace scripts):

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
npm run server          # Production start
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

{ "title": "...", "domain": "...", "mode": "Remote", "duration_weeks": 6, "applications_open": 1 }
```

### Delete Internship
```http
DELETE /api/internships/:id
```
Returns `409 Conflict` if active applications exist.

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

A successful submission echoes the submitted applicant fields alongside its reference ID. `GET /api/applications` omits applicant names and email addresses.

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

### Actual test results (verified on 2026-10-16, Node v24.21.0)

```
npm test
ℹ tests 60
ℹ suites 2
ℹ pass 60
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
```

Coverage includes:
- **26 REST API integration tests**: health checks, CRUD endpoints, query filtering, pagination, SQL injection protection, constraint enforcement.
- **34 security & integration tests**: Helmet headers, `x-powered-by` suppression, query bounds, applicant validation edge cases, duplicate & closed guards, general & submission rate limits, body size limits, error envelope consistency, applicant PII redaction, and administrative authentication.

Manual browser checks: delayed API loading indicator; empty inventory and filtered-empty states; API error and Retry recovery; filter clearing; 360px layout without horizontal overflow; client-side name/email validation; and successful application submission against the local API.

### Frontend Build
```
✓ vite build → 27 modules transformed, built in 143ms
```
No build errors or warnings.

### Frontend lint
```bash
npm run lint
```

Actual result: `oxlint` exited successfully with **0 warnings and 0 errors** across all 32 project files.

---

## 12. Security Checklist

| Feature | Status | Details |
|---------|--------|---------|
| **Helmet security headers** | ✅ | `X-Content-Type-Options`, `X-Frame-Options`, `CSP`, `HSTS`, `Referrer-Policy` |
| **Administrative authentication** | ✅ | Mutation routes (`POST/PUT/DELETE /api/internships`) require `ADMIN_API_KEY`; disabled in production when unconfigured |
| **Rate limiting — general** | ✅ | 200 req / 15 min per IP on all `/api/*` (configurable) |
| **Rate limiting — submissions** | ✅ | 10 req / 15 min per IP on `POST /api/applications` (configurable) |
| **CORS origin control** | ✅ | Production allows only exact origins from `FRONTEND_ORIGIN`; no wildcard hosting origins |
| **Body size limit** | ✅ | All requests capped at 100 KB |
| **Parameterized SQL** | ✅ | All user values bound via `?` — no string interpolation |
| **Query param length limits** | ✅ | `q` ≤ 200, `domain` ≤ 100, `mode` ≤ 20 chars |
| **Server-side name validation** | ✅ | Required, 2–100 chars |
| **Server-side email validation** | ✅ | RFC 5322 regex, max 255 chars |
| **Client-side email validation** | ✅ | RFC 5322 regex (same as server) |
| **Duplicate application guard** | ✅ | DB UNIQUE constraint + pre-check with clear 409 |
| **Closed internship guard** | ✅ | `applications_open = 0` check before insert |
| **Nonexistent internship guard** | ✅ | Lookup before insert, returns 404 |
| **Foreign key enforcement** | ✅ | `PRAGMA foreign_keys = ON`, `ON DELETE RESTRICT` |
| **No stack trace in responses** | ✅ | Error handler strips internal details in development and production |
| **No SQL internals in responses** | ✅ | SQLite errors mapped to safe user messages |
| **PII not logged** | ✅ | Server error logs contain only the HTTP method and generic error code; error messages, paths, query strings, and request bodies are omitted |
| **PII omitted from application listings** | ✅ | `GET /api/applications` excludes applicant names and emails |
| **`x-powered-by` removed** | ✅ | Helmet + `app.disable('x-powered-by')` |
| **No hardcoded secrets** | ✅ | All config via environment variables |
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
Production CORS origins must be configured in `FRONTEND_ORIGIN` as a comma-separated exact-origin allowlist. Localhost origins are allowed automatically only outside production. CORS controls browser access; it is not authentication. Rate limits are read from:
- `RATE_LIMIT_WINDOW_MS` / `RATE_LIMIT_MAX` — general limiter
- `APPLY_RATE_LIMIT_WINDOW_MS` / `APPLY_RATE_LIMIT_MAX` — submission limiter

---

## 14. Deployment Requirements & Limitations

| Concern | Details |
|---------|---------|
| **Frontend** | Deployed to GitHub Pages (static). Hosted at `https://kannan-IT-24.github.io/internship-board/` |
| **Backend** | **Runs locally only** — not publicly deployed. Must be started manually on `localhost:5000` |
| **Cross-origin** | The live frontend cannot reach a local backend. The deployed page uses the API only when a local server is running |
| **Database** | SQLite file (`server/data/internships.db`) is local. Not suitable for multi-instance production deployment |
| **Rate limiting** | Uses in-memory store — resets on server restart, not shared across processes |
| **Scaling** | For production: use PostgreSQL, a persistent rate-limit store (Redis), and deploy the backend to a cloud service (Railway, Render, etc.) |
| **HTTPS** | Required for `Strict-Transport-Security` to activate. Local development uses HTTP |
| **Environment variables** | All secrets/config must be provided via environment — never committed to source control |

---

## 15. Task 3 Secure Application Integration Summary

| Category | File(s) Changed | What Changed |
|----------|----------------|--------------|
| **Headers and CORS** | `server/src/app.js` | Helmet headers; exact configured production origin allowlist; no credentialed CORS |
| **Administrative Auth** | `server/src/middleware/adminAuth.js`, `server/src/routes/internships.js` | `requireAdminAuth` middleware guarding POST, PUT, DELETE with `ADMIN_API_KEY`; disabled in production when unconfigured |
| **Rate limiting** | `server/src/middleware/rateLimiter.js`, `server/src/routes/applications.js` | Configurable general and application-submission limiters |
| **Validation and errors** | `server/src/validators/internshipValidator.js`, `server/src/middleware/errorHandler.js` | Query shape/size checks; safe 4xx parser errors and sanitized 5xx responses/logging |
| **Application privacy** | `server/src/services/applicationService.js` | Application listing omits applicant names and emails |
| **Frontend integration** | `src/App.jsx`, `src/services/api.js` | Validate API response shape and retain static detail metadata on API-backed listings |
| **Application form** | `src/components/InternshipModal.jsx` | Name/email bounds, synchronous duplicate-submit guard, in-flight close protection |
| **Responsive layout** | `src/index.css` | Prevent narrow-screen grid overflow and wrap modal metadata |
| **Environment** | `server/.env.example`, `server/package.json` | Document configurable origins, limits, and ADMIN_API_KEY; include Helmet and rate-limit middleware dependencies |
| **Tests** | `server/tests/security.test.js` | 34 security, validation, privacy, rate-limit, and administrative auth tests |
| **Documentation** | `README.md` | Full Task 3 documentation with security checklist, test results, API reference, and deployment guide |

---

## 16. Step-by-Step Backend Deployment Guide (Render / Railway)

If deploying the backend to a cloud hosting platform to connect with the live frontend:

### Deploying to Render (Web Service):
1. Create a free account at [render.com](https://render.com).
2. Click **New +** > **Web Service** and connect this GitHub repository (`kannan-IT-24/internship-board`).
3. Set the following build and start configurations:
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. Add the following **Environment Variables** in Render's dashboard:
   - `NODE_ENV`: `production`
   - `PORT`: `5000` (or leave default assigned by Render)
   - `DATABASE_PATH`: `./data/internships.db`
   - `FRONTEND_ORIGIN`: `https://kannan-IT-24.github.io`
   - `ADMIN_API_KEY`: *(generate a secure random string for admin API access)*
5. Once deployed, Render provides an HTTPS URL (e.g. `https://internhub-api.onrender.com`).
6. Set `VITE_API_BASE_URL=https://internhub-api.onrender.com/api` in your frontend build settings or GitHub Actions repository secrets, then rebuild the frontend.

---

## 17. Remaining Known Limitations

1. **Local vs. Cloud Backend**: By default, the Express API runs on `http://localhost:5000`. The static GitHub Pages frontend communicates with the local backend when running locally, or with the cloud backend when `VITE_API_BASE_URL` is pointed to the deployed backend URL.
2. **In-memory rate limiter**: Rate limit counters reset on server restart and are memory-backed. A Redis store (e.g. `rate-limit-redis`) is recommended for multi-instance distributed deployments.
3. **Database storage**: The SQLite database (`server/data/internships.db`) uses the local filesystem. For serverless or ephemeral platforms without persistent disk mounts, migrate to PostgreSQL or attach a persistent volume.
4. **Skills field**: The `skills` array shown in the frontend modal comes from `src/data/internships.js` (enriching the SQLite records by ID). The SQLite schema stores `id`, `title`, `domain`, `mode`, `duration_weeks`, `applications_open`.
5. **Reverse proxies**: When deploying behind a reverse proxy (Cloudflare, Nginx, Render), set `app.set('trust proxy', 1)` so client IP detection accurately distinguishes separate users for rate limiting.
