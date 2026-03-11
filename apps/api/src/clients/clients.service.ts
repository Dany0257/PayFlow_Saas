import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClientDto, UpdateClientDto } from './dto/client.dto';

@Injectable()
export class ClientsService {
    constructor(private prisma: PrismaService) { }

    async create(userId: string, dto: CreateClientDto) {
        const business = await this.prisma.business.findUnique({
            where: { userId },
        });

        if (!business) {
            throw new NotFoundException('Entreprise non trouvée');
        }

        return this.prisma.client.create({
            data: {
                ...dto,
                country: dto.country || 'FR',
                businessId: business.id,
            },
        });
    }

    async findAll(userId: string) {
        const business = await this.prisma.business.findUnique({
            where: { userId },
        });

        if (!business) {
            throw new NotFoundException('Entreprise non trouvée');
        }

        return this.prisma.client.findMany({
            where: { businessId: business.id },
            include: {
                _count: { select: { invoices: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findOne(userId: string, clientId: string) {
        const business = await this.prisma.business.findUnique({
            where: { userId },
        });

        const client = await this.prisma.client.findFirst({
            where: { id: clientId, businessId: business?.id },
            include: {
                invoices: {
                    orderBy: { createdAt: 'desc' },
                    take: 10,
                },
            },
        });

        if (!client) {
            throw new NotFoundException('Client non trouvé');
        }

        return client;
    }

    async update(userId: string, clientId: string, dto: UpdateClientDto) {
        await this.findOne(userId, clientId);

        return this.prisma.client.update({
            where: { id: clientId },
            data: dto,
        });
    }

    async delete(userId: string, clientId: string) {
        await this.findOne(userId, clientId);

        return this.prisma.client.delete({
            where: { id: clientId },
        });
    }
}
