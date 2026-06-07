import { Injectable, Scope } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable({ scope: Scope.TRANSIENT })
export class ProjectBuilder {
  private title!: string;
  private description?: string;
  private ownerId!: string;
  private customStages: string[] = [];

  constructor(private prisma: PrismaService) {}

  setBasicInfo(title: string, description?: string) {
    this.title = title;
    this.description = description;
    return this; 
  }

  setOwner(userId: string) {
    this.ownerId = userId;
    return this;
  }

  setCustomStages(stages: string[]) {
    if (stages && stages.length > 0) {
      this.customStages = stages;
    }
    return this;
  }

  async build() {
    const stagesToCreate =
      this.customStages.length > 0
        ? this.customStages.map((title, index) => ({
            title,
            position: index + 1,
          }))
        : [
            { title: 'To Do', position: 1 },
            { title: 'In Progress', position: 2 },
            { title: 'Done', position: 3 },
          ];

    return this.prisma.project.create({
      data: {
        title: this.title,
        description: this.description,
        members: {
          create: {
            userId: this.ownerId,
            role: 'OWNER',
            status: 'ACCEPTED',
          },
        },
        stages: {
          create: stagesToCreate,
        },
      },
    });
  }
}
