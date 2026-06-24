import { PrismaClient, GlobalRole, ProjectRole, TaskStatus, TaskPriority } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // FIX: Dynamically generate a valid bcrypt hash
  const defaultPassword = await bcrypt.hash('password123', 10); 

  // 1. Create 2 Users
  const manager = await prisma.user.upsert({
    where: { email: 'manager@teamsync.com' },
    update: {},
    create: {
      email: 'manager@teamsync.com',
      name: 'Alice Manager',
      passwordHash: defaultPassword,
      role: GlobalRole.MANAGER,
    },
  });

  const member = await prisma.user.upsert({
    where: { email: 'member@teamsync.com' },
    update: {},
    create: {
      email: 'member@teamsync.com',
      name: 'Bob Member',
      passwordHash: defaultPassword,
      role: GlobalRole.MEMBER,
    },
  });

  // 2. Create 1 Project
  const project = await prisma.project.create({
    data: {
      name: 'TeamSync MVP Development',
      description: 'Building the core product for the CDAZZDEV assessment.',
      ownerId: manager.id,
      members: {
        create: [
          { userId: manager.id, role: ProjectRole.MANAGER },
          { userId: member.id, role: ProjectRole.MEMBER },
        ],
      },
    },
  });

  // 3. Create 5 Tasks
  const tasks = await prisma.task.createMany({
    data: [
      {
        projectId: project.id,
        title: 'Design Database Schema',
        description: 'Create the Prisma schema with required models and indexes.',
        status: TaskStatus.DONE,
        priority: TaskPriority.HIGH,
        assigneeId: manager.id,
      },
      {
        projectId: project.id,
        title: 'Implement JWT Auth',
        description: 'Set up Guards and Role-based access control.',
        status: TaskStatus.IN_PROGRESS,
        priority: TaskPriority.HIGH,
        assigneeId: member.id,
      },
      {
        projectId: project.id,
        title: 'Build Next.js Dashboard',
        description: 'Translate Figma tokens into a responsive UI.',
        status: TaskStatus.TODO,
        priority: TaskPriority.MEDIUM,
        assigneeId: member.id,
      },
      {
        projectId: project.id,
        title: 'React Native Offline Cache',
        description: 'Implement offline-first task fetching in Expo.',
        status: TaskStatus.TODO,
        priority: TaskPriority.LOW,
        assigneeId: member.id,
      },
      {
        projectId: project.id,
        title: 'Write ARCHITECTURE.md',
        description: 'Document AWS deployment strategies and indexing choices.',
        status: TaskStatus.TODO,
        priority: TaskPriority.MEDIUM,
        assigneeId: manager.id,
      },
    ],
  });

  console.log(`✅ Seeded: 2 Users, 1 Project, ${tasks.count} Tasks.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });