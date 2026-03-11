import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { StatsService } from './stats.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('stats')
export class StatsController {
    constructor(private readonly statsService: StatsService) { }

    @Get('dashboard')
    async getDashboardStats(@Request() req: any) {
        return this.statsService.getDashboardStats(req.user.id);
    }

    @Get('revenue')
    async getMonthlyRevenue(
        @Request() req: any,
        @Query('year') year?: string,
    ) {
        const currentYear = year ? parseInt(year) : new Date().getFullYear();
        return this.statsService.getMonthlyRevenue(req.user.id, currentYear);
    }
}
