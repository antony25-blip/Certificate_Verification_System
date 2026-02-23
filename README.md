# 🎓 Certificate Verification System

A full-stack web application designed to streamline certificate issuance and verification using a secure admin panel and dynamic PDF generation.

---

## 🚀 Tech Stack

### Frontend
- React (Vite)
- Axios
- React Router

### Backend
- Node.js
- Express.js
- MySQL
- PDF-Lib
- JWT Authentication

---

## 📌 Features

### 👤 Admin Panel
- Admin login (JWT secured)
- Upload bulk certificates via Excel
- Upload certificate templates (PDF)
- Configure layout (x, y positioning)
- Select active template
- Delete templates
- Real-time analytics stats

### 🎓 Student
- Search certificate by ID
- View certificate
- Download dynamically generated PDF

---

## 🧠 Architecture


Frontend communicates with backend via REST APIs.

Backend dynamically generates certificates using:
- Custom template
- Stored layout configuration
- Embedded modern fonts

---

## 🔐 Security
- JWT Authentication
- Protected Admin Routes
- Duplicate prevention
- Input validation
- Layout configuration stored in DB

---

## 📂 How to Run Locally

### Backend

```bash
cd certificate-verification-backend
npm install
node server.js

cd certificate-frontend
npm install
npm run dev
