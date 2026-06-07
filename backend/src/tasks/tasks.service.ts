import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  async createTask(
    projectId: string,
    stageId: string,
    title: string,
    creatorId: string,
    assignedToUserId?: string,
    dueDate?: Date,
  ) {
    return this.prisma.task.create({
      data: {
        projectId,
        stageId,
        title,
        creatorId, 
        assignedTo: assignedToUserId,
        dueDate,
      },
    });
  }

  async getTaskDetails(taskId: string) {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      include: {
        assignee: { select: { id: true, name: true, email: true } },
        stage: { select: { id: true, title: true } },
        comments: {
          include: {
            user: { select: { id: true, name: true } },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!task) throw new NotFoundException('Task not found.');
    return task;
  }

  async updateTask(
    taskId: string,
    data: {
      title?: string;
      description?: string;
      dueDate?: Date | null;
      assignedTo?: string | null;
    },
  ) {
    return this.prisma.task.update({
      where: { id: taskId },
      data: {
        title: data.title,
        description: data.description,
        dueDate: data.dueDate,
        assignedTo: data.assignedTo,
      },
    });
  }

  async deleteTask(taskId: string) {
    return this.prisma.task.delete({ where: { id: taskId } });
  }

  async moveTask(taskId: string, newStageId: string) {
    return this.prisma.task.update({
      where: { id: taskId },
      data: { stageId: newStageId },
    });
  }

  async addComment(taskId: string, userId: string, content: string) {
    return this.prisma.comment.create({
      data: { taskId, userId, content },
      include: {
        user: { select: { id: true, name: true } },
      },
    });
  }

  async getUpcomingTasks(userId: string) {
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);

    return this.prisma.task.findMany({
      where: {
        assignedTo: userId,
        dueDate: {
          gte: today,
          lte: nextWeek,
        },
      },
      include: {
        project: { select: { title: true } },
        stage: { select: { title: true } },
      },
      orderBy: { dueDate: 'asc' },
    });
  }
}
