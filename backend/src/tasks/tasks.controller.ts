// src/tasks/tasks.controller.ts
import {
  Body,
  Controller,
  Param,
  Patch,
  Post,
  Get,
  Request,
  UseGuards,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { AuthGuard } from '../auth/auth.guard';
import { TaskMutationGuard } from './task-mutation.guard';

@Controller('tasks')
@UseGuards(AuthGuard) // Wajib login untuk semua endpoint task
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  // Endpoint: POST /tasks
  @Post()
  async createTask(
    @Body()
    body: {
      projectId: string;
      stageId: string;
      title: string;
      assignedTo?: string;
      dueDate?: string;
    },
  ) {
    return this.tasksService.createTask(
      body.projectId,
      body.stageId,
      body.title,
      body.assignedTo,
      body.dueDate ? new Date(body.dueDate) : undefined,
    );
  }

  @Get('upcoming')
  async getUpcomingTasks(@Request() req) {
    const userId = req.user.sub;
    return this.tasksService.getUpcomingTasks(userId);
  }

  // Endpoint: PATCH /tasks/:id/move
  // Di sini keajaiban "Anti-Mess" bekerja dengan TaskMutationGuard
  @Patch(':id/move')
  @UseGuards(TaskMutationGuard)
  async moveTask(
    @Param('id') id: string,
    @Body() body: { newStageId: string },
  ) {
    return this.tasksService.moveTask(id, body.newStageId);
  }
}
