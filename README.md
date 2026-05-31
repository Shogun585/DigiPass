# 🚀 DigiPass

DigiPass is a full-stack web application designed to modernize and automate hostel leave and market pass management systems.

It replaces traditional paper-based workflows with a secure, role-based, real-time digital platform that streamlines pass requests, approvals, and gate verification.

## ✨ Why DigiPass?
Traditional hostel pass systems are:
- Paper-based and inefficient
- Time-consuming for students and wardens
- Difficult to track and audit
- Prone to misuse and data inconsistency

DigiPass introduces a secure, transparent, and scalable digital alternative.

## 🔑 Key Features

### 🔐 Role-Based Authentication
- Secure JWT-based login session management.
- Protected frontend routes and token-secured backend REST APIs.
- Supported roles:
    - 🎓 **Student:** Request and track pass approvals.
    - 🏢 **Warden:** Evaluate, approve, or reject incoming requests.
    - 🚪 **Guard:** Real-time checkpoint gate verification.
    - 🛠️ **Admin:** Manage institutional user databases.

---

### 📝 Digital Pass Management
- **Student Dashboard:** Apply for Market Pass or Leave Pass; select predefined courses (e.g., B.Tech CSE, IT) using an interactive UI card layout; monitor real-time approval status.
- **Warden Dashboard:** Clean interface to filter, view pending requests, track history, and single-click approve or reject passes.

---

### 🛠️ Administrative & User Control
- **Single User Creation:** Manually onboard individual students, wardens, or guards.
- **Bulk Import (CSV Parsing):** Efficiently import hundreds of institutional users at once. Generates downloadable password sheets matching assigned IDs.
- **Partial Failure Resiliency:** Processes all valid accounts in a bulk upload batch while reporting clean error payloads for duplicates or corrupt structural entries.
- **Soft Delete Routine:** Preserves historical relational data logs and gate pass accountability by safely marking users inactive rather than hard-wiping records.
- **Administrative Password Overrides:** Dedicated manual control panel to update security credentials if a user forgets their password.

---

### 🚪 Smart Gate Verification
DigiPass enhances campus security through quick identification verification at institutional gates.
1. Guard input/scanning handles student identification tokens.
2. System extracts individual student keys.
3. Verification checks:
    * Pass status evaluates to **Approved**.
    * Current timestamp falls within the pass validity range.

If valid → ✅ **Access Granted** If invalid → ❌ **Access Denied**

---

## 🛠 Tech Stack

### Frontend
- **React.js** & Functional Components
- **React Router Dom** (Client-side routing)
- **Axios** (API Client)
- **Tailwind CSS** (Modern utility-first layout)
- **Context API** (Global state & Auth state management)

### Backend
- **Node.js** & **Express.js** (REST API)
- **Prisma ORM** (Database mapping and migrations)
- **JSON Web Tokens (JWT)** (Secure token stateless authorization)
- **Bcrypt** (Secure password hashing)
- **Multer** & **CSV-Parser** (Stream-based multi-part text loading)

### Database
- **PostgreSQL**

---

## 📂 Project Structure
```bash
DigiPass/
│
├── backend-sec/            # Node.js + Express API
│   ├── routers/            # Auth, Pass, Admin routes
│   ├── utils/              # Database connection pools
│   ├── prisma/             # Schema definitions and migrations
│   └── index.js            # Entry server file
│
├── frontend/               # React SPA Client
│   ├── src/
│   │   ├── components/     # UI Elements
│   │   ├── pages/          # Dashboard, Admin, Login views
│   │   ├── context/        # Global authentication states
│   │   ├── services/       # Axio API wrappers (api.js)
│   │   └── App.jsx
│
└── README.md
```

---
## ⚙️ Getting Started

### 1️⃣ Clone Repository
```bash
git clone [https://github.com/Shogun585/DigiPass.git](https://github.com/Shogun585/DigiPass.git)
cd DigiPass
```
### 2️⃣ Backend Setup
Navigate to the server workspace and install dependencies:
```bash
cd backend-sec
npm install
```
Create your environment file (.env):
```bash
cd backend-sec
touch .env
```
Configure your environment file (.env):
```
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public" # connection pooling database url
DIRECT_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public" # simple database connectivity url
JWT_SECRET="your_super_secret_key"
```
Generate the client instances and map schemas into your active database engine:
```bash
npx prisma db push
npx prisma generate
```
Start the local server instance:
```bash
npm start
```
The API engine will activate locally on http://localhost:5000

### 3️⃣ Frontend Setup
Open a separate terminal window, access the client workspace, and trigger assembly:
```bash
cd frontend
npm install
npm start
```
Frontend development engine targets: http://localhost:3000

---

## 🧪 Application Flow
1. Administrative Setup: Bulk uploads or appends user data via CSV schema records.

2. Pass Issuance: Student submits validated pass scopes targeting local schedules.

3. Auditing Verification: Warden updates pass state machines from pending configurations.

4. Gate Evaluation: Guard runs real-time queries asserting safety records at campus exits.

---

## 🌱 Benefits

* Reduces manual paperwork footprint.

* Sharpens structural tracking and accountability data streams.

* Enhances multi-tier hostel edge security parameters.

* Eco-friendly digital log maintenance.
