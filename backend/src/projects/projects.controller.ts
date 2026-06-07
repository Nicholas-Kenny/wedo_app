import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Patch,
  Request,
  UseGuards,
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
    @Body()
    body: { title: string; description?: string; customStages?: string[] },
  ) {
    return this.projectsService.createProject(
      req.user.sub,
      body.title,
      body.description,
      body.customStages,
    );
  }

  @Get()
  async getUserProjects(@Request() req) {
    return this.projectsService.getUserProjects(req.user.sub);
  }

  @Get(':id')
  async getProjectBoard(@Param('id') id: string) {
    return this.projectsService.getProjectBoard(id);
  }

  // --- INVITATION ENDPOINTS ---

  @Post(':id/invite')
  @UseGuards(OwnerOnlyGuard) // Hanya owner yang bisa invite
  async inviteMember(
    @Param('id') projectId: string,
    @Body() body: { email: string },
  ) {
    return this.projectsService.inviteMember(projectId, body.email);
  }

  @Patch(':id/accept')
  async acceptInvitation(@Param('id') projectId: string, @Request() req) {
    return this.projectsService.acceptInvitation(projectId, req.user.sub);
  }

  // --- STAGE & DELETE ENDPOINTS ---

  @Post(':id/stages')
  @UseGuards(OwnerOnlyGuard)
  async addCustomStage(
    @Param('id') projectId: string,
    @Body() body: { title: string },
  ) {
    return this.projectsService.addCustomStage(projectId, body.title);
  }

  @Delete(':id')
  @UseGuards(OwnerOnlyGuard)
  async deleteProject(@Param('id') id: string) {
    return this.projectsService.deleteProject(id);
  }

  @Delete(':projectId/stages/:stageId')
  async deleteStage(
    @Param('projectId') projectId: string,
    @Param('stageId') stageId: string,
  ) {
    return this.projectsService.deleteStage(stageId); 
  }
}
