import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInvoiceDto, UpdateInvoiceStatusDto } from './dto/invoice.dto';
import { InvoiceStatus } from '@prisma/client';

@Injectable()
export class InvoicesService {
    constructor(private prisma: PrismaService) { }

    async create(userId: string, dto: CreateInvoiceDto) {
        // Get user's business
        const business = await this.prisma.business.findUnique({
            where: { userId },
        });

        if (!business) {
            throw new NotFoundException('Entreprise non trouvée');
        }

        // Verify client belongs to this business
        const client = await this.prisma.client.findFirst({
            where: { id: dto.clientId, businessId: business.id },
        });

        if (!client) {
            throw new NotFoundException('Client non trouvé');
        }

        // Generate invoice number
        const invoiceCount = await this.prisma.invoice.count({
            where: { businessId: business.id },
        });
        const invoiceNumber = `INV-${String(invoiceCount + 1).padStart(5, '0')}`;

        // Calculate amounts
        const taxRate = dto.taxRate || 0;
        const items = dto.items.map((item) => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.quantity * item.unitPrice,
        }));
        const amount = items.reduce((sum, item) => sum + item.total, 0);
        const taxAmount = amount * (taxRate / 100);
        const totalAmount = amount + taxAmount;

        return this.prisma.invoice.create({
            data: {
                number: invoiceNumber,
                amount,
                taxRate,
                taxAmount,
                totalAmount,
                currency: dto.currency || 'EUR',
                dueDate: new Date(dto.dueDate),
                notes: dto.notes,
                businessId: business.id,
                clientId: dto.clientId,
                items: {
                    create: items,
                },
            },
            include: {
                items: true,
                client: true,
            },
        });
    }

    async findAll(userId: string, page = 1, limit = 20, status?: string) {
        const business = await this.prisma.business.findUnique({
            where: { userId },
        });

        if (!business) {
            throw new NotFoundException('Entreprise non trouvée');
        }

        const where: any = { businessId: business.id };
        if (status) {
            where.status = status as InvoiceStatus;
        }

        const [invoices, total] = await Promise.all([
            this.prisma.invoice.findMany({
                where,
                include: { items: true, client: true, payments: true },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            this.prisma.invoice.count({ where }),
        ]);

        return {
            data: invoices,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async findOne(userId: string, invoiceId: string) {
        const business = await this.prisma.business.findUnique({
            where: { userId },
        });

        const invoice = await this.prisma.invoice.findUnique({
            where: { id: invoiceId },
            include: {
                items: true,
                client: true,
                payments: true,
                business: true,
            },
        });

        if (!invoice) {
            throw new NotFoundException('Facture non trouvée');
        }

        if (invoice.businessId !== business?.id) {
            throw new ForbiddenException('Accès non autorisé');
        }

        return invoice;
    }

    async findByPublicToken(token: string) {
        const invoice = await this.prisma.invoice.findUnique({
            where: { publicToken: token },
            include: {
                items: true,
                client: true,
                business: true,
                payments: true,
            },
        });

        if (!invoice) {
            throw new NotFoundException('Facture non trouvée');
        }

        return invoice;
    }

    async updateStatus(userId: string, invoiceId: string, dto: UpdateInvoiceStatusDto) {
        const invoice = await this.findOne(userId, invoiceId);

        const data: any = { status: dto.status as InvoiceStatus };

        if (dto.status === 'SENT' && !invoice.sentAt) {
            data.sentAt = new Date();
        }

        if (dto.status === 'PAID') {
            data.paidAt = new Date();
        }

        return this.prisma.invoice.update({
            where: { id: invoiceId },
            data,
            include: { items: true, client: true },
        });
    }

    async delete(userId: string, invoiceId: string) {
        await this.findOne(userId, invoiceId); // Validates ownership

        return this.prisma.invoice.delete({
            where: { id: invoiceId },
        });
    }
}
