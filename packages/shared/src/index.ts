// PayFlow Shared Types

export enum Role {
    ADMIN = 'ADMIN',
    BUSINESS = 'BUSINESS',
    CLIENT = 'CLIENT',
}

export enum InvoiceStatus {
    DRAFT = 'DRAFT',
    SENT = 'SENT',
    PAID = 'PAID',
    OVERDUE = 'OVERDUE',
    CANCELLED = 'CANCELLED',
}

export enum PaymentMethod {
    CARD = 'CARD',
    APPLE_PAY = 'APPLE_PAY',
    GOOGLE_PAY = 'GOOGLE_PAY',
    PAYPAL = 'PAYPAL',
    MOBILE_MONEY = 'MOBILE_MONEY',
}

export enum PaymentStatus {
    PENDING = 'PENDING',
    SUCCESS = 'SUCCESS',
    FAILED = 'FAILED',
}

export interface InvoiceItem {
    id: string;
    description: string;
    quantity: number;
    unitPrice: number;
}

export interface Invoice {
    id: string;
    number: string;
    status: InvoiceStatus;
    amount: number;
    currency: string;
    dueDate: string;
    items: InvoiceItem[];
    clientId: string;
    businessId: string;
    publicToken: string;
    createdAt: string;
}

export interface Payment {
    id: string;
    amount: number;
    currency: string;
    method: PaymentMethod;
    provider: string;
    providerRef?: string;
    status: PaymentStatus;
    invoiceId: string;
    createdAt: string;
}

export const SUPPORTED_CURRENCIES = ['EUR', 'USD', 'XOF', 'XAF', 'GBP'] as const;
export type SupportedCurrency = typeof SUPPORTED_CURRENCIES[number];
