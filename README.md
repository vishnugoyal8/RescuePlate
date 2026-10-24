# RescuePlate — Good food. Better futures.
### Tech Yuva Build-A-Thon 2026 | Problem Statement PS-43: Community Food Donation Matcher

RescuePlate is a verified community food donation matching and commercial kitchen waste intelligence platform engineered to eliminate avoidable food waste while maintaining food safety, verifiable custody, and real role-based security.

---

## 🛡️ Authentication & RBAC Architecture

RescuePlate implements **real backend authentication** with role-based access control (RBAC), replacing insecure client-side mock authentication.

### Security Controls Implemented
1. **Password Security**: Passwords are never stored in plaintext. Passwords are salted and hashed on the server using **bcrypt** with 10 salt rounds.
2. **Session Management**: Session tokens are cryptographically signed **JSON Web Tokens (JWT)** transmitted exclusively via **`HttpOnly`**, **`SameSite=Lax`** cookies (with `Secure` flag in production).
3. **No Sensitive Data in `localStorage`**: Neither plaintext passwords, authentication tokens, nor session secrets are stored in client `localStorage`.
4. **Session Restoration on Refresh**: On page reload, the client queries `/api/auth/me` with `credentials: 'include'` to restore active authenticated identity directly from the secure cookie.
5. **Role-Based Authorization (Server & Client)**:
   - **Food Donors**: Can broadcast surplus food batches, log daily commercial kitchen waste, view donor impact, and track delivery custody passes. Donors are strictly prohibited from claiming donations.
   - **Recipient NGOs**: Can browse eligible matches based on intake capacity, travel distance, and cold-chain constraints, claim surplus batches, and confirm intake sign-offs. NGOs are strictly prohibited from posting commercial kitchen inventory.
6. **Cross-Organization Data Isolation**: Organization A cannot view private operational records or alter dispatch status for Organization B by manipulating API identifiers or URLs.
7. **Simulated KYC Verification Gating**: Public self-registration initializes accounts in `Pending Review` status. Organizations with `Pending Review` or `Rejected` status are restricted on both server API endpoints and client UI from broadcasting or claiming food batches.
8. **Rate Limiting & Brute-Force Prevention**: Authentication endpoints employ IP-based sliding window rate limiting via `express-rate-limit`.

---

## 🚀 Quick Start Guide

### 1. Environment Configuration
The project includes a documented `.env.example` file and a ready-to-run `.env` file:
```bash
# Port configuration
PORT=5001
NODE_ENV=development

# Cryptographic Secrets
JWT_SECRET=rescueplate_demo_secret_jwt_key_2026_buildathon_secure
COOKIE_SECRET=rescueplate_demo_cookie_secret_key_2026_buildathon

# Client origin for CORS and cookie matching
CLIENT_URL=http://localhost:5173
```

### 2. Starting the Application
You can run both the Express backend and the Vite frontend simultaneously with a single command:
```bash
npm run dev:full
```

Or run them in separate terminal tabs:
```bash
# Terminal 1: Backend Auth & RBAC Server (Port 5001)
npm run server

# Terminal 2: Vite React Frontend (Port 5173)
npm run dev
```

Visit **`http://localhost:5173`** in your browser.

---

## 👥 Seeded Demo Accounts for Hackathon Judges

The login page (`/login`) includes **1-Click Quick Demo Login** buttons for instant testing without manual typing:

| Role | Organization | Email | Demo Password | KYC Status | Primary Permissions |
|---|---|---|---|---|---|
| **Food Donor** | Grand Pearl Banquet & Hotel | `donor@grandpearl.com` | `DemoDonor@2026` | **Verified** ✅ | Post donations, Hotel Waste Intelligence, Dispatch passes |
| **Food Donor** | Royal Spoon Banquets | `donor@royalspoon.com` | `DemoDonor@2026` | **Verified** ✅ | Commercial kitchen broadcast & donor impact tracking |
| **Food Donor (Pending)** | Saffron Heritage Banquets | `pending@saffron.com` | `DemoDonor@2026` | **Pending Review** ⚠️ | Tests KYC gating (blocked from posting until verified) |
| **Recipient NGO** | Asha Ek Kadam Foundation | `ngo@asha.org` | `DemoNgo@2026` | **Verified** ✅ | Claim available food, Match engine recommendations |
| **Recipient NGO** | Pratham Food Relief | `ngo@pratham.org` | `DemoNgo@2026` | **Verified** ✅ | Large intake capacity claims & intake confirmations |
| **Recipient NGO (Pending)** | Hope Shelter Home | `pending@hopeshelter.org` | `DemoNgo@2026` | **Pending Review** ⚠️ | Tests NGO gating (blocked from claiming food dispatches) |

---

## 🧪 Automated Verification Suite

Run all 31 automated test scenarios across matching, donor impact, waste intelligence, and RBAC:
```bash
npm test
```

### Test Results Summary (31/31 Passing)
- **Part 1: Explainable Smart Matching Engine (6 Tests)**: Distance limits, capacity overflows, expired food rejection, unreachable transit windows, category compatibility, and cold-chain constraints.
- **Part 2: Donor Impact & Lifecycle Transitions (8 Tests)**: Verified meals from delivered dispatches, exclusion of incomplete batches, dynamic disposal cost scaling, partner badge thresholds, and state machine transition validation.
- **Part 3: Waste Reconciliation, KYC Gating & Traceability (7 Tests)**: Mass-balance surplus reconciliation ($S = P - S$), anomaly rejection, donor/NGO verification gating, Genesis SHA-256 block linkage, and tamper detection.
- **Part 4: Secure Role-Based Authentication & Authorization (10 Tests)**:
  - `TC-AUTH-01`: Donor registration with bcrypt password hashing.
  - `TC-AUTH-02`: NGO registration with capacity onboarding.
  - `TC-AUTH-03`: Authentication failure on invalid credentials.
  - `TC-AUTH-04`: Session restoration via `HttpOnly` cookie on refresh (`/api/auth/me`).
  - `TC-AUTH-05`: Secure logout and cookie expiration.
  - `TC-AUTH-06`: Route protection for unauthenticated users.
  - `TC-AUTH-07`: Donor attempting NGO-only claim action (blocked with 403 Forbidden).
  - `TC-AUTH-08`: NGO attempting donor-only broadcast action (blocked with 403 Forbidden).
  - `TC-AUTH-09`: Cross-organization data isolation enforcement.
  - `TC-AUTH-10`: KYC verification gating for unverified organizations.

---

## 🔒 Remaining Security Considerations for Production
1. **Database Adapter**: The current backend implements atomic JSON file persistence (`server/data/db.json`), making local demo evaluation 100% dependency-free. In production, configure `MONGODB_URI` or PostgreSQL with TLS.
2. **HTTPS in Production**: The `secure` cookie flag dynamically activates when `NODE_ENV=production`. Ensure SSL certificates are provisioned on deployment.
3. **Password Reset Delivery**: In this hackathon demo, the password reset token is securely generated via `crypto.randomBytes(32)` and exposed on the demo response for testing; in production, connect an authorized transactional email provider (SendGrid / AWS SES).
