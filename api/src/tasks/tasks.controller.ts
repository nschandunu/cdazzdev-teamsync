import { Controller, Get, Post, Body, Patch, Param, Query, UseGuards } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto, UpdateTaskDto, FilterTasksDto, CreateCommentDto } from './tasks.dto';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetUser } from '../auth/get-user.decorator';
import { GlobalRole } from '@prisma/client';

@ApiTags('Tasks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post('projects/:projectId/tasks')
  @ApiOperation({ summary: 'Create a task in a project' })
  create(@Param('projectId') projectId: string, @Body() dto: CreateTaskDto) {
    return this.tasksService.create(projectId, dto);
  }

  @Get('projects/:projectId/tasks')
  @ApiOperation({ summary: 'Get tasks with filtering & pagination' })
  findAll(@Param('projectId') projectId: string, @Query() query: FilterTasksDto) {
    return this.tasksService.findAllInProject(projectId, query);
  }

  @Get('tasks/:id')
  @ApiOperation({ summary: 'Get a single task with comments and assignee' })
  findOne(@Param('id') id: string) {
    return this.tasksService.findOne(id);
  }

  @Patch('tasks/:id')
  @ApiOperation({ summary: 'Update a task (Restricted access)' })
  update(@Param('id') id: string, @Body() dto: UpdateTaskDto, @GetUser() user: any) {
    return this.tasksService.update(id, dto, user.userId, user.role as GlobalRole);
  }

  @Post('tasks/:id/comments')
  @ApiOperation({ summary: 'Add a comment to a task' })
  addComment(@Param('id') id: string, @Body() dto: CreateCommentDto, @GetUser() user: any) {
    return this.tasksService.addComment(id, dto, user.userId);
  }
}