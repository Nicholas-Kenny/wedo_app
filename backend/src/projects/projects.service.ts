import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BoardStageFactory } from './board-stage.factory';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  async createProject(userId: string, title: string, description?: string) {
    return this.prisma.$transaction(async (tx) => {
      const project = await tx.project.create({
        data: { title, description },
      });

      await tx.projectMember.create({
        data: { projectId: project.id, userId, role: 'OWNER' },
      });

      const defaultStages = BoardStageFactory.createDefaultStages(project.id);
      await tx.boardStage.createMany({ data: defaultStages });

      return project;
    });
  }

  async getProjectBoard(projectId: string) {
    const board = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: {
        stages: {
          orderBy: { position: 'asc' },
          include: { tasks: { orderBy: { createdAt: 'asc' } } },
        },
        members: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
      },
    });

    if (!board) throw new NotFoundException('Proyek tidak ditemukan.');
    return board;
  }

  async getUserProjects(userId: string) {
    return this.prisma.project.findMany({
      where: { members: { some: { userId } } },
      include: {
        members: {
          where: { userId: userId },
          select: { role: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async addCustomStage(projectId: string, title: string) {
    const lastStage = await this.prisma.boardStage.findFirst({
      where: { projectId },
      orderBy: { position: 'desc' },
    });

    const newPosition = lastStage ? lastStage.position + 1 : 0;

    return this.prisma.boardStage.create({
      data: { projectId, title, position: newPosition },
    });
  }

  async inviteMember(
    projectId: string,
    email: string,
    role: string = 'MEMBER',
  ) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user)
      throw new NotFoundException(
        'User dengan email tersebut tidak ditemukan.',
      );

    // Cek apakah sudah jadi member
    const existing = await this.prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId: user.id } },
    });
    if (existing) throw new Error('User ini sudah menjadi anggota proyek.');

    return this.prisma.projectMember.create({
      data: { projectId, userId: user.id, role },
      include: { user: { select: { id: true, name: true, email: true } } },
    });
  }

  async deleteProject(projectId: string) {
    return this.prisma.project.delete({ where: { id: projectId } });
  }

  async deleteStage(stageId: string) {
    return this.prisma.boardStage.delete({ where: { id: stageId } });
  }
}
