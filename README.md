# Restaurant Takeaway Ordering System

**MAL3020 Full-Stack Development — Assessment 2**

A real-time takeaway ordering system built with the MEAN stack. The system contain three roles: Customers browse the menu, place orders, and track their status live. Kitchen staff see incoming orders instantly and advance their status. While admins manage the menu and view all orders.

## Author
**Student Name**: Ng Kean Chun

**Student ID**: BSSE2506036

## Stack
- **Frontend:** Angular 21 (Standalone components, Signals)
- **Backend:** Node.js 20 + Express + Socket.IO
- **Database:** MongoDB 7 (Mongoose ODM)
- **Testing:** Mocha + Chai + Supertest
- **CI/CD:** GitHub Actions
- **Infrastructure:** Docker + Docker Compose

## Features by Role

### Customer
- Register and log in securely (JWT)
- Browse the menu grouped by category
- Add items to a cart with quantity controls
- Place orders with optional notes
- View order history
- Track live order status updates via WebSockets (Placed → Preparing → Ready → Completed)

### Kitchen Staff
- Log in with a pre-seeded account
- View a live order queue (new orders appear instantly without refreshing)
- Advance order statuses through the state machine

### Admin
- Log in with a pre-seeded account
- Full CRUD operations on menu items
- Toggle item availability (sold-out items disappear from the customer menu)
- View a live table of all orders in the system

## Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (with Docker Compose v2)
- Web browser

## Quick Start

1. Clone the repository:
   ```bash
   git clone https://github.com/NgKeanChun120005/MAL3020-Fullstack-Development-BSSE2506036.git
   cd MAL3020-Fullstack-Development-BSSE2506036
   ```
   
2. Start the application:
  ```bash
  docker compose up --build
  (The first build takes 3–5 minutes. Subsequent starts take ~10 seconds.)
  ```
3. Access the application:
   - **Frontend:** http://localhost:4200
   - **Backend API Health Check:** http://localhost:5000/api/health

## Seed Data
To test the staff and admin views, you must populate the database with the default accounts and sample menu items. Run this command once while the containers are running:

  ``` bash
  docker compose exec backend npm run seed
  ```

  ## Test Accounts
  ### Admin:
  - **Email:** admin@takeaway.local
  - **Password:** admin12345
  ### Kitchen Staff:
  - **Email:** kitchen@takeaway.local
  -**Password:** kitchen12345

Customers can simply register their own new accounts via the frontend.

## Testing
The backend contains 42 automated tests covering unit tests, REST integration, and WebSocket integration.

To run the test suite inside Docker:

  ``` bash
  docker compose exec backend npm test
  ```

To run tests with coverage reporting (c8):

  ```bash
docker compose exec backend npm run test:coverage
  ```

## CI Pipeline
The project uses GitHub Actions (```.github/workflows/ci.yml```). On every push to ```main```, two parallel jobs will run:
 - **Backend:** ESLint + Mocha test suite with coverage.
 - **Frontend** Production build via ```ng build```.

## Architecture Overview
**Layered Backend:** Code is split into ```routes```, ```controllers```, ```services```, and ```models``` to enforce Separation of Concerns.

**Order State Machine:** Valid status transitions (e.g., Placed -> Preparing) are managed via a central ```ALLOWED_TRANSITIONS``` lookup table in the service layer.

**Embedded Order Items:** Orders store a snapshot of item names and prices at the time of purchase, ensuring historical data integrity.

**WebSockets:** Socket.IO handles real-time updates using rooms (```kitchen``` and ```order:<id>```) to ensure data is only sent to the correct clients.

**Design Tokens:** Frontend styling uses global CSS variables (```styles.css```) for consistent, maintainable UI across all views.
