import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import {
  CreateTaskDto,
  UpdateTaskDto,
  FilterTasksDto,
  CreateCommentDto,
} from './tasks.dto';
import { GlobalRole, ProjectRole, Prisma } from '@prisma/client';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  async create(projectId: string, dto: CreateTaskDto) {
    return this.prisma.task.create({
      data: {
        ...dto,
        projectId,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
      },
    });
  }

  async findAllInProject(projectId: string, query: FilterTasksDto) {
    const { status, priority, assigneeId, sortBy } = query;
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const where = {
      projectId,
      ...(status && { status }),
      ...(priority && { priority }),
      ...(assigneeId && { assigneeId }),
    };

    const orderBy: Prisma.TaskOrderByWithRelationInput = sortBy
      ? { [sortBy]: 'asc' }
      : { createdAt: 'desc' };

    const [data, total] = await Promise.all([
      this.prisma.task.findMany({ 
        where, 
        skip, 
        take: limit, 
        orderBy,
        include: { assignee: { select: { id: true, name: true } } }
      }),
      this.prisma.task.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const task = await this.prisma.task.findUnique({
      where: { id },
      include: {
        assignee: { select: { id: true, name: true } },
        comments: {
          include: { author: { select: { id: true, name: true } } },
          orderBy: { createdAt: 'asc' },
        },
      },
    });
    if (!task) throw new NotFoundException('Task not found');
    return task;
  }

  async update(
    id: string,
    dto: UpdateTaskDto,
    userId: string,
    userRole: GlobalRole,
  ) {
    const task = await this.prisma.task.findUnique({
      where: { id },
      include: { project: { include: { members: true } } },
    });
    if (!task) throw new NotFoundException('Task not found');

    // Security Check: Only Assignee, Project Manager, or Global Admin can update
    const isAssignee = task.assigneeId === userId;
    const isAdmin = userRole === GlobalRole.ADMIN;
    const isProjectManager = task.project.members.some(
      (m) => m.userId === userId && m.role === ProjectRole.MANAGER,
    );

    if (!isAssignee && !isAdmin && !isProjectManager) {
      throw new ForbiddenException(
        'You do not have permission to update this task',
      );
    }

    const updateData: any = { ...dto };
    if (dto.dueDate !== undefined) {
      updateData.dueDate = dto.dueDate ? new Date(dto.dueDate) : null;
    }

    return this.prisma.task.update({ where: { id }, data: updateData });
  }

  async addComment(taskId: string, dto: CreateCommentDto, userId: string) {
    return this.prisma.comment.create({
      data: {
        taskId,
        authorId: userId,
        body: dto.body,
      },
    });
  }
}
