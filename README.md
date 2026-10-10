# InternHub — Full-Stack Internship Board

> **EdVyro Task 2: REST API & Persistent Data Storage**
>
> Building upon **Task 1** (Responsive React + Vite Frontend) by introducing an Express.js REST API, SQLite persistent storage, automated testing, and frontend integration.

- **Live Frontend**: [https://kannan-IT-24.github.io/internship-board/](https://kannan-IT-24.github.io/internship-board/)
- **GitHub Repository**: [https://github.com/kannan-IT-24/internship-board](https://github.com/kannan-IT-24/internship-board)

---

## 1. Project Overview

**InternHub** is a full-stack internship portal designed for students and graduates to discover and apply for verified internship opportunities.

- **Task 1 Foundation**: Responsive, accessible React single-page frontend with instant search, domain/mode filters, details modal, keyboard accessibility, and GitHub Pages deployment.
- **Task 2 Enhancement**: Production-ready Node.js & Express REST API with SQLite database persistence, foreign key enforcement, idempotent seed automation, comprehensive input validation, 26 automated integration tests, and live frontend data synchronization.

---

## 2. Key Features

### Backend (Task 2)
- **Persistent Storage**: SQLite database enforcing foreign keys and unique constraints (`internship_id`, `applicant_email`).
- **RESTful Endpoints**: Full CRUD for internships (`GET`, `POST`, `PUT`, `DELETE`), application submissions (`POST`), application listing (`GET`), and health diagnostics (`GET /api/health`).
- **Pagination & Filtering**: Parameterized SQL queries supporting `page`, `limit`, search query (`q`), and categorical filters (`domain`, `mode`).
- **Safe Application Submission**: Business logic and database constraint validation to reject duplicate applications, applications to nonexistent internships, or submissions to closed positions.
- **Cascading Protection**: Deletion policy returns `HTTP 409 Conflict` if an internship has active linked applications.
- **Idempotent Seeding**: Re-running the seed script inserts only missing records without duplicating or overwriting data.
- **Uniform API Envelope**: Consistent JSON structures for all success responses and error codes.
- **26 Automated Integration Tests**: Tested using Node.js built-in test runner and Supertest with an isolated in-memory test database.

### Frontend (Integrated with Backend)
- **Live Data Fetching**: Retrieves internships directly from Express API using a centralized API client (`src/services/api.js`).
- **Loading & Error Handling**: Accessible loading spinner and resilient error states with a functional **"Try Again"** retry action.
- **Interactive Application Modal**: Submit applications directly with real-time field validation, double-submission prevention, and feedback notifications.
- **Preserved Design & Accessibility**: Retains all original colors, dark/light contrast (WCAG AA), responsive mobile/tablet/desktop layouts, and keyboard focus trap.

---

## 3. Technologies

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, Vite 8, JavaScript (ES6+), Vanilla CSS3 (CSS Variables, Flexbox, Grid) |
| **Backend** | Node.js, Express.js 4, SQLite (`node:sqlite` built-in native driver) |
| **Testing** | Node.js Test Runner (`node --test`), Supertest |
| **Security & Middleware** | CORS, Body Parsers (size-limited JSON), Centralized Error Handler |
| **Deployment** | GitHub Pages (Static Frontend), Local/Cloud Node Runtime (Backend) |

---

## 4. Architecture

```text
[ Browser (React + Vite) ]
         │
         │ HTTP / JSON Requests (CORS-enabled)
         ▼
[ Express.js REST API Server (Port 5000) ]
   ├── Routing Layer (/api/internships, /api/applications)
   ├── Validation Middleware (internshipValidator, applicationValidator)
   ├── Controller Layer (internshipsController, applicationsController)
   ├── Service Layer (InternshipService, ApplicationService)
   └── Centralized Error Handling & Uniform JSON Envelope
         │
         │ Parameterized SQL Queries (PRAGMA foreign_keys = ON)
         ▼
[ SQLite Database (data/internships.db) ]
   ├── internships table
   └── applications table (Foreign Key & UNIQUE constraint)
```

---

## 5. Project Folder Structure

```text
internship-board/
├── .github/
│   └── workflows/
│       └── deploy.yml            # GitHub Pages deployment workflow (Static Frontend)
├── public/                       # Static public assets
├── server/                       # Backend Express & SQLite Application
│   ├── data/                     # SQLite database storage (git-ignored)
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js       # SQLite connection & schema initializer
│   │   ├── controllers/
│   │   │   ├── applicationsController.js # Application endpoints logic
│   │   │   └── internshipsController.js  # Internship CRUD controller
│   │   ├── db/
│   │   │   ├── init.js           # Database initialization script
│   │   │   ├── schema.sql        # Table DDL & constraint definitions
│   │   │   └── seed.js           # Idempotent seed script (4 records)
│   │   ├── middleware/
│   │   │   ├── errorHandler.js   # Centralized error & 404 handlers
│   │   │   └── validateRequest.js
│   │   ├── routes/
│   │   │   ├── applications.js   # /api/applications routes
│   │   │   └── internships.js    # /api/internships routes
│   │   ├── services/
│   │   │   ├── applicationService.js # Application queries & rules
│   │   │   └── internshipService.js  # Internship parameterized SQL queries
│   │   ├── utils/
│   │   │   └── errors.js         # AppError, ValidationError, NotFoundError, ConflictError
│   │   ├── app.js                # Express app factory (used in tests & server)
│   │   └── server.js             # HTTP server entry point (port 5000)
│   ├── tests/
│   │   └── api.test.js           # 26 automated integration tests
│   ├── .env.example              # Server environment variable template
│   └── package.json              # Server dependencies & test scripts
├── src/                          # Frontend React Source Code
│   ├── components/
│   │   ├── EmptyState.jsx        # No-results fallback view
│   │   ├── ErrorState.jsx        # API failure banner with Retry button
│   │   ├── Footer.jsx            # Semantic footer
│   │   ├── Header.jsx            # Accessible header & skip link
│   │   ├── Hero.jsx              # Hero introduction section
│   │   ├── InternshipCard.jsx    # Card showing title, mode, duration, open status
│   │   ├── InternshipList.jsx    # Responsive cards grid
│   │   ├── InternshipModal.jsx   # Details dialog & application form
│   │   └── SearchFilters.jsx     # Search input & dynamic dropdown filters
│   ├── data/
│   │   └── internships.js        # Fallback constants & domains
│   ├── services/
│   │   └── api.js                # Reusable frontend API client
│   ├── App.jsx                   # Main stateful application component
│   ├── index.css                 # Global typography, tokens, animations
│   └── main.jsx                  # React mount entry point
├── .env.example                  # Frontend environment variable template
├── .gitignore                    # Excludes node_modules, .env, and *.db files
├── index.html                    # Main HTML shell
├── package.json                  # Root scripts (build, dev, server, test, db:seed)
├── vite.config.js                # Vite build config with base path
└── README.md                     # Comprehensive documentation
```

---

## 6. Prerequisites & Node Version

- **Node.js**: `v20.x`, `v22.x`, or `v24.x` (Tested and verified on `v24.21.0` and Windows 11).
- **npm**: `v10.x` or `v11.x`.
- **Database Driver**: Uses Node's built-in SQLite engine (`node:sqlite`), which eliminates native compilation failures (`node-gyp` / Visual Studio C++ not required).

---

## 7. Installation & Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/kannan-IT-24/internship-board.git
   cd internship-board
   ```

2. **Install root frontend dependencies**:
   ```bash
   npm install
   ```

3. **Install backend dependencies**:
   ```bash
   cd server
   npm install
   cd ..
   ```

4. **Configure Environment Variables**:
   - In `server/`, copy `.env.example` to `.env`:
     ```bash
     PORT=5000
     DATABASE_PATH=./data/internships.db
     FRONTEND_ORIGIN=http://localhost:5173
     NODE_ENV=development
     ```
   - In root directory, copy `.env.example` to `.env`:
     ```bash
     VITE_API_BASE_URL=http://localhost:5000/api
     ```

---

## 8. Database Initialization & Seeding

The database scripts can be run from the root directory or inside `server/`.

### Initialize Database Schema
Creates `internships` and `applications` tables with foreign keys and unique constraints:
```bash
npm run db:init
```

### Seed Initial Records
Inserts the 4 mandated fictional sample internship records idempotently:
```bash
npm run db:seed
```

> **Idempotency Guarantee**: If the records already exist, running `npm run db:seed` will skip existing IDs without duplicating or overwriting them:
> ```text
> Database seeded successfully: 0 inserted, 4 already existed (preserved).
> ```

---

## 9. Running the Application

### Option A: Run Backend and Frontend Concurrently

1. **Terminal 1 — Start the Backend Server**:
   ```bash
   npm run server
   ```
   *The server starts at `http://localhost:5000`.*

2. **Terminal 2 — Start the Frontend Dev Server**:
   ```bash
   npm run dev
   ```
   *Open `http://localhost:5173` in your browser.*

---

## 10. Running Automated Tests

A comprehensive integration test suite verifies all 24 required test scenarios and extra safety rules:

```bash
npm test
```
*or directly inside `server/`:*
```bash
cd server
npm test
```

### Actual Test Results
```text
▶ InternHub REST API Automated Test Suite
  ✔ 1. GET /api/health should return 200 with health status
  ✔ 2. GET /api/internships should return 200 with list of seeded internships
  ✔ 3. GET /api/internships?page=1&limit=2 should return 200 with paginated results
  ✔ 4. GET /api/internships?q=frontend should return matching record
  ✔ 5. GET /api/internships?domain=UI/UX should return matching domain records
  ✔ 6. GET /api/internships?mode=Hybrid should return matching mode records
  ✔ 7. GET /api/internships/INT-001 should return 200 and single internship details
  ✔ 8. GET /api/internships/INT-999 should return 404 NOT_FOUND
  ✔ 9. POST /api/internships should create a new internship and return 201
  ✔ 10. POST /api/internships should reject missing required fields with 400
  ✔ 11. POST /api/internships with duplicate ID should return 409 CONFLICT
  ✔ 12. PUT /api/internships/:id should update internship and return 200
  ✔ 13. PUT /api/internships/:id for unknown ID should return 404 NOT_FOUND
  ✔ 14. DELETE /api/internships/:id should delete internship with no applications and return 200
  ✔ 15. DELETE /api/internships/:id for missing record should return 404 NOT_FOUND
  ✔ 16. GET /api/internships with negative page or non-numeric limit should return 400
  ✔ 17. POST /api/applications with valid data should return 201
  ✔ 18. POST /api/applications with missing name should return 400 VALIDATION_ERROR
  ✔ 19. POST /api/applications with invalid email format should return 400 VALIDATION_ERROR
  ✔ 20. POST /api/applications for nonexistent internship should return 404 NOT_FOUND
  ✔ 21. POST /api/applications duplicate should return 409 CONFLICT
  ✔ 22. POST /api/applications to closed internship (INT-004) should return 409 CONFLICT
  ✔ 23. Error responses must strictly adhere to the standard error envelope
  ✔ 24. SQL injection strings should be sanitized via parameterized queries
  ✔ DELETE /api/internships/:id with existing applications should return 409 CONFLICT
  ✔ GET /api/applications returns paginated application list
✔ InternHub REST API Automated Test Suite
ℹ tests 26 | pass 26 | fail 0
```

---

## 11. Database Schema & Seed Data

### Table 1: `internships`
| Field | Type | Modifiers | Description |
|---|---|---|---|
| `id` | `TEXT` | `PRIMARY KEY` | Unique internship identifier (e.g. `INT-001`) |
| `title` | `TEXT` | `NOT NULL` | Position title |
| `domain` | `TEXT` | `NOT NULL` | Department/field (e.g. `Web Development`) |
| `mode` | `TEXT` | `NOT NULL` | Work arrangement (`Remote`, `Hybrid`, `On-site`) |
| `duration_weeks` | `INTEGER` | `NOT NULL` | Duration in weeks |
| `applications_open` | `INTEGER` | `NOT NULL DEFAULT 1` | `1` = Open, `0` = Closed |

### Table 2: `applications`
| Field | Type | Modifiers | Description |
|---|---|---|---|
| `id` | `INTEGER` | `PRIMARY KEY AUTOINCREMENT` | Auto-incrementing application ID |
| `internship_id` | `TEXT` | `NOT NULL, REFERENCES internships(id)` | Foreign key to `internships.id` |
| `applicant_name` | `TEXT` | `NOT NULL` | Applicant's full name |
| `applicant_email` | `TEXT` | `NOT NULL` | Applicant's email address |
| `created_at` | `TEXT` | `NOT NULL DEFAULT CURRENT_TIMESTAMP` | Submission timestamp |

**Constraints**:
- `UNIQUE (internship_id, applicant_email)`: Prevents multiple applications by the same applicant to the same position.
- Foreign key enforcement is enabled via `PRAGMA foreign_keys = ON;`.

### Seed Dataset
1. **`INT-001`**: *Frontend Practice Internship* | Web Development | Remote | 4 Weeks | Applications: Open
2. **`INT-002`**: *Data Dashboard Internship* | Data Analytics | Remote | 6 Weeks | Applications: Open
3. **`INT-003`**: *Product Design Internship* | UI/UX | Hybrid | 4 Weeks | Applications: Open
4. **`INT-004`**: *C++ Utility Internship* | C++ Programming | Remote | 5 Weeks | Applications: Closed (`applications_open: 0`)

---

## 12. API Documentation

### Uniform Response Envelopes

#### List Response
```json
{
  "status": "success",
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 4,
    "totalPages": 1
  }
}
```

#### Detail / Mutation Response
```json
{
  "status": "success",
  "data": {}
}
```

#### Error Envelope
```json
{
  "status": "error",
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "A clear explanation of the problem."
  }
}
```

---

### Endpoints Reference

#### 1. Health Check
- **`GET /api/health`**
- **Response `200 OK`**:
  ```json
  {
    "status": "success",
    "data": {
      "status": "healthy",
      "message": "InternHub API is running smoothly."
    }
  }
  ```

#### 2. List Internships
- **`GET /api/internships`**
- **Query Parameters**:
  - `page` (integer, default: `1`)
  - `limit` (integer, default: `10`, max: `100`)
  - `q` (optional search query: matches title, domain, mode, or ID)
  - `domain` (optional domain filter, e.g. `UI/UX`)
  - `mode` (optional mode filter, e.g. `Remote`)
- **Example**: `GET /api/internships?page=1&limit=2&domain=Web%20Development`
- **Response `200 OK`**:
  ```json
  {
    "status": "success",
    "data": [
      {
        "id": "INT-001",
        "title": "Frontend Practice Internship",
        "domain": "Web Development",
        "mode": "Remote",
        "duration_weeks": 4,
        "applications_open": 1
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 2,
      "total": 1,
      "totalPages": 1
    }
  }
  ```

#### 3. Get Internship Details
- **`GET /api/internships/:id`**
- **Response `200 OK`** or **`404 NOT_FOUND`**.

#### 4. Create Internship
- **`POST /api/internships`**
- **Request Body**:
  ```json
  {
    "id": "INT-005",
    "title": "Backend Engineering Internship",
    "domain": "Backend Development",
    "mode": "Remote",
    "duration_weeks": 8,
    "applications_open": 1
  }
  ```
- **Response `201 CREATED`** or **`400 VALIDATION_ERROR`** or **`409 CONFLICT`**.

#### 5. Update Internship
- **`PUT /api/internships/:id`**
- **Request Body**:
  ```json
  {
    "title": "Senior Frontend Internship",
    "domain": "Web Development",
    "mode": "Hybrid",
    "duration_weeks": 6,
    "applications_open": 1
  }
  ```
- **Response `200 OK`** or **`404 NOT_FOUND`** or **`400 VALIDATION_ERROR`**.

#### 6. Delete Internship
- **`DELETE /api/internships/:id`**
- **Safety Policy**: If active applications exist for this internship, returns **`409 CONFLICT`** to prevent orphaned records.
- **Response `200 OK`**:
  ```json
  {
    "status": "success",
    "data": {
      "id": "INT-004",
      "deleted": true
    }
  }
  ```

#### 7. Submit Application
- **`POST /api/applications`**
- **Request Body**:
  ```json
  {
    "internship_id": "INT-001",
    "applicant_name": "Kannan G",
    "applicant_email": "kannan@example.com"
  }
  ```
- **Response `201 CREATED`**:
  ```json
  {
    "status": "success",
    "data": {
      "id": 1,
      "internship_id": "INT-001",
      "applicant_name": "Kannan G",
      "applicant_email": "kannan@example.com",
      "created_at": "2026-10-10 14:31:26"
    }
  }
  ```
- **Error Cases**:
  - `400 VALIDATION_ERROR`: Invalid email, missing name, or malformed body.
  - `404 NOT_FOUND`: Nonexistent `internship_id`.
  - `409 CONFLICT`: Duplicate application (same applicant & internship) or position is closed (`applications_open: 0`).

#### 8. List Applications (Development/Demo)
- **`GET /api/applications`**
- Returns paginated applications for inspection. Does not expose secrets or sensitive credentials.

---

## 13. Security & Validation Practices

- **SQL Injection Defense**: 100% of queries use prepared statements with parameterized placeholders (`?`). Direct string concatenation is prohibited.
- **Strict Input Validation**: Validates string lengths, allowed enum modes (`Remote`, `Hybrid`, `On-site`), email formats, and integer bounds.
- **Request Size Limits**: Express body parser is capped at `100kb` to protect against payload denial-of-service.
- **Safe Error Responses**: In production mode, raw database error strings and stack traces are suppressed, returning generic client-safe messages.
- **Privacy Protection**: Logs never output sensitive applicant data.
- **CORS Configuration**: Restricts origins via `FRONTEND_ORIGIN` with automatic local dev support.

---

## 14. Deployment Notes & Limitations

### GitHub Pages vs. Backend Architecture
1. **Frontend Deployment**:
   - The live site at [https://kannan-IT-24.github.io/internship-board/](https://kannan-IT-24.github.io/internship-board/) is hosted statically on **GitHub Pages**.
   - GitHub Pages only serves static assets (HTML, CSS, compiled JavaScript); it does not run Node.js or execute server-side code.
2. **Backend Execution**:
   - For evaluation and local use, the Express + SQLite backend runs locally on port 5000 (`npm run server`).
   - The frontend connects to `http://localhost:5000/api` (or custom `VITE_API_BASE_URL`).
   - When visited on GitHub Pages without a locally running or cloud-hosted backend, the frontend gracefully displays the accessible **Error State** banner informing the user that the backend server is offline, with a functional **"Try Again"** button.
3. **Cloud Deployment (Future Option)**:
   - To make the backend publicly accessible 24/7 alongside GitHub Pages, the `server/` directory can be deployed to a free cloud container host (e.g., Render, Railway, or Fly.io), and the GitHub Pages repository environment variable `VITE_API_BASE_URL` set to the resulting hosted backend URL.

---

## 15. Author

**Kannan G**

*EdVyro Full-Stack Engineering Program*
