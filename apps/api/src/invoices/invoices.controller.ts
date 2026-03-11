import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Body,
    Param,
    Query,
    UseGuards,
    Request,
    Res,
    NotFoundException,
} from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { PdfService } from './pdf.service';
import { CreateInvoiceDto, UpdateInvoiceStatusDto } from './dto/invoice.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('invoices')
export class InvoicesController {
    constructor(
        private readonly invoicesService: InvoicesService,
        private readonly pdfService: PdfService
    ) { }

    @UseGuards(JwtAuthGuard)
    @Post()
    async create(@Request() req: any, @Body() dto: CreateInvoiceDto) {
        return this.invoicesService.create(req.user.id, dto);
    }

    @UseGuards(JwtAuthGuard)
    @Get()
    async findAll(
        @Request() req: any,
        @Query('page') page?: string,
        @Query('limit') limit?: string,
        @Query('status') status?: string,
    ) {
        return this.invoicesService.findAll(
            req.user.id,
            page ? parseInt(page) : 1,
            limit ? parseInt(limit) : 20,
            status,
        );
    }

    @UseGuards(JwtAuthGuard)
    @Get(':id')
    async findOne(@Request() req: any, @Param('id') id: string) {
        return this.invoicesService.findOne(req.user.id, id);
    }

    @UseGuards(JwtAuthGuard)
    @Get(':id/pdf')
    async downloadPdf(
        @Request() req: any,
        @Param('id') id: string,
        @Res() res: any
    ) {
        const invoice = await this.invoicesService.findOne(req.user.id, id);
        if (!invoice) throw new NotFoundException('Facture non trouvée');

        const pdfBuffer = await this.pdfService.generateInvoicePdf(invoice);

        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename=facture-${invoice.number}.pdf`,
            'Content-Length': pdfBuffer.length,
        });

        res.end(pdfBuffer);
    }

    // Public endpoint - no auth required (for client payment page)
    @Get('public/:token')
    async findByPublicToken(@Param('token') token: string) {
        return this.invoicesService.findByPublicToken(token);
    }

    @UseGuards(JwtAuthGuard)
    @Patch(':id/status')
    async updateStatus(
        @Request() req: any,
        @Param('id') id: string,
        @Body() dto: UpdateInvoiceStatusDto,
    ) {
        return this.invoicesService.updateStatus(req.user.id, id, dto);
    }

    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    async delete(@Request() req: any, @Param('id') id: string) {
        return this.invoicesService.delete(req.user.id, id);
    }
}
