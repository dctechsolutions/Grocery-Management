import React, { useState } from 'react';
import { Sale, StoreSettings, Language, UserRole } from '../types';
import { 
  History, 
  Search, 
  Receipt, 
  Calendar, 
  RotateCcw, 
  ArrowRight, 
  CheckCircle,
  FileText,
  Clock
} from 'lucide-react';
import { getTranslation } from '../i18n/translations';

interface SalesHistoryModuleProps {
  sales: Sale[];
  settings: StoreSettings;
  lang: Language;
  userRole: UserRole;
  onViewReceipt: (sale: Sale) => void;
  onStartReturn: (sale: Sale) => void;
}

export const SalesHistoryModule: React.FC<SalesHistoryModuleProps> = ({
  sales,
  settings,
  lang,
  userRole,
  onViewReceipt,
  onStartReturn
}) => {
  const isUrdu = lang === 'ur';

  const [searchQuery, setSearchQuery] = useState('');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [selectedSaleDetail, setSelectedSaleDetail] = useState<Sale | null>(null);

  const filteredSales = sales.filter(s => {
    if (paymentFilter !== 'all' && s.paymentMethod !== paymentFilter) return false;
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;

    return (
      s.invoiceNumber.toLowerCase().includes(q) ||
      (s.customerName && s.customerName.toLowerCase().includes(q)) ||
      s.dateTime.includes(q) ||
      s.items.some(i => i.productName.toLowerCase().includes(q))
    );
  });

  const totalSalesRevenue = filteredSales.reduce((sum, s) => sum + s.grandTotal, 0);

  return (
    <div id="sales-history-view" className="space-y-4 animate-in fade-in duration-150">
      
      {/* Top Banner */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <History className="w-5 h-5 text-violet-600" />
            <span>{getTranslation(lang, 'salesHistory')}</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-violet-50 text-violet-700 font-bold">
              {sales.length} Invoices
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Browse previous transactions, reprint receipts, or process item returns.
          </p>
        </div>

        <div className="text-right">
          <span className="text-xs text-slate-500 block">Filtered Total:</span>
          <span className="text-xl font-black text-slate-900 font-mono">
            {settings.currencySymbol} {totalSalesRevenue.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center gap-2.5">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by invoice number, customer name, or item..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none"
          />
        </div>

        <select
          value={paymentFilter}
          onChange={(e) => setPaymentFilter(e.target.value)}
          className="w-full sm:w-48 py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
        >
          <option value="all">All Payment Modes</option>
          <option value="cash">Cash Only</option>
          <option value="credit">Udhaar (Credit)</option>
          <option value="split">Split Payment</option>
          <option value="easypaisa">EasyPaisa</option>
          <option value="jazzcash">JazzCash</option>
        </select>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Items Summary</th>
                <th className="py-3 px-4 text-center">Payment</th>
                <th className="py-3 px-4 text-right">Grand Total</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSales.map(sale => (
                <tr key={sale.id} className="hover:bg-slate-50/70 transition-colors text-xs">
                  <td className="py-3 px-4 font-bold text-slate-900 font-mono">
                    #{sale.invoiceNumber}
                  </td>
                  <td className="py-3 px-4 text-slate-500 font-mono">
                    {sale.dateTime}
                  </td>
                  <td className="py-3 px-4">
                    {sale.customerName ? (
                      <span className="font-semibold text-slate-800">{sale.customerName}</span>
                    ) : (
                      <span className="text-slate-400">Walk-in</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    <span className="font-semibold text-slate-900">{sale.items.length} items</span> ({sale.items.map(i => `${i.productName} (${i.quantity})`).join(', ').slice(0, 32)}...)
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`px-2.5 py-0.5 rounded-full font-bold uppercase text-[10px] ${
                      sale.paymentMethod === 'credit' 
                        ? 'bg-amber-100 text-amber-900' 
                        : sale.paymentMethod === 'cash' 
                        ? 'bg-emerald-100 text-emerald-900' 
                        : 'bg-indigo-100 text-indigo-900'
                    }`}>
                      {sale.paymentMethod}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-black text-slate-900 font-mono text-sm">
                    {settings.currencySymbol} {sale.grandTotal.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => onViewReceipt(sale)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                        title="View / Print Receipt"
                      >
                        <Receipt className="w-3.5 h-3.5 text-slate-600" />
                        <span>Receipt</span>
                      </button>

                      <button
                        onClick={() => onStartReturn(sale)}
                        className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 rounded-lg font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                        title="Return / Refund"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-amber-700" />
                        <span>Return</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredSales.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No sales invoices found matching filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
