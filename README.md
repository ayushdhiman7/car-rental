# Drive — Car Rental

<p align="center">
  <strong>Browse. Book. Drive.</strong><br/>
  A full-stack car rental web app with a React frontend and an Express + MySQL API.
</p>

<p align="center">
  <img alt="React" src="https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black" />
  <img alt="Vite" src="https://img.shields.io/badge/Vite-5-646CFF?style=flat-square&logo=vite&logoColor=white" />
  <img alt="Express" src="https://img.shields.io/badge/Express-4-000000?style=flat-square&logo=express&logoColor=white" />
  <img alt="MySQL" src="https://img.shields.io/badge/MySQL-8-4479A1?style=flat-square&logo=mysql&logoColor=white" />
</p>

---

## Features

- **Fleet browsing** — filter by category, search by name/brand, sort by price or rating
- **Car details** — seats, transmission, fuel, rating, and day rate
- **Instant booking** — pickup location, dates, and totals computed on the server
- **My bookings** — look up reservations by email
- **Clean REST API** — CORS-ready Express backend with MySQL storage

---

## Tech stack

| Layer    | Stack                          |
|----------|--------------------------------|
| Frontend | React 18, React Router, Vite   |
| Backend  | Node.js, Express               |
| Database | MySQL (local or cloud)         |

---

## Project structure

```text
car-rental/
├── frontend/          # Vite + React SPA
│   ├── src/
│   │   ├── pages/     # Home, Cars, CarDetails, MyBookings
│   │   ├── components/
│   │   └── api.js     # Fetch wrapper (VITE_API_BASE)
│   └── .env.example
└── backend/           # Express REST API
    ├── migrations/    # SQL schema migrations
    ├── server.js
    ├── migrate.js
    ├── seed.js
    └── .env           # DB credentials (not committed)
```

---

## Getting started

### Prerequisites

- Node.js 18+
- MySQL 8+ (or a managed MySQL instance)

### 1. Clone & install

```bash
git clone <your-repo-url>
cd car-rental

cd backend && npm install
cd ../frontend && npm install
```

### 2. Configure the backend

Create `backend/.env`:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=car_rental
PORT=4000
```

> If your host requires TLS, place a `ca.pem` next to `backend/db.js` — the app picks it up automatically.

### 3. Migrate & seed

```bash
cd backend
node migrate.js
npm run seed
```

### 4. Configure the frontend

Create `frontend/.env` (or copy the example). Point it at the **full backend URL**:

```env
# Local backend
VITE_API_BASE=http://localhost:4000/api

# Production (Render) — also set this in Vercel → Project → Settings → Environment Variables
# VITE_API_BASE=https://your-service.onrender.com/api
```

There is no Vite proxy — the browser calls the API URL from `VITE_API_BASE` directly.

### 5. Run

**Terminal 1 — API**

```bash
cd backend
npm run dev
# → http://localhost:4000
```

**Terminal 2 — UI**

```bash
cd frontend
npm run dev
# → http://localhost:5173
```

Open [http://localhost:5173](http://localhost:5173) and you’re ready to roll.

---

## API reference

Base path: `/api`

| Method | Endpoint              | Description                                      |
|--------|-----------------------|--------------------------------------------------|
| `GET`  | `/health`             | Health check                                     |
| `GET`  | `/categories`         | Categories with vehicle counts                   |
| `GET`  | `/cars`               | List cars (`category`, `search`, `sort`, `maxPrice`) |
| `GET`  | `/cars/:id`           | Single car                                       |
| `POST` | `/bookings`           | Create a booking                                 |
| `GET`  | `/bookings?email=`    | List bookings (optional email filter)            |

**Example booking body**

```json
{
  "car_id": 1,
  "customer_name": "Jane Doe",
  "email": "jane@example.com",
  "phone": "+1 555 0100",
  "pickup_location": "Downtown Depot",
  "start_date": "2026-08-01",
  "end_date": "2026-08-05"
}
```

Totals are always recomputed server-side from `price_per_day` — never trusted from the client.

---

## Pages

| Route         | Page        | Purpose                          |
|---------------|-------------|----------------------------------|
| `/`           | Home        | Hero, categories, featured cars  |
| `/cars`       | Cars        | Search, filter, and browse fleet |
| `/cars/:id`   | CarDetails  | Vehicle info + booking form      |
| `/bookings`   | MyBookings  | Find bookings by email           |

---

## Scripts

**Backend**

| Command            | What it does              |
|--------------------|---------------------------|
| `npm start`        | Start API                 |
| `npm run dev`      | Start API with `--watch`  |
| `node migrate.js`  | Run pending migrations    |
| `npm run seed`     | Seed sample cars          |

**Frontend**

| Command         | What it does        |
|-----------------|---------------------|
| `npm run dev`   | Vite dev server     |
| `npm run build` | Production build    |
| `npm run preview` | Preview production build |

---

## License

All rights reserved by **Ayush Dhiman**.
