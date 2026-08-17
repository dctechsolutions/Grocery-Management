import React, { useState } from 'react';
import { Customer, CustomerLedgerEntry, StoreSettings, Language, UserRole } from '../types';
import { 
  Users, 
  Plus, 
  Search, 
  DollarSign, 
  FileText, 
  Phone, 
  MapPin, 
  CreditCard, 
  CheckCircle, 
  ArrowUpRight, 
  ArrowDownLeft,
  Printer,
  History
} from 'lucide-react';
import { getTranslation } from '../i18n/translations';

interface CustomersModuleProps {
  customers: Customer[];
  customerLedger: CustomerLedgerEntry[];
  settings: StoreSettings;
  lang: Language;
  userRole: UserRole;
  onAddCustomer: (cust: Partial<Customer>) => { success: boolean; error?: string };
  onReceivePayment: (
    customerId: string,
    amount: number,
    paymentMethod: 'cash' | 'bank' | 'easypaisa' | 'jazzcash',
    notes: string
  ) => { success: boolean; error?: string };
}

export const CustomersModule: React.FC<CustomersModuleProps> = ({
  customers,
  customerLedger,
  settings,
  lang,
  userRole,
  onAddCustomer,
  onReceivePayment
}) => {
  const isUrdu = lang === 'ur';

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'udhaar' | 'clear'>('all');

  // Add Customer Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCustomer, setNewCustomer] = useState<Partial<Customer>>({
    name: '',
    phone: '',
    address: '',
    creditLimit: 10000,
    outstandingCredit: 0
  });

  // Receive Payment Modal
  const [showPayModal, setShowPayModal] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [payAmount, setPayAmount] = useState<number>(0);
  const [payMethod, setPayMethod] = useState<'cash' | 'bank' | 'easypaisa' | 'jazzcash'>('cash');
  const [payNotes, setPayNotes] = useState('');

  // View Customer Ledger Statement Modal
  const [statementCustomerId, setStatementCustomerId] = useState<string | null>(null);

  const [formError, setFormError] = useState('');
  const [notice, setNotice] = useState('');

  // Total Outstanding Udhaar
  const totalUdhaar = customers.reduce((sum, c) => sum + (c.outstandingCredit || 0), 0);
  const totalCustomersWithCredit = customers.filter(c => c.outstandingCredit > 0).length;

  const filteredCustomers = customers.filter(c => {
    if (filterMode === 'udhaar' && c.outstandingCredit <= 0) return false;
    if (filterMode === 'clear' && c.outstandingCredit > 0) return false;

    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      c.name.toLowerCase().includes(q) ||
      c.phone.toLowerCase().includes(q) ||
      (c.address && c.address.toLowerCase().includes(q))
    );
  });

  // Handle Save New Customer
  const handleSaveCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomer.name || !newCustomer.phone) {
      setFormError('Please enter both name and phone number.');
      return;
    }

    const result = onAddCustomer(newCustomer);
    if (result.success) {
      setShowAddModal(false);
      setNewCustomer({ name: '', phone: '', address: '', creditLimit: 10000, outstandingCredit: 0 });
      setNotice('Customer saved successfully!');
      setTimeout(() => setNotice(''), 3000);
    } else {
      setFormError(result.error || 'Failed to save customer.');
    }
  };

  // Handle Receive Payment
  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId || payAmount <= 0) {
      setFormError('Please select a customer and enter a valid amount.');
      return;
    }

    const result = onReceivePayment(selectedCustomerId, payAmount, payMethod, payNotes);
    if (result.success) {
      setShowPayModal(false);
      setPayAmount(0);
      setPayNotes('');
      setNotice('Payment received and ledger updated!');
      setTimeout(() => setNotice(''), 3000);
    } else {
      setFormError(result.error || 'Payment failed.');
    }
  };

  const selectedForPay = customers.find(c => c.id === selectedCustomerId);
  const statementCustomer = customers.find(c => c.id === statementCustomerId);
  const customerStatements = customerLedger.filter(l => l.customerId === statementCustomerId);

  return (
    <div id="customers-view" className="space-y-4 animate-in fade-in duration-150">
      
      {/* Udhaar Banner & Top Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        
        {/* Total Udhaar Metric */}
        <div className="bg-[#4A5D3F] p-5 rounded-2xl text-white shadow-2xs flex flex-col justify-between">
          <div>
            <span className="text-xs uppercase font-bold tracking-wider text-[#DCEAD7]">
              {getTranslation(lang, 'customerUdhaar')}
            </span>
            <div className="text-2xl sm:text-3xl font-black mt-1 font-mono text-white">
              {settings.currencySymbol} {totalUdhaar.toLocaleString()}
            </div>
          </div>
          <div className="text-xs text-[#EEF4EC] mt-2 font-medium">
            {totalCustomersWithCredit} customers have pending balance
          </div>
        </div>

        {/* Action: Receive Payment */}
        <div 
          onClick={() => {
            setSelectedCustomerId(customers[0]?.id || '');
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
              {getTranslation(lang, 'receivePayment')} (وصولی)
            </h4>
            <p className="text-xs text-[#787865] mt-0.5">Collect cash or digital payment for Udhaar</p>
          </div>
        </div>

        {/* Action: Add New Customer */}
        <div 
          onClick={() => {
            setFormError('');
            setShowAddModal(true);
          }}
          className="bg-[#FAF9F5] p-5 rounded-2xl border border-[#E2E1D8] shadow-2xs hover:border-[#4A5D3F] transition-all cursor-pointer flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold text-[#787865] tracking-wider">New Khata</span>
            <div className="w-9 h-9 rounded-xl bg-[#EEF4EC] text-[#24331C] flex items-center justify-center group-hover:scale-105 transition-transform">
              <Plus className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h4 className="text-base font-bold text-[#2C2C24] group-hover:text-[#4A5D3F]">
              {getTranslation(lang, 'addCustomer')}
            </h4>
            <p className="text-xs text-[#787865] mt-0.5">Create new customer account and credit limit</p>
          </div>
        </div>

      </div>

      {notice && (
        <div className="p-3 bg-[#EEF4EC] border border-[#DCEAD7] text-[#24331C] text-xs font-bold rounded-xl flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-[#4A5D3F]" />
          <span>{notice}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-[#FAF9F5] p-3.5 rounded-2xl border border-[#E2E1D8] shadow-2xs flex flex-col sm:flex-row items-center gap-2.5">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#9A988B]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search customers by name, phone number, or address..."
            className="w-full pl-9 pr-4 py-2 bg-white border border-[#DCDAD0] rounded-xl text-xs sm:text-sm text-[#2C2C24] placeholder-[#9A988B] focus:outline-none focus:border-[#4A5D3F]"
          />
        </div>

        <div className="flex items-center gap-1 w-full sm:w-auto">
          <button
            onClick={() => setFilterMode('all')}
            className={`px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-colors ${
              filterMode === 'all' ? 'bg-[#4A5D3F] text-white' : 'bg-[#F2F1EA] hover:bg-[#EAE8DF] text-[#5A5A40]'
            }`}
          >
            All ({customers.length})
          </button>
          <button
            onClick={() => setFilterMode('udhaar')}
            className={`px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-colors ${
              filterMode === 'udhaar' ? 'bg-[#9E3628] text-white font-bold' : 'bg-[#FDF0EE] hover:bg-[#FADCD7] text-[#9E3628]'
            }`}
          >
            Has Udhaar ({totalCustomersWithCredit})
          </button>
          <button
            onClick={() => setFilterMode('clear')}
            className={`px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-colors ${
              filterMode === 'clear' ? 'bg-[#384923] text-white' : 'bg-[#EEF4EC] hover:bg-[#DCEAD7] text-[#24331C]'
            }`}
          >
            Clear (0)
          </button>
        </div>
      </div>

      {/* Customer List Table */}
      <div className="bg-[#FAF9F5] rounded-2xl border border-[#E2E1D8] shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#F2F1EA] text-[#787865] text-xs uppercase border-b border-[#E2E1D8]">
              <tr>
                <th className="py-3 px-4">Customer Name</th>
                <th className="py-3 px-4">Contact Phone</th>
                <th className="py-3 px-4">Address / Area</th>
                <th className="py-3 px-4 text-right">Credit Limit</th>
                <th className="py-3 px-4 text-right">Outstanding Udhaar</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EBEAE3]">
              {filteredCustomers.map(cust => (
                <tr key={cust.id} className="hover:bg-[#F5F4EE] transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-bold text-[#2C2C24]">{cust.name}</div>
                    <div className="text-xs text-[#9A988B]">Account ID: {cust.id}</div>
                  </td>
                  <td className="py-3 px-4 text-[#5A5A40] text-xs font-mono">
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-[#9A988B]" />
                      <span>{cust.phone}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-[#787865] text-xs">
                    {cust.address || '—'}
                  </td>
                  <td className="py-3 px-4 text-right text-xs font-mono text-[#787865]">
                    {settings.currencySymbol} {cust.creditLimit.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-sm">
                    <span className={`px-2.5 py-1 rounded-full text-xs ${
                      cust.outstandingCredit > 0
                        ? 'bg-[#FDF0EE] text-[#9E3628] font-black'
                        : 'bg-[#EEF4EC] text-[#24331C]'
                    }`}>
                      {settings.currencySymbol} {cust.outstandingCredit.toLocaleString()}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      
                      {/* Receive Payment Quick Button */}
                      {cust.outstandingCredit > 0 && (
                        <button
                          onClick={() => {
                            setSelectedCustomerId(cust.id);
                            setPayAmount(cust.outstandingCredit);
                            setFormError('');
                            setShowPayModal(true);
                          }}
                          className="px-2.5 py-1 bg-[#4A5D3F] hover:bg-[#3E5034] text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                        >
                          Receive
                        </button>
                      )}

                      {/* Ledger Statement Button */}
                      <button
                        onClick={() => setStatementCustomerId(cust.id)}
                        className="px-2.5 py-1 bg-[#F2F1EA] hover:bg-[#EAE8DF] text-[#2C2C24] rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <History className="w-3.5 h-3.5 text-[#787865]" />
                        <span>Ledger</span>
                      </button>

                    </div>
                  </td>
                </tr>
              ))}

              {filteredCustomers.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#9A988B]">
                    No customers found matching search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Customer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="bg-[#FAF9F5] border border-[#E2E1D8] rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-[#2C2C24] mb-3 pb-2 border-b border-[#E2E1D8] flex items-center gap-2">
              <Users className="w-5 h-5 text-[#4A5D3F]" />
              <span>{getTranslation(lang, 'addCustomer')}</span>
            </h3>

            {formError && (
              <div className="mb-3 p-2.5 bg-[#FDF0EE] border border-[#FADCD7] text-[#9E3628] text-xs rounded-xl font-semibold">
                {formError}
              </div>
            )}

            <form onSubmit={handleSaveCustomer} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-[#434338] block mb-1">Customer Full Name *</label>
                <input
                  type="text"
                  required
                  value={newCustomer.name || ''}
                  onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                  placeholder="e.g. Haji Irfan Siddiqui"
                  className="w-full px-3 py-2 bg-white border border-[#DCDAD0] rounded-xl text-sm text-[#2C2C24]"
                  autoFocus
                />
              </div>

              <div>
                <label className="font-semibold text-[#434338] block mb-1">Phone Number (Required for Udhaar) *</label>
                <input
                  type="text"
                  required
                  value={newCustomer.phone || ''}
                  onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                  placeholder="0300-1234567"
                  className="w-full px-3 py-2 bg-white border border-[#DCDAD0] rounded-xl text-sm text-[#2C2C24]"
                />
              </div>

              <div>
                <label className="font-semibold text-[#434338] block mb-1">House / Shop Address / Mohalla</label>
                <input
                  type="text"
                  value={newCustomer.address || ''}
                  onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
                  placeholder="e.g. Street 4, Sector G-9/2"
                  className="w-full px-3 py-2 bg-white border border-[#DCDAD0] rounded-xl text-sm text-[#2C2C24]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-[#434338] block mb-1">Credit Limit ({settings.currencySymbol})</label>
                  <input
                    type="number"
                    min="0"
                    value={newCustomer.creditLimit || 10000}
                    onChange={(e) => setNewCustomer({ ...newCustomer, creditLimit: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-white border border-[#DCDAD0] rounded-xl text-sm font-bold text-[#2C2C24]"
                  />
                </div>

                <div>
                  <label className="font-semibold text-[#434338] block mb-1">Opening Udhaar Balance</label>
                  <input
                    type="number"
                    min="0"
                    value={newCustomer.outstandingCredit || 0}
                    onChange={(e) => setNewCustomer({ ...newCustomer, outstandingCredit: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-white border border-[#DCDAD0] rounded-xl text-sm font-bold text-[#9E3628]"
                  />
                </div>
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
                  Save Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Receive Payment Modal */}
      {showPayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="bg-[#FAF9F5] border border-[#E2E1D8] rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-[#2C2C24] mb-3 pb-2 border-b border-[#E2E1D8] flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-[#4A5D3F]" />
              <span>Receive Customer Payment (وصولی)</span>
            </h3>

            {formError && (
              <div className="mb-3 p-2.5 bg-[#FDF0EE] border border-[#FADCD7] text-[#9E3628] text-xs rounded-xl font-semibold">
                {formError}
              </div>
            )}

            <form onSubmit={handleRecordPayment} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-[#434338] block mb-1">Select Customer *</label>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => {
                    setSelectedCustomerId(e.target.value);
                    const c = customers.find(item => item.id === e.target.value);
                    if (c) setPayAmount(c.outstandingCredit);
                  }}
                  className="w-full px-3 py-2.5 bg-white border border-[#DCDAD0] rounded-xl text-sm font-medium text-[#2C2C24]"
                >
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} (Udhaar: Rs. {c.outstandingCredit.toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>

              {selectedForPay && (
                <div className="p-3 bg-[#F2F1EA] rounded-xl border border-[#E2E1D8] text-[#2C2C24] flex justify-between items-center text-xs">
                  <span>Current Outstanding Udhaar:</span>
                  <span className="font-black text-sm text-[#9E3628]">
                    {settings.currencySymbol} {selectedForPay.outstandingCredit.toLocaleString()}
                  </span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-[#434338] block mb-1">Amount Received ({settings.currencySymbol}) *</label>
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
                    <option value="cash">Cash (To Drawer)</option>
                    <option value="easypaisa">EasyPaisa</option>
                    <option value="jazzcash">JazzCash</option>
                    <option value="bank">Bank Transfer</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-[#434338] block mb-1">Receipt / Remarks Note</label>
                <input
                  type="text"
                  value={payNotes}
                  onChange={(e) => setPayNotes(e.target.value)}
                  placeholder="e.g. Paid by brother at shop"
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
                  Record Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Customer Ledger Statement Modal */}
      {statementCustomerId && statementCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs overflow-y-auto">
          <div className="bg-[#FAF9F5] border border-[#E2E1D8] rounded-2xl max-w-2xl w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 my-auto">
            
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E1D8]">
              <div>
                <h3 className="text-base font-bold text-[#2C2C24]">{statementCustomer.name} - Khata Statement</h3>
                <p className="text-xs text-[#787865]">Phone: {statementCustomer.phone} • Address: {statementCustomer.address || 'Local'}</p>
              </div>
              <button 
                onClick={() => setStatementCustomerId(null)}
                className="text-[#787865] hover:text-[#2C2C24] cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Khata Summary Bar */}
            <div className="my-4 p-3.5 bg-[#F2F1EA] rounded-xl border border-[#E2E1D8] flex justify-between items-center text-xs">
              <div>
                <span className="text-[#787865]">Credit Limit:</span>
                <span className="font-bold text-[#2C2C24] ml-1">{settings.currencySymbol} {statementCustomer.creditLimit.toLocaleString()}</span>
              </div>
              <div className="text-right">
                <span className="text-[#787865]">Current Balance:</span>
                <span className="font-black text-sm text-[#9E3628] ml-1">{settings.currencySymbol} {statementCustomer.outstandingCredit.toLocaleString()}</span>
              </div>
            </div>

            {/* Ledger Transactions Table */}
            <div className="border border-[#E2E1D8] rounded-xl overflow-hidden max-h-72 overflow-y-auto bg-white">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F2F1EA] text-[#787865] uppercase font-semibold sticky top-0">
                  <tr>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Description</th>
                    <th className="py-2.5 px-3 text-right">Debit (Udhaar)</th>
                    <th className="py-2.5 px-3 text-right">Credit (Payment)</th>
                    <th className="py-2.5 px-3 text-right">Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EBEAE3]">
                  {customerStatements.map(entry => (
                    <tr key={entry.id} className="hover:bg-[#FAF9F5]">
                      <td className="py-2 px-3 text-[#787865] font-mono">{entry.dateTime.split(' ')[0]}</td>
                      <td className="py-2 px-3 text-[#2C2C24]">{entry.description}</td>
                      <td className="py-2 px-3 text-right text-[#9E3628] font-mono font-bold">
                        {entry.debit > 0 ? `${settings.currencySymbol} ${entry.debit.toLocaleString()}` : '—'}
                      </td>
                      <td className="py-2 px-3 text-right text-[#384923] font-mono font-bold">
                        {entry.credit > 0 ? `${settings.currencySymbol} ${entry.credit.toLocaleString()}` : '—'}
                      </td>
                      <td className="py-2 px-3 text-right font-black text-[#2C2C24] font-mono">
                        {settings.currencySymbol} {entry.runningBalance.toLocaleString()}
                      </td>
                    </tr>
                  ))}

                  {customerStatements.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-[#9A988B]">
                        No transactions recorded for this customer yet.
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
                <span>Print Khata</span>
              </button>

              <button
                type="button"
                onClick={() => setStatementCustomerId(null)}
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
