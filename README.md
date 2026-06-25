# TeamSync - CDAZZDEV Full-Stack Assessment

TeamSync is a lightweight project and task tracking platform designed for managers and team members. It consists of a NestJS backend API, a Next.js web dashboard, and an Expo React Native mobile companion app.

**Video Walkthrough:** [Insert your YouTube or Loom link here](INSERT_YOUR_YOUTUBE/LOOM_LINK_HERE)

---

## Architecture and Cloud Strategy

Refer to [ARCHITECTURE.md](ARCHITECTURE.md) for the full technical spec, including:

- Database ERD and indexing strategy for Part D
- AWS cloud deployment strategy for Part E
- CI/CD pipeline and secrets management

---

## Quick Start

This project runs entirely locally. Docker spins up PostgreSQL, and no paid external services are required.

### Prerequisites

- Node.js 18 or later
- Docker and Docker Compose
- Expo Go, or an Android Emulator / iOS Simulator

### 1. Root Setup and Database

```bash
git clone <your-repo-url>
cd cdazzdev-teamsync
cp .env.example .env

docker compose up -d
```

### 2. Start the Backend API

Open a new terminal:

```bash
cd api
npm install
npx prisma migrate dev
npx prisma db seed
npm run start:dev
```

- Swagger API docs: http://localhost:3000/api/docs
- Run unit tests: `npm run test`

### 3. Start the Web App

Open a second terminal:

```bash
cd web
npm install
npm run dev
```

- Web dashboard: http://localhost:3001
- If port 3001 is unavailable, Next.js may fall back to port 3000

### 4. Start the Mobile App

Open a third terminal:

```bash
cd mobile
npm install
npx expo start -c
```

- Press `a` to launch the Android emulator
- Press `i` to launch the iOS simulator

---

## Key Engineering Decisions

### 1. JWT Storage Strategy

For the web app, JWTs are never stored in `localStorage` because of XSS risk. Authentication is handled through Next.js Server Actions that set `httpOnly`, `Secure`, and `SameSite=Strict` cookies.

For the mobile app, `httpOnly` cookies are not available, so authentication uses `expo-secure-store`. This encrypts the JWT and stores it in the native Android Keystore and iOS Keychain rather than plain `AsyncStorage`.

### 2. Data Fetching and State Management

The Next.js app uses React Server Components and Server Actions instead of a client-heavy data-fetching layer. This keeps the bundle smaller and improves the initial load path.

For client-side interactions such as optimistic task updates, the app uses React's `useTransition` and `useOptimistic` hooks.

On mobile, a custom fetch wrapper and `@react-native-async-storage/async-storage` provide the offline-first cache. When `expo-network` detects an offline state, the app falls back to cached JSON data and shows an offline warning banner.

### 3. Mobile Push Notifications Limitation

Push notification registration is implemented in `mobile/App.tsx`, but Expo Go on SDK 53 does not support remote push token registration. The `getExpoPushTokenAsync()` call is wrapped in `try/catch` so the app remains stable in local Expo Go and still works in a custom EAS development build.

### 4. Design-to-Code Fidelity

The web UI uses Tailwind CSS mapped to the provided design tokens for colors, typography, spacing, and radius. This keeps the Login, Dashboard, and Task Detail screens consistent without hardcoding arbitrary values in components.

---

## Database Design

The database model and indexing strategy are documented in [ARCHITECTURE.md](ARCHITECTURE.md).

### Main Entities

- User
- Project
- ProjectMember
- Task
- Comment

### Query Optimization

The schema includes targeted indexes for common access patterns such as:

- User email authentication lookups
- Project ownership filtering
- Project membership queries
- Task filtering by project, assignee, and status
- Comment loading by task

These indexes reduce table scans and improve dashboard and task management performance.

---

## Useful Notes

- The backend is NestJS + Prisma + PostgreSQL.
- The web app uses Next.js App Router.
- The mobile app uses Expo React Native.
- The architecture document contains the deployment and scaling strategy for AWS.
