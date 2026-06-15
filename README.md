# SlotGemz Admin Panel

Vite + React + TypeScript admin app. Uses the same backend as the main site.

## Setup

1. Ensure at least one user has `rank: 'admin'` in the database (e.g. set in MongoDB).
2. Copy `.env` and set `VITE_API_URL` and `VITE_SOCKET_URL` to your backend (e.g. `http://demo-api.grakairos.com`).
3. `npm install && npm run dev` — app runs on port 5174.

## Features

- **Login**: POST `/admin/login` (email + password, no captcha). Only users with `rank: 'admin'` can sign in.
- **Register**: Uses main backend `/auth/credentials/register` (captcha required there). After registering, set the user's `rank` to `admin` in the DB to access the panel.
- **Dashboard**: KPIs (total users, new this month, banned, games), Latest Pay Stats, Latest Game Stats, Latest Registrations.
- **Users**: List/search users via socket `getUserList`.
- **Games**: RTP & win % per game (from recent data), game history table.

## Backend

- New route: `GET /admin/dashboard` (auth + admin) — returns counts and latest pay/game/registrations.
- New route: `POST /admin/login` — admin-only login (no captcha).

