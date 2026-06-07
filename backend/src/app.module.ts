import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { ProjectsModule } from './projects/projects.module';
import { TasksModule } from './tasks/tasks.module';
import { DashboardFacade } from './dashboard/dashboard.facade'; // Import Facade
import { DashboardController } from './dashboard/dashboard.controller'; // Import Controller

@Module({
  imports: [AuthModule, PrismaModule, ProjectsModule, TasksModule],
  controllers: [AppController, DashboardController], // Daftarkan Controller
  providers: [AppService, DashboardFacade], // Daftarkan Facade
})
export class AppModule {}