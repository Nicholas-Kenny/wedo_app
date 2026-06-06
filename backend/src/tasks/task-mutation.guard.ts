// src/tasks/task-mutation.guard.ts
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
    const userId = request.user.sub; // Didapat dari AuthGuard
    const taskId = request.params.id; // Didapat dari URL parameter /tasks/:id/move

    // Cari tugas beserta info keanggotaan user di proyek tersebut
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      include: {
        project: {
          include: {
            members: {
              where: { userId: userId },
            },
          },
        },
      },
    });

    if (!task) {
      throw new NotFoundException('Tugas tidak ditemukan.');
    }

    // Cek otorisasi
    const isAssignee = task.assignedTo === userId;
    const isOwner =
      task.project.members.length > 0 &&
      task.project.members[0].role === 'OWNER';

    if (isAssignee || isOwner) {
      return true; // Lolos verifikasi
    }

    throw new ForbiddenException(
      'Strict Mutation Policy: Anda hanya dapat memindahkan tugas yang di-assign ke Anda, atau jika Anda adalah OWNER proyek.',
    );
  }
}
