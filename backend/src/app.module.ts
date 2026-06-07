import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { ProjectsModule } from './projects/projects.module';
import { TasksModule } from './tasks/tasks.module';
import { DashboardFacade } from './dashboard/dashboard.facade'; 
import { DashboardController } from './dashboard/dashboard.controller'; 

@Module({
  imports: [AuthModule, PrismaModule, ProjectsModule, TasksModule],
  controllers: [AppController, DashboardController], 
  providers: [AppService, DashboardFacade], 
})
export class AppModule {}