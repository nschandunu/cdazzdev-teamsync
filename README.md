TeamSync - CDAZZDEV Assessment

TeamSync is a lightweight project and task tracking platform consisting of a NestJS backend, a Next.js web interface, and an Expo React Native mobile app.

🚀 Quick Start (Local Setup)

This project uses Docker to spin up the database and requires zero paid external services.TeamSync - CDAZZDEV Assessment

TeamSync is a lightweight project and task tracking platform consisting of a NestJS backend, a Next.js web interface, and an Expo React Native mobile app.

🚀 Quick Start (Local Setup)

This project uses Docker to spin up the database and requires zero paid external services.

1. Clone & Setup Environment

git clone <your-repo-url>
cd cdazzdev-teamsync
cp .env.example .env
# Make sure Docker is running
docker compose up -d

2. Start the API

cd api
npm install
npx prisma migrate dev
npm run start:dev

The API will be available at:

http://localhost:3000/api/docs

📊 Database Design (Part D)

Entity Relationship Diagram (ERD)

erDiagram
    USER {
        String id PK
        String email UK
        String passwordHash
        String name
        GlobalRole role
    }
    PROJECT {
        String id PK
        String name
        String description
        String ownerId FK
    }
    PROJECTMEMBER {
        String id PK
        String userId FK
        String projectId FK
        ProjectRole role
    }
    TASK {
        String id PK
        String projectId FK
        String title
        String description
        TaskStatus status
        TaskPriority priority
        String assigneeId FK
        DateTime dueDate
    }
    COMMENT {
        String id PK
        String taskId FK
        String authorId FK
        String body
    }
    USER ||--o{ PROJECT : owns
    USER ||--o{ PROJECTMEMBER : belongs_to
    USER ||--o{ TASK : assigned_to
    USER ||--o{ COMMENT : writes
    PROJECT ||--o{ PROJECTMEMBER : has
    PROJECT ||--o{ TASK : contains
    TASK ||--o{ COMMENT : has

Database Indexing Strategy

Indexes have been added to optimize the most common query paths:

* User.email → unique index for authentication lookups
* Project.ownerId → project ownership filtering
* ProjectMember.userId → user membership lookups
* ProjectMember.projectId → project member retrieval
* Task.projectId → task listing per project
* Task.assigneeId → assigned task retrieval
* Task.status → task filtering
* Comment.taskId → task comment loading

These indexes reduce table scans and improve query performance for project dashboards and task management workflows.TeamSync - CDAZZDEV Assessment

TeamSync is a lightweight project and task tracking platform consisting of a NestJS backend, a Next.js web interface, and an Expo React Native mobile app.

🚀 Quick Start (Local Setup)

This project uses Docker to spin up the database and requires zero paid external services.

1. Clone & Setup Environment

git clone <your-repo-url>
cd cdazzdev-teamsync
cp .env.example .env
# Make sure Docker is running
docker compose up -d

2. Start the API

cd api
npm install
npx prisma migrate dev
npm run start:dev

The API will be available at:

http://localhost:3000/api/docs

📊 Database Design (Part D)

Entity Relationship Diagram (ERD)

erDiagram
    USER {
        String id PK
        String email UK
        String passwordHash
        String name
        GlobalRole role
    }
    PROJECT {
        String id PK
        String name
        String description
        String ownerId FK
    }
    PROJECTMEMBER {
        String id PK
        String userId FK
        String projectId FK
        ProjectRole role
    }
    TASK {
        String id PK
        String projectId FK
        String title
        String description
        TaskStatus status
        TaskPriority priority
        String assigneeId FK
        DateTime dueDate
    }
    COMMENT {
        String id PK
        String taskId FK
        String authorId FK
        String body
    }
    USER ||--o{ PROJECT : owns
    USER ||--o{ PROJECTMEMBER : belongs_to
    USER ||--o{ TASK : assigned_to
    USER ||--o{ COMMENT : writes
    PROJECT ||--o{ PROJECTMEMBER : has
    PROJECT ||--o{ TASK : contains
    TASK ||--o{ COMMENT : has

Database Indexing Strategy

Indexes have been added to optimize the most common query paths:

* User.email → unique index for authentication lookups
* Project.ownerId → project ownership filtering
* ProjectMember.userId → user membership lookups
* ProjectMember.projectId → project member retrieval
* Task.projectId → task listing per project
* Task.assigneeId → assigned task retrieval
* Task.status → task filtering
* Comment.taskId → task comment loading

These indexes reduce table scans and improve query performance for project dashboards and task management workflows.

1. Clone & Setup Environment

git clone <your-repo-url>
cd cdazzdev-teamsync
cp .env.example .env
# Make sure Docker is running
docker compose up -d

2. Start the API

cd api
npm install
npx prisma migrate dev
npm run start:dev

The API will be available at:

http://localhost:3000/api/docs

📊 Database Design (Part D)

Entity Relationship Diagram (ERD)

erDiagram
    USER {
        String id PK
        String email UK
        String passwordHash
        String name
        GlobalRole role
    }
    PROJECT {
        String id PK
        String name
        String description
        String ownerId FK
    }
    PROJECTMEMBER {
        String id PK
        String userId FK
        String projectId FK
        ProjectRole role
    }
    TASK {
        String id PK
        String projectId FK
        String title
        String description
        TaskStatus status
        TaskPriority priority
        String assigneeId FK
        DateTime dueDate
    }
    COMMENT {
        String id PK
        String taskId FK
        String authorId FK
        String body
    }
    USER ||--o{ PROJECT : owns
    USER ||--o{ PROJECTMEMBER : belongs_to
    USER ||--o{ TASK : assigned_to
    USER ||--o{ COMMENT : writes
    PROJECT ||--o{ PROJECTMEMBER : has
    PROJECT ||--o{ TASK : contains
    TASK ||--o{ COMMENT : has

Database Indexing Strategy

Indexes have been added to optimize the most common query paths:

* User.email → unique index for authentication lookups
* Project.ownerId → project ownership filtering
* ProjectMember.userId → user membership lookups
* ProjectMember.projectId → project member retrieval
* Task.projectId → task listing per project
* Task.assigneeId → assigned task retrieval
* Task.status → task filtering
* Comment.taskId → task comment loading

These indexes reduce table scans and improve query performance for project dashboards and task management workflows.