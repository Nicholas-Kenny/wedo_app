import { Module } from '@nestjs/common';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';
import { ProjectBuilder } from './project.builder'; 

@Module({
  controllers: [ProjectsController],
  providers: [ProjectsService, ProjectBuilder], 
  exports: [ProjectsService],
})
export class ProjectsModule {}