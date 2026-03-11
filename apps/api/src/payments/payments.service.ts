import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import Stripe from 'stripe';

@Injectable()
export class PaymentsService {
    private stripe: Stripe;

    constructor(
        private prisma: PrismaService,
        private configService: ConfigService,
    ) {
        this.stripe = new Stripe(
            this.configService.get<string>('STRIPE_SECRET_KEY') || '',
            { apiVersion: '2025-04-30.basil' as any },
        );
    }

    // ===== STRIPE (Apple Pay, Google Pay, Cards) =====

    async createStripeCheckout(invoiceId: string, publicToken?: string) {
        // Find invoice
        const invoice = publicToken
            ? await this.prisma.invoice.findUnique({
                where: { publicToken },
                include: { items: true, business: true, client: true },
            })
            : await this.prisma.invoice.findUnique({
                where: { id: invoiceId },
                include: { items: true, business: true, client: true },
            });

        if (!invoice) {
            throw new NotFoundException('Facture non trouvée');
        }

        if (invoice.status === 'PAID') {
            throw new BadRequestException('Cette facture est déjà payée');
        }

        // Create Stripe Checkout Session
        const session = await this.stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'payment',
            line_items: invoice.items.map((item) => ({
                price_data: {
                    currency: invoice.currency.toLowerCase(),
                    product_data: {
                        name: item.description,
                    },
                    unit_amount: Math.round(Number(item.unitPrice) * 100), // Stripe uses cents
                },
                quantity: item.quantity,
            })),
            // Add tax if applicable
            ...(Number(invoice.taxRate) > 0
                ? {
                    automatic_tax: { enabled: false },
                }
                : {}),
            metadata: {
                invoiceId: invoice.id,
                invoiceNumber: invoice.number,
            },
            success_url: `${this.configService.get('APP_URL')}/pay/${invoice.publicToken}?status=success`,
            cancel_url: `${this.configService.get('APP_URL')}/pay/${invoice.publicToken}?status=cancelled`,
            customer_email: invoice.client?.email || undefined,
        });

        // Create payment record
        await this.prisma.payment.create({
            data: {
                amount: Number(invoice.totalAmount),
                currency: invoice.currency,
                method: 'CARD',
                provider: 'stripe',
                providerRef: session.id,
                status: 'PENDING',
                invoiceId: invoice.id,
            },
        });

        return { url: session.url, sessionId: session.id };
    }

    async handleStripeWebhook(signature: string, payload: Buffer) {
        const webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET');

        let event: Stripe.Event;
        try {
            event = this.stripe.webhooks.constructEvent(
                payload,
                signature,
                webhookSecret || '',
            );
        } catch (err) {
            throw new BadRequestException('Webhook signature invalide');
        }

        if (event.type === 'checkout.session.completed') {
            const session = event.data.object as Stripe.Checkout.Session;
            const invoiceId = session.metadata?.invoiceId;

            if (invoiceId) {
                // Update payment status
                await this.prisma.payment.updateMany({
                    where: { providerRef: session.id },
                    data: { status: 'SUCCESS' },
                });

                // Update invoice status
                await this.prisma.invoice.update({
                    where: { id: invoiceId },
                    data: { status: 'PAID', paidAt: new Date() },
                });
            }
        }

        return { received: true };
    }

    // ===== PAYPAL =====

    async createPayPalOrder(invoiceId: string, publicToken?: string) {
        const invoice = publicToken
            ? await this.prisma.invoice.findUnique({
                where: { publicToken },
                include: { items: true, business: true, client: true },
            })
            : await this.prisma.invoice.findUnique({
                where: { id: invoiceId },
                include: { items: true, business: true, client: true },
            });

        if (!invoice) {
            throw new NotFoundException('Facture non trouvée');
        }

        if (invoice.status === 'PAID') {
            throw new BadRequestException('Cette facture est déjà payée');
        }

        const clientId = this.configService.get<string>('PAYPAL_CLIENT_ID');
        const clientSecret = this.configService.get<string>('PAYPAL_CLIENT_SECRET');
        const mode = this.configService.get<string>('PAYPAL_MODE', 'sandbox');
        const baseUrl = mode === 'sandbox'
            ? 'https://api-m.sandbox.paypal.com'
            : 'https://api-m.paypal.com';

        // Get PayPal access token
        const authResponse = await fetch(`${baseUrl}/v1/oauth2/token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
            },
            body: 'grant_type=client_credentials',
        });

        const authData = await authResponse.json();
        const accessToken = authData.access_token;

        // Create PayPal order
        const orderResponse = await fetch(`${baseUrl}/v2/checkout/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
                intent: 'CAPTURE',
                purchase_units: [
                    {
                        reference_id: invoice.id,
                        description: `Facture ${invoice.number}`,
                        amount: {
                            currency_code: invoice.currency,
                            value: Number(invoice.totalAmount).toFixed(2),
                            breakdown: {
                                item_total: {
                                    currency_code: invoice.currency,
                                    value: Number(invoice.amount).toFixed(2),
                                },
                                tax_total: {
                                    currency_code: invoice.currency,
                                    value: Number(invoice.taxAmount).toFixed(2),
                                },
                            },
                        },
                        items: invoice.items.map((item) => ({
                            name: item.description,
                            quantity: String(item.quantity),
                            unit_amount: {
                                currency_code: invoice.currency,
                                value: Number(item.unitPrice).toFixed(2),
                            },
                        })),
                    },
                ],
                application_context: {
                    return_url: `${this.configService.get('APP_URL')}/pay/${invoice.publicToken}?status=success`,
                    cancel_url: `${this.configService.get('APP_URL')}/pay/${invoice.publicToken}?status=cancelled`,
                    brand_name: invoice.business?.name || 'PayFlow',
                    user_action: 'PAY_NOW',
                },
            }),
        });

        const orderData = await orderResponse.json();

        // Create payment record
        await this.prisma.payment.create({
            data: {
                amount: Number(invoice.totalAmount),
                currency: invoice.currency,
                method: 'PAYPAL',
                provider: 'paypal',
                providerRef: orderData.id,
                status: 'PENDING',
                invoiceId: invoice.id,
            },
        });

        const approvalUrl = orderData.links?.find((l: any) => l.rel === 'approve')?.href;

        return { orderId: orderData.id, approvalUrl };
    }

    async capturePayPalOrder(orderId: string) {
        const clientId = this.configService.get<string>('PAYPAL_CLIENT_ID');
        const clientSecret = this.configService.get<string>('PAYPAL_CLIENT_SECRET');
        const mode = this.configService.get<string>('PAYPAL_MODE', 'sandbox');
        const baseUrl = mode === 'sandbox'
            ? 'https://api-m.sandbox.paypal.com'
            : 'https://api-m.paypal.com';

        // Get access token
        const authResponse = await fetch(`${baseUrl}/v1/oauth2/token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
            },
            body: 'grant_type=client_credentials',
        });
        const authData = await authResponse.json();

        // Capture the order
        const captureResponse = await fetch(`${baseUrl}/v2/checkout/orders/${orderId}/capture`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authData.access_token}`,
            },
        });

        const captureData = await captureResponse.json();

        if (captureData.status === 'COMPLETED') {
            // Find the payment and update
            const payment = await this.prisma.payment.findFirst({
                where: { providerRef: orderId },
            });

            if (payment) {
                await this.prisma.payment.update({
                    where: { id: payment.id },
                    data: { status: 'SUCCESS' },
                });

                await this.prisma.invoice.update({
                    where: { id: payment.invoiceId },
                    data: { status: 'PAID', paidAt: new Date() },
                });
            }
        }

        return captureData;
    }

    // ===== COMMON =====

    async getPaymentsByInvoice(invoiceId: string) {
        return this.prisma.payment.findMany({
            where: { invoiceId },
            orderBy: { createdAt: 'desc' },
        });
    }

    async getPaymentHistory(userId: string, page = 1, limit = 20) {
        const business = await this.prisma.business.findUnique({
            where: { userId },
        });

        if (!business) {
            throw new NotFoundException('Entreprise non trouvée');
        }

        const [payments, total] = await Promise.all([
            this.prisma.payment.findMany({
                where: { invoice: { businessId: business.id } },
                include: {
                    invoice: {
                        select: { number: true, client: { select: { name: true } } },
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            this.prisma.payment.count({
                where: { invoice: { businessId: business.id } },
            }),
        ]);

        return {
            data: payments,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
        };
    }
}
