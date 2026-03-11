import { Controller, Post, Param, UseGuards, Request, Body, NotFoundException } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';

@Controller('notifications')
export class NotificationsController {
    constructor(
        private readonly notificationsService: NotificationsService,
        private readonly prisma: PrismaService,
    ) { }

    @UseGuards(JwtAuthGuard)
    @Post('invoice/:id/send')
    async sendInvoice(
        @Request() req: any,
        @Param('id') id: string,
        @Body('channels') channels: string[] = ['email'], // ['email', 'sms', 'whatsapp']
    ) {
        // Vérifier l'accès
        const invoice = await this.prisma.invoice.findFirst({
            where: {
                id,
                business: { userId: req.user.id },
            },
        });

        if (!invoice) throw new NotFoundException('Facture non trouvée ou accès refusé');

        const promises: Promise<any>[] = [];
        if (channels.includes('email')) promises.push(this.notificationsService.sendInvoiceEmail(id));
        if (channels.includes('sms')) promises.push(this.notificationsService.sendInvoiceSms(id));
        if (channels.includes('whatsapp')) promises.push(this.notificationsService.sendInvoiceWhatsApp(id));

        await Promise.all(promises);

        // Mettre à jour le statut de la facture si c'est un brouillon
        if (invoice.status === 'DRAFT') {
            await this.prisma.invoice.update({
                where: { id },
                data: { status: 'SENT', sentAt: new Date() },
            });
        }

        return { success: true, message: 'Notifications envoyées avec succès' };
    }
}
