import React, { useState } from 'react';
import { Expense, StoreSettings, Language, UserRole } from '../types';
import { 
  Receipt, 
  Plus, 
  Trash2, 
  Search, 
  DollarSign, 
  Coffee, 
  Zap, 
  Building, 
  Truck, 
  Users, 
  Package, 
  Layers 
} from 'lucide-react';
import { getTranslation } from '../i18n/translations';

interface ExpensesModuleProps {
  expenses: Expense[];
  settings: StoreSettings;
  lang: Language;
  userRole: UserRole;
  onAddExpense: (expense: Partial<Expense>) => { success: boolean; error?: string };
}

export const ExpensesModule: React.FC<ExpensesModuleProps> = ({
  expenses,
  settings,
  lang,
  userRole,
  onAddExpense
}) => {
  const isUrdu = lang === 'ur';

  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [newExpense, setNewExpense] = useState<{
    category: string;
    amount: number;
    description: string;
    paidFromDrawer: boolean;
  }>({
    category: 'tea_refreshment',
    amount: 100,
    description: '',
    paidFromDrawer: true
  });

  const [formError, setFormError] = useState('');

  const todayStr = new Date().toISOString().split('T')[0];
  const todayExpenses = expenses.filter(e => e.date === todayStr);
  const todayTotal = todayExpenses.reduce((sum, e) => sum + e.amount, 0);
  const totalAllTime = expenses.reduce((sum, e) => sum + e.amount, 0);

  const categories = [
    { id: 'all', label: 'All Expenses', icon: Layers },
    { id: 'tea_refreshment', label: 'Tea & Refreshment (چائے خرچہ)', icon: Coffee },
    { id: 'electricity_utility', label: 'Electricity / Bill (بجلی کا بل)', icon: Zap },
    { id: 'shop_rent', label: 'Shop Rent (دکان کا کرایہ)', icon: Building },
    { id: 'staff_salary', label: 'Staff Salary / Wages (تنخواہ)', icon: Users },
    { id: 'transport_delivery', label: 'Transport / Freight (کرایہ)', icon: Truck },
    { id: 'bags_packaging', label: 'Plastic Bags / Packaging (شاپر)', icon: Package },
    { id: 'maintenance_repair', label: 'Repair & Maintenance (مرمت)', icon: Layers },
    { id: 'other', label: 'Other Misc Expense (دیگر)', icon: Receipt }
  ];

  const filteredExpenses = expenses.filter(e => {
    if (selectedCategory !== 'all' && e.category !== selectedCategory) return false;
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      e.description.toLowerCase().includes(q) ||
      e.category.toLowerCase().includes(q) ||
      e.date.includes(q)
    );
  });

  const handleSaveExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (newExpense.amount <= 0) {
      setFormError('Please enter a valid amount.');
      return;
    }

    const catObj = categories.find(c => c.id === newExpense.category);
    const result = onAddExpense({
      category: newExpense.category as any,
      amount: newExpense.amount,
      description: newExpense.description || (catObj ? catObj.label.split('(')[0].trim() : 'Expense'),
      paidFromDrawer: newExpense.paidFromDrawer,
      date: new Date().toISOString().split('T')[0],
      recordedBy: 'Admin'
    });

    if (result.success) {
      setShowAddModal(false);
      setNewExpense({ category: 'tea_refreshment', amount: 100, description: '', paidFromDrawer: true });
      setFormError('');
    } else {
      setFormError(result.error || 'Failed to record expense.');
    }
  };

  return (
    <div id="expenses-view" className="space-y-4 animate-in fade-in duration-150">
      
      {/* Top Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-[#4A5D3F] p-5 rounded-2xl text-white shadow-2xs">
          <span className="text-xs uppercase font-bold text-[#DCEAD7] tracking-wider">
            {getTranslation(lang, 'todayExpenses')}
          </span>
          <div className="text-2xl sm:text-3xl font-black mt-1 font-mono text-white">
            {settings.currencySymbol} {todayTotal.toLocaleString()}
          </div>
          <div className="text-xs text-[#EEF4EC] mt-2 font-medium">
            {todayExpenses.length} expense items recorded today
          </div>
        </div>

        <div className="bg-[#FAF9F5] p-5 rounded-2xl border border-[#E2E1D8] shadow-2xs flex flex-col justify-between">
          <span className="text-xs uppercase font-bold text-[#787865] tracking-wider">
            {getTranslation(lang, 'totalExpenses')} (Month / Total)
          </span>
          <div className="text-2xl font-black text-[#2C2C24] font-mono mt-1">
            {settings.currencySymbol} {totalAllTime.toLocaleString()}
          </div>
          <div className="text-xs text-[#787865] mt-2">Deducted from store net profit</div>
        </div>

        <div 
          onClick={() => {
            setFormError('');
            setShowAddModal(true);
          }}
          className="bg-[#FAF9F5] p-5 rounded-2xl border border-[#E2E1D8] shadow-2xs hover:border-[#4A5D3F] transition-all cursor-pointer flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold text-[#787865] tracking-wider">Quick Action</span>
            <div className="w-9 h-9 rounded-xl bg-[#EEF4EC] text-[#24331C] flex items-center justify-center group-hover:scale-105 transition-transform">
              <Plus className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h4 className="text-base font-bold text-[#2C2C24] group-hover:text-[#4A5D3F]">
              {getTranslation(lang, 'addExpense')} (روزانہ خرچہ)
            </h4>
            <p className="text-xs text-[#787865] mt-0.5">Tea, bills, salary, rent, transport, polythene bags</p>
          </div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-[#FAF9F5] p-3.5 rounded-2xl border border-[#E2E1D8] shadow-2xs flex flex-col sm:flex-row items-center gap-2.5">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#9A988B]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search expenses by notes or category..."
            className="w-full pl-9 pr-4 py-2 bg-white border border-[#DCDAD0] rounded-xl text-xs sm:text-sm text-[#2C2C24] placeholder-[#9A988B] focus:outline-none focus:border-[#4A5D3F]"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full sm:w-56 py-2 px-3 bg-white border border-[#DCDAD0] rounded-xl text-xs font-semibold text-[#2C2C24]"
        >
          {categories.map(c => (
            <option key={c.id} value={c.id}>{c.label}</option>
          ))}
        </select>
      </div>

      {/* Expenses Table */}
      <div className="bg-[#FAF9F5] rounded-2xl border border-[#E2E1D8] shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#F2F1EA] text-[#787865] text-xs uppercase border-b border-[#E2E1D8]">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Description / Details</th>
                <th className="py-3 px-4 text-center">Paid From Drawer</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4">Recorded By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EBEAE3]">
              {filteredExpenses.map(exp => (
                <tr key={exp.id} className="hover:bg-[#F5F4EE] transition-colors">
                  <td className="py-3 px-4 font-mono text-[#5A5A40] text-xs">{exp.date}</td>
                  <td className="py-3 px-4">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#FDF0EE] text-[#9E3628] text-xs font-bold uppercase">
                      {exp.category.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-[#2C2C24] font-medium text-xs">{exp.description}</td>
                  <td className="py-3 px-4 text-center">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                      exp.paidFromDrawer ? 'bg-[#EEF4EC] text-[#24331C]' : 'bg-[#F2F1EA] text-[#5A5A40]'
                    }`}>
                      {exp.paidFromDrawer ? 'Yes (Cash)' : 'No (External)'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-black text-[#9E3628] font-mono text-sm">
                    {settings.currencySymbol} {exp.amount.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-[#787865] text-xs">{exp.recordedBy || 'Admin'}</td>
                </tr>
              ))}

              {filteredExpenses.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#9A988B]">
                    No expense records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Expense Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="bg-[#FAF9F5] border border-[#E2E1D8] rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-[#2C2C24] mb-3 pb-2 border-b border-[#E2E1D8] flex items-center gap-2">
              <Receipt className="w-5 h-5 text-[#4A5D3F]" />
              <span>{getTranslation(lang, 'addExpense')}</span>
            </h3>

            {formError && (
              <div className="mb-3 p-2.5 bg-[#FDF0EE] border border-[#FADCD7] text-[#9E3628] text-xs rounded-xl font-semibold">
                {formError}
              </div>
            )}

            <form onSubmit={handleSaveExpense} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-[#434338] block mb-1">Expense Category *</label>
                <select
                  value={newExpense.category}
                  onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                  className="w-full px-3 py-2.5 bg-white border border-[#DCDAD0] rounded-xl text-sm font-medium text-[#2C2C24]"
                >
                  <option value="tea_refreshment">Tea & Refreshment (چائے خرچہ)</option>
                  <option value="electricity_utility">Electricity / Utility Bill (بجلی کا بل)</option>
                  <option value="shop_rent">Shop Rent (دکان کا کرایہ)</option>
                  <option value="staff_salary">Staff Salary / Daily Wages (تنخواہ)</option>
                  <option value="transport_delivery">Transport / Delivery Freight (کرایہ)</option>
                  <option value="bags_packaging">Plastic Bags / Packaging (شاپر)</option>
                  <option value="maintenance_repair">Repair & Maintenance (مرمت)</option>
                  <option value="other">Other Misc Expense (دیگر)</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-[#434338] block mb-1">
                  {getTranslation(lang, 'expenseAmount')} ({settings.currencySymbol}) *
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={newExpense.amount || ''}
                  onChange={(e) => setNewExpense({ ...newExpense, amount: parseFloat(e.target.value) || 0 })}
                  placeholder="e.g. 250"
                  className="w-full px-3 py-2 bg-white border border-[#DCDAD0] rounded-xl text-base font-black text-[#9E3628] font-mono"
                  autoFocus
                />
              </div>

              <div>
                <label className="font-semibold text-[#434338] block mb-1">Description / Notes</label>
                <input
                  type="text"
                  value={newExpense.description}
                  onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                  placeholder="e.g. Tea and biscuits for store staff"
                  className="w-full px-3 py-2 bg-white border border-[#DCDAD0] rounded-xl text-xs text-[#2C2C24]"
                />
              </div>

              <div className="p-3 bg-[#F2F1EA] border border-[#E2E1D8] rounded-xl flex items-center justify-between">
                <div>
                  <div className="font-semibold text-[#2C2C24]">Deduct From Cash Drawer (Galla)?</div>
                  <div className="text-[11px] text-[#787865]">Automatically subtract from cash in hand</div>
                </div>
                <input
                  type="checkbox"
                  checked={newExpense.paidFromDrawer}
                  onChange={(e) => setNewExpense({ ...newExpense, paidFromDrawer: e.target.checked })}
                  className="w-4 h-4 rounded text-[#4A5D3F] accent-[#4A5D3F]"
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
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
