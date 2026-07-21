# AFRATER Frontend

**Amok Fraud Terminator** — React frontend for real-time M-Pesa fraud detection.

## Tech Stack

- **Framework:** React + Vite
- **Routing:** React Router DOM v7
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion
- **Icons:** Lucide React
- **Font:** Orbitron (Google Fonts)
- **Deployment:** Vercel

---

## Project Structure

```
AFRATER-Frontend/
├── index.html
├── vite.config.js
├── package.json
├── src/
│   ├── main.jsx                # Entry point
│   ├── App.jsx                 # Router + user state
│   ├── api/
│   │   └── api.js              # All API calls to backend
│   ├── pages/
│   │   ├── Landing.jsx         # Public landing page
│   │   └── Dashboard.jsx       # Protected wallet dashboard
│   └── components/
│       ├── Navbar.jsx          # Navigation + profile dropdown
│       ├── AuthModal.jsx       # Login / register modal
│       ├── PaymentTab.jsx      # Send payment with fraud check
│       ├── Footer.jsx          # Landing page footer
│       └── ProfileDropdown.jsx # Profile management
```

---

## Local Setup

```bash
# Clone the repo
git clone https://github.com/monica-njoki1/AFRATER-Frontend.git
cd AFRATER-Frontend

# Install dependencies
npm install

# Run locally
npm run dev
```

---

## Environment

The backend URL is set directly in `src/api/api.js`:

```js
const BASE_URL = "https://afrater-backend.onrender.com";
```

Change this to `http://localhost:5000` for local backend testing.

---

## Pages

### Landing (`/`)
- Hero section with animated fraud detection preview
- Platform, Features, Demo sections
- Live demo — paste a message and get a real fraud verdict
- Login/Register modal
- Redirects to `/dashboard` after successful login

### Dashboard (`/dashboard`) — Protected
Full wallet home page with:

| Section | Description |
|---------|-------------|
| **Profile dropdown** | Avatar, name, change photo, logout, delete account |
| **Balance card** | Simulated M-Pesa balance with show/hide toggle |
| **Fraud alert banner** | Shows when a payment was blocked |
| **Security score** | Animated bar showing account safety (0-100) |
| **Quick actions** | Send, Receive, Check, Scan |
| **Recent transactions** | With FRAUD / RISK / SAFE badges |

### Sub-screens (inside Dashboard)
| Screen | Description |
|--------|-------------|
| **Check Message** | Paste suspicious message → fraud verdict + score |
| **Screenshot Scan** | Upload M-Pesa screenshot → AI analysis |
| **Send Payment** | Phone + amount → preflight check → STK Push |
| **Receive Check** | Check sender reputation before accepting money |
| **History** | All transactions with fraud scores + clear option |

---

## Key Features

### Auth Flow
- JWT token saved to `localStorage` on login
- Auto-logout on 401 (expired token)
- Protected route redirects to `/` if not logged in

### Fraud Detection Flow
```
User pastes message
      ↓
POST /scam/check
      ↓
Returns: score (0-100), verdict, reasons
      ↓
Show result with colour-coded badge
```

### Payment Flow
```
User enters phone + amount
      ↓
POST /mpesa/preflight (reputation + fraud check)
      ↓
Safe? → STK Push fires immediately
Warnings? → Warning screen shown
Blacklisted? → Hard blocked, cannot proceed
      ↓
Poll /query/stk/<id> every 3 seconds
      ↓
Show: completed / cancelled / wrong PIN / timed out
```

### Balance Simulation
- Balance starts at KES 12,450
- Deducts when payment goes through
- Persists in `localStorage`
- Will be replaced with real Daraja balance API in production

---

## Deployment (Vercel)

1. Push to GitHub
2. Connect repo to Vercel
3. Vercel auto-deploys on every push to `main`

No environment variables needed — backend URL is hardcoded in `api.js`.

---

## Notes

- Screenshot scan requires Anthropic API credits — shows friendly message when unavailable
- Swahili + English fraud detection works without any API credits
- UptimeRobot pings backend every 5 minutes to prevent Render cold starts