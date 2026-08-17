import React from 'react';
import { 
  Sale, 
  Expense, 
  Product, 
  Customer, 
  CashSession, 
  StoreSettings, 
  Language, 
  UserRole 
} from '../types';
import { 
  ShoppingCart, 
  Package, 
  Boxes, 
  Truck, 
  Users, 
  Receipt, 
  DollarSign, 
  History, 
  RotateCcw, 
  BarChart3, 
  Database, 
  Settings as SettingsIcon,
  AlertTriangle,
  TrendingUp,
  ArrowUpRight,
  PlusCircle,
  FileCode2,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { getTranslation } from '../i18n/translations';

interface DashboardProps {
  sales: Sale[];
  expenses: Expense[];
  products: Product[];
  customers: Customer[];
  cashSession: CashSession;
  settings: StoreSettings;
  lang: Language;
  userRole: UserRole;
  onNavigate: (tab: string) => void;
  onViewSale: (sale: Sale) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  sales,
  expenses,
  products,
  customers,
  cashSession,
  settings,
  lang,
  userRole,
  onNavigate,
  onViewSale
}) => {
  const isUrdu = lang === 'ur';
  const todayStr = new Date().toISOString().split('T')[0];

  // Calculate Today's Stats
  const todaySales = sales.filter(s => s.dateTime.startsWith(todayStr));
  const todaySalesTotal = todaySales.reduce((acc, s) => acc + s.grandTotal, 0);

  // Calculate Today's COGS for Profit
  const todayCogs = todaySales.reduce((acc, s) => {
    const saleCogs = s.items.reduce((sum, item) => sum + (item.quantity * item.purchasePrice), 0);
    return acc + saleCogs;
  }, 0);

  const todayGrossProfit = Math.max(0, todaySalesTotal - todayCogs);

  const todayExpensesList = expenses.filter(e => e.date === todayStr);
  const todayExpensesTotal = todayExpensesList.reduce((acc, e) => acc + e.amount, 0);

  const todayNetProfit = todayGrossProfit - todayExpensesTotal;

  const totalUdhaar = customers.reduce((acc, c) => acc + (c.outstandingCredit || 0), 0);
  const lowStockProducts = products.filter(p => p.currentStock > 0 && p.currentStock <= p.minStockLevel);
  const outOfStockProducts = products.filter(p => p.currentStock <= 0);

  return (
    <div id="dashboard-view" className="space-y-6 animate-in fade-in duration-150">
      
      {/* Top Banner / Store Welcome & Giant New Sale Button */}
      <div className="bg-[#2C2C24] rounded-2xl p-6 text-[#F5F5F0] shadow-md border border-[#3D3E32] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-[#4A5D3F]/40 text-[#D0E2C4] text-xs font-semibold border border-[#7D946F]/40 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#A0B891] animate-pulse" />
              Store Active & Ready
            </span>
            <span className="text-[#A7A699] text-xs flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black mt-1 tracking-tight text-[#FAF9F5]">
            {settings.storeName}
          </h2>
          <p className="text-[#C8C7BA] text-sm mt-0.5" style={{ fontFamily: 'system-ui' }}>
            {settings.storeNameUrdu || "Grocery Store Management System"}
          </p>
        </div>

        {/* Big New Sale POS Launch Button */}
        <button
          id="dashboard-new-sale-hero-btn"
          onClick={() => onNavigate('pos')}
          className="w-full md:w-auto px-8 py-4 bg-[#4A5D3F] hover:bg-[#3E5034] text-white font-black text-lg rounded-2xl shadow-lg flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
        >
          <ShoppingCart className="w-6 h-6 stroke-[2.5]" />
          <span>{getTranslation(lang, 'pos')}</span>
          <ArrowUpRight className="w-5 h-5 opacity-75" />
        </button>
      </div>

      {/* Main Stats Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Today's Sales */}
        <div 
          onClick={() => onNavigate('salesHistory')}
          className="bg-[#FAF9F5] p-5 rounded-2xl border border-[#E2E1D8] shadow-2xs hover:shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-[#5A5A40] text-xs font-semibold uppercase tracking-wider mb-2">
            <span>{getTranslation(lang, 'todaySales')}</span>
            <div className="w-8 h-8 rounded-xl bg-[#EEF4EC] text-[#3D522B] flex items-center justify-center group-hover:scale-110 transition-transform">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-[#2C2C24] tracking-tight">
            {settings.currencySymbol} {todaySalesTotal.toLocaleString()}
          </div>
          <div className="text-xs text-[#4A5D3F] font-medium mt-1 flex items-center gap-1">
            <span>{todaySales.length} {isUrdu ? 'بل بنے' : 'bills today'}</span>
          </div>
        </div>

        {/* Today's Profit (Admin only or general if permitted) */}
        <div 
          onClick={() => onNavigate('reports')}
          className="bg-[#FAF9F5] p-5 rounded-2xl border border-[#E2E1D8] shadow-2xs hover:shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-[#5A5A40] text-xs font-semibold uppercase tracking-wider mb-2">
            <span>{getTranslation(lang, 'todayProfit')}</span>
            <div className="w-8 h-8 rounded-xl bg-[#EBEAE3] text-[#434338] flex items-center justify-center group-hover:scale-110 transition-transform">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-[#384923] tracking-tight">
            {userRole === 'admin' ? (
              `${settings.currencySymbol} ${todayNetProfit.toLocaleString()}`
            ) : (
              '••••••'
            )}
          </div>
          <div className="text-xs text-[#787865] font-medium mt-1">
            {userRole === 'admin' ? 'Net after expenses' : 'Admin only'}
          </div>
        </div>

        {/* Today's Expenses */}
        <div 
          onClick={() => onNavigate('expenses')}
          className="bg-[#FAF9F5] p-5 rounded-2xl border border-[#E2E1D8] shadow-2xs hover:shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-[#5A5A40] text-xs font-semibold uppercase tracking-wider mb-2">
            <span>{getTranslation(lang, 'todayExpenses')}</span>
            <div className="w-8 h-8 rounded-xl bg-[#FDF0EE] text-[#9E3628] flex items-center justify-center group-hover:scale-110 transition-transform">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-[#9E3628] tracking-tight">
            {settings.currencySymbol} {todayExpensesTotal.toLocaleString()}
          </div>
          <div className="text-xs text-[#787865] font-medium mt-1">
            {todayExpensesList.length} recorded items
          </div>
        </div>

        {/* Customer Udhaar */}
        <div 
          onClick={() => onNavigate('customers')}
          className="bg-[#FAF9F5] p-5 rounded-2xl border border-[#E2E1D8] shadow-2xs hover:shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-[#5A5A40] text-xs font-semibold uppercase tracking-wider mb-2">
            <span>{getTranslation(lang, 'customerUdhaar')}</span>
            <div className="w-8 h-8 rounded-xl bg-[#FDF5EB] text-[#8A5214] flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-[#8A5214] tracking-tight">
            {settings.currencySymbol} {totalUdhaar.toLocaleString()}
          </div>
          <div className="text-xs text-[#8A5214] font-medium mt-1">
            {customers.filter(c => c.outstandingCredit > 0).length} customers pending
          </div>
        </div>

      </div>

      {/* Actionable Alerts Section */}
      {(outOfStockProducts.length > 0 || lowStockProducts.length > 0 || totalUdhaar > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          
          {outOfStockProducts.length > 0 && (
            <div 
              onClick={() => onNavigate('inventory')}
              className="bg-[#FDF0EE] border border-[#F5CEC7] rounded-xl p-3.5 flex items-center justify-between cursor-pointer hover:bg-[#FAE5E2] transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#B94A3D] text-white flex items-center justify-center font-bold">
                  {outOfStockProducts.length}
                </div>
                <div>
                  <h4 className="font-bold text-[#7E2519] text-sm">
                    {outOfStockProducts.length} {getTranslation(lang, 'outOfStockAlerts')}
                  </h4>
                  <p className="text-xs text-[#9E3628]">Click to reorder stock</p>
                </div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-[#9E3628]" />
            </div>
          )}

          {lowStockProducts.length > 0 && (
            <div 
              onClick={() => onNavigate('inventory')}
              className="bg-[#FDF5EB] border border-[#F5DEC2] rounded-xl p-3.5 flex items-center justify-between cursor-pointer hover:bg-[#FAECDB] transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#C27E2E] text-white flex items-center justify-center font-bold">
                  {lowStockProducts.length}
                </div>
                <div>
                  <h4 className="font-bold text-[#6D3D08] text-sm">
                    {lowStockProducts.length} {getTranslation(lang, 'lowStockAlerts')}
                  </h4>
                  <p className="text-xs text-[#8A5214]">Low stock reorder alert</p>
                </div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-[#8A5214]" />
            </div>
          )}

          {totalUdhaar > 0 && (
            <div 
              onClick={() => onNavigate('customers')}
              className="bg-[#EEF4EC] border border-[#D4E4CE] rounded-xl p-3.5 flex items-center justify-between cursor-pointer hover:bg-[#E2EBDD] transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#4A5D3F] text-white flex items-center justify-center font-bold">
                  Rs
                </div>
                <div>
                  <h4 className="font-bold text-[#202E17] text-sm">
                    {settings.currencySymbol} {totalUdhaar.toLocaleString()} Pending Udhaar
                  </h4>
                  <p className="text-xs text-[#3D522B]">Click to receive payments</p>
                </div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-[#4A5D3F]" />
            </div>
          )}

        </div>
      )}

      {/* Main Navigation Modules Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-[#434338] text-sm uppercase tracking-wider">
            {getTranslation(lang, 'quickActions')} / Menu
          </h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          
          {/* POS / New Sale */}
          <button
            id="dash-btn-pos"
            onClick={() => onNavigate('pos')}
            className="bg-[#FAF9F5] p-4 rounded-2xl border-2 border-[#4A5D3F] shadow-xs hover:shadow-md hover:bg-[#EEF4EC]/60 text-left transition-all group cursor-pointer flex flex-col justify-between h-28"
          >
            <div className="w-10 h-10 rounded-xl bg-[#4A5D3F] text-white flex items-center justify-center group-hover:scale-105 transition-transform shadow-xs">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-[#2C2C24] text-base">{getTranslation(lang, 'pos')}</div>
              <div className="text-[11px] text-[#384923] font-medium">Quick Cash & Credit Sale</div>
            </div>
          </button>

          {/* Products */}
          <button
            id="dash-btn-products"
            onClick={() => onNavigate('products')}
            className="bg-[#FAF9F5] p-4 rounded-2xl border border-[#E2E1D8] shadow-2xs hover:shadow-xs hover:border-[#DCDAD0] text-left transition-all group cursor-pointer flex flex-col justify-between h-28"
          >
            <div className="w-10 h-10 rounded-xl bg-[#FDF5EB] text-[#8A5214] flex items-center justify-center group-hover:scale-105 transition-transform">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-[#2C2C24] text-sm sm:text-base">{getTranslation(lang, 'products')}</div>
              <div className="text-[11px] text-[#787865]">{products.length} Items listed</div>
            </div>
          </button>

          {/* Stock & Inventory */}
          <button
            id="dash-btn-inventory"
            onClick={() => onNavigate('inventory')}
            className="bg-[#FAF9F5] p-4 rounded-2xl border border-[#E2E1D8] shadow-2xs hover:shadow-xs hover:border-[#DCDAD0] text-left transition-all group cursor-pointer flex flex-col justify-between h-28"
          >
            <div className="w-10 h-10 rounded-xl bg-[#EBEAE3] text-[#434338] flex items-center justify-center group-hover:scale-105 transition-transform">
              <Boxes className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-[#2C2C24] text-sm sm:text-base">{getTranslation(lang, 'inventory')}</div>
              <div className="text-[11px] text-[#787865]">Stock Count & Adjustments</div>
            </div>
          </button>

          {/* Purchases */}
          <button
            id="dash-btn-purchases"
            onClick={() => onNavigate('purchases')}
            className="bg-[#FAF9F5] p-4 rounded-2xl border border-[#E2E1D8] shadow-2xs hover:shadow-xs hover:border-[#DCDAD0] text-left transition-all group cursor-pointer flex flex-col justify-between h-28"
          >
            <div className="w-10 h-10 rounded-xl bg-[#EEF4EC] text-[#3D522B] flex items-center justify-center group-hover:scale-105 transition-transform">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-[#2C2C24] text-sm sm:text-base">{getTranslation(lang, 'purchases')}</div>
              <div className="text-[11px] text-[#787865]">Supplier Invoices & Stock In</div>
            </div>
          </button>

          {/* Customers & Udhaar */}
          <button
            id="dash-btn-customers"
            onClick={() => onNavigate('customers')}
            className="bg-[#FAF9F5] p-4 rounded-2xl border border-[#E2E1D8] shadow-2xs hover:shadow-xs hover:border-[#DCDAD0] text-left transition-all group cursor-pointer flex flex-col justify-between h-28"
          >
            <div className="w-10 h-10 rounded-xl bg-[#EEF4EC] text-[#24331C] flex items-center justify-center group-hover:scale-105 transition-transform">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-[#2C2C24] text-sm sm:text-base">{getTranslation(lang, 'customers')}</div>
              <div className="text-[11px] text-[#3D522B] font-medium">Udhaar Khata Ledger</div>
            </div>
          </button>

          {/* Expenses */}
          <button
            id="dash-btn-expenses"
            onClick={() => onNavigate('expenses')}
            className="bg-[#FAF9F5] p-4 rounded-2xl border border-[#E2E1D8] shadow-2xs hover:shadow-xs hover:border-[#DCDAD0] text-left transition-all group cursor-pointer flex flex-col justify-between h-28"
          >
            <div className="w-10 h-10 rounded-xl bg-[#FDF0EE] text-[#9E3628] flex items-center justify-center group-hover:scale-105 transition-transform">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-[#2C2C24] text-sm sm:text-base">{getTranslation(lang, 'expenses')}</div>
              <div className="text-[11px] text-[#787865]">Bills, Rent & Tea</div>
            </div>
          </button>

          {/* Daily Cash Drawer */}
          <button
            id="dash-btn-cash-drawer"
            onClick={() => onNavigate('cashDrawer')}
            className="bg-[#FAF9F5] p-4 rounded-2xl border border-[#E2E1D8] shadow-2xs hover:shadow-xs hover:border-[#DCDAD0] text-left transition-all group cursor-pointer flex flex-col justify-between h-28"
          >
            <div className="w-10 h-10 rounded-xl bg-[#EEF4EC] text-[#3D522B] flex items-center justify-center group-hover:scale-105 transition-transform">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-[#2C2C24] text-sm sm:text-base">{getTranslation(lang, 'cashDrawer')}</div>
              <div className="text-[11px] text-[#787865]">Reconciliation & Galla</div>
            </div>
          </button>

          {/* Sales History */}
          <button
            id="dash-btn-sales-history"
            onClick={() => onNavigate('salesHistory')}
            className="bg-[#FAF9F5] p-4 rounded-2xl border border-[#E2E1D8] shadow-2xs hover:shadow-xs hover:border-[#DCDAD0] text-left transition-all group cursor-pointer flex flex-col justify-between h-28"
          >
            <div className="w-10 h-10 rounded-xl bg-[#EBEAE3] text-[#434338] flex items-center justify-center group-hover:scale-105 transition-transform">
              <History className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-[#2C2C24] text-sm sm:text-base">{getTranslation(lang, 'salesHistory')}</div>
              <div className="text-[11px] text-[#787865]">Invoices & Receipts</div>
            </div>
          </button>

          {/* Returns & Refunds */}
          <button
            id="dash-btn-returns"
            onClick={() => onNavigate('returns')}
            className="bg-[#FAF9F5] p-4 rounded-2xl border border-[#E2E1D8] shadow-2xs hover:shadow-xs hover:border-[#DCDAD0] text-left transition-all group cursor-pointer flex flex-col justify-between h-28"
          >
            <div className="w-10 h-10 rounded-xl bg-[#FDF5EB] text-[#8A5214] flex items-center justify-center group-hover:scale-105 transition-transform">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-[#2C2C24] text-sm sm:text-base">{getTranslation(lang, 'returns')}</div>
              <div className="text-[11px] text-[#787865]">Damaged & Return Goods</div>
            </div>
          </button>

          {/* Reports & P&L */}
          <button
            id="dash-btn-reports"
            onClick={() => onNavigate('reports')}
            className="bg-[#FAF9F5] p-4 rounded-2xl border border-[#E2E1D8] shadow-2xs hover:shadow-xs hover:border-[#DCDAD0] text-left transition-all group cursor-pointer flex flex-col justify-between h-28"
          >
            <div className="w-10 h-10 rounded-xl bg-[#EBEAE3] text-[#434338] flex items-center justify-center group-hover:scale-105 transition-transform">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-[#2C2C24] text-sm sm:text-base">{getTranslation(lang, 'reports')}</div>
              <div className="text-[11px] text-[#787865]">Daily Sales & Profit Analysis</div>
            </div>
          </button>

          {/* Backup & Restore */}
          <button
            id="dash-btn-backup"
            onClick={() => onNavigate('backup')}
            className="bg-[#FAF9F5] p-4 rounded-2xl border border-[#E2E1D8] shadow-2xs hover:shadow-xs hover:border-[#DCDAD0] text-left transition-all group cursor-pointer flex flex-col justify-between h-28"
          >
            <div className="w-10 h-10 rounded-xl bg-[#EBEAE3] text-[#434338] flex items-center justify-center group-hover:scale-105 transition-transform">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-[#2C2C24] text-sm sm:text-base">{getTranslation(lang, 'backup')}</div>
              <div className="text-[11px] text-[#787865]">Export SQL & Save Data</div>
            </div>
          </button>

          {/* XAMPP / PHP Files */}
          <button
            id="dash-btn-xampp-export"
            onClick={() => onNavigate('xamppExport')}
            className="bg-[#FAF9F5] p-4 rounded-2xl border border-[#E2E1D8] shadow-2xs hover:shadow-xs hover:border-[#DCDAD0] text-left transition-all group cursor-pointer flex flex-col justify-between h-28"
          >
            <div className="w-10 h-10 rounded-xl bg-[#8F6A33] text-white flex items-center justify-center group-hover:scale-105 transition-transform">
              <FileCode2 className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-[#2C2C24] text-sm sm:text-base">{getTranslation(lang, 'xamppExport')}</div>
              <div className="text-[11px] text-[#8F6A33] font-medium">PHP 8+ MVC & Batch Files</div>
            </div>
          </button>

        </div>
      </div>

      {/* Recent Sales Live Table */}
      <div className="bg-[#FAF9F5] rounded-2xl border border-[#E2E1D8] shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-[#EBEAE3] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#4A5D3F]" />
            <h3 className="font-bold text-[#2C2C24] text-base">{getTranslation(lang, 'recentSales')}</h3>
          </div>
          <button
            onClick={() => onNavigate('salesHistory')}
            className="text-xs text-[#4A5D3F] hover:text-[#384923] font-bold hover:underline cursor-pointer"
          >
            View All ({sales.length}) →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#F2F1EA] text-[#5A5A40] text-xs uppercase border-b border-[#E2E1D8]">
              <tr>
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Time</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Items</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4 text-right">Total</th>
                <th className="py-3 px-4 text-center">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EBEAE3]">
              {sales.slice(0, 5).map(sale => (
                <tr key={sale.id} className="hover:bg-[#F2F1EA]/60 transition-colors">
                  <td className="py-3 px-4 font-bold text-[#2C2C24]">
                    #{sale.invoiceNumber}
                  </td>
                  <td className="py-3 px-4 text-[#787865] text-xs">
                    {sale.dateTime.split(' ')[1] || sale.dateTime}
                  </td>
                  <td className="py-3 px-4">
                    {sale.customerName ? (
                      <span className="font-medium text-[#2C2C24]">{sale.customerName}</span>
                    ) : (
                      <span className="text-[#787865] text-xs">Walk-in</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-[#5A5A40] text-xs">
                    {sale.items.length} items ({sale.items.map(i => i.productName.split(' ')[0]).join(', ').slice(0, 24)}...)
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold uppercase ${
                      sale.paymentMethod === 'credit' 
                        ? 'bg-[#FDF5EB] text-[#8A5214]' 
                        : 'bg-[#EEF4EC] text-[#3D522B]'
                    }`}>
                      {sale.paymentMethod}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-[#2C2C24]">
                    {settings.currencySymbol} {sale.grandTotal.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => onViewSale(sale)}
                      className="px-2.5 py-1 bg-[#EBEAE3] hover:bg-[#E2E1D8] text-[#35362B] text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}

              {sales.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-[#787865]">
                    No sales recorded yet. Click "NEW SALE (POS)" to make your first sale!
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
