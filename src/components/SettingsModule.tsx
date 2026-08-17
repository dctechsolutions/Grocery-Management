import React, { useState } from 'react';
import { StoreSettings, User, Language, UserRole } from '../types';
import { 
  Settings as SettingsIcon, 
  Store, 
  Receipt, 
  KeyRound, 
  CheckCircle, 
  Globe, 
  DollarSign, 
  Printer 
} from 'lucide-react';
import { getTranslation } from '../i18n/translations';

interface SettingsModuleProps {
  settings: StoreSettings;
  users: User[];
  lang: Language;
  userRole: UserRole;
  onUpdateSettings: (newSettings: StoreSettings) => void;
  onUpdateUserPin: (userId: string, newPin: string) => void;
}

export const SettingsModule: React.FC<SettingsModuleProps> = ({
  settings,
  users,
  lang,
  userRole,
  onUpdateSettings,
  onUpdateUserPin
}) => {
  const isUrdu = lang === 'ur';

  const [formSettings, setFormSettings] = useState<StoreSettings>({ ...settings });
  const [adminPin, setAdminPin] = useState(users.find(u => u.role === 'admin')?.pin || '1234');
  const [cashierPin, setCashierPin] = useState(users.find(u => u.role === 'cashier')?.pin || '0000');
  const [notice, setNotice] = useState('');

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings(formSettings);

    const adminUser = users.find(u => u.role === 'admin');
    if (adminUser) onUpdateUserPin(adminUser.id, adminPin);

    const cashierUser = users.find(u => u.role === 'cashier');
    if (cashierUser) onUpdateUserPin(cashierUser.id, cashierPin);

    setNotice('Settings saved successfully!');
    setTimeout(() => setNotice(''), 3500);
  };

  return (
    <div id="settings-view" className="space-y-4 max-w-4xl mx-auto animate-in fade-in duration-150">
      
      {/* Top Banner */}
      <div className="bg-[#FAF9F5] p-4 rounded-2xl border border-[#E2E1D8] shadow-2xs flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#2C2C24] tracking-tight flex items-center gap-2">
            <SettingsIcon className="w-5 h-5 text-[#4A5D3F]" />
            <span>{getTranslation(lang, 'settings')}</span>
          </h2>
          <p className="text-xs text-[#787865] mt-0.5">
            Configure store profile, thermal receipt formatting, and security PIN codes.
          </p>
        </div>
      </div>

      {notice && (
        <div className="p-3 bg-[#EEF4EC] border border-[#DCEAD7] text-[#24331C] text-xs font-bold rounded-xl flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-[#4A5D3F]" />
          <span>{notice}</span>
        </div>
      )}

      <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
        
        {/* Store Profile Card */}
        <div className="bg-[#FAF9F5] p-5 rounded-2xl border border-[#E2E1D8] shadow-2xs space-y-4">
          <h3 className="text-sm font-bold text-[#2C2C24] uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-[#E2E1D8]">
            <Store className="w-4 h-4 text-[#4A5D3F]" />
            <span>Store Profile Information</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-[#434338] block mb-1">Store Name (English) *</label>
              <input
                type="text"
                required
                value={formSettings.storeName}
                onChange={(e) => setFormSettings({ ...formSettings, storeName: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-[#DCDAD0] rounded-xl text-sm font-bold text-[#2C2C24] focus:outline-none focus:border-[#4A5D3F]"
              />
            </div>

            <div>
              <label className="font-semibold text-[#434338] block mb-1">Store Name (Urdu) *</label>
              <input
                type="text"
                required
                value={formSettings.storeNameUrdu}
                onChange={(e) => setFormSettings({ ...formSettings, storeNameUrdu: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-[#DCDAD0] rounded-xl text-sm font-bold text-[#384923] focus:outline-none focus:border-[#4A5D3F]"
                dir="rtl"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="font-semibold text-[#434338] block mb-1">Contact Phone</label>
              <input
                type="text"
                value={formSettings.phone}
                onChange={(e) => setFormSettings({ ...formSettings, phone: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-[#DCDAD0] rounded-xl text-sm text-[#2C2C24] focus:outline-none focus:border-[#4A5D3F]"
              />
            </div>

            <div>
              <label className="font-semibold text-[#434338] block mb-1">Currency Symbol</label>
              <input
                type="text"
                value={formSettings.currencySymbol}
                onChange={(e) => setFormSettings({ ...formSettings, currencySymbol: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-[#DCDAD0] rounded-xl text-sm font-bold text-[#2C2C24] focus:outline-none focus:border-[#4A5D3F]"
              />
            </div>

            <div>
              <label className="font-semibold text-[#434338] block mb-1">NTN / Tax Registration #</label>
              <input
                type="text"
                value={formSettings.taxNumber || ''}
                onChange={(e) => setFormSettings({ ...formSettings, taxNumber: e.target.value })}
                placeholder="Optional"
                className="w-full px-3 py-2 bg-white border border-[#DCDAD0] rounded-xl text-sm text-[#2C2C24] placeholder-[#9A988B] focus:outline-none focus:border-[#4A5D3F]"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-[#434338] block mb-1">Store Address / Location</label>
            <input
              type="text"
              value={formSettings.address}
              onChange={(e) => setFormSettings({ ...formSettings, address: e.target.value })}
              className="w-full px-3 py-2 bg-white border border-[#DCDAD0] rounded-xl text-sm text-[#2C2C24] focus:outline-none focus:border-[#4A5D3F]"
            />
          </div>
        </div>

        {/* Receipt & Thermal Printer Card */}
        <div className="bg-[#FAF9F5] p-5 rounded-2xl border border-[#E2E1D8] shadow-2xs space-y-4">
          <h3 className="text-sm font-bold text-[#2C2C24] uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-[#E2E1D8]">
            <Receipt className="w-4 h-4 text-[#4A5D3F]" />
            <span>Thermal Receipt Formatting</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-[#434338] block mb-1">Receipt Header Tagline</label>
              <input
                type="text"
                value={formSettings.receiptHeader}
                onChange={(e) => setFormSettings({ ...formSettings, receiptHeader: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-[#DCDAD0] rounded-xl text-sm text-[#2C2C24] focus:outline-none focus:border-[#4A5D3F]"
              />
            </div>

            <div>
              <label className="font-semibold text-[#434338] block mb-1">Receipt Footer Note</label>
              <input
                type="text"
                value={formSettings.receiptFooter}
                onChange={(e) => setFormSettings({ ...formSettings, receiptFooter: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-[#DCDAD0] rounded-xl text-sm text-[#2C2C24] focus:outline-none focus:border-[#4A5D3F]"
              />
            </div>
          </div>

          <div className="p-3 bg-white rounded-xl border border-[#E2E1D8] flex items-center justify-between">
            <div>
              <span className="font-semibold text-[#2C2C24] block">Auto-Open Receipt on Sale Completion</span>
              <span className="text-[11px] text-[#787865]">Automatically display print preview when checkout completes</span>
            </div>
            <input
              type="checkbox"
              checked={formSettings.autoPrintReceipt}
              onChange={(e) => setFormSettings({ ...formSettings, autoPrintReceipt: e.target.checked })}
              className="w-4 h-4 rounded accent-[#4A5D3F]"
            />
          </div>
        </div>

        {/* Security PIN Codes Card */}
        <div className="bg-[#FAF9F5] p-5 rounded-2xl border border-[#E2E1D8] shadow-2xs space-y-4">
          <h3 className="text-sm font-bold text-[#2C2C24] uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-[#E2E1D8]">
            <KeyRound className="w-4 h-4 text-[#4A5D3F]" />
            <span>Security PIN Codes</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-[#434338] block mb-1">Admin 4-Digit PIN</label>
              <input
                type="text"
                maxLength={4}
                value={adminPin}
                onChange={(e) => setAdminPin(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#DCDAD0] rounded-xl text-center text-lg font-mono font-bold tracking-widest text-[#2C2C24] focus:outline-none focus:border-[#4A5D3F]"
              />
              <span className="text-[10px] text-[#787865] mt-1 block">Full permissions (profit, reports, inventory adjustments)</span>
            </div>

            <div>
              <label className="font-semibold text-[#434338] block mb-1">Cashier 4-Digit PIN</label>
              <input
                type="text"
                maxLength={4}
                value={cashierPin}
                onChange={(e) => setCashierPin(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#DCDAD0] rounded-xl text-center text-lg font-mono font-bold tracking-widest text-[#2C2C24] focus:outline-none focus:border-[#4A5D3F]"
              />
              <span className="text-[10px] text-[#787865] mt-1 block">POS sales, daily cash collection, invoice printing</span>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="pt-2">
          <button
            type="submit"
            className="w-full py-3.5 bg-[#4A5D3F] hover:bg-[#3E5034] text-white rounded-xl text-sm font-bold shadow-2xs transition-colors cursor-pointer"
          >
            Save All Settings
          </button>
        </div>

      </form>

    </div>
  );
};
