import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BoardStageFactory } from './board-stage.factory';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  // Kita asumsikan userId didapat dari JWT Token (akan kita buat nanti)
  async createProject(userId: string, title: string, description?: string) {
    // Kita gunakan Prisma Transaction agar jika salah satu gagal, semua di-rollback
    return this.prisma.$transaction(async (tx) => {
      // 1. Buat Project
      const project = await tx.project.create({
        data: { title, description },
      });

      // 2. Assign User sebagai OWNER di tabel junction
      await tx.projectMember.create({
        data: {
          projectId: project.id,
          userId: userId,
          role: 'OWNER',
        },
      });

      // 3. Gunakan Factory Pattern untuk generate kolom default
      const defaultStages = BoardStageFactory.createDefaultStages(project.id);
      await tx.boardStage.createMany({
        data: defaultStages,
      });

      return project;
    });
  }

  async getProjectBoard(projectId: string) {
    return this.prisma.project.findUnique({
      where: { id: projectId },
      include: {
        stages: {
          orderBy: { position: 'asc' }, // Urutkan kolom berdasarkan posisi (To Do -> In Progress -> Done)
          include: {
            tasks: true, // Ambil semua task yang ada di dalam masing-masing kolom
          },
        },
      },
    });
  }

  async getUserProjects(userId: string) {
    return this.prisma.project.findMany({
      where: {
        members: {
          some: { userId: userId }, // Hanya ambil proyek di mana user ini menjadi member/owner
        },
      },
    });
  }

  // Fungsi untuk menambah kolom kustom baru di dalam proyek
  async addCustomStage(projectId: string, title: string) {
    // Cari posisi urutan paling akhir di papan tersebut
    const lastStage = await this.prisma.boardStage.findFirst({
      where: { projectId },
      orderBy: { position: 'desc' },
    });

    // Taruh kolom baru di posisi paling kanan
    const newPosition = lastStage ? lastStage.position + 1 : 0;

    return this.prisma.boardStage.create({
      data: {
        projectId,
        title,
        position: newPosition,
      },
    });
  }

  async inviteMember(projectId: string, email: string, role: string = 'MEMBER') {
    // 1. Cari user berdasarkan email
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new Error('User dengan email tersebut tidak ditemukan');

    // 2. Tambahkan ke tabel member
    return this.prisma.projectMember.create({
      data: {
        projectId,
        userId: user.id,
        role,
      },
    });
  }
}
