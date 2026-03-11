import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StatsService {
    constructor(private prisma: PrismaService) { }

    async getDashboardStats(userId: string) {
        const business = await this.prisma.business.findUnique({
            where: { userId },
        });

        if (!business) {
            throw new NotFoundException('Entreprise non trouvée');
        }

        const [
            totalInvoices,
            paidInvoices,
            overdueInvoices,
            draftInvoices,
            totalClients,
            recentInvoices,
            totalRevenue,
            totalPending,
        ] = await Promise.all([
            this.prisma.invoice.count({ where: { businessId: business.id } }),
            this.prisma.invoice.count({
                where: { businessId: business.id, status: 'PAID' },
            }),
            this.prisma.invoice.count({
                where: { businessId: business.id, status: 'OVERDUE' },
            }),
            this.prisma.invoice.count({
                where: { businessId: business.id, status: 'DRAFT' },
            }),
            this.prisma.client.count({ where: { businessId: business.id } }),
            this.prisma.invoice.findMany({
                where: { businessId: business.id },
                include: { client: true },
                orderBy: { createdAt: 'desc' },
                take: 5,
            }),
            this.prisma.invoice.aggregate({
                where: { businessId: business.id, status: 'PAID' },
                _sum: { totalAmount: true },
            }),
            this.prisma.invoice.aggregate({
                where: {
                    businessId: business.id,
                    status: { in: ['SENT', 'OVERDUE'] },
                },
                _sum: { totalAmount: true },
            }),
        ]);

        return {
            overview: {
                totalInvoices,
                paidInvoices,
                overdueInvoices,
                draftInvoices,
                totalClients,
                totalRevenue: totalRevenue._sum.totalAmount || 0,
                totalPending: totalPending._sum.totalAmount || 0,
            },
            recentInvoices,
        };
    }

    async getMonthlyRevenue(userId: string, year: number) {
        const business = await this.prisma.business.findUnique({
            where: { userId },
        });

        if (!business) {
            throw new NotFoundException('Entreprise non trouvée');
        }

        const payments = await this.prisma.payment.findMany({
            where: {
                status: 'SUCCESS',
                invoice: { businessId: business.id },
                createdAt: {
                    gte: new Date(`${year}-01-01`),
                    lt: new Date(`${year + 1}-01-01`),
                },
            },
            select: {
                amount: true,
                createdAt: true,
            },
        });

        // Group by month
        const monthly = Array.from({ length: 12 }, (_, i) => ({
            month: i + 1,
            revenue: 0,
        }));

        payments.forEach((payment) => {
            const month = payment.createdAt.getMonth();
            monthly[month].revenue += Number(payment.amount);
        });

        return monthly;
    }
}
