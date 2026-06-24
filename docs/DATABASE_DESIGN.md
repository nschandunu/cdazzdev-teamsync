Database Design (Part D)

Overview

The TeamSync platform uses PostgreSQL with Prisma ORM.

The schema is designed around five primary entities:

1. User
2. Project
3. ProjectMember
4. Task
5. Comment

The design follows normalization principles to minimize redundancy while maintaining efficient query performance.

⸻

Entity Descriptions

User

Represents a system user.

Field	Description
id	Primary Key
email	Unique email
passwordHash	Hashed password
name	User display name
role	Global system role

⸻

Project

Represents a project workspace.

Field	Description
id	Primary Key
name	Project name
description	Project details
ownerId	User who owns the project

⸻

ProjectMember

Maps users to projects and stores project-specific roles.

Field	Description
id	Primary Key
userId	Member user
projectId	Related project
role	Project role

⸻

Task

Represents work items within a project.

Field	Description
id	Primary Key
projectId	Parent project
title	Task title
description	Task description
status	Current task status
priority	Task priority
assigneeId	Assigned user
dueDate	Due date

⸻

Comment

Stores discussions related to tasks.

Field	Description
id	Primary Key
taskId	Related task
authorId	Comment author
body	Comment content

⸻

Relationships

User → Project

One user can own multiple projects.

User → ProjectMember

One user can belong to multiple projects.

Project → ProjectMember

One project can have multiple members.

Project → Task

One project can contain multiple tasks.

User → Task

One user can be assigned multiple tasks.

Task → Comment

One task can contain multiple comments.

User → Comment

One user can create multiple comments.

⸻

Indexing Strategy

The following indexes are used:

User(email)
Project(ownerId)
ProjectMember(userId)
ProjectMember(projectId)
Task(projectId)
Task(assigneeId)
Task(status)
Comment(taskId)

Why These Indexes?

* Authentication frequently searches by email.
* Dashboards load projects by owner.
* Membership checks filter by user and project.
* Task boards filter by status and assignee.
* Comments are always loaded by task.

This indexing strategy improves query performance while maintaining efficient write operations.