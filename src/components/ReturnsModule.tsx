import React, { useState } from 'react';
import { SaleReturn, Sale, Product, StoreSettings, Language, UserRole } from '../types';
import { 
  RotateCcw, 
  Plus, 
  Search, 
  CheckCircle, 
  AlertTriangle, 
  Package, 
  DollarSign, 
  Clock 
} from 'lucide-react';
import { getTranslation } from '../i18n/translations';

interface ReturnsModuleProps {
  returns: SaleReturn[];
  sales: Sale[];
  products: Product[];
  settings: StoreSettings;
  lang: Language;
  userRole: UserRole;
  preSelectedSale?: Sale | null;
  onProcessReturn: (
    saleId: string,
    items: { productId: string; quantity: number; refundAmount: number }[],
    refundMethod: 'cash' | 'credit_reduction',
    reason: string
  ) => { success: boolean; error?: string };
}

export const ReturnsModule: React.FC<ReturnsModuleProps> = ({
  returns,
  sales,
  products,
  settings,
  lang,
  userRole,
  preSelectedSale,
  onProcessReturn
}) => {
  const isUrdu = lang === 'ur';

  const [showNewReturnModal, setShowNewReturnModal] = useState(!!preSelectedSale);
  const [selectedSaleId, setSelectedSaleId] = useState<string>(preSelectedSale?.id || sales[0]?.id || '');
  const [returnItems, setReturnItems] = useState<{ productId: string; quantity: number; refundAmount: number }[]>([]);
  const [refundMethod, setRefundMethod] = useState<'cash' | 'credit_reduction'>('cash');
  const [reason, setReason] = useState('Customer changed mind');
  const [formError, setFormError] = useState('');
  const [notice, setNotice] = useState('');

  const selectedSale = sales.find(s => s.id === selectedSaleId);

  // Initialize return items when sale changes
  const handleSelectSale = (saleId: string) => {
    setSelectedSaleId(saleId);
    const sale = sales.find(s => s.id === saleId);
    if (sale && sale.items.length > 0) {
      setReturnItems(sale.items.map(item => ({
        productId: item.productId,
        quantity: 0,
        refundAmount: item.sellingPrice
      })));
    } else {
      setReturnItems([]);
    }
  };

  const handleOpenModal = () => {
    if (sales.length === 0) {
      setFormError('No sales available to return.');
      return;
    }
    const initialSaleId = selectedSaleId || sales[0].id;
    handleSelectSale(initialSaleId);
    setFormError('');
    setShowNewReturnModal(true);
  };

  const handleQuantityChange = (productId: string, qty: number, maxQty: number, unitPrice: number) => {
    const validQty = Math.max(0, Math.min(qty, maxQty));
    setReturnItems(prev => prev.map(item => {
      if (item.productId === productId) {
        return {
          ...item,
          quantity: validQty,
          refundAmount: validQty * unitPrice
        };
      }
      return item;
    }));
  };

  const totalRefund = returnItems.reduce((sum, item) => sum + item.refundAmount, 0);

  const handleSubmitReturn = (e: React.FormEvent) => {
    e.preventDefault();
    const activeReturnItems = returnItems.filter(i => i.quantity > 0);
    if (activeReturnItems.length === 0) {
      setFormError('Please specify quantity (> 0) for at least one item to return.');
      return;
    }

    const result = onProcessReturn(selectedSaleId, activeReturnItems, refundMethod, reason);
    if (result.success) {
      setShowNewReturnModal(false);
      setNotice('Return processed successfully! Stock restored.');
      setTimeout(() => setNotice(''), 3500);
    } else {
      setFormError(result.error || 'Failed to process return.');
    }
  };

  return (
    <div id="returns-view" className="space-y-4 animate-in fade-in duration-150">
      
      {/* Top Banner */}
      <div className="bg-[#FAF9F5] p-4 rounded-2xl border border-[#E2E1D8] shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-[#2C2C24] tracking-tight flex items-center gap-2">
            <RotateCcw className="w-5 h-5 text-[#4A5D3F]" />
            <span>{getTranslation(lang, 'returns')}</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-[#EEF4EC] text-[#24331C] font-bold">
              {returns.length} Processed
            </span>
          </h2>
          <p className="text-xs text-[#787865] mt-0.5">
            Process customer returns, restock inventory items, and refund cash or credit balance.
          </p>
        </div>

        <button
          onClick={handleOpenModal}
          className="px-4 py-2.5 bg-[#4A5D3F] hover:bg-[#3E5034] text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-2xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{getTranslation(lang, 'newReturn')}</span>
        </button>
      </div>

      {notice && (
        <div className="p-3 bg-[#EEF4EC] border border-[#DCEAD7] text-[#24331C] text-xs font-bold rounded-xl flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-[#4A5D3F]" />
          <span>{notice}</span>
        </div>
      )}

      {/* Returns List */}
      <div className="bg-[#FAF9F5] rounded-2xl border border-[#E2E1D8] shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#F2F1EA] text-[#787865] text-xs uppercase border-b border-[#E2E1D8]">
              <tr>
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Invoice Ref</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Returned Items</th>
                <th className="py-3 px-4">Reason</th>
                <th className="py-3 px-4 text-right">Refund Amount</th>
                <th className="py-3 px-4">Processed By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EBEAE3]">
              {returns.map(ret => (
                <tr key={ret.id} className="hover:bg-[#F5F4EE] transition-colors text-xs">
                  <td className="py-3 px-4 font-mono text-[#5A5A40]">{ret.dateTime}</td>
                  <td className="py-3 px-4 font-bold font-mono text-[#2C2C24]">#{ret.saleInvoiceNumber}</td>
                  <td className="py-3 px-4 text-[#2C2C24]">{ret.customerName || 'Walk-in'}</td>
                  <td className="py-3 px-4 text-[#434338]">
                    {ret.items.map(i => `${i.productName} (${i.quantity})`).join(', ')}
                  </td>
                  <td className="py-3 px-4 text-[#787865]">{ret.reason}</td>
                  <td className="py-3 px-4 text-right font-black text-[#9E3628] font-mono text-sm">
                    {settings.currencySymbol} {ret.totalRefundAmount.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-[#787865]">{ret.processedBy}</td>
                </tr>
              ))}

              {returns.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#9A988B]">
                    No product returns processed yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Process Return Modal */}
      {showNewReturnModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs overflow-y-auto">
          <div className="bg-[#FAF9F5] border border-[#E2E1D8] rounded-2xl max-w-xl w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 my-auto">
            
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E1D8]">
              <h3 className="text-base font-bold text-[#2C2C24] flex items-center gap-2">
                <RotateCcw className="w-5 h-5 text-[#4A5D3F]" />
                <span>Process Return / Refund</span>
              </h3>
              <button onClick={() => setShowNewReturnModal(false)} className="text-[#787865] hover:text-[#2C2C24] cursor-pointer">
                ✕
              </button>
            </div>

            {formError && (
              <div className="my-3 p-2.5 bg-[#FDF0EE] border border-[#FADCD7] text-[#9E3628] text-xs rounded-xl font-semibold">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmitReturn} className="space-y-4 text-xs mt-3">
              
              <div>
                <label className="font-semibold text-[#434338] block mb-1">Select Original Sale Invoice *</label>
                <select
                  value={selectedSaleId}
                  onChange={(e) => handleSelectSale(e.target.value)}
                  className="w-full px-3 py-2.5 bg-white border border-[#DCDAD0] rounded-xl text-sm font-medium text-[#2C2C24]"
                >
                  {sales.map(s => (
                    <option key={s.id} value={s.id}>
                      #{s.invoiceNumber} • {s.dateTime.split(' ')[0]} • Rs. {s.grandTotal.toLocaleString()} ({s.customerName || 'Walk-in'})
                    </option>
                  ))}
                </select>
              </div>

              {/* Items from selected sale to return */}
              {selectedSale && (
                <div>
                  <label className="font-bold text-[#2C2C24] uppercase tracking-wider block mb-1.5">
                    Select Items & Return Quantity
                  </label>
                  <div className="border border-[#E2E1D8] rounded-xl divide-y divide-[#EBEAE3] bg-white p-2 space-y-2">
                    {selectedSale.items.map(item => {
                      const returnState = returnItems.find(ri => ri.productId === item.productId);
                      const returnQty = returnState?.quantity || 0;

                      return (
                        <div key={item.productId} className="flex items-center justify-between gap-3 p-1">
                          <div className="flex-1">
                            <div className="font-bold text-[#2C2C24]">{item.productName}</div>
                            <div className="text-[11px] text-[#787865]">
                              Bought: {item.quantity} @ Rs. {item.sellingPrice}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-[#787865]">Return Qty:</span>
                            <input
                              type="number"
                              min="0"
                              max={item.quantity}
                              step="any"
                              value={returnQty}
                              onChange={(e) => handleQuantityChange(item.productId, parseFloat(e.target.value) || 0, item.quantity, item.sellingPrice)}
                              className="w-16 px-2 py-1 bg-[#FAF9F5] border border-[#DCDAD0] rounded-lg text-center font-bold text-[#2C2C24]"
                            />
                          </div>

                          <div className="w-20 text-right font-black text-[#9E3628] font-mono">
                            {settings.currencySymbol} {(returnQty * item.sellingPrice).toLocaleString()}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Total Refund & Method */}
              <div className="p-3 bg-[#F2F1EA] rounded-xl border border-[#E2E1D8] flex justify-between items-center">
                <span className="font-bold text-[#2C2C24] text-sm">Total Refund Amount:</span>
                <span className="text-xl font-black text-[#9E3628] font-mono">
                  {settings.currencySymbol} {totalRefund.toLocaleString()}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-[#434338] block mb-1">Refund Method</label>
                  <select
                    value={refundMethod}
                    onChange={(e) => setRefundMethod(e.target.value as any)}
                    className="w-full px-3 py-2 bg-white border border-[#DCDAD0] rounded-xl text-xs font-medium text-[#2C2C24]"
                  >
                    <option value="cash">Cash Refund (From Drawer)</option>
                    <option value="credit_reduction">Reduce Customer Udhaar Balance</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-[#434338] block mb-1">Return Reason</label>
                  <select
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#DCDAD0] rounded-xl text-xs text-[#2C2C24]"
                  >
                    <option value="Customer changed mind">Customer changed mind</option>
                    <option value="Damaged / Leaked item">Damaged / Leaked item</option>
                    <option value="Expired product">Expired product</option>
                    <option value="Wrong product taken">Wrong product taken</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 pt-3 border-t border-[#E2E1D8]">
                <button
                  type="button"
                  onClick={() => setShowNewReturnModal(false)}
                  className="flex-1 py-2.5 border border-[#DCDAD0] rounded-xl text-[#5A5A40] font-semibold hover:bg-[#EBEAE3] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={totalRefund === 0}
                  className={`flex-1 py-2.5 rounded-xl font-bold cursor-pointer transition-colors ${
                    totalRefund === 0 ? 'bg-[#DCDAD0] text-[#9A988B] cursor-not-allowed' : 'bg-[#4A5D3F] hover:bg-[#3E5034] text-white'
                  }`}
                >
                  Confirm Return & Restock
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
