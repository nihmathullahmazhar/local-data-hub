import { useState } from 'react';
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
    // --- 1. CALCULATIONS ---
    const totalVal = lead.finalValue || 0;
    const advVal = lead.advanceAmount || 0;
    const balVal = lead.balanceAmount || (totalVal - advVal);
    const today = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

    const currency = lead.currency || 'LKR';
    const currencySymbol = getCurrencySymbol(currency);
    const exchangeRate = lead.exchangeRate || 1;
    const isForeign = currency !== 'LKR';

    // Discount Logic
    const discountType = lead.discountType || 'none';
    const discountValue = lead.discountValue || 0;
    let discountAmount = 0;
    
    const rawServicesTotal = (lead.services || []).reduce(
      (sum, s) => sum + (s.price * s.quantity), 
      0
    );

    if (discountType !== 'none' && discountValue > 0) {
      if (discountType === 'percentage') {
        discountAmount = rawServicesTotal * (discountValue / 100);
      } else {
        discountAmount = discountValue;
      }
    }

    const finalTotal = totalVal; 
    const finalTotalLKR = isForeign ? finalTotal * exchangeRate : finalTotal;
    const amountInLKR = isForeign ? rawServicesTotal * exchangeRate : rawServicesTotal;
    const advanceInLKR = isForeign ? advVal * exchangeRate : advVal;
    const balanceInLKR = isForeign ? balVal * exchangeRate : balVal;

    // --- 2. STYLING VARS ---
    let docTitle = '';
    let docAccent = ''; 
    let statusLabel = '';
    let statusBg = '';
    let mainContent = '';

    // HTML Helpers
    const servicesRows = (lead.services || []).map((service) => {
      const itemTotal = service.price * service.quantity;
      const itemTotalLKR = isForeign ? itemTotal * exchangeRate : itemTotal;
      
      return `
      <tr class="item-row">
        <td class="desc-col">
          <div class="item-name">${service.name}</div>
          ${service.description ? `<div class="item-desc">${service.description}</div>` : ''}
        </td>
        <td class="qty-col">${service.quantity}</td>
        <td class="price-col">${currencySymbol} ${service.price.toLocaleString()}</td>
        <td class="total-col">Rs. ${itemTotalLKR.toLocaleString()}</td>
      </tr>
    `;
    }).join('');

    const discountRow = discountAmount > 0 ? `
      <tr class="total-row sub-row">
        <td colspan="3" class="label-col">Discount ${discountType === 'percentage' ? `(${discountValue}%)` : ''}</td>
        <td class="value-col text-red">- Rs. ${(isForeign ? discountAmount * exchangeRate : discountAmount).toLocaleString()}</td>
      </tr>
    ` : '';

    const includedFeatures = (lead.deliveryFeatures || []).filter(f => f.included);
    const featuresHtml = includedFeatures.length > 0 ? `
      <div class="features-section">
        <div class="section-label">Included Features</div>
        <div class="feature-grid">
          ${includedFeatures.map(f => `<span class="feature-tag">${f.feature}</span>`).join('')}
        </div>
      </div>
    ` : '';

    // --- 3. LOGIC PER TYPE ---
    if (type === 'quotation') {
      docTitle = 'Quotation';
      docAccent = '#111827'; // Dark Slate
      statusLabel = 'ESTIMATE';
      statusBg = '#f3f4f6';
      
      const hasServices = (lead.services || []).length > 0;
      const tableBody = hasServices ? servicesRows : `
        <tr class="item-row">
          <td colspan="3" class="desc-col"><div class="item-name">${lead.packageType || 'Web Development'} Package</div></td>
          <td class="total-col">Rs. ${amountInLKR.toLocaleString()}</td>
        </tr>`;

      mainContent = `
        ${tableBody}
        <tr class="spacer-row"><td colspan="4"></td></tr>
        <tr class="total-row sub-row">
          <td colspan="3" class="label-col">Subtotal</td>
          <td class="value-col">Rs. ${amountInLKR.toLocaleString()}</td>
        </tr>
        ${discountRow}
        <tr class="total-row final-row">
          <td colspan="3" class="label-col">Total Amount</td>
          <td class="value-col">Rs. ${finalTotalLKR.toLocaleString()}</td>
        </tr>
      `;

    } else if (type === 'advance') {
      docTitle = 'Receipt';
      docAccent = '#d97706'; // Amber
      statusLabel = 'ADVANCE PAID';
      statusBg = '#fffbeb';
      const finalBalanceAfterDiscount = finalTotal - advVal;
      const finalBalanceAfterDiscountLKR = isForeign ? finalBalanceAfterDiscount * exchangeRate : finalBalanceAfterDiscount;

      mainContent = `
        <tr class="item-row">
          <td colspan="3" class="desc-col"><div class="item-name">Total Project Value</div></td>
          <td class="total-col">Rs. ${amountInLKR.toLocaleString()}</td>
        </tr>
        ${discountRow}
        <tr class="total-row sub-row" style="color: #d97706;">
          <td colspan="3" class="label-col">Advance Payment Received <span style="font-weight:400; font-size:10px; color:#666;">(${lead.advanceMethod || 'N/A'})</span></td>
          <td class="value-col">- Rs. ${advanceInLKR.toLocaleString()}</td>
        </tr>
        <tr class="total-row final-row">
          <td colspan="3" class="label-col">Balance Due</td>
          <td class="value-col">Rs. ${finalBalanceAfterDiscountLKR.toLocaleString()}</td>
        </tr>
      `;

    } else if (type === 'balance') {
      docTitle = 'Receipt';
      docAccent = '#059669'; // Emerald
      statusLabel = 'PAID IN FULL';
      statusBg = '#ecfdf5';

      mainContent = `
        <tr class="item-row">
          <td colspan="3" class="desc-col"><div class="item-name">Total Project Value</div></td>
          <td class="total-col">Rs. ${amountInLKR.toLocaleString()}</td>
        </tr>
        ${discountRow}
        <tr class="total-row sub-row">
          <td colspan="3" class="label-col">Less: Advance Payment</td>
          <td class="value-col">- Rs. ${advanceInLKR.toLocaleString()}</td>
        </tr>
        <tr class="total-row sub-row" style="color: #059669;">
          <td colspan="3" class="label-col">Final Balance Received <span style="font-weight:400; font-size:10px; color:#666;">(${lead.balanceMethod || 'N/A'})</span></td>
          <td class="value-col">- Rs. ${balanceInLKR.toLocaleString()}</td>
        </tr>
        <tr class="total-row final-row">
          <td colspan="3" class="label-col">Outstanding Balance</td>
          <td class="value-col">Rs. 0.00</td>
        </tr>
      `;
    }

    // --- 4. ASSEMBLE HTML ---
    
    const receiptHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${docTitle} - ${lead.businessName}</title>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
      <style>
        /* RESET & VARS */
        :root { --primary: ${docAccent}; --text-main: #1f2937; --text-muted: #6b7280; --border: #e5e7eb; }
        @page { size: A4; margin: 0; }
        body { margin: 0; padding: 0; font-family: 'Inter', sans-serif; -webkit-print-color-adjust: exact; background: #525659; }
        
        /* CONTAINERS */
        .doc-container {
          background: white;
          width: 210mm;
          min-height: 297mm;
          margin: 0 auto;
          padding: 15mm 20mm;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
        }

        .terms-container {
          background: white;
          width: 210mm;
          min-height: 297mm;
          margin: 0 auto;
          padding: 15mm 20mm;
          box-sizing: border-box;
          
          /* FORCE NEW PAGE */
          page-break-before: always; 
          break-before: page;
        }

        /* STYLES */
        .header { display: flex; justify-content: space-between; margin-bottom: 50px; border-bottom: 2px solid var(--primary); padding-bottom: 20px; align-items: flex-end; }
        .brand-name { font-size: 24px; font-weight: 800; color: var(--text-main); line-height: 1; letter-spacing: -0.5px; }
        .brand-sub { font-size: 12px; color: var(--text-muted); font-weight: 500; margin-top: 5px; }
        .doc-meta { text-align: right; }
        .doc-type { font-size: 36px; font-weight: 300; color: var(--primary); line-height: 1; text-transform: uppercase; }
        .doc-status { display: inline-block; background: ${statusBg}; color: ${docAccent}; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 4px; margin-top: 10px; letter-spacing: 1px; }

        .info-grid { display: flex; gap: 60px; margin-bottom: 60px; }
        .info-col { flex: 1; }
        .label { font-size: 10px; text-transform: uppercase; letter-spacing: 1.5px; color: var(--text-muted); font-weight: 600; margin-bottom: 12px; }
        .value { font-size: 14px; color: var(--text-main); line-height: 1.6; }
        .value strong { font-weight: 700; color: #000; display: block; margin-bottom: 2px; font-size: 15px; }

        table { width: 100%; border-collapse: collapse; margin-bottom: 30px; table-layout: fixed; }
        th { text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: var(--text-muted); padding: 10px 0; border-bottom: 1px solid var(--border); font-weight: 600; }
        
        .item-row td { padding: 15px 0; border-bottom: 1px solid var(--border); vertical-align: top; }
        .desc-col { width: 50%; }
        .qty-col { width: 10%; text-align: center; color: var(--text-muted); }
        .price-col { width: 20%; text-align: right; color: var(--text-muted); }
        .total-col { width: 20%; text-align: right; font-weight: 600; color: var(--text-main); }
        .item-name { font-weight: 600; font-size: 14px; color: var(--text-main); }
        .item-desc { font-size: 12px; color: var(--text-muted); margin-top: 4px; line-height: 1.4; max-width: 90%; }

        .spacer-row td { padding: 10px 0; border: none; }
        .total-row td { padding: 8px 0; text-align: right; }
        .label-col { color: var(--text-muted); font-size: 13px; font-weight: 500; }
        .value-col { color: var(--text-main); font-size: 14px; font-weight: 600; }
        .text-red { color: #ef4444; }
        .final-row td { padding-top: 15px; border-top: 2px solid var(--primary); font-size: 18px; font-weight: 800; color: var(--primary); }

        .features-section { margin-top: 40px; padding-top: 20px; border-top: 1px dashed var(--border); }
        .section-label { font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--text-muted); margin-bottom: 15px; }
        .feature-grid { display: flex; flex-wrap: wrap; gap: 8px; }
        .feature-tag { background: #f9fafb; border: 1px solid var(--border); padding: 6px 12px; border-radius: 6px; font-size: 11px; color: var(--text-main); font-weight: 500; }

        .doc-footer { margin-top: auto; padding-top: 40px; text-align: center; color: var(--text-muted); font-size: 11px; }

        /* TERMS STYLING */
        .terms-title { font-size: 24px; font-weight: 700; color: var(--text-main); margin-bottom: 30px; border-bottom: 2px solid var(--border); padding-bottom: 10px; }
        .terms-grid { 
          display: grid; 
          grid-template-columns: 1fr 1fr; 
          column-gap: 40px; 
          row-gap: 25px; 
          font-size: 11px; 
          line-height: 1.6; 
          color: var(--text-main); 
        }
        .term-item { break-inside: avoid; }
        .term-head { 
          font-weight: 700; 
          color: var(--primary); 
          margin-bottom: 6px; 
          display: block; 
          font-size: 12px; 
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        @media print {
          body { background: white; }
          .doc-container, .terms-container { width: 100%; margin: 0; padding: 15mm 10mm; box-shadow: none; height: auto; min-height: 0; display: block; }
          .doc-footer { position: relative; }
        }
      </style>
    </head>
    <body>

      <div class="doc-container">
        
        <div class="header">
          <div>
            <div class="brand-name">Nihmathullah<span style="font-weight:300;"> M. Azhar</span></div>
            <div class="brand-sub">Digital Solutions Provider</div>
          </div>
          <div class="doc-meta">
            <div class="doc-type">${docTitle}</div>
            <div class="doc-status">${statusLabel}</div>
            <div style="font-size: 12px; margin-top: 8px; color: #6b7280;">${today}</div>
          </div>
        </div>

        <div class="info-grid">
          <div class="info-col">
            <div class="label">Client</div>
            <div class="value">
              <strong>${lead.businessName}</strong>
              ${lead.clientName ? `${lead.clientName}<br>` : ''}
              ${lead.country ? `${lead.country}` : ''}
            </div>
          </div>
          <div class="info-col" style="text-align: right;">
             <div class="label">Provider</div>
             <div class="value">
              <strong>Nihmathullah M. Azhar</strong>
              nihmathullahmazhar@gmail.com<br>
              (+94) 76 906 6840<br>
              www.nihmathullah.com
            </div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Description</th>
              <th style="text-align: center;">Qty</th>
              <th style="text-align: right;">Unit</th>
              <th style="text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${mainContent}
          </tbody>
        </table>

        ${type === 'quotation' ? featuresHtml : ''}

        <div class="doc-footer">
          <p>Thank you for trusting us with your business.</p>
        </div>
      </div>

      <div class="terms-container">
        <div class="terms-title">Terms & Conditions</div>
        <div class="terms-grid">
          
          <div class="term-item">
            <span class="term-head">Advance Payment</span>
            A 50% advance payment is required to commence the project. Work will begin only after the advance payment is received and confirmed.
          </div>

          <div class="term-item">
            <span class="term-head">Non-Refundable Payment</span>
            All advance payments are strictly non-refundable once the project has started, regardless of project cancellation, delays, or changes in requirements.
          </div>

          <div class="term-item">
            <span class="term-head">Delivery Timeline</span>
            Standard project delivery is between 7–14 business days, depending on the project scope, complexity, and timely submission of required content by the client. Any delays in content submission or scope changes may extend the delivery timeline.
          </div>

          <div class="term-item">
            <span class="term-head">Final Handover</span>
            All website files, source code, live deployment access, domain, and hosting credentials will be handed over only after 100% of the total project payment is received and verified.
          </div>

          <div class="term-item">
            <span class="term-head">Scope of Work</span>
            This quotation includes only the services explicitly mentioned. Any additional pages, features, integrations, or changes beyond the agreed scope will require a separate quotation and approval.
          </div>

          <div class="term-item">
            <span class="term-head">Exclusions</span>
            Unless stated otherwise, third-party paid tools or plugins, advanced backend functionality, content writing, photography, custom graphics, ongoing maintenance, and hosting/domain renewal after the free 1-year period are not included.
          </div>

          <div class="term-item">
            <span class="term-head">Revisions</span>
            Up to 2 rounds of minor revisions are included. Additional revisions or major changes will be charged separately.
          </div>

          <div class="term-item">
            <span class="term-head">Domain & Hosting</span>
            Free domain and hosting (if offered) are provided for 1 year only. Renewal after the first year will be charged separately at prevailing rates.
          </div>

          <div class="term-item">
            <span class="term-head">Client Responsibilities</span>
            The client must provide all required content (text, images, logos, menu, contact details) within 48 hours of project commencement. Failure to do so may affect delivery timelines.
          </div>

          <div class="term-item">
            <span class="term-head">Payment Methods</span>
            Payments can be made via Bank Transfer, or other mutually agreed methods. Payment confirmation must be shared after transfer.
          </div>

        </div>
        
        <div class="doc-footer" style="margin-top: 40px; font-weight: 500;">
          <p>Agreement: By proceeding with the payment, the client confirms that they have read, understood, and agreed to these Terms & Conditions.</p>
        </div>
      </div>

      <script>
        window.onload = function() { setTimeout(() => window.print(), 500); }
      </script>
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
            Select a document type for <strong>{lead.businessName}</strong>
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
                <p className="text-xs text-muted-foreground">Estimate (LKR)</p>
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
                <p className="text-xs text-muted-foreground">Partial Payment (LKR)</p>
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
                <p className="text-xs text-muted-foreground">Paid in Full (LKR)</p>
              </div>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}