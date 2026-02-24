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
- Secure JWT-based login
 Role-specific dashboards
- Protected frontend routes
- Token-secured backend APIs

    Supported roles:
    - 🎓 Student
    - 🏢 Warden
    - 🚪 Guard

---

### 📝 Digital Pass Management
__Student__
- Apply for Market Pass
- Apply for Leave Pass
- Track approval status in real-time

__Warden__
- View pending requests
- Approve or reject passes
- Manage requests through dashboard interface

---

### 🚪 Smart Gate Verification
DigiPass enhances campus security through barcode-based ID verification.

At the gate:

1. Guard scans student ID barcode
2. System extracts student identifier
3. Verification checks:
    * Pass status is Approved
    * Current date falls within pass validity

If valid → ✅ Access Granted

If invalid → ❌ Access Denied

This ensures real-time security validation.

---

## 🛠 Tech Stack
### Backend
- FastAPI
- SQLAlchemy
- JWT Authentication
- OpenCV
- Pyzbar / Pyzxing

### Frontend
- React.js
- React Router
- Axios
- Context API

### Database
- MySQL

## 📂 Project Structure
```
DigiPass/
│
├── backend/
│   ├── app/
│   │   ├── routers/
│   │   ├── utils/
│   │   ├── models.py
│   │   ├── schemas.py
│   │   └── main.py
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── services/
│   │   └── App.js
│
└── README.md
```

## ⚙️ Getting Started
### 1️⃣ Clone Repository
```bash
    git clone https://github.com/Shogun585/DigiPass.git
    cd DigiPass
```
---
### 2️⃣ Backend Setup
Install dependencies:
```bash
    cd backend/app
    pip install fastapi uvicorn sqlalchemy pymysql cryptography \
    python-jose passlib python-multipart pwdlib \
    opencv-python-headless numpy pyzbar pillow pyzxing
```
Configure database credentials inside:
```bash
    backend/app/utils/database.py
```
Start backend server:
```bash
    uvicorn app.main:app --reload --port 8000
```

API documentation will be available at:

    http://localhost:8000/docs
---
### 3️⃣ Frontend Setup
```bash
    cd frontend
    npm install
    npm start
```
Frontend runs on:

    http://localhost:3000

--- 

## 🧪 Application Flow

1. Student logs in and submits a pass request
2. Warden reviews and approves/rejects request
3. Guard verifies pass at hostel gate
4. System validates approval status and date range

## 🔍 API Overview

* Authentication endpoint for login
* Pass creation endpoint
* Pass retrieval endpoint
* Pass status update endpoint
* Manual verification endpoint
* Barcode verification endpoint

All protected endpoints require a valid JWT token.

## 🌱 Benefits

  *  Reduces manual paperwork
  *  Improves transparency and accountability
  *  Enhances hostel security
  *  Enables real-time tracking
  *  Promotes eco-friendly digital record keeping

## 🚀 Future Improvements

   * 📱 Mobile App Version
   * 📧 Email/SMS Notifications
   * 📊 Analytics Dashboard
   * 🏫 ERP Integration
   * 🔔 Real-time Push Notifications
   * ☁ Cloud Deployment

## ⭐ Support the Project

If you found this project helpful, consider starring the repository.