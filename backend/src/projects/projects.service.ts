import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProjectBuilder } from './project.builder';

@Injectable()
export class ProjectsService {
  constructor(
    private prisma: PrismaService,
    private projectBuilder: ProjectBuilder, 
  ) {}

  async createProject(
    userId: string,
    title: string,
    description?: string,
    customStages?: string[],
  ) {
    return this.projectBuilder
      .setBasicInfo(title, description)
      .setOwner(userId)
      .setCustomStages(customStages || [])
      .build();
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
          where: { status: 'ACCEPTED' }, // Hanya tampilkan member yang sudah accept
          include: { user: { select: { id: true, name: true, email: true } } },
        },
      },
    });

    if (!board) throw new NotFoundException('Proyek tidak ditemukan.');
    return board;
  }

  async getUserProjects(userId: string) {
    // Req 7: Hanya melihat projek dimana user terlibat sebagai OWNER atau sudah ACCEPT invitation
    return this.prisma.project.findMany({
      where: {
        members: {
          some: { userId, status: 'ACCEPTED' },
        },
      },
      include: {
        members: {
          where: { userId },
          select: { role: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Req 5: Invite User
  async inviteMember(projectId: string, email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user)
      throw new NotFoundException(
        'User dengan email tersebut tidak ditemukan.',
      );

    const existing = await this.prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId: user.id } },
    });

    if (existing) {
      if (existing.status === 'PENDING')
        throw new BadRequestException('User ini sudah diundang (Pending).');
      throw new BadRequestException('User ini sudah menjadi anggota proyek.');
    }

    return this.prisma.projectMember.create({
      data: { projectId, userId: user.id, role: 'MEMBER', status: 'PENDING' },
      include: { user: { select: { id: true, name: true, email: true } } },
    });
  }

  // Req 6: Terima Invitation
  async acceptInvitation(projectId: string, userId: string) {
    return this.prisma.projectMember.update({
      where: { projectId_userId: { projectId, userId } },
      data: { status: 'ACCEPTED' },
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

  async deleteProject(projectId: string) {
    return this.prisma.project.delete({ where: { id: projectId } });
  }

  async deleteStage(stageId: string) {
    return this.prisma.boardStage.delete({ where: { id: stageId } });
  }
}
