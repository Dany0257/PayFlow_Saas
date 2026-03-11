import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreatePaymentDto {
    @IsString()
    @IsNotEmpty()
    invoiceId: string;

    @IsString()
    @IsNotEmpty()
    method: string; // 'stripe' | 'paypal'

    @IsOptional()
    @IsString()
    returnUrl?: string;
}

export class ConfirmPaymentDto {
    @IsString()
    @IsNotEmpty()
    paymentIntentId: string;
}
