// src/tasks/tasks.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  async createTask(
    projectId: string,
    stageId: string,
    title: string,
    assignedToUserId?: string,
    dueDate?: Date,
  ) {
    return this.prisma.task.create({
      data: {
        projectId,
        stageId,
        title,
        assignedTo: assignedToUserId, // Bisa null jika belum ada yang di-assign
        dueDate: dueDate,
      },
    });
  }

  async moveTask(taskId: string, newStageId: string) {
    return this.prisma.task.update({
      where: { id: taskId },
      data: {
        stageId: newStageId,
      },
    });
  }

  async getUpcomingTasks(userId: string) {
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);

    return this.prisma.task.findMany({
      where: {
        assignedTo: userId, // Hanya ambil tugas milik user ini
        dueDate: {
          gte: today, // Tenggat waktu lebih dari atau sama dengan hari ini
          lte: nextWeek, // Tenggat waktu kurang dari atau sama dengan 7 hari ke depan
        },
      },
      include: {
        project: { select: { title: true } }, // Bawa serta nama proyeknya
        stage: { select: { title: true } }, // Bawa serta nama statusnya
      },
      orderBy: {
        dueDate: 'asc', // Urutkan dari deadline yang paling dekat
      },
    });
  }
}
