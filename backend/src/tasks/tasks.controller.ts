import {
  Body,
  Controller,
  Param,
  Patch,
  Post,
  Get,
  Delete,
  Request,
  UseGuards,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { AuthGuard } from '../auth/auth.guard';
import { TaskMutationGuard } from './task-mutation.guard';

@Controller('tasks')
@UseGuards(AuthGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

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
    return this.tasksService.getUpcomingTasks(req.user.sub);
  }

  @Get(':id')
  async getTaskDetails(@Param('id') id: string) {
    return this.tasksService.getTaskDetails(id);
  }

  @Patch(':id')
  @UseGuards(TaskMutationGuard)
  async updateTask(
    @Param('id') id: string,
    @Body()
    body: {
      title?: string;
      description?: string;
      dueDate?: string | null;
      assignedTo?: string | null;
    },
  ) {
    return this.tasksService.updateTask(id, {
      title: body.title,
      description: body.description,
      dueDate:
        body.dueDate === null
          ? null
          : body.dueDate
            ? new Date(body.dueDate)
            : undefined,
      assignedTo: body.assignedTo,
    });
  }

  @Delete(':id')
  @UseGuards(TaskMutationGuard)
  async deleteTask(@Param('id') id: string) {
    return this.tasksService.deleteTask(id);
  }

  @Patch(':id/move')
  @UseGuards(TaskMutationGuard)
  async moveTask(
    @Param('id') id: string,
    @Body() body: { newStageId: string },
  ) {
    return this.tasksService.moveTask(id, body.newStageId);
  }

  @Post(':id/comments')
  async addComment(
    @Param('id') taskId: string,
    @Request() req,
    @Body() body: { content: string },
  ) {
    return this.tasksService.addComment(taskId, req.user.sub, body.content);
  }
}