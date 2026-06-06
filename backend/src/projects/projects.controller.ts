// src/projects/projects.controller.ts
import {
  Body,
  Controller,
  Post,
  Get,
  UseGuards,
  Request,
  Param,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { AuthGuard } from '../auth/auth.guard';
import { OwnerOnlyGuard } from './guards/owner-only.guard';

@Controller('projects')
// 1. Tambahkan dekorator ini untuk memproteksi seluruh endpoint di dalam controller ini
@UseGuards(AuthGuard)
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  async createProject(
    @Request() req,
    @Body() body: { title: string; description?: string },
  ) {
    // 2. Ambil ID user dari req.user yang sudah disisipkan oleh AuthGuard tadi (payload.sub)
    const userId = req.user.sub;

    // 3. Panggil service dengan userId yang asli!
    return this.projectsService.createProject(
      userId,
      body.title,
      body.description,
    );
  }

  @Get(':id/board')
  async getProjectBoard(@Param('id') id: string) {
    return this.projectsService.getProjectBoard(id);
  }

  @Get()
  async getUserProjects(@Request() req) {
    // Ekstrak ID dari token JWT yang sudah dilewati AuthGuard
    return this.projectsService.getUserProjects(req.user.sub);
  }

  // Endpoint untuk menambah kolom kustom
  @Post(':id/stages')
  async addStage(
    @Param('id') projectId: string,
    @Body() body: { title: string },
  ) {
    return this.projectsService.addCustomStage(projectId, body.title);
  }

  @Post(':id/invite')
  @UseGuards(AuthGuard, OwnerOnlyGuard) // Guard bekerja berurutan
  async inviteMember(
    @Param('id') projectId: string,
    @Body() body: { email: string; role?: string },
  ) {
    return this.projectsService.inviteMember(projectId, body.email, body.role);
  }
}
