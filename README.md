
# GetSchoolInfo

A comprehensive school search portal for parents to find, compare, and analyze schools in data-rich regions (currently Bathinda pilot).

## 🚀 Features

-   **Search & Filter**: Filter by Location, Fee Budget, Board, Staff Quality, Infrastructure, and more.
-   **Detailed Analytics**: Policy-benchmarked metrics (STR, Girl's Hygiene, Trained Teachers).
-   **Comparison**: Side-by-side comparison of up to 3 schools.
-   **SEO Optimized**: Next.js App Router with dynamic metadata and JSON-LD schema.
-   **Secure**: Middleware for bot blocking and rate limiting.

## 🛠 Tech Stack

-   **Frontend**: Next.js 14 (App Router), Tailwind CSS, Lucide Icons.
-   **Backend**: Node.js, Express.
-   **Database**: PostgreSQL (Structured School Data).
-   **Auth/Leads**: Firebase Admin SDK (Hybrid approach).
-   **DevOps**: Docker, DigitalOcean (Deployment Ready).

## 🏗 Architecture

The project follows a hybrid architecture to optimize for both *complex querying* (Postgres) and *user management* (Firebase).

-   `frontend/`: Next.js application running on **Port 3002**.
-   `backend/`: Express API server running on **Port 4000**.
-   `postgres`: Dockerized database container (Port 5432).

## 🚦 Getting Started

### Prerequisites

-   Node.js (v18+)
-   Docker & Docker Compose

### 1. Setup Environment

Create `.env` files in `backend` and `frontend`.

**backend/.env**:
```env
PORT=4000
DATABASE_URL=postgres://postgres:password@localhost:5432/schooldb
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=password
DB_NAME=schooldb
DB_PORT=5432
```

**frontend/.env.local**:
```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
NEXT_PUBLIC_BASE_URL=http://localhost:3002
```

### 2. Run Locally (Development)

**Start Backend & Database**:
```bash
cd backend
npm install
# Start DB (Ensure Docker is running)
docker-compose up -d postgres
# Seed Data
npx ts-node seed.ts
# Start Server
npm run dev
```

**Start Frontend**:
```bash
cd frontend
npm install
npm run dev
# Access at http://localhost:3002
```

### 3. Deployment

Code is push-ready for GitHub Actions integration.
-   **Staging**: Deploy docker containers to DigitalOcean via SSH.
-   **Production**: Use Managed Postgres and separate Firebase environment.

## 📄 License

(C) 2024 Isaee Projects. All Rights Reserved.
