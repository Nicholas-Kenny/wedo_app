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
          where: { status: 'ACCEPTED' },
          include: { user: { select: { id: true, name: true, email: true } } },
        },
      },
    });

    if (!board) throw new NotFoundException('Project not found.');
    return board;
  }

  async getUserProjects(userId: string) {
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

  async inviteMember(projectId: string, email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user)
      throw new NotFoundException(
        'User with the specified email not found.',
      );

    const existing = await this.prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId: user.id } },
    });

    if (existing) {
      if (existing.status === 'PENDING')
        throw new BadRequestException('User is already invited (Pending).');
      throw new BadRequestException('User is already a member of the project.');
    }

    return this.prisma.projectMember.create({
      data: { projectId, userId: user.id, role: 'MEMBER', status: 'PENDING' },
      include: { user: { select: { id: true, name: true, email: true } } },
    });
  }

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
