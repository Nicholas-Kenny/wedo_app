import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardFacade {
  constructor(private prisma: PrismaService) {}

  async getDashboardData(userId: string) {
    const today = new Date();
    const sevenDaysLater = new Date();
    sevenDaysLater.setDate(today.getDate() + 7);

    // Promise.all agar eksekusi query berjalan paralel (lebih cepat)
    const [upcomingTasks, userProjects, pendingInvitations] = await Promise.all(
      [
        // 1. Task dengan deadline 7 hari ke depan dimana user adalah assignee ATAU creator
        this.prisma.task.findMany({
          where: {
            OR: [{ assignedTo: userId }, { creatorId: userId }],
            dueDate: { gte: today, lte: sevenDaysLater },
          },
          include: {
            project: { select: { title: true } },
            stage: { select: { title: true } },
          },
          orderBy: { dueDate: 'asc' },
        }),

        // 2. Projek aktif (ACCEPTED)
        this.prisma.project.findMany({
          where: { members: { some: { userId, status: 'ACCEPTED' } } },
          include: { members: { where: { userId }, select: { role: true } } },
        }),

        // 3. Undangan projek yang belum di-accept (PENDING)
        this.prisma.projectMember.findMany({
          where: { userId, status: 'PENDING' },
          include: {
            project: { select: { id: true, title: true, description: true } },
          },
        }),
      ],
    );

    return {
      upcomingTasks,
      userProjects,
      pendingInvitations,
    };
  }
}
