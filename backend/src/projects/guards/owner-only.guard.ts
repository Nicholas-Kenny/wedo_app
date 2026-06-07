import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class OwnerOnlyGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user.sub;
    const projectId = request.params.id;

    const member = await this.prisma.projectMember.findFirst({
      where: { projectId, userId, role: 'OWNER' },
    });

    if (!member) {
      throw new ForbiddenException(
        'Only the OWNER can perform this action.',
      );
    }

    return true;
  }
}
