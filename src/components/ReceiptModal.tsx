import React from 'react';
import { Sale, StoreSettings, Language } from '../types';
import { Printer, X, Check } from 'lucide-react';
import { getTranslation } from '../i18n/translations';

interface ReceiptModalProps {
  sale: Sale | null;
  settings: StoreSettings;
  lang: Language;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ sale, settings, lang, onClose }) => {
  if (!sale) return null;

  const handlePrint = () => {
    window.print();
  };

  const isUrdu = lang === 'ur';

  return (
    <div id="receipt-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs overflow-y-auto">
      <div id="receipt-modal-container" className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden flex flex-col my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header Action Bar (Hidden in print) */}
        <div className="print:hidden bg-[#4A5D3F] text-white px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-[#DCEAD7]" />
            <span className="font-semibold text-base">{getTranslation(lang, 'printBill')}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              id="receipt-print-btn"
              onClick={handlePrint}
              className="px-4 py-1.5 bg-[#3E5034] hover:bg-[#32422A] text-white rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              {getTranslation(lang, 'print')}
            </button>
            <button
              id="receipt-close-btn"
              onClick={onClose}
              className="p-1.5 text-[#DCEAD7] hover:text-white rounded-lg hover:bg-black/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Canvas */}
        <div 
          id="printable-receipt" 
          className="p-6 bg-white text-[#2C2C24] font-mono text-sm leading-tight select-text overflow-y-auto max-h-[75vh]"
          style={{ width: '100%' }}
        >
          {/* Store Info Header */}
          <div className="text-center border-b border-dashed border-[#DCDAD0] pb-3 mb-3">
            <h2 className="font-bold text-lg tracking-tight text-[#2C2C24] uppercase">
              {settings.storeName}
            </h2>
            {settings.storeNameUrdu && (
              <p className="font-medium text-base text-[#434338] mt-0.5" style={{ fontFamily: 'system-ui' }}>
                {settings.storeNameUrdu}
              </p>
            )}
            <p className="text-xs text-[#787865] mt-1">{settings.address}</p>
            <p className="text-xs text-[#787865]">Tel: {settings.phone}</p>
            {settings.receiptHeader && (
              <p className="text-[11px] text-[#787865] italic mt-1">{settings.receiptHeader}</p>
            )}
          </div>

          {/* Invoice Meta */}
          <div className="text-xs space-y-1 border-b border-dashed border-[#DCDAD0] pb-2 mb-3">
            <div className="flex justify-between">
              <span className="text-[#787865]">Bill No:</span>
              <span className="font-bold text-[#2C2C24]">#{sale.invoiceNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#787865]">Date:</span>
              <span>{sale.dateTime}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#787865]">Cashier:</span>
              <span>{sale.cashierName}</span>
            </div>
            {sale.customerName && (
              <div className="flex justify-between text-[#24331C] font-semibold bg-[#EEF4EC] px-1 py-0.5 rounded">
                <span>Customer:</span>
                <span>{sale.customerName}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-[#787865]">Payment:</span>
              <span className="font-semibold uppercase">{sale.paymentMethod}</span>
            </div>
          </div>

          {/* Items Table */}
          <div className="border-b border-dashed border-[#DCDAD0] pb-3 mb-3">
            <div className="flex justify-between text-xs font-bold border-b border-[#E2E1D8] pb-1 mb-2 text-[#434338]">
              <span className="w-1/2">Item</span>
              <span className="w-1/4 text-center">Qty x Rate</span>
              <span className="w-1/4 text-right">Amount</span>
            </div>

            <div className="space-y-1.5 text-xs">
              {sale.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-start">
                  <div className="w-1/2 pr-1">
                    <p className="font-semibold text-[#2C2C24] truncate">
                      {isUrdu && item.productNameUrdu ? item.productNameUrdu : item.productName}
                    </p>
                    {isUrdu && item.productNameUrdu && (
                      <p className="text-[10px] text-[#787865] truncate">{item.productName}</p>
                    )}
                  </div>
                  <div className="w-1/4 text-center text-[#5A5A40]">
                    {item.quantity} {item.unit} @ {item.sellingPrice}
                  </div>
                  <div className="w-1/4 text-right font-medium text-[#2C2C24]">
                    {settings.currencySymbol} {item.subtotal.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Financial Totals */}
          <div className="space-y-1.5 text-xs border-b border-dashed border-[#DCDAD0] pb-3 mb-3">
            <div className="flex justify-between">
              <span className="text-[#787865]">Subtotal:</span>
              <span className="font-medium">{settings.currencySymbol} {sale.subtotal.toLocaleString()}</span>
            </div>
            {sale.discountTotal > 0 && (
              <div className="flex justify-between text-[#9E3628]">
                <span>Discount:</span>
                <span>-{settings.currencySymbol} {sale.discountTotal.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-bold text-[#2C2C24] border-t border-[#2C2C24] pt-1.5 mt-1">
              <span>GRAND TOTAL:</span>
              <span>{settings.currencySymbol} {sale.grandTotal.toLocaleString()}</span>
            </div>
            
            {sale.paymentMethod !== 'credit' && (
              <>
                <div className="flex justify-between pt-1 text-[#5A5A40]">
                  <span>Cash Received:</span>
                  <span>{settings.currencySymbol} {sale.paidAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[#384923] font-bold">
                  <span>Change Return:</span>
                  <span>{settings.currencySymbol} {sale.changeAmount.toLocaleString()}</span>
                </div>
              </>
            )}

            {sale.creditAmount > 0 && (
              <div className="flex justify-between text-[#9E3628] font-bold bg-[#FDF0EE] px-1 py-1 rounded">
                <span>Credit Added (Udhaar):</span>
                <span>{settings.currencySymbol} {sale.creditAmount.toLocaleString()}</span>
              </div>
            )}
          </div>

          {/* Footer Note */}
          <div className="text-center text-[11px] text-[#787865] space-y-1">
            <p className="font-medium text-[#434338]">{settings.receiptFooter}</p>
            {settings.receiptFooterUrdu && (
              <p className="text-[#434338] font-medium" style={{ fontFamily: 'system-ui' }}>
                {settings.receiptFooterUrdu}
              </p>
            )}
            <p className="text-[10px] text-[#9A988B] pt-2">Powered by Local Grocery Store System</p>
          </div>
        </div>

        {/* Bottom Actions (Hidden in print) */}
        <div className="print:hidden bg-[#FAF9F5] p-4 border-t border-[#E2E1D8] flex gap-3">
          <button
            id="receipt-finish-btn"
            onClick={onClose}
            className="flex-1 py-2.5 bg-white border border-[#DCDAD0] hover:bg-[#F5F4EE] text-[#434338] font-medium rounded-xl text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Check className="w-4 h-4" />
            {getTranslation(lang, 'close')} (Done)
          </button>
          <button
            id="receipt-print-bottom-btn"
            onClick={handlePrint}
            className="flex-1 py-2.5 bg-[#4A5D3F] hover:bg-[#3E5034] text-white font-medium rounded-xl text-sm flex items-center justify-center gap-2 shadow-2xs transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            {getTranslation(lang, 'printBill')}
          </button>
        </div>

      </div>
    </div>
  );
};
