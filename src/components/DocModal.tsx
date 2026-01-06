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

const getCurrencySymbol = (currency: string) => {
  const symbols: Record<string, string> = {
    'LKR': 'Rs.',
    'USD': '$',
    'GBP': '£',
    'CAD': 'C$',
    'AUD': 'A$',
    'AED': 'AED',
    'INR': '₹',
  };
  return symbols[currency] || currency;
};

export function DocModal({ open, onClose, lead }: DocModalProps) {
  if (!lead) return null;

  const generateDocument = (type: DocType) => {
    const totalVal = lead.finalValue || 0;
    const advVal = lead.advanceAmount || 0;
    const balVal = lead.balanceAmount || (totalVal - advVal);
    const today = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

    // Currency info
    const currency = lead.currency || 'LKR';
    const currencySymbol = getCurrencySymbol(currency);
    const exchangeRate = lead.exchangeRate || 1;
    const isForeign = currency !== 'LKR';

    // Calculate LKR amounts
    const amountInLKR = isForeign ? totalVal * exchangeRate : totalVal;
    const advanceInLKR = isForeign ? advVal * exchangeRate : advVal;
    const balanceInLKR = isForeign ? balVal * exchangeRate : balVal;

    let docTitle = '';
    let docColor = '';
    let mainContent = '';
    let paymentStatus = '';

    // Generate services table rows - show in original currency + LKR
    const servicesRows = (lead.services || []).map(service => {
      const itemTotal = service.price * service.quantity;
      const itemTotalLKR = isForeign ? itemTotal * exchangeRate : itemTotal;
      return `
      <tr style="background-color: #f9fafb;">
        <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">
          <strong>${service.name}</strong>
          ${service.description ? `<br><span style="font-size: 12px; color: #666;">${service.description}</span>` : ''}
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: center;">${service.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: right;">${currencySymbol} ${service.price.toLocaleString()}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: right;">Rs. ${itemTotalLKR.toLocaleString()}</td>
      </tr>
    `;
    }).join('');

    // Generate features list
    const includedFeatures = (lead.deliveryFeatures || []).filter(f => f.included);
    const featuresHtml = includedFeatures.length > 0 ? `
      <div style="margin-top: 20px; padding: 15px; background: #f0fdf4; border-radius: 8px;">
        <strong style="color: #059669;">Included Features:</strong>
        <ul style="margin: 10px 0 0 20px; color: #374151;">
          ${includedFeatures.map(f => `<li>${f.feature}</li>`).join('')}
        </ul>
        ${lead.revisionsIncluded ? `<p style="margin-top: 10px; font-size: 12px; color: #666;"><strong>Revisions Included:</strong> ${lead.revisionsIncluded}</p>` : ''}
      </div>
    ` : '';

    // Currency note for foreign currency
    const currencyNote = isForeign ? `
      <div style="margin-top: 15px; padding: 10px; background: #fef3c7; border-radius: 8px; font-size: 12px;">
        <strong>Currency Conversion:</strong> ${currencySymbol} ${totalVal.toLocaleString()} @ ${exchangeRate} LKR = Rs. ${amountInLKR.toLocaleString()}
      </div>
    ` : '';

    if (type === 'quotation') {
      docTitle = 'QUOTATION';
      docColor = '#4f46e5';
      paymentStatus = `<span style="color: #6b7280; border: 2px solid #6b7280; padding: 5px 10px; border-radius: 5px; font-weight: bold;">ESTIMATE</span>`;
      
      const hasServices = (lead.services || []).length > 0;
      mainContent = hasServices ? `
        ${servicesRows}
        <tr style="background-color: #f3f4f6;">
          <td colspan="3" style="padding: 10px; text-align: right;"><strong>Subtotal ${isForeign ? `(${currency})` : ''}</strong></td>
          <td style="padding: 10px; text-align: right;"><strong>${isForeign ? `${currencySymbol} ${totalVal.toLocaleString()} = ` : ''}Rs. ${amountInLKR.toLocaleString()}</strong></td>
        </tr>
        <tr>
          <td colspan="3" style="padding: 10px; text-align: right;"><strong>Total (LKR)</strong></td>
          <td style="padding: 10px; text-align: right; font-size: 18px;"><strong>Rs. ${amountInLKR.toLocaleString()}</strong></td>
        </tr>
      ` : `
        <tr style="background-color: #f3f4f6;">
          <td colspan="3" style="padding: 10px; border-bottom: 1px solid #e5e7eb;"><strong>${lead.packageType || 'Web Development'} Package</strong><br><span style="font-size: 12px; color: #666;">${lead.projectScope || 'Web Design & Development Services'}</span></td>
          <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: right;">Rs. ${amountInLKR.toLocaleString()}</td>
        </tr>
        <tr>
          <td colspan="3" style="padding: 10px; text-align: right;"><strong>Total (LKR)</strong></td>
          <td style="padding: 10px; text-align: right;"><strong>Rs. ${amountInLKR.toLocaleString()}</strong></td>
        </tr>
      `;
    } else if (type === 'advance') {
      docTitle = 'PAYMENT RECEIPT';
      docColor = '#d97706';
      const paidDate = lead.advanceDateReceived || lead.advanceDate || lead.date;
      paymentStatus = `<span style="color: #d97706; border: 2px solid #d97706; padding: 5px 10px; border-radius: 5px; font-weight: bold;">ADVANCE PAID</span>`;
      mainContent = `
        <tr>
          <td colspan="3" style="padding: 10px; border-bottom: 1px solid #e5e7eb;">Total Project Value</td>
          <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: right;">${isForeign ? `${currencySymbol} ${totalVal.toLocaleString()} = ` : ''}Rs. ${amountInLKR.toLocaleString()}</td>
        </tr>
        <tr style="background-color: #fffbeb;">
          <td colspan="3" style="padding: 10px; border-bottom: 1px solid #e5e7eb;">
            <strong>Advance Payment Received</strong><br>
            <span style="font-size: 12px; color: #666;">
              Amount: ${currencySymbol} ${advVal.toLocaleString()} ${isForeign ? `(Rs. ${advanceInLKR.toLocaleString()})` : ''}<br>
              Method: ${lead.advanceMethod || 'N/A'} | Date: ${paidDate}
            </span>
          </td>
          <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: right; color: #d97706;"><strong>- Rs. ${advanceInLKR.toLocaleString()}</strong></td>
        </tr>
        <tr>
          <td colspan="3" style="padding: 10px; text-align: right;"><strong>Balance Due (${currency})</strong></td>
          <td style="padding: 10px; text-align: right;"><strong>${currencySymbol} ${balVal.toLocaleString()} ${isForeign ? `= Rs. ${balanceInLKR.toLocaleString()}` : ''}</strong></td>
        </tr>
      `;
    } else if (type === 'balance') {
      docTitle = 'PAYMENT RECEIPT';
      docColor = '#059669';
      const paidDate = lead.balanceDateReceived || lead.balanceDate || today;
      paymentStatus = `<span style="color: #059669; border: 2px solid #059669; padding: 5px 10px; border-radius: 5px; font-weight: bold;">PAID IN FULL</span>`;
      mainContent = `
        <tr>
          <td colspan="3" style="padding: 10px; border-bottom: 1px solid #e5e7eb;">Total Project Value</td>
          <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: right;">${isForeign ? `${currencySymbol} ${totalVal.toLocaleString()} = ` : ''}Rs. ${amountInLKR.toLocaleString()}</td>
        </tr>
        <tr>
          <td colspan="3" style="padding: 10px; border-bottom: 1px solid #e5e7eb;">
            Less: Advance Payment<br>
            <span style="font-size: 12px; color: #666;">${currencySymbol} ${advVal.toLocaleString()}</span>
          </td>
          <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: right;">- Rs. ${advanceInLKR.toLocaleString()}</td>
        </tr>
        <tr style="background-color: #ecfdf5;">
          <td colspan="3" style="padding: 10px; border-bottom: 1px solid #e5e7eb;">
            <strong>Final Balance Received</strong><br>
            <span style="font-size: 12px; color: #666;">
              Amount: ${currencySymbol} ${balVal.toLocaleString()} ${isForeign ? `(Rs. ${balanceInLKR.toLocaleString()})` : ''}<br>
              Method: ${lead.balanceMethod || 'N/A'} | Date: ${paidDate}
            </span>
          </td>
          <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: right; color: #059669;"><strong>- Rs. ${balanceInLKR.toLocaleString()}</strong></td>
        </tr>
        <tr>
          <td colspan="3" style="padding: 10px; text-align: right;"><strong>Outstanding Amount</strong></td>
          <td style="padding: 10px; text-align: right;"><strong>Rs. 0.00</strong></td>
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
          <div class="logo">Nihmathullah<span style="color: #333;"> Web Services</span></div>
          <div class="sub-logo">Digital Solutions</div>
          <div style="margin-top: 10px; font-size: 12px; color: #555;">
            Sri Lanka<br>
            contact@nihmathullah.com<br>
            www.nihmathullah.com
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
            <th style="text-align: center;">Qty</th>
            <th style="text-align: right;">Unit Price (${currency})</th>
            <th style="text-align: right;">Amount (LKR)</th>
          </tr>
        </thead>
        <tbody>
          ${mainContent}
        </tbody>
      </table>

      ${type === 'quotation' ? featuresHtml : ''}
      ${type === 'quotation' && isForeign ? currencyNote : ''}

      <div style="margin-top: 40px;">
        <strong>Notes:</strong>
        <p style="font-size: 13px; color: #666;">
          ${lead.projectScope || 'Web development services as per agreement.'}
          <br>
          ${type === 'quotation' ? 'This quotation is valid for 14 days.' : 'Thank you for your business!'}
        </p>
      </div>

      <div class="footer">
        <p>&copy; ${new Date().getFullYear()} Nihmathullah Web Services. All rights reserved.</p>
        <p style="font-size: 10px; margin-top: 5px;">www.nihmathullah.com | contact@nihmathullah.com</p>
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
                <p className="text-xs text-muted-foreground">Generate price estimate document (LKR)</p>
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
                <p className="text-xs text-muted-foreground">Receipt for advance payment (LKR)</p>
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
                <p className="text-xs text-muted-foreground">Full payment receipt - Paid in Full (LKR)</p>
              </div>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}