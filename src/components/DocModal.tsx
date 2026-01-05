import { Lead } from '@/types/lead';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FileText, Receipt, CreditCard } from 'lucide-react';

interface DocModalProps {
  open: boolean;
  onClose: () => void;
  lead: Lead | null;
}

type DocType = 'quotation' | 'advance' | 'balance';

export function DocModal({ open, onClose, lead }: DocModalProps) {
  if (!lead) return null;

  const getCurrencySymbol = (cur: string) => {
    const symbols: Record<string, string> = {
      LKR: 'Rs.',
      USD: '$',
      GBP: '£',
      CAD: 'C$',
      AUD: 'A$',
      AED: 'AED',
      INR: '₹',
    };
    return symbols[cur] || cur;
  };

  const generateDocument = (type: DocType) => {
    const symbol = getCurrencySymbol(lead.currency || 'LKR');
    const totalVal = lead.finalValue || 0;
    const advVal = lead.advanceAmount || 0;
    const balVal = lead.balanceAmount || (totalVal - advVal);
    const today = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

    let docTitle = '';
    let docColor = '';
    let mainContent = '';
    let paymentStatus = '';

    if (type === 'quotation') {
      docTitle = 'QUOTATION';
      docColor = '#4f46e5';
      paymentStatus = `<span style="color: #6b7280; border: 2px solid #6b7280; padding: 5px 10px; border-radius: 5px; font-weight: bold;">ESTIMATE</span>`;
      mainContent = `
        <tr style="background-color: #f3f4f6;">
          <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;"><strong>${lead.packageType || 'Web Development'} Package</strong><br><span style="font-size: 12px; color: #666;">${lead.projectScope || 'Web Design & Development Services'}</span></td>
          <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: right;">${symbol} ${totalVal.toLocaleString()}</td>
        </tr>
        <tr>
          <td style="padding: 10px; text-align: right;"><strong>Total</strong></td>
          <td style="padding: 10px; text-align: right;"><strong>${symbol} ${totalVal.toLocaleString()}</strong></td>
        </tr>
      `;
    } else if (type === 'advance') {
      docTitle = 'PAYMENT RECEIPT';
      docColor = '#d97706';
      const paidDate = lead.advanceDate || lead.date;
      paymentStatus = `<span style="color: #d97706; border: 2px solid #d97706; padding: 5px 10px; border-radius: 5px; font-weight: bold;">ADVANCE PAID</span>`;
      mainContent = `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">Total Project Value</td>
          <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: right;">${symbol} ${totalVal.toLocaleString()}</td>
        </tr>
        <tr style="background-color: #fffbeb;">
          <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;"><strong>Advance Payment Received</strong><br><span style="font-size: 12px; color: #666;">Method: ${lead.advanceMethod || 'N/A'} | Date: ${paidDate}</span></td>
          <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: right; color: #d97706;"><strong>- ${symbol} ${advVal.toLocaleString()}</strong></td>
        </tr>
        <tr>
          <td style="padding: 10px; text-align: right;"><strong>Balance Due</strong></td>
          <td style="padding: 10px; text-align: right;"><strong>${symbol} ${balVal.toLocaleString()}</strong></td>
        </tr>
      `;
    } else if (type === 'balance') {
      docTitle = 'PAYMENT RECEIPT';
      docColor = '#059669';
      const paidDate = lead.balanceDate || today;
      paymentStatus = `<span style="color: #059669; border: 2px solid #059669; padding: 5px 10px; border-radius: 5px; font-weight: bold;">PAID IN FULL</span>`;
      mainContent = `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">Total Project Value</td>
          <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: right;">${symbol} ${totalVal.toLocaleString()}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">Less: Advance Payment</td>
          <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: right;">- ${symbol} ${advVal.toLocaleString()}</td>
        </tr>
        <tr style="background-color: #ecfdf5;">
          <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;"><strong>Final Balance Received</strong><br><span style="font-size: 12px; color: #666;">Method: ${lead.balanceMethod || 'N/A'} | Date: ${paidDate}</span></td>
          <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: right; color: #059669;"><strong>- ${symbol} ${balVal.toLocaleString()}</strong></td>
        </tr>
        <tr>
          <td style="padding: 10px; text-align: right;"><strong>Outstanding Amount</strong></td>
          <td style="padding: 10px; text-align: right;"><strong>${symbol} 0.00</strong></td>
        </tr>
      `;
    }

    const receiptHTML = `
    <html>
    <head>
      <title>${docTitle} - ${lead.businessName}</title>
      <style>
        body { font-family: 'Helvetica', sans-serif; padding: 40px; color: #333; max-width: 800px; margin: 0 auto; }
        .header { display: flex; justify-content: space-between; margin-bottom: 40px; align-items: flex-start; }
        .logo { font-size: 24px; font-weight: bold; color: ${docColor}; margin-bottom: 5px; }
        .sub-logo { font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 2px; }
        .invoice-details { text-align: right; }
        .client-info { margin-bottom: 40px; padding: 20px; background: #f9fafb; border-radius: 8px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
        th { text-align: left; padding: 10px; background: ${docColor}; color: white; }
        .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #888; border-top: 1px solid #eee; padding-top: 20px; }
        .status-stamp { margin-bottom: 10px; display: inline-block; }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <div class="logo">Gododal<span style="color: #333;">CRM</span></div>
          <div class="sub-logo">Digital Solutions</div>
          <div style="margin-top: 10px; font-size: 12px; color: #555;">
            Colombo, Sri Lanka<br>
            support@gododal.com
          </div>
        </div>
        <div class="invoice-details">
          <h1 style="color: ${docColor}; margin: 0;">${docTitle}</h1>
          <p>Date: ${today}</p>
          <div class="status-stamp">${paymentStatus}</div>
        </div>
      </div>

      <div class="client-info">
        <strong style="color: ${docColor}">BILL TO:</strong><br>
        <h3 style="margin: 5px 0;">${lead.businessName}</h3>
        ${lead.clientName ? `Attn: ${lead.clientName}<br>` : ''}
        ${lead.country ? `${lead.country}` : ''}
      </div>

      <table>
        <thead>
          <tr>
            <th>Description</th>
            <th style="text-align: right;">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${mainContent}
        </tbody>
      </table>

      <div style="margin-top: 40px;">
        <strong>Notes:</strong>
        <p style="font-size: 13px; color: #666;">
          ${lead.projectScope || 'Web development services as per agreement.'}
          <br>
          ${type === 'quotation' ? 'This quotation is valid for 14 days.' : 'Thank you for your business!'}
        </p>
      </div>

      <div class="footer">
        <p>&copy; ${new Date().getFullYear()} Gododal. Generated via GododalCRM.</p>
      </div>
      
      <script>window.print();</script>
    </body>
    </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(receiptHTML);
      printWindow.document.close();
    }
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Generate Document
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <p className="text-sm text-muted-foreground mb-4">
            Select a document type to generate for <strong>{lead.businessName}</strong>
          </p>
          
          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start h-auto py-4 border-primary/30 hover:border-primary hover:bg-primary/10"
              onClick={() => generateDocument('quotation')}
            >
              <FileText className="w-8 h-8 mr-4 text-primary" />
              <div className="text-left">
                <p className="font-semibold">Quotation</p>
                <p className="text-xs text-muted-foreground">Generate price estimate document</p>
              </div>
            </Button>
            
            <Button
              variant="outline"
              className="w-full justify-start h-auto py-4 border-amber-500/30 hover:border-amber-500 hover:bg-amber-500/10"
              onClick={() => generateDocument('advance')}
            >
              <Receipt className="w-8 h-8 mr-4 text-amber-500" />
              <div className="text-left">
                <p className="font-semibold">Advance Receipt</p>
                <p className="text-xs text-muted-foreground">Receipt for advance payment</p>
              </div>
            </Button>
            
            <Button
              variant="outline"
              className="w-full justify-start h-auto py-4 border-emerald-500/30 hover:border-emerald-500 hover:bg-emerald-500/10"
              onClick={() => generateDocument('balance')}
            >
              <CreditCard className="w-8 h-8 mr-4 text-emerald-500" />
              <div className="text-left">
                <p className="font-semibold">Final Receipt</p>
                <p className="text-xs text-muted-foreground">Full payment receipt (Paid in Full)</p>
              </div>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
