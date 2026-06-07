import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { DashboardFacade } from './dashboard.facade';

@Controller('dashboard')
@UseGuards(AuthGuard)
export class DashboardController {
  constructor(private readonly dashboardFacade: DashboardFacade) {}

  @Get()
  async getDashboard(@Request() req) {
    return this.dashboardFacade.getDashboardData(req.user.sub);
  }
}
