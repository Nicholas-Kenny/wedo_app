import { Module } from '@nestjs/common';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';
import { ProjectBuilder } from './project.builder'; // Import Builder

@Module({
  controllers: [ProjectsController],
  providers: [ProjectsService, ProjectBuilder], // Daftarkan Builder
  exports: [ProjectsService],
})
export class ProjectsModule {}