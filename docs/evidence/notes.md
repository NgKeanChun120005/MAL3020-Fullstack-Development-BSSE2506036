# Log Notes

Running log of code written, why, and where it will be referenced in the report.

---

## Health check endpoint (backend/src/index.js)
- Written: 14-10-2026
- Purpose: Minimal /api/health route to verify Express is running


## HealthService (frontend/src/app/services/health.service.ts)
- Written: 14-10-2026
- Purpose: Angular service calling backend health endpoint

## docker-compose.yml
- Written: 14-10-2026
- Purpose: Orchestrates mongo, backend, frontend containers

## backend/Dockerfile
- Written: 14-10-2026
- Purpose: Node 20-alpine image running Express dev server

## frontend/Dockerfile
- Written: 14-10-2026
- Purpose: Node 20-alpine image running Angular dev server
- Notes: Runs ng serve with --host 0.0.0.0 and --poll 2000 to support Windows host volume mounts.

---

## Docker Compose stack — 1st milestone
- Date: 14-10-2026
- Status: WORKING
- Evidence: docs/evidence/screenshots/docker-containers-running.png
            docs/evidence/screenshots/app-health-check.png
            docs/evidence/test-results/docker-ps.txt
- Report sections:
  - Design (component architecture): three containers on shared network
  - DevOps (pipeline): containerised development environment
- Notes: Backend is now reachable at http://localhost:5000, frontend at http://localhost:4200. Frontend successfully calls backend via CORS-restricted HTTP. MongoDB is running but not yet connected to app.

---

## AppError.js + errorHandler.js
- Written: 16-10-2026
- Path: backend/src/utils/AppError.js, backend/src/middleware/errorHandler.js
- Purpose: Custom error type + centralised Express error handler
- Report section: 4.3 Design Practices — DRY
- Snippet: AppError class + errorHandler

## User.js (password hashing)
- Written: 16-10-2026
- Path: backend/src/models/User.js
- Purpose: User schema with bcrypt hashing + comparePassword method
- Snippet: pre('save') hook + comparePassword method
- Notes: Mongoose 8 removed the next callback from async hooks, so the pre('save') hook now uses the returned-promise style instead of next().

## db.js (Mongo connection)
- Written: 16-10-2026
- Path: backend/src/config/db.js
- Purpose: Single place that knows how to connect to MongoDB
- Notes: Separation of concerns — index.js starts the app while db.js handles
  the database connection. This makes it easier for me to add a second database or swap to a replica set in the future, since I only need to change db.js.
- Evidence: docs\evidence\screenshots\backend-connected-to-database.png

## MongoDB Compass — password hashing verified
- Date: 16-10-2026
- Purpose: Compass screenshot showing passwordHash field is a bcrypt hash,
  not plaintext.
- Evidence: docs\evidence\screenshots\mongodb-user-document-in-compass.png


## authMiddleware.js + roleGuard.js
- Written: 21-10-2026
- Path: backend/src/middleware/authMiddleware.js, roleGuard.js
- Purpose: Separate concerns — authMiddleware the token, roleGuard checks role. The reason why is because a combined checkAuth would couple token verification with authorisation, so a change to either could break the other. Here, authMiddleware only cares about JWT, while roleGuard only cares about roles, and they compose per route via `authMiddleware, roleGuard('admin')`.


## authService.js
- Written: 21-10-2026
- Path: backend/src/services/authService.js
- Purpose: Business logic for register/login — hashing, JWT signing, user sanitisation and the login function (identical error messages for enumeration protection)


## roleGuard.test.js — unit test
- Written: 21-10-2026
- Path: backend/tests/roleGuard.test.js
- Type: Unit testing
- Purpose: To demonstrate a pure unit test (no database, http or filesystem etc).
- Lines to show: the first two `it` blocks (allow case + reject case)


## auth.test.js — integration test
- Written: 21-10-2026
- Path: backend/tests/auth.test.js
- Type: Integration testing (Supertest → Express → middleware → service → model → in-memory Mongo)
- Purpose: To demonstrate the full request lifecycle in a real HTTP context, including validation, error handling, hashing, and JWT issuing. It also demonstrates a security property (user enumeration) via an assertion comparing two error responses.
- Lines to show: the "rejects wrong password with same error as unknown email" test, this is to show that it shows testing of a behaviour, not just a return value.


## app.js — testability refactor
- Written: 21-10-2026
- Path: backend/src/app.js
- Purpose: Separate app definition from server startup so tests can use Supertest without binding a port.
- Reason: To prevent the import of running server in tests. Splitting createApp() from index.js makes the app a pure function of its dependencies. 


## Jest configuration
- File: backend/package.json (jest block)
- Notes: Uses experimental-vm-modules for ESM; testMatch restricted to tests/**/*.test.js.