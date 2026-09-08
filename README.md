# 🌱 SCRAP SATHI (स्क्रैप साथी)
### *An App That Turns Every Kabadiwala Into a Partner of India's Formal Recycling System*

**Smart India Hackathon 2026**  
**Problem Statement 26229 — "Kabadiwala Connect"**  
**Ministry of Mines (MoM) · JNARDDC**  
**Category: Software · Theme: Clean & Green Technology**

---

## 🎯 1. The Core Breakthrough: Why Nobody Else Fixed This

India imports nearly 100% of its **Lithium, Cobalt, and Neodymium (rare-earth permanent magnets)**. Yet over 90% of old electronics pass through informal kabadiwalas who burn cables or dip circuit boards into boiling acid for a little copper, destroying the high-value critical minerals and poisoning ground water and their own lungs.

Existing apps (**Attero MetalMandi, ScrapUncle, The Kabadiwala, Kabadiwalla Connect**) only price generic metals or book doorstep consumer pickups.

### 5 Things Scrap Sathi Does That Nobody Else Does:
1. **Looking inside the waste, not just weighing it**: Estimates how much Lithium (Li), Cobalt (Co), Neodymium (Nd), and pure Copper (Cu) a batch contains using **JNARDDC stoichiometric formulas**.
2. **Showing two numbers, not one**: The collector sees the **Cash Price (₹)** AND a **Recovery Score (0-100)** showing critical metals saved and CO₂ offset.
3. **Matching by skill, not just price**: Routes battery batches to hydrometallurgical battery specialists (with a +10% bonus) rather than generic scrap buyers.
4. **Batch Pooling ("Small Batches Team Up")**: Allows nearby kabadiwalas to combine small battery/magnet lots into a bulk aggregate shipment to unlock an additional **+15% bulk specialist bonus**.
5. **Turning proof into a product (EPR Compliance)**: Every completed handover creates a tamper-proof **SHA-256 cryptographically chained digital certificate** with a verification QR code for corporate Extended Producer Responsibility (EPR) buyers and the Ministry of Mines.

---

## 🏗️ 2. Technology Stack & Multi-Disciplinary Architecture

- **MERN Stack Backend & Database**: Node.js & Express API with a hybrid MongoDB and in-memory fallback layer, ensuring 100% zero-friction execution.
- **Frontend & Android Mobile App**: React 18+ (Vite) styled with a custom dark glassmorphic design system + Capacitor (`@capacitor/android`, `@capacitor/core`) ready for native Android APK generation.
- **AI / ML & Data Science Engine (`ai_engine/`)**:
  - `metal_estimator.py` / `metal_estimator.js`: JNARDDC stoichiometric critical mineral calculator.
  - `model_pricing.py`: ML dynamic regression pricing engine with bulk volume multipliers.
  - `fairness_detector.py`: Anti-exploitation statistical anomaly detector flagging predatory black-market offers.
  - Computer Vision Classifier: Instant recognition of Li-ion batteries, PCBs, copper cables, electric motors, and CRT tubes.
- **Cybersecurity Architecture**:
  - SHA-256 tamper-proof handover ledger chaining proof records.
  - Digital signatures and QR verification URLs for Ministry of Mines audits.
  - Rate limiting, Helmet security headers, and secure JWT authentication with role-based access control.
- **Accessibility & Offline-First**:
  - Multilingual: **Hindi (हिंदी)**, **Marathi (मराठी)**, and **English** with instant switching.
  - Web Speech API **Text-to-Speech (TTS)** voice narration for illiterate collectors.
  - Web Speech **Speech-to-Text (STT)** voice input for speaking weights.
  - **IndexedDB** local queue: Works with zero internet in slums or field pickups, auto-syncing when signal returns.

---

## 📱 3. All 11 Collector Screens & Portals

| # | Screen / Portal | Core Capability |
|---|---|---|
| 1 | **Log In** | Phone Number + 4-digit OTP, Google One-Click Auth, or Password with Dev-preview |
| 2 | **Home / Price Board** | Live JNARDDC benchmark rates, up/down trend arrows, audio narration in Hindi/Marathi |
| 3 | **Scan & Identify** | Camera viewfinder with AI detection of batteries, PCBs, motors, cables, screens |
| 4 | **Weight & Value** | Voice mic or typed weight, instant Cash ₹ + Critical Mineral breakdown (Li, Co, Nd, Cu, Au) |
| 5 | **Best Match List** | AI ranking by distance, price, and specialist mineral recovery bonus |
| 6 | **Confirm Batch & Team Up** | Unique Batch ID, QR code, and neighborhood batch pooling for +15% bonus |
| 7 | **Hand It Over** | Photo proof, GPS geotag, timestamp, SHA-256 seal, IndexedDB offline support |
| 8 | **Handover Status** | Real-time OTP validation (Waiting → Arrived → Verified → Paid) |
| 9 | **My Earnings & Khata** | Running total of cash earned, pending dues, and past transaction records |
| 10 | **Safety Tips** | Audio-visual flashcards in Hindi/Marathi: No wire burning, no acid dipping, safe battery storage |
| 11 | **Collector Profile** | Ministry of Mines Verified Collector badge, reputation score, KYC status |
| 12 | **Recycler Dashboard** | CPCB registration proof, live marketplace lots, OTP confirmation, auto-generated EPR certificates |
| 13 | **Ministry of Mines View** | National critical mineral reserves dashboard, state heatmap, EPR blockchain audit explorer |

---

## 🚀 4. How to Run Locally

### Prerequisites
- Node.js (v18+)
- Python (v3.8+)

### Step 1: Install Dependencies
```bash
npm run install-all
```

### Step 2: Start Full Stack (Server + Client)
```bash
npm run dev
# OR: node dev-runner.js
```
- **Web App**: `http://localhost:5173`
- **Backend API**: `http://localhost:5000`
- **Health Check**: `http://localhost:5000/api/health`

---

## 📱 5. Packaging into Android Mobile Application (APK)

Scrap Sathi is pre-configured with **Capacitor Android**:

```bash
# 1. Build the production web bundle
npm run build

# 2. Sync web assets to Android
npm run cap:sync

# 3. Open in Android Studio to build APK or run in Emulator:
npm run cap:open:android
```

---

## ☁️ 6. Cloud Deployment (Docker)

```bash
# Build and run the production container
docker-compose up --build
```
The entire full-stack app (API, AI models, and optimized React bundle) will be live on port `5000`.

---

## 👥 Demo Personas (One-Click Testing)
- **Ramesh Kumar** (Hindi Kabadiwala, Dharavi Mumbai): Phone `9876543210` (Default OTP: `1234` or any generated 4 digits)
- **Santosh Shinde** (Marathi Kabadiwala, Pune): Phone `9822334455`
- **EcoMetals Green Refining** (Approved Recycler): CPCB ID `CPCB/EW-REG/MH/2024/9912`
- **Ministry of Mines / JNARDDC** (National Telemetry Officer)
