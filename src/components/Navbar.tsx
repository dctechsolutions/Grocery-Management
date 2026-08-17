import React, { useState } from 'react';
import { User, StoreSettings, Language, CashSession } from '../types';
import { 
  Store, 
  User as UserIcon, 
  Globe, 
  DollarSign, 
  ShoppingCart, 
  Bell, 
  Maximize, 
  Minimize, 
  KeyRound, 
  FileCode2,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import { getTranslation } from '../i18n/translations';

interface NavbarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  currentUser: User;
  onSwitchUser: (user: User) => void;
  users: User[];
  settings: StoreSettings;
  cashSession: CashSession;
  currentLang: Language;
  onToggleLang: (lang: Language) => void;
  lowStockCount: number;
  outOfStockCount: number;
  totalUdhaar: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  currentUser,
  onSwitchUser,
  users,
  settings,
  cashSession,
  currentLang,
  onToggleLang,
  lowStockCount,
  outOfStockCount,
  totalUdhaar
}) => {
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User>(currentUser);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [showAlertsMenu, setShowAlertsMenu] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const isUrdu = currentLang === 'ur';

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  };

  const handleVerifyPin = () => {
    if (selectedUser.pin === pinInput) {
      onSwitchUser(selectedUser);
      setShowUserModal(false);
      setPinInput('');
      setPinError('');
    } else {
      setPinError('Incorrect PIN. Default: Admin is 1234, Cashier is 0000');
    }
  };

  const totalAlerts = (outOfStockCount > 0 ? 1 : 0) + (lowStockCount > 0 ? 1 : 0) + (totalUdhaar > 0 ? 1 : 0);

  return (
    <header className="bg-[#2C2C24] text-[#F5F5F0] border-b border-[#3D3E32] sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Store Title */}
          <div 
            onClick={() => onSelectTab('dashboard')} 
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className="w-10 h-10 rounded-xl bg-[#4A5D3F] flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform text-[#FAF9F5]">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-base sm:text-lg text-[#FAF9F5] leading-tight tracking-tight flex items-center gap-2">
                <span>{settings.storeName}</span>
              </h1>
              <p className="text-xs text-[#9FA887] font-medium leading-none mt-0.5" style={{ fontFamily: 'system-ui' }}>
                {settings.storeNameUrdu || "Local Grocery POS System"}
              </p>
            </div>
          </div>

          {/* Center / Right Control Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Quick POS Button */}
            <button
              id="nav-pos-btn"
              onClick={() => onSelectTab('pos')}
              className={`px-3.5 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-xs cursor-pointer ${
                currentTab === 'pos'
                  ? 'bg-[#5A6F4E] text-white ring-2 ring-[#7D946F]'
                  : 'bg-[#4A5D3F] hover:bg-[#3E5034] text-white'
              }`}
            >
              <ShoppingCart className="w-4 h-4" />
              <span className="hidden sm:inline">{getTranslation(currentLang, 'pos')}</span>
              <span className="sm:hidden font-bold">POS</span>
            </button>

            {/* Cash in Drawer Quick Badge */}
            <div 
              onClick={() => onSelectTab('cashDrawer')}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#37382E] hover:bg-[#434438] border border-[#48493D] text-xs text-[#D8D7CE] cursor-pointer transition-colors"
              title="Click to view Cash Drawer"
            >
              <DollarSign className="w-4 h-4 text-[#A0B891]" />
              <span>{getTranslation(currentLang, 'cashInHand')}:</span>
              <span className="font-bold text-[#D0E2C4]">
                {settings.currencySymbol} {(cashSession.expectedCash || 0).toLocaleString()}
              </span>
            </div>

            {/* Language Switcher */}
            <button
              id="nav-lang-toggle"
              onClick={() => onToggleLang(currentLang === 'en' ? 'ur' : 'en')}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#37382E] hover:bg-[#434438] text-xs font-semibold text-[#E5E4DC] border border-[#48493D] transition-colors cursor-pointer"
              title="Switch English / اردو"
            >
              <Globe className="w-4 h-4 text-[#8FA47F]" />
              <span>{currentLang === 'en' ? 'اردو' : 'English'}</span>
            </button>

            {/* Alerts Dropdown */}
            <div className="relative">
              <button
                id="nav-alerts-btn"
                onClick={() => setShowAlertsMenu(!showAlertsMenu)}
                className="relative p-2 rounded-xl bg-[#37382E] hover:bg-[#434438] text-[#D8D7CE] transition-colors cursor-pointer"
                title="System Alerts"
              >
                <Bell className="w-4 h-4" />
                {totalAlerts > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#B94A3D] text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                    {totalAlerts}
                  </span>
                )}
              </button>

              {showAlertsMenu && (
                <div className="absolute right-0 mt-2 w-72 bg-[#FAF9F5] text-[#33332D] rounded-2xl shadow-xl border border-[#E2E1D8] py-2 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-4 py-2 border-b border-[#EBEAE3] font-bold text-xs text-[#5A5A40] uppercase tracking-wider flex justify-between items-center">
                    <span>{getTranslation(currentLang, 'alertNotice')}</span>
                    <span className="text-[11px] font-normal text-[#787865]">{totalAlerts} Active</span>
                  </div>

                  <div className="py-1 text-xs">
                    {outOfStockCount > 0 && (
                      <div 
                        onClick={() => { onSelectTab('inventory'); setShowAlertsMenu(false); }}
                        className="px-4 py-2.5 hover:bg-[#FDF0EE] cursor-pointer flex items-start gap-2 text-[#9E3628]"
                      >
                        <span className="w-2 h-2 rounded-full bg-[#B94A3D] mt-1.5 shrink-0" />
                        <div>
                          <p className="font-semibold">{outOfStockCount} {getTranslation(currentLang, 'outOfStockAlerts')}</p>
                          <p className="text-[11px] text-[#A64436]">Reorder immediately from suppliers.</p>
                        </div>
                      </div>
                    )}

                    {lowStockCount > 0 && (
                      <div 
                        onClick={() => { onSelectTab('inventory'); setShowAlertsMenu(false); }}
                        className="px-4 py-2.5 hover:bg-[#FDF5EB] cursor-pointer flex items-start gap-2 text-[#8A5214]"
                      >
                        <span className="w-2 h-2 rounded-full bg-[#C27E2E] mt-1.5 shrink-0" />
                        <div>
                          <p className="font-semibold">{lowStockCount} {getTranslation(currentLang, 'lowStockAlerts')}</p>
                          <p className="text-[11px] text-[#9A6224]">Stock below minimum safety level.</p>
                        </div>
                      </div>
                    )}

                    {totalUdhaar > 0 && (
                      <div 
                        onClick={() => { onSelectTab('customers'); setShowAlertsMenu(false); }}
                        className="px-4 py-2.5 hover:bg-[#EEF4EC] cursor-pointer flex items-start gap-2 text-[#3D522B]"
                      >
                        <span className="w-2 h-2 rounded-full bg-[#5A6F4E] mt-1.5 shrink-0" />
                        <div>
                          <p className="font-semibold">Customer Udhaar: {settings.currencySymbol} {totalUdhaar.toLocaleString()}</p>
                          <p className="text-[11px] text-[#4E623E]">Collect pending customer payments.</p>
                        </div>
                      </div>
                    )}

                    {totalAlerts === 0 && (
                      <div className="px-4 py-4 text-center text-[#787865] text-xs">
                        No critical alerts. All systems running smooth!
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* XAMPP / PHP Export Shortcut */}
            <button
              id="nav-xampp-btn"
              onClick={() => onSelectTab('xamppExport')}
              className={`p-2 rounded-xl transition-colors cursor-pointer ${
                currentTab === 'xamppExport' 
                  ? 'bg-[#8F6A33] text-white font-bold' 
                  : 'bg-[#37382E] hover:bg-[#434438] text-[#C9A96E]'
              }`}
              title="XAMPP & PHP Source Code Files"
            >
              <FileCode2 className="w-4 h-4" />
            </button>

            {/* Fullscreen Toggle */}
            <button
              id="nav-fullscreen-btn"
              onClick={toggleFullscreen}
              className="hidden lg:block p-2 rounded-xl bg-[#37382E] hover:bg-[#434438] text-[#D8D7CE] transition-colors cursor-pointer"
              title="Toggle Fullscreen"
            >
              {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </button>

            {/* User Switcher / Role Badge */}
            <button
              id="nav-user-switch-btn"
              onClick={() => {
                setSelectedUser(currentUser);
                setPinInput('');
                setPinError('');
                setShowUserModal(true);
              }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#37382E] hover:bg-[#434438] border border-[#48493D] text-xs transition-colors cursor-pointer"
            >
              <div className="w-6 h-6 rounded-full bg-[#4A5D3F] flex items-center justify-center text-white font-bold text-xs">
                {currentUser.name.charAt(0)}
              </div>
              <div className="text-left hidden sm:block">
                <p className="font-semibold text-[#FAF9F5] leading-tight truncate max-w-[110px]">{currentUser.name.split(' ')[0]}</p>
                <p className="text-[10px] text-[#9FA887] font-medium uppercase tracking-wider">{currentUser.role}</p>
              </div>
            </button>

          </div>

        </div>
      </div>

      {/* User Switch & PIN Modal */}
      {showUserModal && (
        <div id="user-switch-modal" className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="bg-[#FAF9F5] text-[#33332D] rounded-2xl shadow-2xl max-w-sm w-full p-6 border border-[#E2E1D8] animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[#EBEAE3]">
              <div className="flex items-center gap-2 font-bold text-base text-[#2C2C24]">
                <KeyRound className="w-5 h-5 text-[#4A5D3F]" />
                <span>{getTranslation(currentLang, 'switchRole')}</span>
              </div>
              <button 
                onClick={() => setShowUserModal(false)}
                className="text-[#787865] hover:text-[#434338] p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <label className="text-xs font-semibold text-[#5A5A40] block">Select Account:</label>
              <div className="grid grid-cols-2 gap-2">
                {users.map(u => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => {
                      setSelectedUser(u);
                      setPinInput('');
                      setPinError('');
                    }}
                    className={`p-3 rounded-xl border text-left flex flex-col items-center justify-center transition-all cursor-pointer ${
                      selectedUser.id === u.id
                        ? 'border-[#4A5D3F] bg-[#EEF4EC] text-[#24331C] font-bold ring-2 ring-[#7D946F]'
                        : 'border-[#E2E1D8] hover:bg-[#F2F1EA] text-[#434338]'
                    }`}
                  >
                    {u.role === 'admin' ? (
                      <ShieldCheck className="w-6 h-6 text-[#4A5D3F] mb-1" />
                    ) : (
                      <UserCheck className="w-6 h-6 text-[#5A6F4E] mb-1" />
                    )}
                    <span className="text-xs">{u.name.split(' ')[0]}</span>
                    <span className="text-[10px] uppercase text-[#787865]">{u.role}</span>
                  </button>
                ))}
              </div>

              <div className="pt-2">
                <label className="text-xs font-semibold text-[#434338] block mb-1">
                  Enter 4-Digit PIN:
                </label>
                <input
                  id="user-pin-input"
                  type="password"
                  maxLength={6}
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleVerifyPin();
                  }}
                  placeholder="e.g. 1234 or 0000"
                  className="w-full text-center text-xl tracking-widest px-4 py-2.5 rounded-xl border border-[#DCDAD0] bg-white text-[#2C2C24] focus:outline-none focus:ring-2 focus:ring-[#5A6F4E] font-mono"
                  autoFocus
                />
                <p className="text-[11px] text-[#787865] mt-1 text-center">
                  (Default PIN: Admin = 1234, Cashier = 0000)
                </p>
                {pinError && (
                  <p className="text-xs text-[#9E3628] font-medium mt-1 text-center">{pinError}</p>
                )}
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowUserModal(false)}
                  className="flex-1 py-2 rounded-xl border border-[#DCDAD0] text-[#5A5A40] text-xs font-semibold hover:bg-[#F2F1EA] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  id="user-pin-confirm-btn"
                  onClick={handleVerifyPin}
                  className="flex-1 py-2 rounded-xl bg-[#4A5D3F] hover:bg-[#3E5034] text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  Login
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </header>
  );
};
