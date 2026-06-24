Cloud Architecture (Part E)

Architecture Overview

The solution follows a modular three-tier architecture:

┌──────────────────────────┐
│      Client Layer        │
├──────────────────────────┤
│ Next.js Web Application  │
│ Expo React Native App    │
└─────────────┬────────────┘
              │ HTTPS
              ▼
┌──────────────────────────┐
│      API Layer           │
├──────────────────────────┤
│ NestJS Backend           │
│ JWT Authentication       │
│ RBAC Authorization       │
│ Swagger Documentation    │
└─────────────┬────────────┘
              │ Prisma ORM
              ▼
┌──────────────────────────┐
│      Data Layer          │
├──────────────────────────┤
│ PostgreSQL Database      │
└──────────────────────────┘

⸻

Technology Choices

Backend

* NestJS
* TypeScript
* Prisma ORM
* JWT Authentication
* Role Based Access Control

Database

* PostgreSQL

Web Client

* Next.js
* React
* TypeScript

Mobile Client

* Expo
* React Native

Containerization

* Docker
* Docker Compose

⸻

Authentication Flow

1. User submits credentials.
2. Backend validates credentials.
3. Password hash is verified.
4. JWT access token is issued.
5. Client stores token securely.
6. Protected endpoints validate token.
7. RBAC guards enforce permissions.

⸻

Security Measures

Password Security

* Passwords hashed using bcrypt.
* Plain text passwords never stored.

Authentication

* JWT access tokens.
* Route guards protect endpoints.

Authorization

* Global roles.
* Project-level roles.
* RBAC enforced at API level.

Validation

* DTO validation.
* Request sanitization.
* Strong typing through TypeScript.

⸻

Scalability Considerations

The architecture is intentionally simple while supporting future scaling.

Possible enhancements:

* Redis caching
* Background job processing
* Horizontal API scaling
* Read replicas
* Object storage for attachments

⸻

Deployment Strategy

Development

Docker Compose
 ├─ PostgreSQL
 └─ NestJS API

Production

Load Balancer
      │
      ▼
NestJS Containers
      │
      ▼
PostgreSQL Database

This approach provides a clear migration path from local development to production infrastructure without major architectural changes.

⸻

Design Decisions

Why NestJS?

* Modular architecture
* Built-in dependency injection
* Strong TypeScript support
* Enterprise-ready patterns

Why PostgreSQL?

* ACID compliance
* Strong relational modeling
* Excellent Prisma support

Why Docker?

* Consistent environments
* Easy onboarding
* Reproducible deployments

Why RBAC?

* Fine-grained permissions
* Clear separation of responsibilities
* Supports future growth of teams and projects