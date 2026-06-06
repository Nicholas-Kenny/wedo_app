import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TaskMutationGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user.sub;
    const taskId = request.params.id;

    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      include: {
        project: {
          include: {
            members: { where: { userId } },
          },
        },
      },
    });

    if (!task) {
      throw new NotFoundException('Tugas tidak ditemukan.');
    }

    // Cukup jadi anggota proyek untuk bisa mengelola task
    if (task.project.members.length === 0) {
      throw new ForbiddenException('Anda bukan anggota proyek ini.');
    }

    return true;
  }
}