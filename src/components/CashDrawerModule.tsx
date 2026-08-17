import React, { useState } from 'react';
import { CashSession, StoreSettings, Language, UserRole } from '../types';
import { 
  DollarSign, 
  Banknote, 
  Calculator, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  Clock, 
  Lock, 
  Unlock 
} from 'lucide-react';
import { getTranslation } from '../i18n/translations';

interface CashDrawerModuleProps {
  cashSession: CashSession;
  settings: StoreSettings;
  lang: Language;
  userRole: UserRole;
  onUpdateSession: (session: Partial<CashSession>) => void;
  onCloseSession: (actualCash: number, notes: string) => { success: boolean; error?: string };
}

export const CashDrawerModule: React.FC<CashDrawerModuleProps> = ({
  cashSession,
  settings,
  lang,
  userRole,
  onUpdateSession,
  onCloseSession
}) => {
  const isUrdu = lang === 'ur';

  // Currency Denomination Counter State
  const [denominations, setDenominations] = useState<{ [key: number]: number }>({
    5000: 0,
    1000: 0,
    500: 0,
    100: 0,
    50: 0,
    20: 0,
    10: 0,
    5: 0,
    2: 0,
    1: 0
  });

  const [closingNotes, setClosingNotes] = useState('');
  const [notice, setNotice] = useState('');

  // Calculate total counted physical cash from denominations
  const totalCountedCash = Object.entries(denominations).reduce((sum, [note, count]) => {
    return sum + (Number(note) * (Number(count) || 0));
  }, 0);

  const expectedCash = cashSession.expectedCash || 0;
  const difference = totalCountedCash - expectedCash;

  const handleDenominationChange = (note: number, count: string) => {
    const val = parseInt(count) || 0;
    setDenominations(prev => ({ ...prev, [note]: Math.max(0, val) }));
  };

  const handleQuickExactCount = () => {
    // Quick populate 1000s and 500s matching expected
    const thousands = Math.floor(expectedCash / 1000);
    const remainder = expectedCash % 1000;
    const hundreds = Math.floor(remainder / 100);
    const tens = remainder % 100;

    setDenominations({
      5000: 0,
      1000: thousands,
      500: 0,
      100: hundreds,
      50: Math.floor(tens / 50),
      20: 0,
      10: Math.floor((tens % 50) / 10),
      5: 0,
      2: 0,
      1: 0
    });
  };

  const handleCloseSessionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = onCloseSession(totalCountedCash, closingNotes);
    if (result.success) {
      setNotice('Day session successfully balanced and closed!');
      setTimeout(() => setNotice(''), 4000);
    }
  };

  return (
    <div id="cash-drawer-view" className="space-y-4 animate-in fade-in duration-150">
      
      {/* Top Banner with Cash In Hand */}
      <div className="bg-[#4A5D3F] p-6 rounded-2xl text-white shadow-2xs border border-[#3E5034] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-[#EEF4EC] text-xs font-semibold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#DCEAD7] animate-pulse" />
              Live Cash Drawer Session
            </span>
            <span className="text-[#DCEAD7] text-xs font-mono">Started: {cashSession.openedAt}</span>
          </div>

          <div className="text-3xl sm:text-4xl font-black mt-2 font-mono tracking-tight text-white">
            {settings.currencySymbol} {expectedCash.toLocaleString()}
          </div>
          <p className="text-[#EEF4EC] text-xs mt-1">
            System Expected Cash in Drawer (گلے میں متوقع نقد رقم)
          </p>
        </div>

        <button
          onClick={handleQuickExactCount}
          className="px-4 py-2.5 bg-[#3E5034] hover:bg-[#32422A] text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors"
        >
          <Calculator className="w-4 h-4" />
          <span>Match System Expected</span>
        </button>
      </div>

      {notice && (
        <div className="p-3.5 bg-[#EEF4EC] border border-[#DCEAD7] text-[#24331C] text-xs font-bold rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#4A5D3F]" />
          <span>{notice}</span>
        </div>
      )}

      {/* Cash Flow Breakdown Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        
        <div className="bg-[#FAF9F5] p-4 rounded-2xl border border-[#E2E1D8] shadow-2xs">
          <span className="text-[11px] font-semibold text-[#787865] uppercase">{getTranslation(lang, 'openingCash')}</span>
          <div className="text-lg font-black text-[#2C2C24] font-mono mt-1">
            {settings.currencySymbol} {cashSession.openingCash.toLocaleString()}
          </div>
        </div>

        <div className="bg-[#FAF9F5] p-4 rounded-2xl border border-[#E2E1D8] shadow-2xs">
          <span className="text-[11px] font-semibold text-[#384923] uppercase">Cash Sales In (+)</span>
          <div className="text-lg font-black text-[#384923] font-mono mt-1">
            +{settings.currencySymbol} {cashSession.totalCashSales.toLocaleString()}
          </div>
        </div>

        <div className="bg-[#FAF9F5] p-4 rounded-2xl border border-[#E2E1D8] shadow-2xs">
          <span className="text-[11px] font-semibold text-[#4A5D3F] uppercase">Udhaar Recovered (+)</span>
          <div className="text-lg font-black text-[#4A5D3F] font-mono mt-1">
            +{settings.currencySymbol} {cashSession.totalCustomerPayments.toLocaleString()}
          </div>
        </div>

        <div className="bg-[#FAF9F5] p-4 rounded-2xl border border-[#E2E1D8] shadow-2xs">
          <span className="text-[11px] font-semibold text-[#9E3628] uppercase">Cash Outflow (-)</span>
          <div className="text-lg font-black text-[#9E3628] font-mono mt-1">
            -{settings.currencySymbol} {(cashSession.totalCashExpenses + cashSession.totalSupplierPayments).toLocaleString()}
          </div>
        </div>

      </div>

      {/* Physical Count & Denomination Calculator */}
      <div className="bg-[#FAF9F5] rounded-2xl border border-[#E2E1D8] shadow-2xs p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-[#E2E1D8] gap-2">
          <div>
            <h3 className="font-bold text-base text-[#2C2C24] flex items-center gap-2">
              <Banknote className="w-5 h-5 text-[#4A5D3F]" />
              <span>Cash Denomination Counter (نوٹ گنتی)</span>
            </h3>
            <p className="text-xs text-[#787865]">
              Count currency notes at the end of shift to detect surplus or shortage.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-xs text-[#787865] block">Total Counted Cash:</span>
              <span className="text-xl font-black text-[#2C2C24] font-mono">
                {settings.currencySymbol} {totalCountedCash.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Notes Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 my-4">
          {[5000, 1000, 500, 100, 50, 20, 10, 5, 2, 1].map(note => {
            const count = denominations[note] || 0;
            const sub = note * count;

            return (
              <div key={note} className="bg-white p-3 rounded-xl border border-[#DCDAD0] text-xs">
                <div className="flex justify-between items-center mb-1.5 font-bold text-[#434338]">
                  <span>Rs. {note} note</span>
                  <span className="text-[#9A988B] font-mono">={sub.toLocaleString()}</span>
                </div>
                <input
                  type="number"
                  min="0"
                  value={count || ''}
                  onChange={(e) => handleDenominationChange(note, e.target.value)}
                  placeholder="0"
                  className="w-full text-center py-1.5 px-2 bg-[#FAF9F5] border border-[#DCDAD0] rounded-lg font-black text-[#2C2C24] text-sm focus:border-[#4A5D3F] focus:outline-none"
                />
              </div>
            );
          })}
        </div>

        {/* Difference Reconciliation Box */}
        <div className={`p-4 rounded-xl border flex flex-col sm:flex-row items-center justify-between gap-3 ${
          difference === 0 
            ? 'bg-[#EEF4EC] border-[#DCEAD7] text-[#24331C]' 
            : difference > 0 
            ? 'bg-[#EEF4EC] border-[#DCEAD7] text-[#24331C]' 
            : 'bg-[#FDF0EE] border-[#FADCD7] text-[#9E3628]'
        }`}>
          <div>
            <div className="font-bold text-sm">
              {difference === 0 ? '✓ Perfect Reconciliation (No Difference)' : difference > 0 ? '▲ Cash Surplus (Extra cash in drawer)' : '▼ Cash Shortage (Missing cash in drawer)'}
            </div>
            <div className="text-xs mt-0.5 opacity-80">
              Expected: Rs. {expectedCash.toLocaleString()} | Counted: Rs. {totalCountedCash.toLocaleString()}
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs uppercase font-semibold block">Difference:</span>
            <span className="text-2xl font-black font-mono">
              {difference > 0 ? `+${difference.toLocaleString()}` : difference.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Close Session Form */}
        <form onSubmit={handleCloseSessionSubmit} className="mt-4 pt-4 border-t border-[#E2E1D8] flex flex-col sm:flex-row items-center gap-3">
          <input
            type="text"
            value={closingNotes}
            onChange={(e) => setClosingNotes(e.target.value)}
            placeholder="Shift closing remarks (optional)..."
            className="flex-1 w-full px-3 py-2 bg-white border border-[#DCDAD0] rounded-xl text-xs text-[#2C2C24] placeholder-[#9A988B] focus:outline-none focus:border-[#4A5D3F]"
          />

          <button
            type="submit"
            className="w-full sm:w-auto px-6 py-2.5 bg-[#4A5D3F] hover:bg-[#3E5034] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Lock className="w-4 h-4" />
            <span>Close Shift / Save Session</span>
          </button>
        </form>

      </div>

    </div>
  );
};
