import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import * as nodemailer from 'nodemailer';
import { Twilio } from 'twilio';

@Injectable()
export class NotificationsService {
    private readonly logger = new Logger(NotificationsService.name);
    private twilioClient: Twilio | null = null;
    private mailTransporter: nodemailer.Transporter | null = null;

    constructor(
        private prisma: PrismaService,
        private configService: ConfigService,
    ) {
        this.initializeProviders();
    }

    private initializeProviders() {
        // SMS config (Twilio)
        const twilioSid = this.configService.get<string>('TWILIO_ACCOUNT_SID');
        const twilioToken = this.configService.get<string>('TWILIO_AUTH_TOKEN');
        if (twilioSid && twilioToken) {
            this.twilioClient = new Twilio(twilioSid, twilioToken);
            this.logger.log('Twilio client initialized');
        }

        // Email config (SMTP)
        const smtpHost = this.configService.get<string>('SMTP_HOST');
        if (smtpHost) {
            this.mailTransporter = nodemailer.createTransport({
                host: smtpHost,
                port: this.configService.get<number>('SMTP_PORT', 587),
                secure: this.configService.get<boolean>('SMTP_SECURE', false),
                auth: {
                    user: this.configService.get<string>('SMTP_USER'),
                    pass: this.configService.get<string>('SMTP_PASS'),
                },
            });
            this.logger.log('SMTP transporter initialized');
        }
    }

    async sendInvoiceEmail(invoiceId: string) {
        const invoice = await this.prisma.invoice.findUnique({
            where: { id: invoiceId },
            include: { client: true, business: true },
        });

        if (!invoice || !invoice.client?.email) return;

        const paymentUrl = `${this.configService.get('APP_URL')}/pay/${invoice.publicToken}`;
        const subject = `Votre facture ${invoice.number} de ${invoice.business?.name}`;
        const text = `Bonjour ${invoice.client.name},\n\nVoici votre facture ${invoice.number} d'un montant de ${invoice.totalAmount} ${invoice.currency}.\n\nVous pouvez la consulter et la payer en ligne ici : ${paymentUrl}\n\nMerci,\nL'équipe ${invoice.business?.name}`;

        await this.recordAndSendNotification({
            type: 'email',
            recipient: invoice.client.email,
            subject,
            message: text,
            metadata: { invoiceId },
        });
    }

    async sendInvoiceSms(invoiceId: string) {
        const invoice = await this.prisma.invoice.findUnique({
            where: { id: invoiceId },
            include: { client: true, business: true },
        });

        if (!invoice || !invoice.client?.phone) return;

        const paymentUrl = `${this.configService.get('APP_URL')}/pay/${invoice.publicToken}`;
        const smsText = `Facture ${invoice.number} (${invoice.totalAmount} ${invoice.currency}). Payer ici: ${paymentUrl}`;

        await this.recordAndSendNotification({
            type: 'sms',
            recipient: invoice.client.phone,
            message: smsText,
            metadata: { invoiceId },
        });
    }

    async sendInvoiceWhatsApp(invoiceId: string) {
        const invoice = await this.prisma.invoice.findUnique({
            where: { id: invoiceId },
            include: { client: true, business: true },
        });

        if (!invoice || !invoice.client?.phone) return;

        const paymentUrl = `${this.configService.get('APP_URL')}/pay/${invoice.publicToken}`;
        // Simulate WhatsApp Cloud API logic
        const waText = `*Facture ${invoice.number}*\nMontant : ${invoice.totalAmount} ${invoice.currency}\n\nLien de paiement sécurisé : ${paymentUrl}`;

        await this.recordAndSendNotification({
            type: 'whatsapp',
            recipient: invoice.client.phone,
            message: waText,
            metadata: { invoiceId },
        });
    }

    private async recordAndSendNotification(data: {
        type: string;
        recipient: string;
        subject?: string;
        message: string;
        metadata?: any;
    }) {
        // 1. Enregistrement en base
        const notification = await this.prisma.notification.create({
            data: {
                type: data.type,
                recipient: data.recipient,
                subject: data.subject,
                message: data.message,
                status: 'pending',
                metadata: data.metadata,
            },
        });

        // 2. Envoi réel
        try {
            if (data.type === 'sms' && this.twilioClient) {
                await this.twilioClient.messages.create({
                    body: data.message,
                    from: this.configService.get<string>('TWILIO_PHONE_NUMBER'),
                    to: data.recipient,
                });
            } else if (data.type === 'email' && this.mailTransporter) {
                await this.mailTransporter.sendMail({
                    from: `"PayFlow" <${this.configService.get('SMTP_FROM')}>`,
                    to: data.recipient,
                    subject: data.subject,
                    text: data.message,
                });
            }

            await this.prisma.notification.update({
                where: { id: notification.id },
                data: { status: 'sent' },
            });
            this.logger.log(`Notification sent ${data.type} to ${data.recipient}`);
        } catch (error: any) {
            this.logger.error(`Failed to send ${data.type} to ${data.recipient}: ${error.message}`);
            await this.prisma.notification.update({
                where: { id: notification.id },
                data: { status: 'failed', metadata: { ...data.metadata, error: error.message } },
            });
        }
    }
}
