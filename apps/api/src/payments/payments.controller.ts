import {
    Controller,
    Post,
    Get,
    Body,
    Param,
    Query,
    UseGuards,
    Headers,
    Req,
} from '@nestjs/common';
import { Request } from 'express';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('payments')
export class PaymentsController {
    constructor(private readonly paymentsService: PaymentsService) { }

    // Create Stripe checkout session (public - from payment page)
    @Post('stripe/checkout')
    async createStripeCheckout(@Body() body: { invoiceId?: string; publicToken?: string }) {
        return this.paymentsService.createStripeCheckout(
            body.invoiceId || '',
            body.publicToken,
        );
    }

    // Stripe webhook
    @Post('stripe/webhook')
    async handleStripeWebhook(
        @Headers('stripe-signature') signature: string,
        @Req() req: any,
    ) {
        const payload = req.rawBody || Buffer.from(JSON.stringify(req.body));
        return this.paymentsService.handleStripeWebhook(signature, payload);
    }

    // Create PayPal order (public - from payment page)
    @Post('paypal/create-order')
    async createPayPalOrder(@Body() body: { invoiceId?: string; publicToken?: string }) {
        return this.paymentsService.createPayPalOrder(
            body.invoiceId || '',
            body.publicToken,
        );
    }

    // Capture PayPal order after approval
    @Post('paypal/capture-order')
    async capturePayPalOrder(@Body() body: { orderId: string }) {
        return this.paymentsService.capturePayPalOrder(body.orderId);
    }

    // Get payment history (authenticated)
    @UseGuards(JwtAuthGuard)
    @Get('history')
    async getPaymentHistory(
        @Req() req: any,
        @Query('page') page?: string,
        @Query('limit') limit?: string,
    ) {
        return this.paymentsService.getPaymentHistory(
            req.user.id,
            page ? parseInt(page) : 1,
            limit ? parseInt(limit) : 20,
        );
    }
}
