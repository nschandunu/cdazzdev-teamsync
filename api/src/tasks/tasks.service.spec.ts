import { Test, TestingModule } from '@nestjs/testing';
import { TasksService } from './tasks.service';
import { PrismaService } from '../prisma.service';
import { TaskStatus } from '@prisma/client';

describe('TasksService Filtering & Pagination', () => {
  let service: TasksService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: PrismaService,
          useValue: {
            task: {
              findMany: jest.fn().mockResolvedValue([{ id: '1', title: 'Test Task' }]),
              count: jest.fn().mockResolvedValue(1),
            },
          },
        },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should apply pagination and status filters correctly', async () => {
    const projectId = 'proj-123';
    const query = { status: TaskStatus.TODO, page: 2, limit: 5 };
    
    await service.findAllInProject(projectId, query);

    expect(prisma.task.findMany).toHaveBeenCalledWith({
      where: { projectId: 'proj-123', status: 'TODO' },
      skip: 5, // (page 2 - 1) * 5
      take: 5,
      orderBy: { createdAt: 'desc' },
    });
  });
});