import {
  Body,
  Controller,
  Post,
  Get,
  Delete,
  UseGuards,
  Request,
  Param,
  BadRequestException,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { AuthGuard } from '../auth/auth.guard';
import { OwnerOnlyGuard } from './guards/owner-only.guard';

@Controller('projects')
@UseGuards(AuthGuard)
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  async createProject(
    @Request() req,
    @Body() body: { title: string; description?: string },
  ) {
    return this.projectsService.createProject(
      req.user.sub,
      body.title,
      body.description,
    );
  }

  @Get()
  async getUserProjects(@Request() req) {
    return this.projectsService.getUserProjects(req.user.sub);
  }

  @Get(':id/board')
  async getProjectBoard(@Param('id') id: string) {
    return this.projectsService.getProjectBoard(id);
  }

  @Post(':id/stages')
  async addStage(
    @Param('id') projectId: string,
    @Body() body: { title: string },
  ) {
    return this.projectsService.addCustomStage(projectId, body.title);
  }

  @Delete(':id/stages/:stageId')
  @UseGuards(OwnerOnlyGuard)
  async deleteStage(@Param('stageId') stageId: string) {
    return this.projectsService.deleteStage(stageId);
  }

  @Post(':id/invite')
  @UseGuards(OwnerOnlyGuard)
  async inviteMember(
    @Param('id') projectId: string,
    @Body() body: { email: string; role?: string },
  ) {
    try {
      return await this.projectsService.inviteMember(
        projectId,
        body.email,
        body.role,
      );
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  @Delete(':id')
  @UseGuards(OwnerOnlyGuard)
  async deleteProject(@Param('id') projectId: string) {
    return this.projectsService.deleteProject(projectId);
  }
}
