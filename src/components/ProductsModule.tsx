import React, { useState } from 'react';
import { Product, Category, Supplier, UnitType, StoreSettings, Language, UserRole } from '../types';
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  AlertTriangle, 
  Check, 
  Barcode, 
  SlidersHorizontal,
  PackageCheck,
  RefreshCw,
  Eye,
  EyeOff
} from 'lucide-react';
import { getTranslation } from '../i18n/translations';

interface ProductsModuleProps {
  products: Product[];
  categories: Category[];
  suppliers: Supplier[];
  settings: StoreSettings;
  lang: Language;
  userRole: UserRole;
  onSaveProduct: (product: Partial<Product>) => { success: boolean; product?: Product; error?: string };
  onDeleteProduct: (productId: string) => { success: boolean; error?: string };
}

export const ProductsModule: React.FC<ProductsModuleProps> = ({
  products,
  categories,
  suppliers,
  settings,
  lang,
  userRole,
  onSaveProduct,
  onDeleteProduct
}) => {
  const isUrdu = lang === 'ur';

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [stockFilter, setStockFilter] = useState<'all' | 'low' | 'out' | 'active'>('all');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [formError, setFormError] = useState('');

  // Delete Confirm Modal
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const filteredProducts = products.filter(p => {
    // Category filter
    if (selectedCategory !== 'all' && p.categoryId !== selectedCategory) return false;

    // Stock / Status filter
    if (stockFilter === 'low' && (p.currentStock > p.minStockLevel || p.currentStock <= 0)) return false;
    if (stockFilter === 'out' && p.currentStock > 0) return false;
    if (stockFilter === 'active' && p.status !== 'active') return false;

    // Search query
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;

    return (
      p.name.toLowerCase().includes(q) ||
      (p.nameUrdu && p.nameUrdu.includes(q)) ||
      p.barcode.toLowerCase().includes(q) ||
      (p.brand && p.brand.toLowerCase().includes(q))
    );
  });

  const handleOpenAdd = () => {
    setEditingProduct({
      name: '',
      nameUrdu: '',
      barcode: '896' + Math.floor(10000000 + Math.random() * 90000000),
      categoryId: categories[0]?.id || 'cat_staples',
      brand: '',
      unit: 'piece',
      purchasePrice: 0,
      sellingPrice: 0,
      currentStock: 0,
      minStockLevel: 5,
      supplierId: suppliers[0]?.id || '',
      status: 'active'
    });
    setFormError('');
    setShowModal(true);
  };

  const handleOpenEdit = (product: Product) => {
    setEditingProduct({ ...product });
    setFormError('');
    setShowModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    const result = onSaveProduct(editingProduct);
    if (result.success) {
      setShowModal(false);
      setEditingProduct(null);
      setFormError('');
    } else {
      setFormError(result.error || 'Failed to save product.');
    }
  };

  const handleDeleteConfirm = () => {
    if (!deleteTargetId) return;
    onDeleteProduct(deleteTargetId);
    setDeleteTargetId(null);
  };

  return (
    <div id="products-view" className="space-y-4 animate-in fade-in duration-150">
      
      {/* Header & Controls */}
      <div className="bg-[#FAF9F5] p-4 rounded-2xl border border-[#E2E1D8] shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-[#2C2C24] tracking-tight flex items-center gap-2">
            <span>{getTranslation(lang, 'products')}</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#EBEAE3] text-[#434338] font-semibold">
              {products.length} {isUrdu ? 'اشیاء' : 'items'}
            </span>
          </h2>
          <p className="text-xs text-[#787865] mt-0.5">
            Manage your grocery store catalog, prices, barcodes, and inventory thresholds.
          </p>
        </div>

        <button
          id="products-add-btn"
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-[#4A5D3F] hover:bg-[#3E5034] text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-2xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{getTranslation(lang, 'addProduct')}</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-[#FAF9F5] p-3.5 rounded-2xl border border-[#E2E1D8] shadow-2xs flex flex-col sm:flex-row items-center gap-2.5">
        
        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#787865]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, Urdu, brand, or barcode..."
            className="w-full pl-9 pr-4 py-2 bg-white border border-[#DCDAD0] rounded-xl text-xs sm:text-sm text-[#2C2C24] placeholder:text-[#9A988B] focus:outline-none focus:ring-2 focus:ring-[#4A5D3F]"
          />
        </div>

        {/* Category Filter */}
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full sm:w-48 py-2 px-3 bg-white border border-[#DCDAD0] rounded-xl text-xs font-semibold text-[#33332D] focus:outline-none focus:ring-2 focus:ring-[#4A5D3F]"
        >
          <option value="all">{getTranslation(lang, 'allCategories')}</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>
              {isUrdu && c.nameUrdu ? c.nameUrdu : c.name}
            </option>
          ))}
        </select>

        {/* Stock Filter Pills */}
        <div className="flex items-center gap-1 w-full sm:w-auto overflow-x-auto">
          <button
            onClick={() => setStockFilter('all')}
            className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors ${
              stockFilter === 'all' ? 'bg-[#2C2C24] text-[#FAF9F5]' : 'bg-[#EBEAE3] hover:bg-[#E2E1D8] text-[#434338]'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setStockFilter('low')}
            className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors ${
              stockFilter === 'low' ? 'bg-[#8A5214] text-white' : 'bg-[#FDF5EB] hover:bg-[#F7E7D0] text-[#8A5214]'
            }`}
          >
            Low Stock
          </button>
          <button
            onClick={() => setStockFilter('out')}
            className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors ${
              stockFilter === 'out' ? 'bg-[#9E3628] text-white' : 'bg-[#FDF0EE] hover:bg-[#FADCD7] text-[#9E3628]'
            }`}
          >
            Out of Stock
          </button>
        </div>

      </div>

      {/* Products Table */}
      <div className="bg-[#FAF9F5] rounded-2xl border border-[#E2E1D8] shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#F2F1EA] text-[#5A5A40] text-xs uppercase border-b border-[#E2E1D8]">
              <tr>
                <th className="py-3 px-4">Item Name</th>
                <th className="py-3 px-4">Barcode / Category</th>
                <th className="py-3 px-4">Unit</th>
                {userRole === 'admin' && <th className="py-3 px-4 text-right">Cost Price</th>}
                <th className="py-3 px-4 text-right">Selling Price</th>
                <th className="py-3 px-4 text-center">Stock</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EBEAE3] bg-white">
              {filteredProducts.map(prod => {
                const category = categories.find(c => c.id === prod.categoryId);
                const isLow = prod.currentStock <= prod.minStockLevel && prod.currentStock > 0;
                const isOut = prod.currentStock <= 0;

                return (
                  <tr key={prod.id} className="hover:bg-[#F5F5F0] transition-colors">
                    
                    {/* Name */}
                    <td className="py-3 px-4">
                      <div className="font-bold text-[#2C2C24]">
                        {isUrdu && prod.nameUrdu ? prod.nameUrdu : prod.name}
                      </div>
                      <div className="text-xs text-[#787865]">
                        {prod.name} {prod.brand ? `• ${prod.brand}` : ''}
                      </div>
                    </td>

                    {/* Barcode & Category */}
                    <td className="py-3 px-4 text-xs">
                      <div className="font-mono text-[#434338]">{prod.barcode}</div>
                      <div className="text-[#787865]">{category?.name || 'General'}</div>
                    </td>

                    {/* Unit */}
                    <td className="py-3 px-4 text-xs font-semibold uppercase text-[#5A5A40]">
                      {prod.unit}
                    </td>

                    {/* Cost (Admin Only) */}
                    {userRole === 'admin' && (
                      <td className="py-3 px-4 text-right text-xs font-mono text-[#5A5A40]">
                        {settings.currencySymbol} {prod.purchasePrice}
                      </td>
                    )}

                    {/* Selling Price */}
                    <td className="py-3 px-4 text-right font-bold text-[#384923]">
                      {settings.currencySymbol} {prod.sellingPrice}
                    </td>

                    {/* Current Stock */}
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        isOut 
                          ? 'bg-[#FDF0EE] text-[#9E3628]' 
                          : isLow 
                          ? 'bg-[#FDF5EB] text-[#8A5214]' 
                          : 'bg-[#EEF4EC] text-[#24331C]'
                      }`}>
                        {prod.currentStock} {prod.unit}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                        prod.status === 'active' ? 'bg-[#EBEAE3] text-[#434338]' : 'bg-[#FDF0EE] text-[#9E3628]'
                      }`}>
                        {prod.status}
                      </span>
                    </td>

                    {/* Action buttons */}
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(prod)}
                          className="p-1.5 text-[#5A5A40] hover:text-[#24331C] hover:bg-[#EEF4EC] rounded-lg transition-colors cursor-pointer"
                          title="Edit Product"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        {userRole === 'admin' && (
                          <button
                            onClick={() => setDeleteTargetId(prod.id)}
                            className="p-1.5 text-[#9A988B] hover:text-[#9E3628] hover:bg-[#FDF0EE] rounded-lg transition-colors cursor-pointer"
                            title="Delete / Deactivate Product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>

                  </tr>
                );
              })}

              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={userRole === 'admin' ? 8 : 7} className="py-12 text-center text-[#787865]">
                    No grocery products found matching filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {showModal && editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs overflow-y-auto">
          <div className="bg-[#FAF9F5] border border-[#E2E1D8] rounded-2xl max-w-lg w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 my-auto">
            
            <h3 className="text-lg font-bold text-[#2C2C24] mb-4 pb-2 border-b border-[#E2E1D8]">
              {editingProduct.id ? getTranslation(lang, 'editProduct') : getTranslation(lang, 'addProduct')}
            </h3>

            {formError && (
              <div className="mb-4 p-3 bg-[#FDF0EE] border border-[#FADCD7] text-[#9E3628] text-xs font-semibold rounded-xl">
                {formError}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-3.5 text-xs">
              
              {/* Product Name English & Urdu */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-[#434338] block mb-1">
                    {getTranslation(lang, 'productName')} *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingProduct.name || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                    placeholder="e.g. Basmati Rice 1kg"
                    className="w-full px-3 py-2 bg-white border border-[#DCDAD0] rounded-lg text-sm text-[#2C2C24]"
                  />
                </div>

                <div>
                  <label className="font-semibold text-[#434338] block mb-1">
                    {getTranslation(lang, 'productNameUrdu')}
                  </label>
                  <input
                    type="text"
                    value={editingProduct.nameUrdu || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, nameUrdu: e.target.value })}
                    placeholder="مثال: باسمتی چاول"
                    className="w-full px-3 py-2 bg-white border border-[#DCDAD0] rounded-lg text-sm text-[#2C2C24]"
                    dir="rtl"
                  />
                </div>
              </div>

              {/* Barcode & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="font-semibold text-[#434338]">{getTranslation(lang, 'barcode')}</label>
                    <button
                      type="button"
                      onClick={() => setEditingProduct({ ...editingProduct, barcode: '896' + Math.floor(10000000 + Math.random() * 90000000) })}
                      className="text-[10px] text-[#4A5D3F] font-bold hover:underline"
                    >
                      Generate New
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    value={editingProduct.barcode || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, barcode: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#DCDAD0] rounded-lg font-mono text-sm text-[#2C2C24]"
                  />
                </div>

                <div>
                  <label className="font-semibold text-[#434338] block mb-1">{getTranslation(lang, 'category')}</label>
                  <select
                    value={editingProduct.categoryId || 'cat_staples'}
                    onChange={(e) => setEditingProduct({ ...editingProduct, categoryId: e.target.value })}
                    className="w-full px-3 py-2 border border-[#DCDAD0] rounded-lg text-sm bg-white text-[#2C2C24]"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.nameUrdu})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Unit & Brand */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-[#434338] block mb-1">{getTranslation(lang, 'unit')}</label>
                  <select
                    value={editingProduct.unit || 'piece'}
                    onChange={(e) => setEditingProduct({ ...editingProduct, unit: e.target.value as UnitType })}
                    className="w-full px-3 py-2 border border-[#DCDAD0] rounded-lg text-sm bg-white text-[#2C2C24]"
                  >
                    <option value="piece">Piece (عدد / پیس)</option>
                    <option value="kg">Kg (کلوگرام)</option>
                    <option value="gram">Gram (گرام)</option>
                    <option value="liter">Liter (لیٹر)</option>
                    <option value="ml">ml (ملی لیٹر)</option>
                    <option value="dozen">Dozen (درجن)</option>
                    <option value="packet">Packet (پیکٹ)</option>
                    <option value="box">Box (ڈبہ)</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-[#434338] block mb-1">{getTranslation(lang, 'brand')}</label>
                  <input
                    type="text"
                    value={editingProduct.brand || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, brand: e.target.value })}
                    placeholder="e.g. Dalda, National, Olpers"
                    className="w-full px-3 py-2 bg-white border border-[#DCDAD0] rounded-lg text-sm text-[#2C2C24]"
                  />
                </div>
              </div>

              {/* Cost & Selling Price */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-[#434338] block mb-1">
                    {getTranslation(lang, 'purchasePrice')} ({settings.currencySymbol}) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    required
                    value={editingProduct.purchasePrice ?? ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, purchasePrice: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-white border border-[#DCDAD0] rounded-lg text-sm font-bold text-[#2C2C24]"
                  />
                </div>

                <div>
                  <label className="font-semibold text-[#434338] block mb-1">
                    {getTranslation(lang, 'sellingPrice')} ({settings.currencySymbol}) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    required
                    value={editingProduct.sellingPrice ?? ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, sellingPrice: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-[#DCDAD0] rounded-lg text-sm font-black text-[#384923]"
                  />
                </div>
              </div>

              {/* Initial Stock & Min Stock Level */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-[#434338] block mb-1">
                    {getTranslation(lang, 'currentStock')}
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={editingProduct.currentStock ?? 0}
                    onChange={(e) => setEditingProduct({ ...editingProduct, currentStock: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-[#DCDAD0] rounded-lg text-sm font-semibold text-[#2C2C24]"
                  />
                </div>

                <div>
                  <label className="font-semibold text-[#434338] block mb-1">
                    {getTranslation(lang, 'minStock')}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={editingProduct.minStockLevel ?? 5}
                    onChange={(e) => setEditingProduct({ ...editingProduct, minStockLevel: parseFloat(e.target.value) || 5 })}
                    className="w-full px-3 py-2 border border-[#DCDAD0] rounded-lg text-sm text-[#2C2C24]"
                  />
                </div>
              </div>

              {/* Supplier & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-[#434338] block mb-1">{getTranslation(lang, 'supplier')}</label>
                  <select
                    value={editingProduct.supplierId || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, supplierId: e.target.value })}
                    className="w-full px-3 py-2 border border-[#DCDAD0] rounded-lg text-sm bg-white text-[#2C2C24]"
                  >
                    <option value="">None / Market</option>
                    {suppliers.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-[#434338] block mb-1">{getTranslation(lang, 'status')}</label>
                  <select
                    value={editingProduct.status || 'active'}
                    onChange={(e) => setEditingProduct({ ...editingProduct, status: e.target.value as 'active' | 'inactive' })}
                    className="w-full px-3 py-2 border border-[#DCDAD0] rounded-lg text-sm bg-white text-[#2C2C24]"
                  >
                    <option value="active">Active (دستیاب)</option>
                    <option value="inactive">Inactive (غیر فعال)</option>
                  </select>
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="flex gap-2 pt-3 border-t border-[#E2E1D8]">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 border border-[#DCDAD0] rounded-xl text-[#5A5A40] font-semibold hover:bg-[#EBEAE3] cursor-pointer"
                >
                  {getTranslation(lang, 'cancel')}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#4A5D3F] hover:bg-[#3E5034] text-white rounded-xl font-bold shadow-2xs cursor-pointer"
                >
                  {getTranslation(lang, 'save')}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTargetId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="bg-[#FAF9F5] border border-[#E2E1D8] rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-full bg-[#FDF0EE] text-[#9E3628] flex items-center justify-center mx-auto mb-3">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-center text-[#2C2C24] mb-1">
              {getTranslation(lang, 'deleteProduct')}
            </h3>
            <p className="text-xs text-center text-[#787865] mb-4">
              {getTranslation(lang, 'confirmDelete')}
              <br />
              <span className="text-[11px] text-[#9A988B] mt-1 block">
                (If item has previous sales, it will be safely deactivated to preserve accounting history).
              </span>
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setDeleteTargetId(null)}
                className="flex-1 py-2 border border-[#DCDAD0] rounded-xl text-xs font-semibold text-[#5A5A40] hover:bg-[#EBEAE3]"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="flex-1 py-2 bg-[#9E3628] hover:bg-[#7D291E] text-white rounded-xl text-xs font-bold"
              >
                Delete / Deactivate
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
