# Fixup REST API Backend

Production-ready Node.js and Express REST API backend for the **Fixup** Home Services Platform. Supports all three client modules:
1. **User Module** (Service discovery, booking lifecycle, price estimator)
2. **Provider Desk** (Job alerts, duty toggles, execution tracker, payouts)
3. **Admin & Dev Console** (Dispatch board, KYC verification desk, telemetrics)

---

## 🚀 Quick Start

### 1. Install Dependencies
Open your terminal in the `backend/` directory:
```bash
npm install
```

### 2. Start the Server
```bash
npm start
```
The server will boot on `http://localhost:5000`.

For auto-reloading development mode:
```bash
npm run dev
```

---

## 📡 REST API Reference

### 🛠️ Services Endpoints
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/services` | Retrieve list of all available household services |
| `POST` | `/api/services` | Add a new service offering to the catalog |
| `PATCH` | `/api/services/:id/price` | Update base price tariff for a service |

### 👷 Providers Endpoints
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/providers` | List all registered service technicians |
| `POST` | `/api/providers/register` | Register a new service professional (KYC Pending) |
| `PATCH` | `/api/providers/:id/duty` | Toggle duty status (`online` / `offline`) |

### 📅 Bookings & Dispatch Endpoints
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/bookings` | List all active and historical bookings |
| `POST` | `/api/bookings` | Create a new service request / booking |
| `PATCH` | `/api/bookings/:id/status` | Update booking status (`pending`, `assigned`, `enroute`, `in_progress`, `completed`) |
| `PATCH` | `/api/bookings/:id/assign` | Reassign a technician to a booking |

### ⚡ Admin & Telemetrics Endpoints
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/admin/metrics` | Real-time Gross Merchandise Value (GMV), 15% platform take-rate, active dispatches |
| `PATCH` | `/api/admin/providers/:id/kyc` | Verify (`verified`) or reject (`rejected`) provider KYC |
| `GET` | `/api/health` | Healthcheck and server uptime |

---

## 🔒 Architecture & Data Persistence
- Pre-seeded with initial verified professionals, electrical and plumbing categories, and active bookings located in `data/initialData.json`.
- Automatically persists state changes to `data/store.json`.
- Zero database setup required: lightweight, fast, and self-contained.
