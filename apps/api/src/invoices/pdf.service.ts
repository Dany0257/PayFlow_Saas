import { Injectable } from '@nestjs/common';
import PDFDocument = require('pdfkit');

@Injectable()
export class PdfService {
    async generateInvoicePdf(invoice: any): Promise<Buffer> {
        return new Promise((resolve, reject) => {
            try {
                const doc = new PDFDocument({ margin: 50 });
                const buffers: Buffer[] = [];

                doc.on('data', buffers.push.bind(buffers));
                doc.on('end', () => {
                    const pdfData = Buffer.concat(buffers);
                    resolve(pdfData);
                });

                // Header
                doc.fontSize(20).text('FACTURE', { align: 'right' });
                doc.fontSize(10).text(`Facture N°: ${invoice.number}`, { align: 'right' });
                doc.text(`Date d'émission: ${new Date(invoice.createdAt).toLocaleDateString('fr-FR')}`, { align: 'right' });
                doc.text(`Date d'échéance: ${new Date(invoice.dueDate).toLocaleDateString('fr-FR')}`, { align: 'right' });
                doc.moveDown();

                // Business Profile
                doc.fontSize(14).text(invoice.business.name || '');
                if (invoice.business.address) doc.fontSize(10).text(invoice.business.address);
                if (invoice.business.phone) doc.text(invoice.business.phone);
                if (invoice.business.siret) doc.text(`SIRET: ${invoice.business.siret}`);
                if (invoice.business.vatNumber) doc.text(`TVA: ${invoice.business.vatNumber}`);
                doc.moveDown();

                // Client Profile
                doc.fontSize(12).text('Facturé à:');
                doc.fontSize(10).text(invoice.client.name || '');
                if (invoice.client.address) doc.text(invoice.client.address);
                if (invoice.client.phone) doc.text(invoice.client.phone);
                if (invoice.client.email) doc.text(invoice.client.email);
                doc.moveDown(2);

                // Table Header
                let y = doc.y;
                doc.font('Helvetica-Bold');
                doc.text('Description', 50, y);
                doc.text('Qté', 350, y, { width: 50, align: 'right' });
                doc.text('Prix unitaire', 400, y, { width: 70, align: 'right' });
                doc.text('Total', 470, y, { width: 70, align: 'right' });
                doc.moveTo(50, y + 15).lineTo(540, y + 15).stroke();
                doc.font('Helvetica');

                y += 20;

                // Items
                for (const item of invoice.items) {
                    doc.text(item.description, 50, y);
                    doc.text(item.quantity.toString(), 350, y, { width: 50, align: 'right' });
                    doc.text(Number(item.unitPrice).toFixed(2), 400, y, { width: 70, align: 'right' });
                    doc.text(Number(item.total).toFixed(2), 470, y, { width: 70, align: 'right' });
                    y += 20;
                }

                doc.moveTo(50, y + 5).lineTo(540, y + 5).stroke();
                y += 15;

                // Totals
                doc.font('Helvetica-Bold');
                doc.text('Sous-total HT', 350, y, { width: 120, align: 'right' });
                doc.text(Number(invoice.amount).toFixed(2), 470, y, { width: 70, align: 'right' });
                y += 20;

                if (Number(invoice.taxRate) > 0) {
                    doc.text(`TVA (${invoice.taxRate}%)`, 350, y, { width: 120, align: 'right' });
                    doc.text(Number(invoice.taxAmount).toFixed(2), 470, y, { width: 70, align: 'right' });
                    y += 20;
                }

                doc.fontSize(14);
                doc.text('Total TTC', 350, y, { width: 120, align: 'right' });
                doc.text(Number(invoice.totalAmount).toFixed(2), 470, y, { width: 70, align: 'right' });
                doc.fontSize(10);
                y += 30;

                // Notes
                if (invoice.notes) {
                    doc.font('Helvetica');
                    doc.text('Notes / Conditions:', 50, y);
                    doc.text(invoice.notes, 50, y + 15, { width: 490 });
                }

                doc.end();
            } catch (error) {
                reject(error);
            }
        });
    }
}
