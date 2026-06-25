import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './projects.dto';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { GlobalRole } from '@prisma/client';
import { GetUser } from '../auth/get-user.decorator';

@ApiTags('Projects')
@ApiBearerAuth() // Tells Swagger this route needs a JWT
@UseGuards(JwtAuthGuard, RolesGuard) // Secures all endpoints in this controller
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @Roles(GlobalRole.MANAGER, GlobalRole.ADMIN) // Requirement: Manager/Admin only
  @ApiOperation({ summary: 'Create a new project (Manager/Admin only)' })
  create(@Body() dto: CreateProjectDto, @GetUser() user: any) {
    return this.projectsService.create(dto, user.userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all projects the user belongs to' })
  findAll(@GetUser() user: any) {
    return this.projectsService.findAllForUser(user.userId);
  }
}