import React, { useState } from 'react';
import { StoreState, StoreSettings, Language, UserRole } from '../types';
import { 
  Database, 
  Download, 
  Upload, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle2, 
  FileCode2, 
  HardDrive,
  Copy,
  Check
} from 'lucide-react';
import { generateFullSqlDump } from '../services/sqlGenerator';
import { getTranslation } from '../i18n/translations';

interface BackupRestoreModuleProps {
  storeState: StoreState;
  settings: StoreSettings;
  lang: Language;
  userRole: UserRole;
  onRestoreState: (state: StoreState) => void;
  onResetStore: () => void;
}

export const BackupRestoreModule: React.FC<BackupRestoreModuleProps> = ({
  storeState,
  settings,
  lang,
  userRole,
  onRestoreState,
  onResetStore
}) => {
  const isUrdu = lang === 'ur';

  const [copiedSql, setCopiedSql] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Export JSON file
  const handleExportJson = () => {
    const dataStr = JSON.stringify(storeState, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `grocery_store_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    showNotification('success', 'JSON backup file downloaded!');
  };

  // Export MySQL .SQL file for XAMPP
  const handleExportSql = () => {
    const sqlContent = generateFullSqlDump(storeState);
    const blob = new Blob([sqlContent], { type: 'text/sql' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `grocery_store_mysql_${new Date().toISOString().split('T')[0]}.sql`;
    link.click();
    URL.revokeObjectURL(url);
    showNotification('success', 'MySQL .sql database dump downloaded! Ready for phpMyAdmin.');
  };

  // Copy SQL to clipboard
  const handleCopySql = () => {
    const sqlContent = generateFullSqlDump(storeState);
    navigator.clipboard.writeText(sqlContent);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
    showNotification('success', 'MySQL schema copied to clipboard!');
  };

  // Restore JSON File
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.products && parsed.sales && parsed.customers) {
          onRestoreState(parsed);
          showNotification('success', 'Store data successfully restored from backup!');
        } else {
          showNotification('error', 'Invalid backup file format.');
        }
      } catch (err) {
        showNotification('error', 'Failed to parse JSON backup file.');
      }
    };
    reader.readAsText(file);
  };

  const handleResetConfirm = () => {
    onResetStore();
    setShowResetConfirm(false);
    showNotification('success', 'Store reset to fresh grocery sample dataset!');
  };

  const showNotification = (type: 'success' | 'error', text: string) => {
    setNotice({ type, text });
    setTimeout(() => setNotice(null), 3500);
  };

  return (
    <div id="backup-restore-view" className="space-y-4 animate-in fade-in duration-150">
      
      {/* Top Banner */}
      <div className="bg-[#FAF9F5] p-4 rounded-2xl border border-[#E2E1D8] shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-[#2C2C24] tracking-tight flex items-center gap-2">
            <Database className="w-5 h-5 text-[#4A5D3F]" />
            <span>{getTranslation(lang, 'backup')} & Database Management</span>
          </h2>
          <p className="text-xs text-[#787865] mt-0.5">
            Export MySQL `.sql` dump for XAMPP phpMyAdmin, save local JSON archives, or restore data.
          </p>
        </div>
      </div>

      {notice && (
        <div className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
          notice.type === 'success' ? 'bg-[#EEF4EC] text-[#24331C] border border-[#DCEAD7]' : 'bg-[#FDF0EE] text-[#9E3628] border border-[#FADCD7]'
        }`}>
          <CheckCircle2 className="w-4 h-4" />
          <span>{notice.text}</span>
        </div>
      )}

      {/* Main Grid Options */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* 1. MySQL Dump for XAMPP */}
        <div className="bg-[#FAF9F5] p-5 rounded-2xl border border-[#E2E1D8] shadow-2xs flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-[#EEF4EC] text-[#4A5D3F] flex items-center justify-center mb-3">
              <FileCode2 className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-[#2C2C24]">XAMPP MySQL (.sql) Dump</h4>
            <p className="text-xs text-[#787865] mt-1">
              Generates complete `CREATE TABLE` and `INSERT INTO` queries matching your current live catalog, sales, and ledgers.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-[#E2E1D8] flex gap-2">
            <button
              onClick={handleExportSql}
              className="flex-1 py-2.5 bg-[#4A5D3F] hover:bg-[#3E5034] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download .SQL</span>
            </button>
            <button
              onClick={handleCopySql}
              className="p-2.5 bg-white border border-[#DCDAD0] hover:bg-[#F5F4EE] text-[#434338] rounded-xl text-xs font-semibold cursor-pointer"
              title="Copy SQL to clipboard"
            >
              {copiedSql ? <Check className="w-4 h-4 text-[#4A5D3F]" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* 2. Full JSON Backup */}
        <div className="bg-[#FAF9F5] p-5 rounded-2xl border border-[#E2E1D8] shadow-2xs flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-[#EEF4EC] text-[#384923] flex items-center justify-center mb-3">
              <HardDrive className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-[#2C2C24]">JSON Archive Backup</h4>
            <p className="text-xs text-[#787865] mt-1">
              Creates a lightweight portable JSON snapshot of all store tables for safe-keeping or transferring to another computer.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-[#E2E1D8] flex gap-2">
            <button
              onClick={handleExportJson}
              className="flex-1 py-2.5 bg-[#4A5D3F] hover:bg-[#3E5034] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{getTranslation(lang, 'exportBackup')}</span>
            </button>
          </div>
        </div>

        {/* 3. Restore Backup File */}
        <div className="bg-[#FAF9F5] p-5 rounded-2xl border border-[#E2E1D8] shadow-2xs flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-[#EEF4EC] text-[#4A5D3F] flex items-center justify-center mb-3">
              <Upload className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-[#2C2C24]">Restore From Backup</h4>
            <p className="text-xs text-[#787865] mt-1">
              Upload a previously saved `.json` file to restore inventory, sales history, and customer accounts.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-[#E2E1D8]">
            <label className="w-full py-2.5 bg-[#4A5D3F] hover:bg-[#3E5034] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer">
              <Upload className="w-3.5 h-3.5" />
              <span>{getTranslation(lang, 'importBackup')}</span>
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>

      </div>

      {/* Danger Zone: Reset Store */}
      <div className="bg-[#FDF0EE] border border-[#FADCD7] rounded-2xl p-5 mt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h4 className="font-bold text-[#9E3628] text-sm flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-[#9E3628]" />
            <span>Store Reset & Sample Data Reload</span>
          </h4>
          <p className="text-xs text-[#9E3628]/80 mt-0.5">
            Reset all sales, customers, and stock back to the clean initial grocery seed dataset.
          </p>
        </div>

        <button
          onClick={() => setShowResetConfirm(true)}
          className="px-4 py-2.5 bg-[#9E3628] hover:bg-[#852C20] text-white rounded-xl text-xs font-bold shadow-2xs transition-colors cursor-pointer shrink-0"
        >
          {getTranslation(lang, 'resetData')}
        </button>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="bg-[#FAF9F5] border border-[#E2E1D8] rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-full bg-[#FDF0EE] text-[#9E3628] flex items-center justify-center mx-auto mb-3">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-center text-[#2C2C24] mb-1">
              Reset Store Data?
            </h3>
            <p className="text-xs text-center text-[#787865] mb-4">
              This will reload the initial grocery store catalog and clear any test transactions. Are you sure?
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 py-2 border border-[#DCDAD0] rounded-xl text-xs font-semibold text-[#434338] hover:bg-[#EBEAE3] cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleResetConfirm}
                className="flex-1 py-2 bg-[#9E3628] hover:bg-[#852C20] text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Yes, Reset Store
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
