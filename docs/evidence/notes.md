# Log Notes

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
- Screenshots: docs\evidence\screenshots\backend-connected-to-database.png

## MongoDB Compass — password hashing verified
- Date: 16-10-2026
- Purpose: Compass screenshot showing passwordHash field is a bcrypt hash,
  not plaintext.
- Screenshots: docs\evidence\screenshots\mongodb-user-document-in-compass.png


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


## Jest configuration (OUTDATED: no longer use Jest)
- Written: 21-10-2026
- File: backend/package.json (jest block)
- Notes: Uses experimental-vm-modules for ESM; testMatch restricted to tests/**/*.test.js.


## auth.service.ts + auth.interceptor.ts (frontend)
- Written: 22-10-2026
- Path: frontend/src/app/services/auth.service.ts, interceptors/auth.interceptor.ts
- Notes: auth.service.ts handles login/logout and registration, while auth.interceptor.ts intercepts outgoing HTTP requests (For example: When you makes an API request (http://localhost:4200/admin), it will intercept the request before it hits the network.)


## auth.guard.ts + roleGuard (frontend)
- Written: 22-10-2026
- Path: frontend/src/app/guards/auth.guard.ts
- Reason: Mirrors the backend split (authMiddleware vs roleGuard). authGuard checks if anyone is logged in, and roleGuard('admin') if the user is an admin or not.


## Temporary accounts for testing
- Written: 22-10-2026
- Below will show 2 temporary credentials for each role to test login authentication for the Frontend test:
- Role: admin, Email: admin@takeaway.local, Password: admin12345
- Role: Customer, Email: frontendtest1@gmail.com, Password: Abcd6075!


## Module system refactor: ESM to CommonJS
- Date: 23-10-2026
- Approach: Removed "type": "module"; converted every backend file to require/module.exports. Frontend (Angular) remains TypeScript with its own module system (not affected).
- results: Jest (which needed --experimental-vm-modules) replaced with Mocha + Chai, matching the module system and simplifying test execution.


## Test framework: Jest -> Mocha + Chai
- Date: 23-10-2026
- Assertion style: Chai `expect` (BDD) instead of Jest's `expect` — same concept, different API. Example: `expect(res.status).to.equal(201)` vs `expect(res.status).toBe(201)`.
- Structure: Mocha uses `describe`/`it` (same as Jest), but lifecycle hooks are `before`/`after`/`beforeEach`/`afterEach` — Jest's `beforeAll` is Mocha's `before`.


## menuRoutes.js — roleGuard applied to menuRoutes.js
- Written: 25-10-2026
- Path: backend/src/routes/menuRoutes.js
- Notes: roleGuard's purpose is authorization. Even if a malicious user discovers the URLs to certain pages the roleGuard intercepts the request before the page loads. It checks the user's authenticated role against the required roles for that route. If they don't have permission, it blocks access and redirects them.

## menu.test.js — CRUD integration tests
- Written: 25-10-2026
- Path: backend/tests/menu.test.js
- Reason: Tests the same write route with three different callers: anonymous, customer,admin. The test helps to demonstrate that authorization is enforced end-to-end. Also tests validation (negative price, invalid category) and 404 handling.


## Test totals
-Written 25-10-2026
- Unit tests: 4 (roleGuard)
- Integration tests (auth): 8
- Integration tests (menu): 10
- Total: 22 passing
- Screenshots: docs\evidence\screenshots\integration-test-for-menu-and-auth.png

## menu.service.ts (frontend)
- Written: 25-10-2026
- Path: frontend/src/app/services/menu.service.ts
- Notes: Thin HTTP client — the UI has no knowledge of fetch mechanics. `MenuItemDraft` (Partial<MenuItem> minus id/timestamps) enforces at the type level that creates/updates don't send fields the server manages.

## admin-menu.ts (frontend)
- Written: 26-10-2026
- Path: frontend/src/app/pages/admin-menu/admin-menu.ts
- Notes: The component's responsibility is "manage the menu list", which handles both create and edit, distinguished by `editingId()` signal.

## app.routes.ts — roleGuard applied to admin route
- Written: 26-10-2026
- Path: frontend/src/app/app.routes.ts
- Notes: This is the frontend counterpart to backend menuRoutes.js.

## System test evidence 2nd milestone
- Manual system test performed: 27-10-2026
- Scenarios covered:
  1. Anonymous visitor browses /menu (10 items grouped)
  2. Admin sees Manage Menu in navbar
  3. Create item -> appears in admin table and public menu
  4. Edit price -> reflected in both views
  5. Toggle availability -> hidden from public menu
  6. Delete item -> removed from both views
  7. Customer blocked from /admin/menu by role guard
- Screenshots:
  - docs/evidence/screenshots/menu-public.png
  - docs/evidence/screenshots/admin-menu-table.png