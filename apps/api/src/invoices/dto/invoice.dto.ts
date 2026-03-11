import { IsString, IsNotEmpty, IsOptional, IsNumber, IsDateString, IsArray, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class InvoiceItemDto {
    @IsString()
    @IsNotEmpty()
    description: string;

    @IsNumber()
    @Min(1)
    quantity: number;

    @IsNumber()
    @Min(0)
    unitPrice: number;
}

export class CreateInvoiceDto {
    @IsString()
    @IsNotEmpty()
    clientId: string;

    @IsDateString()
    dueDate: string;

    @IsOptional()
    @IsString()
    currency?: string;

    @IsOptional()
    @IsNumber()
    @Min(0)
    taxRate?: number;

    @IsOptional()
    @IsString()
    notes?: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => InvoiceItemDto)
    items: InvoiceItemDto[];
}

export class UpdateInvoiceStatusDto {
    @IsString()
    @IsNotEmpty()
    status: string;
}
