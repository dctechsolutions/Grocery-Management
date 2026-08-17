import React, { useState } from 'react';
import { Product, StockMovement, Category, StoreSettings, Language, UserRole } from '../types';
import { 
  Boxes, 
  AlertTriangle, 
  History, 
  Plus, 
  Minus, 
  Search, 
  ArrowUpRight, 
  ArrowDownLeft, 
  RotateCcw,
  Sparkles,
  DollarSign,
  TrendingUp,
  FileSpreadsheet
} from 'lucide-react';
import { getTranslation } from '../i18n/translations';

interface InventoryModuleProps {
  products: Product[];
  categories: Category[];
  stockMovements: StockMovement[];
  settings: StoreSettings;
  lang: Language;
  userRole: UserRole;
  onAdjustStock: (
    productId: string,
    adjustedQty: number,
    type: 'damage' | 'expired' | 'manual_adjustment',
    reason: string
  ) => { success: boolean; error?: string };
}

export const InventoryModule: React.FC<InventoryModuleProps> = ({
  products,
  categories,
  stockMovements,
  settings,
  lang,
  userRole,
  onAdjustStock
}) => {
  const isUrdu = lang === 'ur';

  const [activeTab, setActiveTab] = useState<'inventory' | 'movements'>('inventory');
  const [stockFilter, setStockFilter] = useState<'all' | 'low' | 'out'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Stock Adjustment Modal
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [adjustQty, setAdjustQty] = useState<number>(0);
  const [adjustAction, setAdjustAction] = useState<'subtract' | 'add'>('subtract');
  const [adjustType, setAdjustType] = useState<'damage' | 'expired' | 'manual_adjustment'>('damage');
  const [adjustReason, setAdjustReason] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Inventory Valuations
  const totalStockUnits = products.reduce((acc, p) => acc + p.currentStock, 0);
  const totalCostValue = products.reduce((acc, p) => acc + (p.currentStock * p.purchasePrice), 0);
  const totalRetailValue = products.reduce((acc, p) => acc + (p.currentStock * p.sellingPrice), 0);
  const potentialMargin = Math.max(0, totalRetailValue - totalCostValue);

  const lowStockCount = products.filter(p => p.currentStock > 0 && p.currentStock <= p.minStockLevel).length;
  const outOfStockCount = products.filter(p => p.currentStock <= 0).length;

  const filteredProducts = products.filter(p => {
    if (stockFilter === 'low' && (p.currentStock > p.minStockLevel || p.currentStock <= 0)) return false;
    if (stockFilter === 'out' && p.currentStock > 0) return false;

    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;

    return (
      p.name.toLowerCase().includes(q) ||
      (p.nameUrdu && p.nameUrdu.includes(q)) ||
      p.barcode.toLowerCase().includes(q)
    );
  });

  const handleOpenAdjust = (prodId?: string) => {
    setSelectedProductId(prodId || products[0]?.id || '');
    setAdjustQty(1);
    setAdjustAction('subtract');
    setAdjustType('damage');
    setAdjustReason('');
    setErrorMsg('');
    setShowAdjustModal(true);
  };

  const handleSaveAdjust = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId) {
      setErrorMsg('Please select a product.');
      return;
    }
    if (adjustQty <= 0) {
      setErrorMsg('Please enter a valid quantity.');
      return;
    }

    const delta = adjustAction === 'subtract' ? -adjustQty : adjustQty;
    const result = onAdjustStock(selectedProductId, delta, adjustType, adjustReason || 'Inventory adjustment');

    if (result.success) {
      setShowAdjustModal(false);
      setErrorMsg('');
    } else {
      setErrorMsg(result.error || 'Adjustment failed.');
    }
  };

  const selectedProduct = products.find(p => p.id === selectedProductId);

  return (
    <div id="inventory-view" className="space-y-4 animate-in fade-in duration-150">
      
      {/* Header with Valuation Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        
        {/* Total Stock Cost Value */}
        <div className="bg-[#FAF9F5] p-4 rounded-2xl border border-[#E2E1D8] shadow-2xs">
          <div className="text-xs text-[#787865] font-semibold uppercase tracking-wider">{getTranslation(lang, 'totalStockValue')}</div>
          <div className="text-xl font-black text-[#2C2C24] mt-1">
            {userRole === 'admin' ? `${settings.currencySymbol} ${totalCostValue.toLocaleString()}` : '••••••'}
          </div>
          <div className="text-[11px] text-[#787865] mt-0.5">{totalStockUnits.toLocaleString()} units across {products.length} products</div>
        </div>

        {/* Retail Potential Value */}
        <div className="bg-[#FAF9F5] p-4 rounded-2xl border border-[#E2E1D8] shadow-2xs">
          <div className="text-xs text-[#787865] font-semibold uppercase tracking-wider">{getTranslation(lang, 'retailStockValue')}</div>
          <div className="text-xl font-black text-[#384923] mt-1">
            {settings.currencySymbol} {totalRetailValue.toLocaleString()}
          </div>
          <div className="text-[11px] text-[#4A5D3F] font-semibold mt-0.5">
            Est. Margin: {settings.currencySymbol} {potentialMargin.toLocaleString()}
          </div>
        </div>

        {/* Low Stock Items */}
        <div 
          onClick={() => { setActiveTab('inventory'); setStockFilter('low'); }}
          className="bg-[#FDF5EB] hover:bg-[#F7E7D0] p-4 rounded-2xl border border-[#F5DEC2] shadow-2xs cursor-pointer transition-colors"
        >
          <div className="text-xs text-[#8A5214] font-semibold uppercase tracking-wider">{getTranslation(lang, 'lowStockAlerts')}</div>
          <div className="text-xl font-black text-[#8A5214] mt-1">{lowStockCount} Products</div>
          <div className="text-[11px] text-[#8A5214] font-medium mt-0.5">Needs reorder soon</div>
        </div>

        {/* Out of Stock Items */}
        <div 
          onClick={() => { setActiveTab('inventory'); setStockFilter('out'); }}
          className="bg-[#FDF0EE] hover:bg-[#FADCD7] p-4 rounded-2xl border border-[#FADCD7] shadow-2xs cursor-pointer transition-colors"
        >
          <div className="text-xs text-[#9E3628] font-semibold uppercase tracking-wider">{getTranslation(lang, 'outOfStockAlerts')}</div>
          <div className="text-xl font-black text-[#9E3628] mt-1">{outOfStockCount} Products</div>
          <div className="text-[11px] text-[#9E3628] font-medium mt-0.5">Zero quantity on shelf</div>
        </div>

      </div>

      {/* Main Container */}
      <div className="bg-[#FAF9F5] rounded-2xl border border-[#E2E1D8] shadow-2xs overflow-hidden">
        
        {/* Tab Toggle & Actions Bar */}
        <div className="p-3.5 border-b border-[#E2E1D8] bg-[#F2F1EA] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('inventory')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'inventory'
                  ? 'bg-[#2C2C24] text-[#FAF9F5] shadow-2xs'
                  : 'bg-white text-[#434338] hover:bg-[#EBEAE3] border border-[#DCDAD0]'
              }`}
            >
              Current Stock Levels ({products.length})
            </button>
            <button
              onClick={() => setActiveTab('movements')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'movements'
                  ? 'bg-[#2C2C24] text-[#FAF9F5] shadow-2xs'
                  : 'bg-white text-[#434338] hover:bg-[#EBEAE3] border border-[#DCDAD0]'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Stock Movement Audit Log</span>
            </button>
          </div>

          <button
            onClick={() => handleOpenAdjust()}
            className="px-4 py-2 bg-[#4A5D3F] hover:bg-[#3E5034] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
          >
            <Boxes className="w-3.5 h-3.5" />
            <span>{getTranslation(lang, 'stockAdjust')}</span>
          </button>

        </div>

        {/* Tab 1: Current Stock List */}
        {activeTab === 'inventory' && (
          <div>
            {/* Sub-filters */}
            <div className="p-3 border-b border-[#EBEAE3] flex flex-col sm:flex-row items-center gap-2 bg-[#FAF9F5]">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#787865]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search stock by product name or barcode..."
                  className="w-full pl-9 pr-4 py-1.5 bg-white border border-[#DCDAD0] rounded-lg text-xs text-[#2C2C24] placeholder:text-[#9A988B] focus:outline-none focus:ring-2 focus:ring-[#4A5D3F]"
                />
              </div>

              <div className="flex items-center gap-1 w-full sm:w-auto">
                <button
                  onClick={() => setStockFilter('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                    stockFilter === 'all' ? 'bg-[#2C2C24] text-[#FAF9F5]' : 'bg-[#EBEAE3] text-[#434338] hover:bg-[#E2E1D8]'
                  }`}
                >
                  All ({products.length})
                </button>
                <button
                  onClick={() => setStockFilter('low')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                    stockFilter === 'low' ? 'bg-[#8A5214] text-white' : 'bg-[#FDF5EB] text-[#8A5214] hover:bg-[#F7E7D0]'
                  }`}
                >
                  Low ({lowStockCount})
                </button>
                <button
                  onClick={() => setStockFilter('out')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                    stockFilter === 'out' ? 'bg-[#9E3628] text-white' : 'bg-[#FDF0EE] text-[#9E3628] hover:bg-[#FADCD7]'
                  }`}
                >
                  Out ({outOfStockCount})
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#F2F1EA] text-[#5A5A40] text-xs uppercase border-b border-[#E2E1D8]">
                  <tr>
                    <th className="py-3 px-4">Item Name</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4 text-center">Unit</th>
                    <th className="py-3 px-4 text-right">Cost</th>
                    <th className="py-3 px-4 text-right">Selling Price</th>
                    <th className="py-3 px-4 text-center">Current Stock</th>
                    <th className="py-3 px-4 text-center">Min Alert</th>
                    <th className="py-3 px-4 text-right">Total Cost Value</th>
                    <th className="py-3 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EBEAE3] bg-white">
                  {filteredProducts.map(prod => {
                    const cat = categories.find(c => c.id === prod.categoryId);
                    const isLow = prod.currentStock <= prod.minStockLevel && prod.currentStock > 0;
                    const isOut = prod.currentStock <= 0;

                    return (
                      <tr key={prod.id} className="hover:bg-[#F5F5F0] transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-bold text-[#2C2C24]">
                            {isUrdu && prod.nameUrdu ? prod.nameUrdu : prod.name}
                          </div>
                          <div className="text-xs text-[#787865]">{prod.name}</div>
                        </td>
                        <td className="py-3 px-4 text-xs text-[#5A5A40]">{cat?.name || 'General'}</td>
                        <td className="py-3 px-4 text-center text-xs font-semibold text-[#5A5A40] uppercase">{prod.unit}</td>
                        <td className="py-3 px-4 text-right text-xs font-mono text-[#5A5A40]">{settings.currencySymbol} {prod.purchasePrice}</td>
                        <td className="py-3 px-4 text-right text-xs font-bold text-[#384923]">{settings.currencySymbol} {prod.sellingPrice}</td>
                        <td className="py-3 px-4 text-center">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                            isOut ? 'bg-[#FDF0EE] text-[#9E3628]' : isLow ? 'bg-[#FDF5EB] text-[#8A5214]' : 'bg-[#EEF4EC] text-[#24331C]'
                          }`}>
                            {prod.currentStock} {prod.unit}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center text-xs text-[#787865]">{prod.minStockLevel}</td>
                        <td className="py-3 px-4 text-right font-semibold text-[#2C2C24] text-xs">
                          {settings.currencySymbol} {(prod.currentStock * prod.purchasePrice).toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => handleOpenAdjust(prod.id)}
                            className="px-2.5 py-1 bg-[#EEF4EC] hover:bg-[#DCEAD7] text-[#24331C] rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                          >
                            Adjust
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Stock Movements Audit Log */}
        {activeTab === 'movements' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#F2F1EA] text-[#5A5A40] text-xs uppercase border-b border-[#E2E1D8]">
                <tr>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Product</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4 text-center">Change Qty</th>
                  <th className="py-3 px-4 text-center">Previous → New</th>
                  <th className="py-3 px-4">Reference / Reason</th>
                  <th className="py-3 px-4">User</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EBEAE3] bg-white">
                {stockMovements.map(sm => (
                  <tr key={sm.id} className="hover:bg-[#F5F5F0] transition-colors text-xs">
                    <td className="py-2.5 px-4 font-mono text-[#787865]">{sm.dateTime}</td>
                    <td className="py-2.5 px-4 font-bold text-[#2C2C24]">{sm.productName}</td>
                    <td className="py-2.5 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold uppercase ${
                        sm.type === 'sale' ? 'bg-[#EEF4EC] text-[#24331C]' :
                        sm.type === 'purchase' ? 'bg-[#E3EFEA] text-[#1E4D3E]' :
                        sm.type === 'damage' ? 'bg-[#FDF0EE] text-[#9E3628]' :
                        sm.type === 'return' ? 'bg-[#EBF2F7] text-[#1E4263]' :
                        'bg-[#EBEAE3] text-[#434338]'
                      }`}>
                        {sm.type}
                      </span>
                    </td>
                    <td className={`py-2.5 px-4 text-center font-bold font-mono ${
                      sm.quantityChange > 0 ? 'text-[#384923]' : 'text-[#9E3628]'
                    }`}>
                      {sm.quantityChange > 0 ? `+${sm.quantityChange}` : sm.quantityChange}
                    </td>
                    <td className="py-2.5 px-4 text-center font-mono text-[#5A5A40]">
                      {sm.previousStock} → <span className="font-bold text-[#2C2C24]">{sm.newStock}</span>
                    </td>
                    <td className="py-2.5 px-4 text-[#5A5A40]">
                      {sm.referenceNumber ? `[#${sm.referenceNumber}] ` : ''}
                      {sm.reason}
                    </td>
                    <td className="py-2.5 px-4 text-[#787865]">{sm.performedBy}</td>
                  </tr>
                ))}

                {stockMovements.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-[#787865]">
                      No stock movements recorded yet. Movements automatically record on sales, purchases, damages, and returns.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

      </div>

      {/* Adjust Stock Modal */}
      {showAdjustModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="bg-[#FAF9F5] border border-[#E2E1D8] rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-[#2C2C24] mb-3 pb-2 border-b border-[#E2E1D8] flex items-center gap-2">
              <Boxes className="w-5 h-5 text-[#4A5D3F]" />
              <span>{getTranslation(lang, 'stockAdjust')}</span>
            </h3>

            {errorMsg && (
              <div className="mb-3 p-2.5 bg-[#FDF0EE] border border-[#FADCD7] text-[#9E3628] text-xs rounded-xl font-semibold">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSaveAdjust} className="space-y-3 text-xs">
              
              <div>
                <label className="font-semibold text-[#434338] block mb-1">Select Product *</label>
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full p-2.5 border border-[#DCDAD0] rounded-xl text-sm bg-white font-medium text-[#2C2C24]"
                >
                  {products.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} (Current: {p.currentStock} {p.unit})
                    </option>
                  ))}
                </select>
              </div>

              {selectedProduct && (
                <div className="p-2.5 bg-[#F2F1EA] rounded-xl border border-[#E2E1D8] text-[#434338] flex justify-between">
                  <span>Current on Shelf:</span>
                  <span className="font-bold text-[#2C2C24]">{selectedProduct.currentStock} {selectedProduct.unit}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-[#434338] block mb-1">Adjustment Action</label>
                  <div className="flex rounded-xl border border-[#DCDAD0] overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setAdjustAction('subtract')}
                      className={`flex-1 py-2 font-bold cursor-pointer transition-colors ${
                        adjustAction === 'subtract' ? 'bg-[#9E3628] text-white' : 'bg-white text-[#434338] hover:bg-[#EBEAE3]'
                      }`}
                    >
                      - Deduct
                    </button>
                    <button
                      type="button"
                      onClick={() => setAdjustAction('add')}
                      className={`flex-1 py-2 font-bold cursor-pointer transition-colors ${
                        adjustAction === 'add' ? 'bg-[#4A5D3F] text-white' : 'bg-white text-[#434338] hover:bg-[#EBEAE3]'
                      }`}
                    >
                      + Add
                    </button>
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-[#434338] block mb-1">Quantity</label>
                  <input
                    type="number"
                    min="0.1"
                    step="any"
                    required
                    value={adjustQty}
                    onChange={(e) => setAdjustQty(parseFloat(e.target.value) || 0)}
                    className="w-full p-2 bg-white border border-[#DCDAD0] rounded-xl text-sm font-bold text-[#2C2C24]"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-[#434338] block mb-1">Adjustment Reason</label>
                <select
                  value={adjustType}
                  onChange={(e) => setAdjustType(e.target.value as any)}
                  className="w-full p-2.5 border border-[#DCDAD0] rounded-xl text-sm bg-white font-medium text-[#2C2C24]"
                >
                  <option value="damage">Damaged / Broken / Leaked Goods</option>
                  <option value="expired">Expired Past Shelf-Life</option>
                  <option value="manual_adjustment">Physical Stock Count Correction</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-[#434338] block mb-1">Reason / Notes (Optional)</label>
                <input
                  type="text"
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder="e.g. Bag torn during unloading"
                  className="w-full p-2.5 bg-white border border-[#DCDAD0] rounded-xl text-xs text-[#2C2C24]"
                />
              </div>

              <div className="flex gap-2 pt-3 border-t border-[#E2E1D8]">
                <button
                  type="button"
                  onClick={() => setShowAdjustModal(false)}
                  className="flex-1 py-2.5 border border-[#DCDAD0] rounded-xl text-[#5A5A40] font-semibold hover:bg-[#EBEAE3] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#4A5D3F] hover:bg-[#3E5034] text-white rounded-xl font-bold cursor-pointer shadow-2xs"
                >
                  Apply Adjustment
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
