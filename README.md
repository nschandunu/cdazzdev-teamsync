# TeamSync - CDAZZDEV Full-Stack Assessment

TeamSync is a lightweight project and task tracking platform designed for managers and team members. It consists of a NestJS backend API, a Next.js web dashboard, and an Expo React Native mobile companion app.

**Video Walkthrough:** [Insert your YouTube or Loom link here](INSERT__YOUTUBE_LINK_HERE)

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

### 1. Frontend Security & Auth (JWT Storage)
For the web app, JWTs are never stored in `localStorage` because of XSS risk. Next.js Server Actions handle the login mutation, and the JWT is stored in a strictly `httpOnly`, `SameSite=Lax` cookie via `next/headers`. This explicitly prevents XSS attacks from reading the token via `document.cookie`, directly fulfilling the security requirement in the brief.

For the mobile app, where `httpOnly` cookies are not available, authentication uses `expo-secure-store`. This encrypts the JWT and stores it in the native Android Keystore and iOS Keychain rather than plain `AsyncStorage`.

### 2. Web Data Architecture & State Management
Leveraged Next.js 15 Server Components for initial data loads, passing the access token securely via the Next.js `cookies()` API. This avoids a client-heavy data-fetching layer, keeping the bundle smaller and improving the initial load path.

Adopted a URL-driven state architecture (e.g., `?projectId=xyz`) for the Dashboard to ensure the UI is linkable, natively handles browser history, and avoids complex client-side context providers. For client-side interactions such as optimistic task updates, the app uses React's `useTransition` and `useOptimistic` hooks.

On mobile, a custom fetch wrapper and `@react-native-async-storage/async-storage` provide the offline-first cache. When `expo-network` detects an offline state, the app falls back to cached JSON data and shows an offline warning banner.

### 3. Mobile Session Management
Engineered a root-level Auth Guard and 401 Interceptor. When the app boots, or during any API fetch, if the backend returns a 401 Unauthorized, the interceptor elegantly catches the error, wipes the dead token from the secure Keystore, and kicks the user back to the Login screen to prevent unhandled promise crashes.

### 4. Push Notifications
The client-side registration flow was implemented using `expo-notifications`. Due to Expo SDK 53+ removing remote push support from the Expo Go app, a safe try/catch fallback was used so the app remains stable in local Expo Go and still works in a custom EAS development build. Full end-to-end testing of this flow requires an Expo Development Build, which is a documented Expo limitation and does not affect production builds.

### 5. Design-to-Code Fidelity
Leveraged the newly released Tailwind CSS v4 to manage design tokens natively via CSS variables and the `@theme` directive. This ensured strict, pixel-perfect compliance with the provided Figma spec without needing bulky, external configuration files. The web UI uses these design tokens for colors, typography, spacing, and radius to keep the Login, Dashboard, and Task Detail screens consistent without hardcoding arbitrary values in components.

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
