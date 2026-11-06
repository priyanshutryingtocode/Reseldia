# Reseldia

Reseldia is a full-stack event management platform for residential communities. It helps organizers create, edit, and moderate events while residents discover them, RSVP, vote in community polls, join discussions, and stay on top of announcements.

## Features

* **Event management**: Create, edit, delete, cancel, and complete events. Organizer edits return events to moderation unless the editor is an admin.
* **Admin moderation queue**: New and edited events from residents require admin approval before going live. Admins are notified of pending counts in the navbar.
* **RSVPs with capacity control**: Transactional join flow with row locking — no overbooking, no duplicate registrations.
* **Announcements carousel**: Admins publish/edit/deactivate announcements shown on the dashboard carousel.
* **Community polls**: Active poll widget with one-vote-per-user enforcement (transactional, validated against the poll and option).
* **Comments**: Per-event discussion board on the dashboard cards and the event details page.
* **Bookmarks**: Save events for later from the dashboard or the event details page.
* **Notifications**: In-app notifications for RSVPs to your event, comments, approvals/rejections, and cancellations/deletions of events you joined.
* **User profiles**: Personal stats (joined/created/saved/live/pending), guest lists for organizers, and event history.
* **Role-based access**: Residents and admins with separate dashboards; admin-only routes enforced in the UI and on the API.
* **Responsive design**: Tailwind CSS, dark, editorial-style UI with a "Playfair Display / Inter" pairing.

## Tech Stack

### Frontend
* **React 19** with **Vite 7**
* **Tailwind CSS 3**
* **React Router 7**
* **Axios** (shared instance with auth header injection and 401 handling)

### Backend
* **Node.js & Express 5**
* **PostgreSQL** via `pg`
* **JWT** (`jsonwebtoken`) sessions, **bcrypt** password hashing
* **helmet** security headers and **express-rate-limit** on `/api/auth`

## Installation

### Prerequisites
* Node.js and npm
* A running PostgreSQL instance (local or hosted, e.g. Render/Supabase/Neon)

### Backend

```bash
cd backend
npm install
```

Create `backend/.env`:

```env
PORT=5000
JWT_SECRET=change-me-to-a-long-random-string

# Local database
DB_USER=postgres
DB_PASSWORD=yourpassword
DB_HOST=localhost
DB_PORT=5432
DB_NAME=Reseldia

# Or a hosted database (takes precedence over the local settings)
# DATABASE_URL=postgres://user:password@host:5432/dbname

# Comma-separated list of allowed origins (defaults to any origin if unset)
# CORS_ORIGIN=http://localhost:5173
```

The server creates/verifies its feature tables (`event_bookmarks`, `notifications`, `announcements`) on boot via `src/db/initFeatureTables.js`. The base tables — `users`, `activities`, `registrations`, `comments`, `polls`, `poll_options`, `poll_votes`, `announcements` — must exist; load your schema before first start.

```bash
npm run dev    # nodemon (development)
npm start      # node server.js (production)
npm run migrate
```

### Frontend

```bash
cd frontend
npm install
```

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000
```

```bash
npm run dev     # development server
npm run build   # production build -> dist/
npm run lint    # eslint
```

### Making a user an admin

Registration always creates `resident` accounts. Promote one manually:

```sql
UPDATE users SET role = 'admin' WHERE email = 'you@example.com';
```

## Project Structure

```
backend/
  server.js                  Express app wiring, security middleware, startup
  db.js                      PostgreSQL pool (local or DATABASE_URL)
  scripts/migrate.js         Creates feature tables on demand
  src/
    controllers/             Route handlers (auth, events, polls, announcements, notifications)
    routes/                  Express routers mounted under /api/*
    middleware/              JWT auth, admin check, 404 + error handlers
    db/initFeatureTables.js  CREATE TABLE IF NOT EXISTS for feature tables
frontend/
  src/
    App.jsx                  Routes (protected layout, admin route, 404)
    components/              Navbar, Footer, Layout, PollWidget, NewsCarousel,
                             CommentSection, ToastProvider, ProtectedRoute
    pages/                   Home, Login, Register, Dashboard, AdminDashboard,
                             Profile, CreateEvent, EventDetails, StaticPages, NotFound
    lib/api.js               Axios instance: base URL, Bearer token, 401 handling
```

## API Overview

* `POST /api/auth/register` · `POST /api/auth/login` · `GET /api/auth/me`
* `GET|POST /api/events` · `GET|PUT|DELETE /api/events/:id` · `POST /api/events/:id/join`
* `GET /api/events/my-events` · `GET /api/events/created-by-me` · `GET /api/events/bookmarked` · `GET /api/events/stats/me`
* `POST /api/events/:id/bookmark` · `GET|POST /api/events/:id/comments` · `GET /api/events/:id/attendees`
* `PUT /api/events/:id/cancel` · `PUT /api/events/:id/complete`
* `GET /api/events/pending` · `PUT /api/events/approve/:id` · `PUT /api/events/reject/:id` (admin)
* `GET /api/polls/active` · `POST /api/polls/vote`
* `GET /api/announcements` · `GET /api/announcements/all` · `POST|PUT|DELETE /api/announcements[/:id]` (admin for writes)
* `GET /api/notifications` · `PUT /api/notifications/read`
* `GET /api/health` (database connectivity check)
