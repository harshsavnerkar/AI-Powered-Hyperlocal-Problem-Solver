# Community Hero – AI-Powered Hyperlocal Problem Solver

**Community Hero** is a full-stack hyperlocal civic application designed to help citizens report, verify, track, and resolve local infrastructure issues like potholes, garbage piles, water leakages, streetlight failures, road damages, and safety hazards. 

The application utilizes AI checks powered by the **Gemini API**, gamification systems (points, ranks, and unlockable badges), and Leaflet maps for geolocated hotspots and coordinate pin selections.

---

## 🚀 Key Features

* **Three Unique Role Dashboards**:
  * **Citizen**: Report local issues, track their progress, view neighborhood feeds, check the leaderboards, and unlock profile badges.
  * **Volunteer**: Validate reports nearby with Verify and Reject buttons to ensure trust scores.
  * **Admin/Authority**: Manage tasks, assign specific repair teams, track analytics, and review AI hotspot alerts.
* **AI Engine Pipeline (Gemini Integration)**:
  * **Issue Classification**: Scans images and text to assign categories (Pothole, Water Leak, Garbage, etc.).
  * **Priority Evaluation**: Automatically assigns threat scores (Low, Medium, High, Critical) based on safety keywords.
  * **Smart Summary**: Condenses long citizen complaints into a clear title.
  * **Duplicate Detection**: Computes Haversine distance formulas to alert admins of existing issues within 50 meters.
  * **Predictive Insights**: Forecasts upcoming regional problems (e.g. monsoon surge pothole alerts).
* **Interactive Maps**:
  * Manual coordinate mapping pins.
  * Live cluster heatmaps highlighting emerging problem hubs.
* **Gamification System**:
  * Earn points for reporting (+10), verifying (+5), and final resolution (+20).
  * Unlock premium badges (Community Reporter, Problem Solver, Active Citizen, City Guardian, Top Contributor).
  * Real-time local notification bell updates.

---

## 🛠️ Tech Stack

### Frontend
* **React.js** (Vite Bootstrapped)
* **Tailwind CSS** (v4 CSS-First configuration)
* **Recharts** (Interactive pie, line, bar, and area charts)
* **React Leaflet / Leaflet** (Map pins and hotspot clusters)
* **Framer Motion** (Subtle micro-animations)
* **Lucide React** (Modern line icons)

### Backend
* **Node.js & Express.js** (ES Modules configuration)
* **MongoDB & Mongoose** (With file-based JSON store fallback)
* **JWT (JSON Web Tokens) & Bcryptjs** (Role-Based Access Control)
* **Google Generative AI REST API** (Gemini multi-modal pipeline)

---

## ⚙️ Fallback Fail-Safes (Offline Testing Mode)

To ensure this project runs immediately on any machine without complex system integrations:
1. **Database Fallback**: If no `MONGO_URI` is provided, the backend falls back to an auto-created local file database store (`server/data/db_store.json`).
2. **AI Fallback**: If no `GEMINI_API_KEY` is provided, the backend uses a local heuristics parser to classify issues and simulate AI priority responses.

---

## 📂 Project Layout

```text
AI-Powered-Hyperlocal-Problem-Solver/
├── client/                     # React Frontend
│   ├── src/
│   │   ├── components/         # Shared UI (Sidebar, Header, Layout)
│   │   ├── context/            # Global States (Auth, Theme, Notifications)
│   │   ├── pages/              # Role-based pages and forms
│   │   ├── App.jsx             # Routers
│   │   └── index.css           # Tailwind + Map styles
│   └── package.json
└── server/                     # Node Express Backend
    ├── config/                 # db connection config
    ├── data/                   # Fallback database directory
    ├── middleware/             # auth and role verification
    ├── models/                 # Mongoose schemas
    ├── routes/                 # auth, issues, analytics, and notification endpoints
    ├── services/               # Gemini API and heuristics engine
    └── server.js               # Express application listener
```

---

## 💻 Local Installation Guide

### Prerequisites
* [Node.js](https://nodejs.org/) installed locally (v18+ recommended)

### Setup Backend
1. Navigate to the server folder:
   ```bash
   cd server
   ```
2. Install npm modules:
   ```bash
   npm install
   ```
3. Create a `.env` file (Optional):
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_uri
   GEMINI_API_KEY=your_gemini_api_key
   JWT_SECRET=your_custom_secret_key
   ```
4. Start the server:
   ```bash
   npm start
   ```
   *Note: On launch, the server automatically seeds three default test profiles.*

### Setup Frontend
1. Navigate to the client folder in a new terminal:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```

---

## 🔑 Seeded Testing Credentials

Log in directly on the portal using these preset logins:

| Role | Email | Password |
|---|---|---|
| **Citizen (Aarav Sharma)** | `aarav@civic.com` | `password123` |
| **Volunteer (Rohan Mehta)** | `volunteer@civic.com` | `password123` |
| **Admin (Admin Controller)** | `admin@civic.com` | `password123` |
