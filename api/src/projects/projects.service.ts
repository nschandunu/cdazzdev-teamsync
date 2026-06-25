import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateProjectDto } from './projects.dto';
import { ProjectRole } from '@prisma/client';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateProjectDto, userId: string) {
    return this.prisma.project.create({
      data: {
        ...dto,
        ownerId: userId,
        members: {
          create: {
            userId,
            role: ProjectRole.MANAGER, // The creator is automatically a project manager
          }
        }
      },
    });
  }

  async findAllForUser(userId: string) {
    return this.prisma.project.findMany({
      where: {
        members: {
          some: { userId },
        },
      },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        members: { include: { user: { select: { id: true, name: true, email: true } } } },
      }
    });
  }
}