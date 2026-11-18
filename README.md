# 🛠️ Fixup — On-Demand Home Services Platform

> **"Your Home Deserves the Best. Book Trusted Professionals."**  
> A modern, premium, minimalistic on-demand home services startup platform connecting urban households with certified, police-verified specialists.

---

## 🌟 Key Architecture & Highlights

Fixup is built as a complete commercial-grade web application featuring:
1. **Light & Dark Theme Engine:** Seamless switching with persistent storage and system preference detection across every page.
2. **Role-Aware Commercial Navbar:** Sticky navigation with dynamic authentication states for Customers, Service Providers, and Guests.
3. **Strict Role Exclusivity:** Separate Customer and Provider accounts. One person can register and use only one role per account.
4. **Email OTP Verification Flow:** 6-digit secure verification code generation with expiration, resend limits, and account activation.
5. **5-Step Service Provider Registration Wizard:** Personal info, address, trade skills, government KYC documents, and review before OTP verification.
6. **Provider Business Dashboard:** 9 overview KPI cards, native HTML5 Canvas earnings analytics, Top 5 Loyal Customers, and a live **15-Day Recurring KYC Countdown Clock**.
7. **Customer Dashboard:** Real-time 5-step visual tracking timeline (`Placed` ➔ `Assigned` ➔ `Accepted` ➔ `In Progress` ➔ `Completed`), booking history, rebooking, and reviews.
8. **Dynamic Pricing System:** Transparent breakdown including daytime base rates, **night surcharges (8:00 PM – 6:00 AM)**, 60-minute emergency rush fees, and 5% GST/platform trust fees.
9. **Dedicated Enterprise Admin Console:** Entirely separate portal (`frontend/admin/login.html`) with KPI telemetry, technician KYC approvals, and live dispatch control.
10. **Backend REST API & Zero-Dependency Native Server:** Production-ready Express API and standalone zero-dependency native Node.js HTTP server.

---

## 📂 Project File & Directory Structure

```text
Fixup/
│
├── index.html                           # Commercial Landing Page
├── .env.example                         # Environment configuration template
├── README.md                            # Complete Project Documentation
│
├── frontend/
│   ├── css/
│   │   ├── themes.css                   # Light & Dark mode variables & transitions
│   │   ├── global.css                   # Resets, typography, buttons, badges, modals, toasts
│   │   ├── navbar.css                   # Commercial sticky navbar, profile dropdowns & mobile drawer
│   │   ├── home.css                     # Landing page hero, search strip, cards & FAQs
│   │   ├── auth.css                     # Login, OTP screens & 5-step provider registration wizard
│   │   ├── customer.css                 # Customer dashboard & 5-step visual tracking timeline
│   │   ├── provider.css                 # Provider dashboard, 9 KPIs, duty switch, loyal customers
│   │   └── admin.css                    # Admin sidebar layout, tables & 15-day live KYC countdown badges
│   │
│   ├── js/
│   │   ├── theme.js                     # Light / Dark theme controller & localStorage persistence
│   │   ├── store.js                     # Persistent client store, 72h session security, pricing & KYC engine
│   │   ├── app.js                       # Universal navbar hydration, auth-aware menus & toasts
│   │   ├── auth.js                      # Login, Customer & Provider registration + OTP verification
│   │   ├── booking.js                   # Request a Service, emergency rush & dynamic night pricing
│   │   ├── customer.js                  # Customer dashboard metrics & active 5-step order tracker
│   │   ├── provider.js                  # Provider 9 KPIs, native canvas analytics, duty toggle & payout
│   │   └── admin.js                     # Admin dashboard metrics, live dispatch & 15-day KYC countdown
│   │
│   ├── pages/
│   │   ├── services.html                # Full service catalog with category filtering & search
│   │   ├── service-details.html         # Individual service view with included tasks & add-ons
│   │   ├── how-it-works.html            # Customer and provider workflows & trust framework
│   │   ├── reviews.html                 # Verified homeowner reviews & rating statistics
│   │   ├── contact.html                 # 24/7 helpline, WhatsApp concierge, and inquiry form
│   │   ├── login.html                   # Dedicated login with role selector (Customer vs Pro)
│   │   ├── customer-register.html       # Customer registration with email OTP verification
│   │   ├── provider-register.html       # 5-step provider onboarding wizard with KYC & OTP
│   │   ├── forgot-password.html         # Password recovery with OTP verification
│   │   ├── emergency.html               # 60-Minute rapid rush emergency dispatch
│   │   └── request-service.html         # Service booking with dynamic night charges & add-ons
│   │
│   ├── customer/
│   │   ├── dashboard.html               # Customer overview, active bookings & 5-step timeline
│   │   ├── bookings.html                # Booking management & rating submissions
│   │   ├── profile.html                 # Personal profile & saved addresses
│   │   └── settings.html                # Password changes & dispatch notification settings
│   │
│   ├── provider/
│   │   ├── dashboard.html               # 9 KPIs, duty switch, canvas chart & 15-day KYC countdown
│   │   ├── assigned-jobs.html           # Active jobs with step-by-step execution & payment collect
│   │   ├── pending-jobs.html            # Incoming job radar leads with 85% pro split & accept/decline
│   │   ├── earnings.html                # Financial ledger & instant daily UPI payouts
│   │   ├── service-history.html         # Historical completed jobs & customer feedback
│   │   └── profile.html                 # Professional trade profile & verified KYC credentials
│   │
│   └── admin/
│       ├── login.html                   # Dedicated administrative login (admin / admin123)
│       ├── dashboard.html               # 12 overview metrics, 15-day KYC audit table, live dispatch
│       ├── providers.html               # Provider KYC review & suspension controls
│       ├── customers.html               # Verified customer directory & address logs
│       ├── bookings.html                # Dispatch board with emergency filter & pro reassignment
│       └── settings.html                # Dynamic night charges & emergency surcharge configuration
│
├── backend/
│   ├── server.js                        # Express REST API Server
│   ├── server-native.js                 # Zero-dependency native Node.js HTTP server fallback
│   ├── config/db.js                     # Persistent JSON database layer
│   ├── controllers/                     # Service, Provider, Booking & Admin controllers
│   ├── routes/                          # Express route modules
│   ├── middleware/authMiddleware.js     # 72-hour session expiration & role-based access control
│   ├── services/emailService.js         # SMTP email dispatcher with dev logger fallback
│   └── data/store.json                  # Persistent backend JSON data store
│
└── database/
    └── store.json                       # Seed database state
```

---

## 🔑 Initial Demo Credentials

| Role | Username / Identifier | Password | Access Portal |
|---|---|---|---|
| **Customer** | `priya_verma` | `priya123` | [Customer Login](file:///c:/Users/ARPIT/Desktop/Front%20end%20dev/frontend/pages/login.html) |
| **Customer** | `aman_mehra` | `aman123` | [Customer Login](file:///c:/Users/ARPIT/Desktop/Front%20end%20dev/frontend/pages/login.html) |
| **Service Provider** | `rajesh_sharma` | `rajesh123` | [Provider Desk](file:///c:/Users/ARPIT/Desktop/Front%20end%20dev/frontend/pages/login.html) |
| **Service Provider** | `vikram_plumb` | `vikram123` | [Provider Desk](file:///c:/Users/ARPIT/Desktop/Front%20end%20dev/frontend/pages/login.html) |
| **Administrator** | `admin` | `admin123` | [Admin Console](file:///c:/Users/ARPIT/Desktop/Front%20end%20dev/frontend/admin/login.html) |

---

## ⚡ How to Run the Application

### 1. Direct Browser Usage (Zero Configuration)
Simply open [index.html](file:///c:/Users/ARPIT/Desktop/Front%20end%20dev/index.html) in any modern web browser or run it with Live Server. All pages, light/dark themes, role guards, and data persist automatically via `FixupStore`.

### 2. Running with Node.js Server
Open your terminal in `backend/`:
```bash
# Option A: Zero-dependency native server (runs immediately without npm install)
node server-native.js

# Option B: Express server (after running npm install)
node server.js
```
The REST API server will run at `http://localhost:5000`.

---

© 2026 Fixup Technologies Private Limited. All rights reserved.
