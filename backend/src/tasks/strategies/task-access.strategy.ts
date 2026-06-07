import { Task, ProjectMember } from '@prisma/client';

export interface TaskAccessStrategy {
  isAuthorized(userId: string, task: Task, member?: ProjectMember): boolean;
}

export class OwnerStrategy implements TaskAccessStrategy {
  isAuthorized(userId: string, task: Task, member?: ProjectMember): boolean {
    return member?.role === 'OWNER' && member?.status === 'ACCEPTED';
  }
}

export class CreatorStrategy implements TaskAccessStrategy {
  isAuthorized(userId: string, task: Task, member?: ProjectMember): boolean {
    return task.creatorId === userId;
  }
}

// Context Class yang akan mengeksekusi semua strategy
export class TaskAuthorizationContext {
  private strategies: TaskAccessStrategy[] = [
    new OwnerStrategy(),
    new CreatorStrategy(),
  ];

  checkAccess(userId: string, task: Task, member?: ProjectMember): boolean {
    // Akan return true jika salah satu strategy (Owner ATAU Creator) mengembalikan true
    return this.strategies.some((strategy) =>
      strategy.isAuthorized(userId, task, member),
    );
  }
}
