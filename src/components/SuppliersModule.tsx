import React, { useState } from 'react';
import { Supplier, SupplierLedgerEntry, StoreSettings, Language, UserRole } from '../types';
import { 
  Building2, 
  Plus, 
  Search, 
  DollarSign, 
  Phone, 
  MapPin, 
  CheckCircle, 
  History, 
  Printer 
} from 'lucide-react';
import { getTranslation } from '../i18n/translations';

interface SuppliersModuleProps {
  suppliers: Supplier[];
  supplierLedger: SupplierLedgerEntry[];
  settings: StoreSettings;
  lang: Language;
  userRole: UserRole;
  onAddSupplier: (supplier: Partial<Supplier>) => { success: boolean; error?: string };
  onPaySupplier: (
    supplierId: string,
    amount: number,
    paymentMethod: 'cash' | 'bank',
    notes: string
  ) => { success: boolean; error?: string };
}

export const SuppliersModule: React.FC<SuppliersModuleProps> = ({
  suppliers,
  supplierLedger,
  settings,
  lang,
  userRole,
  onAddSupplier,
  onPaySupplier
}) => {
  const isUrdu = lang === 'ur';

  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSupplier, setNewSupplier] = useState<Partial<Supplier>>({
    name: '',
    contactPerson: '',
    phone: '',
    address: '',
    balancePayable: 0
  });

  const [showPayModal, setShowPayModal] = useState(false);
  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  const [payAmount, setPayAmount] = useState<number>(0);
  const [payMethod, setPayMethod] = useState<'cash' | 'bank'>('cash');
  const [payNotes, setPayNotes] = useState('');

  const [statementSupplierId, setStatementSupplierId] = useState<string | null>(null);

  const [formError, setFormError] = useState('');
  const [notice, setNotice] = useState('');

  const totalPayable = suppliers.reduce((sum, s) => sum + (s.balancePayable || 0), 0);

  const filteredSuppliers = suppliers.filter(s => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      s.name.toLowerCase().includes(q) ||
      (s.contactPerson && s.contactPerson.toLowerCase().includes(q)) ||
      s.phone.toLowerCase().includes(q)
    );
  });

  const handleSaveSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSupplier.name || !newSupplier.phone) {
      setFormError('Please fill in supplier name and phone.');
      return;
    }

    const result = onAddSupplier(newSupplier);
    if (result.success) {
      setShowAddModal(false);
      setNewSupplier({ name: '', contactPerson: '', phone: '', address: '', balancePayable: 0 });
      setNotice('Supplier saved successfully!');
      setTimeout(() => setNotice(''), 3000);
    } else {
      setFormError(result.error || 'Failed to save supplier.');
    }
  };

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupplierId || payAmount <= 0) {
      setFormError('Please select supplier and enter valid amount.');
      return;
    }

    const result = onPaySupplier(selectedSupplierId, payAmount, payMethod, payNotes);
    if (result.success) {
      setShowPayModal(false);
      setPayAmount(0);
      setPayNotes('');
      setNotice('Payment to supplier recorded!');
      setTimeout(() => setNotice(''), 3000);
    } else {
      setFormError(result.error || 'Payment failed.');
    }
  };

  const statementSupplier = suppliers.find(s => s.id === statementSupplierId);
  const supplierStatements = supplierLedger.filter(l => l.supplierId === statementSupplierId);

  return (
    <div id="suppliers-view" className="space-y-4 animate-in fade-in duration-150">
      
      {/* Top Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-[#4A5D3F] p-5 rounded-2xl text-white shadow-2xs flex flex-col justify-between">
          <div>
            <span className="text-xs uppercase font-bold tracking-wider text-[#DCEAD7]">
              Total Supplier Payables
            </span>
            <div className="text-2xl sm:text-3xl font-black mt-1 font-mono text-white">
              {settings.currencySymbol} {totalPayable.toLocaleString()}
            </div>
          </div>
          <div className="text-xs text-[#EEF4EC] mt-2 font-medium">
            Pending amount owed to distributors / companies
          </div>
        </div>

        <div 
          onClick={() => {
            setSelectedSupplierId(suppliers[0]?.id || '');
            setPayAmount(0);
            setFormError('');
            setShowPayModal(true);
          }}
          className="bg-[#FAF9F5] p-5 rounded-2xl border border-[#E2E1D8] shadow-2xs hover:border-[#4A5D3F] transition-all cursor-pointer flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold text-[#787865] tracking-wider">Quick Action</span>
            <div className="w-9 h-9 rounded-xl bg-[#EEF4EC] text-[#24331C] flex items-center justify-center group-hover:scale-105 transition-transform">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h4 className="text-base font-bold text-[#2C2C24] group-hover:text-[#4A5D3F]">
              Pay Supplier Bill (ادائیگی)
            </h4>
            <p className="text-xs text-[#787865] mt-0.5">Pay wholesale invoice balance via cash or bank</p>
          </div>
        </div>

        <div 
          onClick={() => {
            setFormError('');
            setShowAddModal(true);
          }}
          className="bg-[#FAF9F5] p-5 rounded-2xl border border-[#E2E1D8] shadow-2xs hover:border-[#4A5D3F] transition-all cursor-pointer flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold text-[#787865] tracking-wider">New Distributor</span>
            <div className="w-9 h-9 rounded-xl bg-[#EEF4EC] text-[#24331C] flex items-center justify-center group-hover:scale-105 transition-transform">
              <Plus className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h4 className="text-base font-bold text-[#2C2C24] group-hover:text-[#4A5D3F]">
              {getTranslation(lang, 'addSupplier')}
            </h4>
            <p className="text-xs text-[#787865] mt-0.5">Register wholesale company, salesman & contact</p>
          </div>
        </div>
      </div>

      {notice && (
        <div className="p-3 bg-[#EEF4EC] border border-[#DCEAD7] text-[#24331C] text-xs font-bold rounded-xl flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-[#4A5D3F]" />
          <span>{notice}</span>
        </div>
      )}

      {/* Search & List */}
      <div className="bg-[#FAF9F5] p-3.5 rounded-2xl border border-[#E2E1D8] shadow-2xs flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#9A988B]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search suppliers by company name or salesman..."
            className="w-full pl-9 pr-4 py-2 bg-white border border-[#DCDAD0] rounded-xl text-xs sm:text-sm text-[#2C2C24] placeholder-[#9A988B] focus:outline-none focus:border-[#4A5D3F]"
          />
        </div>
      </div>

      <div className="bg-[#FAF9F5] rounded-2xl border border-[#E2E1D8] shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#F2F1EA] text-[#787865] text-xs uppercase border-b border-[#E2E1D8]">
              <tr>
                <th className="py-3 px-4">Supplier / Company</th>
                <th className="py-3 px-4">Contact Person</th>
                <th className="py-3 px-4">Phone</th>
                <th className="py-3 px-4">Address</th>
                <th className="py-3 px-4 text-right">Balance Payable</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EBEAE3]">
              {filteredSuppliers.map(sup => (
                <tr key={sup.id} className="hover:bg-[#F5F4EE] transition-colors">
                  <td className="py-3 px-4 font-bold text-[#2C2C24]">{sup.name}</td>
                  <td className="py-3 px-4 text-[#5A5A40] text-xs">{sup.contactPerson || '—'}</td>
                  <td className="py-3 px-4 text-[#5A5A40] text-xs font-mono">{sup.phone}</td>
                  <td className="py-3 px-4 text-[#787865] text-xs">{sup.address || 'Local Market'}</td>
                  <td className="py-3 px-4 text-right font-bold">
                    <span className={`px-2.5 py-1 rounded-full text-xs ${
                      sup.balancePayable > 0 ? 'bg-[#FDF0EE] text-[#9E3628] font-bold' : 'bg-[#EEF4EC] text-[#24331C]'
                    }`}>
                      {settings.currencySymbol} {sup.balancePayable.toLocaleString()}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      {sup.balancePayable > 0 && (
                        <button
                          onClick={() => {
                            setSelectedSupplierId(sup.id);
                            setPayAmount(sup.balancePayable);
                            setFormError('');
                            setShowPayModal(true);
                          }}
                          className="px-2.5 py-1 bg-[#4A5D3F] hover:bg-[#3E5034] text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                        >
                          Pay
                        </button>
                      )}
                      <button
                        onClick={() => setStatementSupplierId(sup.id)}
                        className="px-2.5 py-1 bg-[#F2F1EA] hover:bg-[#EAE8DF] text-[#2C2C24] rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <History className="w-3.5 h-3.5 text-[#787865]" />
                        <span>Ledger</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Supplier Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="bg-[#FAF9F5] border border-[#E2E1D8] rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-[#2C2C24] mb-3 pb-2 border-b border-[#E2E1D8] flex items-center gap-2">
              <Building2 className="w-5 h-5 text-[#4A5D3F]" />
              <span>{getTranslation(lang, 'addSupplier')}</span>
            </h3>

            {formError && (
              <div className="mb-3 p-2.5 bg-[#FDF0EE] border border-[#FADCD7] text-[#9E3628] text-xs rounded-xl font-semibold">
                {formError}
              </div>
            )}

            <form onSubmit={handleSaveSupplier} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-[#434338] block mb-1">Company / Supplier Name *</label>
                <input
                  type="text"
                  required
                  value={newSupplier.name || ''}
                  onChange={(e) => setNewSupplier({ ...newSupplier, name: e.target.value })}
                  placeholder="e.g. National Foods Distributor"
                  className="w-full px-3 py-2 bg-white border border-[#DCDAD0] rounded-xl text-sm text-[#2C2C24]"
                  autoFocus
                />
              </div>

              <div>
                <label className="font-semibold text-[#434338] block mb-1">Contact Person / Salesman</label>
                <input
                  type="text"
                  value={newSupplier.contactPerson || ''}
                  onChange={(e) => setNewSupplier({ ...newSupplier, contactPerson: e.target.value })}
                  placeholder="e.g. Aslam Bhai"
                  className="w-full px-3 py-2 bg-white border border-[#DCDAD0] rounded-xl text-sm text-[#2C2C24]"
                />
              </div>

              <div>
                <label className="font-semibold text-[#434338] block mb-1">Phone Number *</label>
                <input
                  type="text"
                  required
                  value={newSupplier.phone || ''}
                  onChange={(e) => setNewSupplier({ ...newSupplier, phone: e.target.value })}
                  placeholder="0300-9876543"
                  className="w-full px-3 py-2 bg-white border border-[#DCDAD0] rounded-xl text-sm text-[#2C2C24]"
                />
              </div>

              <div>
                <label className="font-semibold text-[#434338] block mb-1">Warehouse / Market Address</label>
                <input
                  type="text"
                  value={newSupplier.address || ''}
                  onChange={(e) => setNewSupplier({ ...newSupplier, address: e.target.value })}
                  placeholder="e.g. Wholesale Market G-8"
                  className="w-full px-3 py-2 bg-white border border-[#DCDAD0] rounded-xl text-sm text-[#2C2C24]"
                />
              </div>

              <div>
                <label className="font-semibold text-[#434338] block mb-1">Opening Payable Balance ({settings.currencySymbol})</label>
                <input
                  type="number"
                  min="0"
                  value={newSupplier.balancePayable || 0}
                  onChange={(e) => setNewSupplier({ ...newSupplier, balancePayable: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 bg-white border border-[#DCDAD0] rounded-xl text-sm font-bold text-[#9E3628]"
                />
              </div>

              <div className="flex gap-2 pt-3 border-t border-[#E2E1D8]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 border border-[#DCDAD0] rounded-xl text-[#5A5A40] font-semibold hover:bg-[#EBEAE3] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#4A5D3F] hover:bg-[#3E5034] text-white rounded-xl font-bold cursor-pointer"
                >
                  Save Supplier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Pay Supplier Modal */}
      {showPayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="bg-[#FAF9F5] border border-[#E2E1D8] rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-[#2C2C24] mb-3 pb-2 border-b border-[#E2E1D8] flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-[#4A5D3F]" />
              <span>Record Supplier Payment (ادائیگی)</span>
            </h3>

            {formError && (
              <div className="mb-3 p-2.5 bg-[#FDF0EE] border border-[#FADCD7] text-[#9E3628] text-xs rounded-xl font-semibold">
                {formError}
              </div>
            )}

            <form onSubmit={handleRecordPayment} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-[#434338] block mb-1">Select Supplier *</label>
                <select
                  value={selectedSupplierId}
                  onChange={(e) => {
                    setSelectedSupplierId(e.target.value);
                    const s = suppliers.find(item => item.id === e.target.value);
                    if (s) setPayAmount(s.balancePayable);
                  }}
                  className="w-full px-3 py-2.5 bg-white border border-[#DCDAD0] rounded-xl text-sm font-medium text-[#2C2C24]"
                >
                  {suppliers.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} (Payable: Rs. {s.balancePayable.toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-[#434338] block mb-1">Amount Paid ({settings.currencySymbol}) *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={payAmount || ''}
                    onChange={(e) => setPayAmount(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-white border border-[#DCDAD0] rounded-xl text-sm font-black text-[#24331C]"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="font-semibold text-[#434338] block mb-1">Payment Method</label>
                  <select
                    value={payMethod}
                    onChange={(e) => setPayMethod(e.target.value as any)}
                    className="w-full px-3 py-2 bg-white border border-[#DCDAD0] rounded-xl text-sm font-medium text-[#2C2C24]"
                  >
                    <option value="cash">Cash (From Drawer)</option>
                    <option value="bank">Bank / Cheque</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-[#434338] block mb-1">Notes / Cheque Number</label>
                <input
                  type="text"
                  value={payNotes}
                  onChange={(e) => setPayNotes(e.target.value)}
                  placeholder="e.g. Paid in cash to salesman"
                  className="w-full px-3 py-2 bg-white border border-[#DCDAD0] rounded-xl text-xs text-[#2C2C24]"
                />
              </div>

              <div className="flex gap-2 pt-3 border-t border-[#E2E1D8]">
                <button
                  type="button"
                  onClick={() => setShowPayModal(false)}
                  className="flex-1 py-2.5 border border-[#DCDAD0] rounded-xl text-[#5A5A40] font-semibold hover:bg-[#EBEAE3] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#4A5D3F] hover:bg-[#3E5034] text-white rounded-xl font-bold cursor-pointer"
                >
                  Save Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Supplier Ledger Statement Modal */}
      {statementSupplierId && statementSupplier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs overflow-y-auto">
          <div className="bg-[#FAF9F5] border border-[#E2E1D8] rounded-2xl max-w-2xl w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 my-auto">
            
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E1D8]">
              <div>
                <h3 className="text-base font-bold text-[#2C2C24]">{statementSupplier.name} - Ledger Statement</h3>
                <p className="text-xs text-[#787865]">Contact: {statementSupplier.contactPerson} • {statementSupplier.phone}</p>
              </div>
              <button 
                onClick={() => setStatementSupplierId(null)}
                className="text-[#787865] hover:text-[#2C2C24] cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="my-4 p-3.5 bg-[#F2F1EA] rounded-xl border border-[#E2E1D8] flex justify-between items-center text-xs">
              <span className="text-[#5A5A40] font-medium">Current Balance Payable:</span>
              <span className="font-black text-sm text-[#9E3628] font-mono">
                {settings.currencySymbol} {statementSupplier.balancePayable.toLocaleString()}
              </span>
            </div>

            <div className="border border-[#E2E1D8] rounded-xl overflow-hidden max-h-72 overflow-y-auto bg-white">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F2F1EA] text-[#787865] uppercase font-semibold sticky top-0">
                  <tr>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Description</th>
                    <th className="py-2.5 px-3 text-right">Debit (Payment)</th>
                    <th className="py-2.5 px-3 text-right">Credit (Purchases)</th>
                    <th className="py-2.5 px-3 text-right">Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EBEAE3]">
                  {supplierStatements.map(entry => (
                    <tr key={entry.id} className="hover:bg-[#FAF9F5]">
                      <td className="py-2 px-3 text-[#787865] font-mono">{entry.dateTime.split(' ')[0]}</td>
                      <td className="py-2 px-3 text-[#2C2C24]">{entry.description}</td>
                      <td className="py-2 px-3 text-right text-[#384923] font-mono font-bold">
                        {entry.debit > 0 ? `${settings.currencySymbol} ${entry.debit.toLocaleString()}` : '—'}
                      </td>
                      <td className="py-2 px-3 text-right text-[#9E3628] font-mono font-bold">
                        {entry.credit > 0 ? `${settings.currencySymbol} ${entry.credit.toLocaleString()}` : '—'}
                      </td>
                      <td className="py-2 px-3 text-right font-black text-[#2C2C24] font-mono">
                        {settings.currencySymbol} {entry.runningBalance.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                  {supplierStatements.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-[#9A988B]">
                        No transactions recorded for this supplier yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-[#E2E1D8] mt-4">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 bg-[#F2F1EA] hover:bg-[#EAE8DF] text-[#2C2C24] rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print Statement</span>
              </button>

              <button
                type="button"
                onClick={() => setStatementSupplierId(null)}
                className="px-6 py-2 bg-[#4A5D3F] hover:bg-[#3E5034] text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
