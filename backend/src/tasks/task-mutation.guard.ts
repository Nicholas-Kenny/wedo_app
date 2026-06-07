import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TaskAuthorizationContext } from './strategies/task-access.strategy';

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

    if (!task) throw new NotFoundException('Tugas tidak ditemukan.');

    const member = task.project.members[0]; 
    const authContext = new TaskAuthorizationContext();

    if (!authContext.checkAccess(userId, task, member)) {
      throw new ForbiddenException(
        'You do not have access to modify or delete this task. Only the task creator or Project Owner is permitted.',
      );
    }

    return true;
  }
}
