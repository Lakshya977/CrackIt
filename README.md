# CrackIt

CrackIt is a powerful **interview preparation platform** built with the **Next.js App Router** and the **MERN stack**. It integrates secure OAuth authentication, Stripe subscriptions, Gemini AI-generated questions, a full-featured admin dashboard, and a modern UI powered by **HeroUI** and **Tailwind CSS**.

---

## 🚀 Features

- 🔐 **OAuth Authentication**: Secure Google and GitHub login using **NextAuth.js** and **JWT**.
- 💳 **Stripe Payments**: Smooth subscription system with Stripe API and webhooks.
- 🤖 **Gemini AI**: Smart, dynamically generated interview questions tailored to users.
- 🧑‍💼 **Admin Dashboard**: Role-based access with user and subscription analytics.
- 📚 **Interview Practice**: Organized question management using MongoDB.
- 📧 **Email Notifications**: Automatic emails via **Nodemailer** for important user actions.
- 🖥️ **Modern UI**: Built using **HeroUI components**, **React**, and **Tailwind CSS**.
- 🧱 **Robust Backend**: **MongoDB**, **Node.js**, and **Mongoose** for clean and reliable data flow.

---

## 🛠️ Tech Stack

**Frontend**  
- Next.js (App Router)  
- React + TypeScript  
- Tailwind CSS  
- HeroUI (UI Components)

**Backend**  
- Node.js  
- MongoDB  
- Mongoose  

**Integrations**  
- **Authentication**: NextAuth.js + JWT  
- **Payments**: Stripe API + Webhooks  
- **AI**: Gemini API (Google)  
- **Email**: Nodemailer  
- **Notifications**: react-hot-toast  

---

## 📸 Screenshots

### 🌐 Landing Page
![Landing Page](./screenshots/Screenshot%202025-05-26%20125745.png)

### 📊 Admin Dashboard
![Admin Dashboard](./screenshots/Screenshot%202025-05-26%20130956.png)

### 📝 Create Interview
![Create Interview](./screenshots/Screenshot%202025-05-26%20131150.png)

### ❓ Interview Questions
![Interview Questions](./screenshots/Screenshot%202025-05-26%20131207.png)

---

## 📦 Installation Guide

### Prerequisites

- **Node.js v18+**
- **MongoDB** (local or hosted)

---

## 🔧 Local Setup

```bash
# Clone the repo
git clone https://github.com/<your-username>/CrackIt.git
cd CrackIt


🔐 Environment Variables
Create a .env file in the root and add the following:
MONGODB_URI=mongodb://...
NEXTAUTH_SECRET=<your-secret>
NEXTAUTH_URL=http://localhost:3000

GOOGLE_CLIENT_ID=<google-client-id>
GOOGLE_CLIENT_SECRET=<google-client-secret>

GITHUB_CLIENT_ID=<github-client-id>
GITHUB_CLIENT_SECRET=<github-client-secret>

STRIPE_SECRET_KEY=sk_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_...
STRIPE_WEBHOOK_SECRET=whsec_...

GEMINI_API_KEY=<gemini-api-key>
API_URL=http://localhost:3000
NEXT_PUBLIC_BASE_URL=http://localhost:3000

EMAIL_HOST=smtp.<your-provider>.com
EMAIL_PORT=587
EMAIL_USER=<your-email>
EMAIL_PASS=<your-password>


##🔧 How to Run

###Go to the root folder of the project 

cd <Project-name>
npm install
npm run dev


