import React, { useState } from 'react';
import { 
  Sale, 
  Expense, 
  Product, 
  Customer, 
  Category, 
  StoreSettings, 
  Language, 
  UserRole 
} from '../types';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Receipt, 
  Printer, 
  Calendar, 
  Award, 
  PieChart, 
  Users, 
  ArrowUpRight 
} from 'lucide-react';
import { getTranslation } from '../i18n/translations';

interface ReportsModuleProps {
  sales: Sale[];
  expenses: Expense[];
  products: Product[];
  customers: Customer[];
  categories: Category[];
  settings: StoreSettings;
  lang: Language;
  userRole: UserRole;
}

export const ReportsModule: React.FC<ReportsModuleProps> = ({
  sales,
  expenses,
  products,
  customers,
  categories,
  settings,
  lang,
  userRole
}) => {
  const isUrdu = lang === 'ur';

  const [dateFilter, setDateFilter] = useState<'today' | 'week' | 'month' | 'all'>('all');

  const todayStr = new Date().toISOString().split('T')[0];

  // Filter Sales & Expenses by Date Range
  const filteredSales = sales.filter(s => {
    if (dateFilter === 'today') return s.dateTime.startsWith(todayStr);
    return true;
  });

  const filteredExpenses = expenses.filter(e => {
    if (dateFilter === 'today') return e.date === todayStr;
    return true;
  });

  // Calculate Key Financials
  const totalRevenue = filteredSales.reduce((sum, s) => sum + s.grandTotal, 0);

  const totalCOGS = filteredSales.reduce((sum, s) => {
    const saleCost = s.items.reduce((itemSum, item) => itemSum + (item.quantity * item.purchasePrice), 0);
    return sum + saleCost;
  }, 0);

  const grossProfit = Math.max(0, totalRevenue - totalCOGS);
  const totalExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  const netProfit = grossProfit - totalExpenses;
  const marginPercent = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : '0';

  // Calculate Top Selling Products
  const productSalesMap: { [prodId: string]: { name: string; quantity: number; revenue: number; profit: number } } = {};
  filteredSales.forEach(s => {
    s.items.forEach(item => {
      if (!productSalesMap[item.productId]) {
        productSalesMap[item.productId] = {
          name: item.productName,
          quantity: 0,
          revenue: 0,
          profit: 0
        };
      }
      productSalesMap[item.productId].quantity += item.quantity;
      productSalesMap[item.productId].revenue += item.total;
      productSalesMap[item.productId].profit += (item.total - (item.quantity * item.purchasePrice));
    });
  });

  const topSellingProducts = Object.values(productSalesMap)
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 8);

  // Total Udhaar
  const totalUdhaar = customers.reduce((sum, c) => sum + (c.outstandingCredit || 0), 0);

  return (
    <div id="reports-view" className="space-y-5 animate-in fade-in duration-150">
      
      {/* Top Header & Filter Controls */}
      <div className="bg-[#FAF9F5] p-4 rounded-2xl border border-[#E2E1D8] shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-[#2C2C24] tracking-tight flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#4A5D3F]" />
            <span>{getTranslation(lang, 'reports')} & Profit / Loss Statement</span>
          </h2>
          <p className="text-xs text-[#787865] mt-0.5">
            Transparent breakdown of Store Revenue, Cost of Goods Sold (COGS), Expenses, and Real Net Profit.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex rounded-xl border border-[#E2E1D8] overflow-hidden bg-[#F2F1EA] p-0.5">
            <button
              onClick={() => setDateFilter('today')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                dateFilter === 'today' ? 'bg-[#FAF9F5] shadow-2xs font-bold text-[#2C2C24]' : 'text-[#787865]'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setDateFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                dateFilter === 'all' ? 'bg-[#FAF9F5] shadow-2xs font-bold text-[#2C2C24]' : 'text-[#787865]'
              }`}
            >
              All Time
            </button>
          </div>

          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 bg-[#4A5D3F] hover:bg-[#3E5034] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* P&L Financial Statement Card */}
      <div className="bg-[#FAF9F5] rounded-2xl border border-[#E2E1D8] shadow-2xs p-5">
        <h3 className="text-base font-bold text-[#2C2C24] mb-4 pb-2 border-b border-[#E2E1D8] flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-[#4A5D3F]" />
          <span>Statement of Profit & Loss ({dateFilter === 'today' ? "Today's Statement" : "Overall Summary"})</span>
        </h3>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Revenue */}
          <div className="p-4 rounded-xl bg-white border border-[#E2E1D8]">
            <span className="text-xs uppercase font-bold text-[#787865]">Gross Sales Revenue (+)</span>
            <div className="text-2xl font-black text-[#2C2C24] font-mono mt-1">
              {settings.currencySymbol} {totalRevenue.toLocaleString()}
            </div>
            <div className="text-[11px] text-[#787865] mt-1">{filteredSales.length} Invoices generated</div>
          </div>

          {/* Cost of Goods Sold */}
          <div className="p-4 rounded-xl bg-white border border-[#E2E1D8]">
            <span className="text-xs uppercase font-bold text-[#787865]">Cost of Goods / Wholesale (-)</span>
            <div className="text-2xl font-black text-[#5A5A40] font-mono mt-1">
              {userRole === 'admin' ? `${settings.currencySymbol} ${totalCOGS.toLocaleString()}` : '••••••'}
            </div>
            <div className="text-[11px] text-[#787865] mt-1">Direct inventory purchase cost</div>
          </div>

          {/* Gross Profit */}
          <div className="p-4 rounded-xl bg-[#EEF4EC] border border-[#DCEAD7]">
            <span className="text-xs uppercase font-bold text-[#24331C]">Gross Profit (منافع)</span>
            <div className="text-2xl font-black text-[#384923] font-mono mt-1">
              {userRole === 'admin' ? `${settings.currencySymbol} ${grossProfit.toLocaleString()}` : '••••••'}
            </div>
            <div className="text-[11px] text-[#4A5D3F] mt-1">Sales minus Inventory Cost</div>
          </div>

          {/* Store Expenses */}
          <div className="p-4 rounded-xl bg-[#FDF0EE] border border-[#FADCD7]">
            <span className="text-xs uppercase font-bold text-[#9E3628]">Operating Expenses (-)</span>
            <div className="text-2xl font-black text-[#9E3628] font-mono mt-1">
              {settings.currencySymbol} {totalExpenses.toLocaleString()}
            </div>
            <div className="text-[11px] text-[#9E3628] mt-1">Tea, bills, salary, rent, etc.</div>
          </div>

        </div>

        {/* Big Net Profit Banner */}
        <div className="mt-4 p-4 rounded-xl bg-[#4A5D3F] text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
          <div>
            <span className="text-xs uppercase font-bold tracking-wider text-[#DCEAD7]">
              Clean Net Profit (خالص منافع)
            </span>
            <div className="text-3xl font-black font-mono mt-1 text-white">
              {userRole === 'admin' ? `${settings.currencySymbol} ${netProfit.toLocaleString()}` : 'Admin PIN Required'}
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs text-[#EEF4EC] block font-medium">Net Profit Margin:</span>
            <span className="text-2xl font-black text-[#DCEAD7] font-mono">
              {userRole === 'admin' ? `${marginPercent}%` : '••%'}
            </span>
          </div>
        </div>

      </div>

      {/* Top 8 Selling Products Table */}
      <div className="bg-[#FAF9F5] rounded-2xl border border-[#E2E1D8] shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-[#E2E1D8] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-[#4A5D3F]" />
            <h3 className="font-bold text-[#2C2C24] text-base">{getTranslation(lang, 'topSellingProducts')}</h3>
          </div>
          <span className="text-xs text-[#787865] font-medium">Ranked by volume sold</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#F2F1EA] text-[#787865] text-xs uppercase border-b border-[#E2E1D8]">
              <tr>
                <th className="py-3 px-4"># Rank</th>
                <th className="py-3 px-4">Product Name</th>
                <th className="py-3 px-4 text-center">Units Sold</th>
                <th className="py-3 px-4 text-right">Total Revenue</th>
                {userRole === 'admin' && <th className="py-3 px-4 text-right">Net Margin</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EBEAE3]">
              {topSellingProducts.map((item, idx) => (
                <tr key={idx} className="hover:bg-[#F5F4EE] transition-colors text-xs">
                  <td className="py-3 px-4 font-bold text-[#9A988B]">#{idx + 1}</td>
                  <td className="py-3 px-4 font-bold text-[#2C2C24]">{item.name}</td>
                  <td className="py-3 px-4 text-center font-bold">
                    <span className="px-2 py-0.5 rounded-full bg-[#EEF4EC] text-[#24331C]">
                      {item.quantity}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-[#2C2C24] font-mono">
                    {settings.currencySymbol} {item.revenue.toLocaleString()}
                  </td>
                  {userRole === 'admin' && (
                    <td className="py-3 px-4 text-right font-bold text-[#384923] font-mono">
                      +{settings.currencySymbol} {item.profit.toLocaleString()}
                    </td>
                  )}
                </tr>
              ))}

              {topSellingProducts.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-[#9A988B]">
                    No sales recorded for this date period.
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
