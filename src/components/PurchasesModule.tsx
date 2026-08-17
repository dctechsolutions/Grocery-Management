import React, { useState } from 'react';
import { Product, Supplier, Purchase, StoreSettings, Language, UserRole } from '../types';
import { 
  Truck, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Search, 
  FileText, 
  AlertCircle,
  Calendar,
  Building2
} from 'lucide-react';
import { getTranslation } from '../i18n/translations';

interface PurchasesModuleProps {
  products: Product[];
  suppliers: Supplier[];
  settings: StoreSettings;
  lang: Language;
  userRole: UserRole;
  onRecordPurchase: (
    supplierId: string,
    invoiceNumber: string,
    items: { productId: string; quantity: number; purchasePrice: number }[],
    paidAmount: number,
    paymentMethod: 'cash' | 'bank' | 'credit',
    notes: string
  ) => { success: boolean; error?: string };
}

export const PurchasesModule: React.FC<PurchasesModuleProps> = ({
  products,
  suppliers,
  settings,
  lang,
  userRole,
  onRecordPurchase
}) => {
  const isUrdu = lang === 'ur';

  // Purchase Form State
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>(suppliers[0]?.id || '');
  const [invoiceNumber, setInvoiceNumber] = useState<string>('PUR-' + Math.floor(1000 + Math.random() * 9000));
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'bank' | 'credit'>('cash');
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [purchaseNotes, setPurchaseNotes] = useState<string>('');
  
  // Line items
  const [lineItems, setLineItems] = useState<{ productId: string; quantity: number; purchasePrice: number }[]>([
    { productId: products[0]?.id || '', quantity: 10, purchasePrice: products[0]?.purchasePrice || 100 }
  ]);

  const [formError, setFormError] = useState('');
  const [successNotice, setSuccessNotice] = useState('');

  const totalBillAmount = lineItems.reduce((sum, item) => sum + (item.quantity * item.purchasePrice), 0);
  const remainingDue = Math.max(0, totalBillAmount - paidAmount);

  const handleAddLineItem = () => {
    const firstProd = products[0];
    setLineItems([
      ...lineItems,
      { productId: firstProd ? firstProd.id : '', quantity: 1, purchasePrice: firstProd ? firstProd.purchasePrice : 0 }
    ]);
  };

  const handleRemoveLineItem = (index: number) => {
    if (lineItems.length <= 1) return;
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  const handleLineItemChange = (index: number, field: 'productId' | 'quantity' | 'purchasePrice', val: any) => {
    const updated = [...lineItems];
    if (field === 'productId') {
      const prod = products.find(p => p.id === val);
      updated[index].productId = val;
      if (prod) {
        updated[index].purchasePrice = prod.purchasePrice;
      }
    } else if (field === 'quantity') {
      updated[index].quantity = Math.max(0.1, parseFloat(val) || 0);
    } else if (field === 'purchasePrice') {
      updated[index].purchasePrice = Math.max(0, parseFloat(val) || 0);
    }
    setLineItems(updated);
  };

  const handleSubmitPurchase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupplierId) {
      setFormError('Please select a supplier.');
      return;
    }
    if (lineItems.length === 0) {
      setFormError('Add at least one item.');
      return;
    }

    const result = onRecordPurchase(
      selectedSupplierId,
      invoiceNumber,
      lineItems,
      paidAmount,
      paymentMethod,
      purchaseNotes
    );

    if (result.success) {
      setShowAddModal(false);
      setSuccessNotice('Purchase recorded! Stock successfully updated.');
      setTimeout(() => setSuccessNotice(''), 4000);
      setInvoiceNumber('PUR-' + Math.floor(1000 + Math.random() * 9000));
      setPaidAmount(0);
      setPurchaseNotes('');
    } else {
      setFormError(result.error || 'Failed to record purchase.');
    }
  };

  return (
    <div id="purchases-view" className="space-y-4 animate-in fade-in duration-150">
      
      {/* Top Header */}
      <div className="bg-[#FAF9F5] p-4 rounded-2xl border border-[#E2E1D8] shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-[#2C2C24] tracking-tight flex items-center gap-2">
            <Truck className="w-5 h-5 text-[#4A5D3F]" />
            <span>{getTranslation(lang, 'purchases')}</span>
          </h2>
          <p className="text-xs text-[#787865] mt-0.5">
            Record incoming wholesale goods, update inventory, and manage supplier invoices.
          </p>
        </div>

        <button
          onClick={() => {
            setFormError('');
            setShowAddModal(true);
          }}
          className="px-4 py-2.5 bg-[#4A5D3F] hover:bg-[#3E5034] text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-2xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{getTranslation(lang, 'newPurchase')}</span>
        </button>
      </div>

      {successNotice && (
        <div className="p-3.5 bg-[#EEF4EC] border border-[#DCEAD7] text-[#24331C] text-xs font-bold rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#4A5D3F]" />
          <span>{successNotice}</span>
        </div>
      )}

      {/* Supplier Payables Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {suppliers.map(sup => (
          <div key={sup.id} className="bg-[#FAF9F5] p-4 rounded-2xl border border-[#E2E1D8] shadow-2xs">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-bold text-[#2C2C24] text-sm">{sup.name}</h4>
                <p className="text-xs text-[#787865] mt-0.5">{sup.contactPerson} • {sup.phone}</p>
              </div>
              <span className="p-2 bg-[#EEF4EC] text-[#24331C] rounded-xl">
                <Building2 className="w-4 h-4" />
              </span>
            </div>

            <div className="mt-3 pt-3 border-t border-[#E2E1D8] flex justify-between items-center text-xs">
              <span className="text-[#787865]">Balance Payable:</span>
              <span className={`font-black ${sup.balancePayable > 0 ? 'text-[#9E3628]' : 'text-[#384923]'}`}>
                {settings.currencySymbol} {sup.balancePayable.toLocaleString()}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* New Purchase Invoice Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs overflow-y-auto">
          <div className="bg-[#FAF9F5] border border-[#E2E1D8] rounded-2xl max-w-2xl w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 my-auto">
            
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E1D8]">
              <h3 className="text-lg font-bold text-[#2C2C24] flex items-center gap-2">
                <Truck className="w-5 h-5 text-[#4A5D3F]" />
                <span>{getTranslation(lang, 'newPurchase')}</span>
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-[#787865] hover:text-[#2C2C24] cursor-pointer">
                ✕
              </button>
            </div>

            {formError && (
              <div className="my-3 p-3 bg-[#FDF0EE] border border-[#FADCD7] text-[#9E3628] text-xs rounded-xl font-semibold">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmitPurchase} className="space-y-4 text-xs mt-4">
              
              {/* Supplier & Invoice # */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-[#434338] block mb-1">
                    {getTranslation(lang, 'selectSupplier')} *
                  </label>
                  <select
                    required
                    value={selectedSupplierId}
                    onChange={(e) => setSelectedSupplierId(e.target.value)}
                    className="w-full px-3 py-2.5 border border-[#DCDAD0] rounded-xl text-sm bg-white font-medium text-[#2C2C24]"
                  >
                    {suppliers.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name} (Payable: Rs. {s.balancePayable.toLocaleString()})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-[#434338] block mb-1">
                    {getTranslation(lang, 'invoiceNumber')} *
                  </label>
                  <input
                    type="text"
                    required
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    className="w-full px-3 py-2.5 bg-white border border-[#DCDAD0] rounded-xl text-sm font-mono text-[#2C2C24]"
                  />
                </div>
              </div>

              {/* Line items table */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="font-bold text-[#434338] uppercase tracking-wider text-xs">
                    Items to Add into Stock
                  </label>
                  <button
                    type="button"
                    onClick={handleAddLineItem}
                    className="px-2.5 py-1 bg-[#EEF4EC] hover:bg-[#DCEAD7] text-[#24331C] rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Item</span>
                  </button>
                </div>

                <div className="border border-[#E2E1D8] rounded-xl overflow-hidden divide-y divide-[#EBEAE3] bg-white">
                  {lineItems.map((item, idx) => {
                    const prod = products.find(p => p.id === item.productId);
                    const itemTotal = item.quantity * item.purchasePrice;

                    return (
                      <div key={idx} className="p-2.5 flex items-center gap-2">
                        
                        {/* Select Product */}
                        <div className="flex-1">
                          <select
                            value={item.productId}
                            onChange={(e) => handleLineItemChange(idx, 'productId', e.target.value)}
                            className="w-full px-2 py-1.5 bg-[#FAF9F5] border border-[#DCDAD0] rounded-lg text-xs font-medium text-[#2C2C24]"
                          >
                            {products.map(p => (
                              <option key={p.id} value={p.id}>
                                {p.name} ({p.unit})
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Quantity */}
                        <div className="w-24">
                          <input
                            type="number"
                            min="0.1"
                            step="any"
                            value={item.quantity}
                            onChange={(e) => handleLineItemChange(idx, 'quantity', e.target.value)}
                            className="w-full px-2 py-1.5 bg-[#FAF9F5] border border-[#DCDAD0] rounded-lg text-xs font-bold text-center text-[#2C2C24]"
                            placeholder="Qty"
                          />
                        </div>

                        {/* Unit Price */}
                        <div className="w-28">
                          <input
                            type="number"
                            min="0"
                            step="any"
                            value={item.purchasePrice}
                            onChange={(e) => handleLineItemChange(idx, 'purchasePrice', e.target.value)}
                            className="w-full px-2 py-1.5 bg-[#FAF9F5] border border-[#DCDAD0] rounded-lg text-xs font-mono text-right text-[#2C2C24]"
                            placeholder="Cost"
                          />
                        </div>

                        {/* Total */}
                        <div className="w-24 text-right font-bold text-[#2C2C24] text-xs">
                          {settings.currencySymbol} {itemTotal.toLocaleString()}
                        </div>

                        {/* Delete line */}
                        <button
                          type="button"
                          onClick={() => handleRemoveLineItem(idx)}
                          className="p-1.5 text-[#9A988B] hover:text-[#9E3628] rounded cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Total, Payment & Due Breakdown */}
              <div className="p-4 bg-[#F2F1EA] border border-[#E2E1D8] rounded-xl space-y-2">
                <div className="flex justify-between items-center text-sm font-bold text-[#2C2C24]">
                  <span>Total Bill Amount:</span>
                  <span className="text-base font-black text-[#24331C] font-mono">
                    {settings.currencySymbol} {totalBillAmount.toLocaleString()}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[#E2E1D8]">
                  <div>
                    <label className="font-semibold text-[#434338] block mb-1">
                      {getTranslation(lang, 'paidAmount')} ({settings.currencySymbol})
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={paidAmount}
                      onChange={(e) => setPaidAmount(parseFloat(e.target.value) || 0)}
                      placeholder="0"
                      className="w-full px-3 py-1.5 bg-white border border-[#DCDAD0] rounded-lg font-bold text-[#2C2C24]"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-[#434338] block mb-1">Payment Method</label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value as any)}
                      className="w-full px-3 py-1.5 bg-white border border-[#DCDAD0] rounded-lg font-medium text-[#2C2C24]"
                    >
                      <option value="cash">Cash (From Drawer)</option>
                      <option value="bank">Bank / Cheque</option>
                      <option value="credit">Full Credit (Pay Later)</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2 text-xs font-semibold text-[#9E3628]">
                  <span>{getTranslation(lang, 'remainingPayable')}:</span>
                  <span className="font-bold">{settings.currencySymbol} {remainingDue.toLocaleString()}</span>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="font-semibold text-[#434338] block mb-1">Notes / Driver Details</label>
                <input
                  type="text"
                  value={purchaseNotes}
                  onChange={(e) => setPurchaseNotes(e.target.value)}
                  placeholder="e.g. Delivered by truck # 4451"
                  className="w-full px-3 py-2 bg-white border border-[#DCDAD0] rounded-xl text-xs text-[#2C2C24]"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2 border-t border-[#E2E1D8]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 border border-[#DCDAD0] rounded-xl text-[#5A5A40] font-semibold hover:bg-[#EBEAE3] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#4A5D3F] hover:bg-[#3E5034] text-white rounded-xl font-bold shadow-2xs cursor-pointer"
                >
                  Save & Increase Stock
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
