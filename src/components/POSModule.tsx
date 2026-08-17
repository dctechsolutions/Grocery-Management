import React, { useState, useEffect, useRef } from 'react';
import { 
  Product, 
  Category, 
  Customer, 
  CartItem, 
  PaymentMethod, 
  StoreSettings, 
  Language, 
  Sale 
} from '../types';
import { 
  Search, 
  Plus, 
  Minus, 
  Trash2, 
  ShoppingCart, 
  CheckCircle, 
  UserPlus, 
  AlertCircle, 
  ScanLine, 
  Layers, 
  ArrowRight,
  RotateCcw,
  Sparkles,
  CreditCard,
  Banknote,
  DollarSign
} from 'lucide-react';
import { getTranslation } from '../i18n/translations';

interface POSModuleProps {
  products: Product[];
  categories: Category[];
  customers: Customer[];
  settings: StoreSettings;
  lang: Language;
  onCompleteSale: (
    items: CartItem[],
    discountTotal: number,
    paidAmount: number,
    paymentMethod: PaymentMethod,
    customerId?: string,
    notes?: string
  ) => { success: boolean; sale?: Sale; error?: string };
  onAddCustomer: (customer: Partial<Customer>) => void;
  onOpenReceipt: (sale: Sale) => void;
}

export const POSModule: React.FC<POSModuleProps> = ({
  products,
  categories,
  customers,
  settings,
  lang,
  onCompleteSale,
  onAddCustomer,
  onOpenReceipt
}) => {
  const isUrdu = lang === 'ur';

  // POS Local State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [cashReceived, setCashReceived] = useState<string>('');
  const [posNotes, setPosNotes] = useState<string>('');
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Fast New Customer Quick Modal in POS
  const [showQuickCustModal, setShowQuickCustModal] = useState(false);
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');

  // Barcode / Search Input Ref
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    searchInputRef.current?.focus();
  }, []);

  // Filter Products
  const filteredProducts = products.filter(p => {
    if (p.status === 'inactive') return false;
    const matchCategory = selectedCategory === 'all' || p.categoryId === selectedCategory;
    const q = searchQuery.toLowerCase().trim();
    if (!q) return matchCategory;

    const matchName = p.name.toLowerCase().includes(q);
    const matchNameUrdu = p.nameUrdu ? p.nameUrdu.includes(q) : false;
    const matchBarcode = p.barcode.toLowerCase().includes(q);
    const matchBrand = p.brand ? p.brand.toLowerCase().includes(q) : false;

    return matchCategory && (matchName || matchNameUrdu || matchBarcode || matchBrand);
  });

  // Handle Exact Barcode Match (auto-add)
  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    const exactMatch = products.find(
      p => p.status === 'active' && (p.barcode === val.trim() || p.barcode === val.replace(/\r|\n/g, '').trim())
    );
    if (exactMatch) {
      addToCart(exactMatch);
      setSearchQuery('');
    }
  };

  // Add Product to Cart
  const addToCart = (product: Product, quantityToAdd: number = 1) => {
    if (product.currentStock <= 0) {
      showNotice('error', `${product.name} is Out of Stock!`);
      return;
    }

    setCart(prevCart => {
      const existingIndex = prevCart.findIndex(item => item.product.id === product.id);
      if (existingIndex > -1) {
        const updated = [...prevCart];
        const newQty = updated[existingIndex].quantity + quantityToAdd;
        
        if (newQty > product.currentStock) {
          showNotice('error', `Only ${product.currentStock} ${product.unit} available in stock.`);
          return prevCart;
        }

        updated[existingIndex].quantity = newQty;
        updated[existingIndex].total = newQty * updated[existingIndex].sellingPrice;
        return updated;
      } else {
        const item: CartItem = {
          product,
          quantity: quantityToAdd,
          sellingPrice: product.sellingPrice,
          purchasePrice: product.purchasePrice,
          total: quantityToAdd * product.sellingPrice,
          discountPercent: 0
        };
        return [...prevCart, item];
      }
    });

    showNotice('success', `Added: ${product.name}`);
  };

  // Update Cart Item Quantity
  const updateQuantity = (productId: string, delta: number) => {
    setCart(prevCart => {
      return prevCart
        .map(item => {
          if (item.product.id === productId) {
            const newQty = Math.max(0.1, Number((item.quantity + delta).toFixed(2)));
            if (newQty > item.product.currentStock) {
              showNotice('error', `Max stock available is ${item.product.currentStock} ${item.product.unit}`);
              return item;
            }
            return {
              ...item,
              quantity: newQty,
              total: newQty * item.sellingPrice
            };
          }
          return item;
        })
        .filter(item => item.quantity > 0);
    });
  };

  // Direct set custom quantity
  const setDirectQuantity = (productId: string, rawVal: string) => {
    const parsed = parseFloat(rawVal);
    if (isNaN(parsed) || parsed <= 0) return;

    setCart(prevCart => {
      return prevCart.map(item => {
        if (item.product.id === productId) {
          const qty = Math.min(item.product.currentStock, parsed);
          return {
            ...item,
            quantity: qty,
            total: qty * item.sellingPrice
          };
        }
        return item;
      });
    });
  };

  // Remove from cart
  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(i => i.product.id !== productId));
  };

  // Clear entire cart
  const handleClearCart = () => {
    if (cart.length === 0) return;
    setCart([]);
    setDiscountAmount(0);
    setCashReceived('');
    setSelectedCustomerId('');
    setPosNotes('');
  };

  // Calculations
  const subtotal = cart.reduce((acc, item) => acc + item.total, 0);
  const grandTotal = Math.max(0, subtotal - (Number(discountAmount) || 0));
  const numericCashReceived = parseFloat(cashReceived) || 0;
  const changeToReturn = paymentMethod === 'credit' ? 0 : Math.max(0, numericCashReceived - grandTotal);

  // Notice Toast helper
  const showNotice = (type: 'success' | 'error', text: string) => {
    setFeedbackMsg({ type, text });
    setTimeout(() => {
      setFeedbackMsg(prev => (prev?.text === text ? null : prev));
    }, 2500);
  };

  // Selected customer details
  const selectedCustomer = customers.find(c => c.id === selectedCustomerId);

  // Quick Customer Creation
  const handleCreateQuickCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName.trim() || !newCustPhone.trim()) return;

    const newCust: Partial<Customer> = {
      name: newCustName.trim(),
      phone: newCustPhone.trim(),
      outstandingCredit: 0,
      creditLimit: 10000
    };
    onAddCustomer(newCust);
    setShowQuickCustModal(false);
    setNewCustName('');
    setNewCustPhone('');
    showNotice('success', 'Customer added!');
  };

  // Submit and Complete Sale
  const handleCheckout = () => {
    if (cart.length === 0) {
      showNotice('error', getTranslation(lang, 'emptyCart'));
      return;
    }

    if (paymentMethod === 'credit' && !selectedCustomerId) {
      showNotice('error', 'Please select a customer for Udhaar/Credit sale.');
      return;
    }

    const paid = paymentMethod === 'credit' ? 0 : (numericCashReceived || grandTotal);

    const result = onCompleteSale(
      cart,
      Number(discountAmount) || 0,
      paid,
      paymentMethod,
      selectedCustomerId || undefined,
      posNotes || undefined
    );

    if (result.success && result.sale) {
      setCart([]);
      setDiscountAmount(0);
      setCashReceived('');
      setSelectedCustomerId('');
      setPosNotes('');
      showNotice('success', `Sale Completed! Invoice #${result.sale.invoiceNumber}`);
      
      // Auto open receipt for printing
      if (settings.autoPrintReceipt) {
        onOpenReceipt(result.sale);
      }
      searchInputRef.current?.focus();
    } else {
      showNotice('error', result.error || 'Failed to complete sale.');
    }
  };

  return (
    <div id="pos-screen" className="h-[calc(100vh-5rem)] flex flex-col lg:flex-row gap-4 overflow-hidden animate-in fade-in duration-150">
      
      {/* LEFT COLUMN: Product Catalog & Fast Search */}
      <div className="flex-1 flex flex-col bg-[#FAF9F5] rounded-2xl border border-[#E2E1D8] shadow-2xs overflow-hidden">
        
        {/* Search Bar & Scanner Input */}
        <div className="p-3.5 border-b border-[#EBEAE3] bg-[#F2F1EA]/60 flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#787865]" />
            <input
              ref={searchInputRef}
              id="pos-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder={getTranslation(lang, 'searchProduct')}
              className="w-full pl-10 pr-10 py-3 bg-white rounded-xl border border-[#DCDAD0] focus:outline-none focus:ring-2 focus:ring-[#4A5D3F] focus:border-[#4A5D3F] font-medium text-sm text-[#2C2C24] placeholder:text-[#9A988B] shadow-2xs"
            />
            {searchQuery ? (
              <button 
                onClick={() => { setSearchQuery(''); searchInputRef.current?.focus(); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#787865] hover:text-[#434338] cursor-pointer"
              >
                ✕
              </button>
            ) : (
              <ScanLine className="w-5 h-5 absolute right-3.5 top-1/2 -translate-y-1/2 text-[#4A5D3F] opacity-70" />
            )}
          </div>
        </div>

        {/* Category Pills Slider */}
        <div className="px-3.5 py-2.5 border-b border-[#EBEAE3] bg-[#FAF9F5] flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-[#2C2C24] text-[#FAF9F5] shadow-2xs'
                : 'bg-[#EBEAE3] hover:bg-[#E2E1D8] text-[#434338]'
            }`}
          >
            {getTranslation(lang, 'allCategories')} ({products.length})
          </button>

          {categories.map(cat => {
            const count = products.filter(p => p.categoryId === cat.id && p.status === 'active').length;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
                  selectedCategory === cat.id
                    ? 'bg-[#4A5D3F] text-white shadow-2xs font-bold'
                    : 'bg-[#EBEAE3] hover:bg-[#E2E1D8] text-[#434338]'
                }`}
              >
                <span>{isUrdu && cat.nameUrdu ? cat.nameUrdu : cat.name}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${selectedCategory === cat.id ? 'bg-[#384923] text-white' : 'bg-[#DCDAD0] text-[#434338]'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Products Grid */}
        <div className="flex-1 p-3.5 overflow-y-auto bg-[#F5F5F0]">
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
            {filteredProducts.map(product => {
              const inCart = cart.find(i => i.product.id === product.id);
              const isLow = product.currentStock <= product.minStockLevel && product.currentStock > 0;
              const isOut = product.currentStock <= 0;

              return (
                <div
                  key={product.id}
                  onClick={() => !isOut && addToCart(product)}
                  className={`bg-white rounded-xl p-3 border transition-all flex flex-col justify-between select-none relative group ${
                    isOut 
                      ? 'opacity-50 border-[#E2E1D8] cursor-not-allowed bg-[#EBEAE3]' 
                      : 'border-[#E2E1D8] hover:border-[#4A5D3F] hover:shadow-sm cursor-pointer active:scale-98'
                  } ${inCart ? 'ring-2 ring-[#4A5D3F] border-[#4A5D3F] bg-[#EEF4EC]/40' : ''}`}
                >
                  {/* Stock Alert Badge */}
                  <div className="flex items-start justify-between gap-1 mb-1">
                    <span className="text-[10px] uppercase font-mono text-[#787865] tracking-wider">
                      {product.unit}
                    </span>
                    {isOut ? (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#FDF0EE] text-[#9E3628]">
                        Out
                      </span>
                    ) : isLow ? (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#FDF5EB] text-[#8A5214]">
                        {product.currentStock} left
                      </span>
                    ) : (
                      <span className="text-[11px] font-medium text-[#787865]">
                        Stock: {product.currentStock}
                      </span>
                    )}
                  </div>

                  {/* Product Title */}
                  <div className="my-1">
                    <h4 className="font-bold text-[#2C2C24] text-sm line-clamp-2 leading-tight">
                      {isUrdu && product.nameUrdu ? product.nameUrdu : product.name}
                    </h4>
                    {isUrdu && product.nameUrdu && (
                      <p className="text-[10px] text-[#787865] truncate mt-0.5">{product.name}</p>
                    )}
                  </div>

                  {/* Price & Add Indicator */}
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#EBEAE3]">
                    <span className="font-extrabold text-base text-[#384923]">
                      {settings.currencySymbol} {product.sellingPrice}
                    </span>
                    
                    {inCart ? (
                      <span className="px-2 py-0.5 rounded-lg bg-[#4A5D3F] text-white font-bold text-xs flex items-center gap-1">
                        {inCart.quantity} {product.unit}
                      </span>
                    ) : (
                      <span className="w-6 h-6 rounded-lg bg-[#EBEAE3] group-hover:bg-[#4A5D3F] group-hover:text-white text-[#434338] flex items-center justify-center transition-colors">
                        <Plus className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>
                </div>
              );
            })}

            {filteredProducts.length === 0 && (
              <div className="col-span-full py-16 text-center text-[#787865]">
                <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50 text-[#787865]" />
                <p className="font-medium text-sm">No grocery products found matching "{searchQuery}"</p>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* RIGHT COLUMN: Shopping Cart & Checkout Panel */}
      <div className="w-full lg:w-[420px] bg-[#FAF9F5] rounded-2xl border border-[#E2E1D8] shadow-2xs flex flex-col overflow-hidden">
        
        {/* Cart Header */}
        <div className="p-3.5 border-b border-[#3D3E32] bg-[#2C2C24] text-[#FAF9F5] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-[#C7DDB8]" />
            <span className="font-bold text-base">{getTranslation(lang, 'cart')}</span>
            <span className="px-2 py-0.5 bg-[#4A5D3F]/50 text-[#D0E2C4] rounded-full text-xs font-semibold">
              {cart.reduce((sum, i) => sum + i.quantity, 0)} items
            </span>
          </div>

          {cart.length > 0 && (
            <button
              id="pos-clear-cart-btn"
              onClick={handleClearCart}
              className="text-xs text-[#F5CEC7] hover:text-white flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{getTranslation(lang, 'clearCart')}</span>
            </button>
          )}
        </div>

        {/* Customer Selector (Udhaar / Cash) */}
        <div className="p-2.5 bg-[#F2F1EA] border-b border-[#E2E1D8] flex items-center gap-2">
          <select
            id="pos-customer-select"
            value={selectedCustomerId}
            onChange={(e) => setSelectedCustomerId(e.target.value)}
            className="flex-1 text-xs py-2 px-2.5 bg-white rounded-lg border border-[#DCDAD0] font-medium text-[#2C2C24] focus:outline-none focus:ring-2 focus:ring-[#4A5D3F]"
          >
            <option value="">{getTranslation(lang, 'walkInCustomer')}</option>
            {customers.map(c => (
              <option key={c.id} value={c.id}>
                👤 {c.name} {c.outstandingCredit > 0 ? `(Udhaar: Rs. ${c.outstandingCredit.toLocaleString()})` : ''}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => setShowQuickCustModal(true)}
            className="p-2 rounded-lg bg-white border border-[#DCDAD0] hover:bg-[#EBEAE3] text-[#434338] text-xs font-semibold flex items-center gap-1 cursor-pointer shrink-0"
            title="Add New Customer"
          >
            <UserPlus className="w-4 h-4 text-[#4A5D3F]" />
          </button>
        </div>

        {/* Customer Balance Alert if Selected */}
        {selectedCustomer && selectedCustomer.outstandingCredit > 0 && (
          <div className="px-3 py-1.5 bg-[#FDF5EB] border-b border-[#F5DEC2] text-[#6D3D08] text-xs font-medium flex justify-between items-center">
            <span>Previous Udhaar Balance:</span>
            <span className="font-bold text-[#8A5214]">{settings.currencySymbol} {selectedCustomer.outstandingCredit.toLocaleString()}</span>
          </div>
        )}

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2 divide-y divide-[#EBEAE3] bg-white">
          {cart.map(item => (
            <div key={item.product.id} className="pt-2 first:pt-0 flex items-center justify-between gap-2">
              
              {/* Item Info */}
              <div className="flex-1 min-w-0 pr-1">
                <p className="font-bold text-[#2C2C24] text-sm truncate">
                  {isUrdu && item.product.nameUrdu ? item.product.nameUrdu : item.product.name}
                </p>
                <div className="flex items-center gap-2 text-xs text-[#787865] mt-0.5">
                  <span>{settings.currencySymbol} {item.sellingPrice} / {item.product.unit}</span>
                </div>
              </div>

              {/* Quantity Controls (+ / - / direct input) */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => updateQuantity(item.product.id, -1)}
                  className="w-7 h-7 rounded-lg bg-[#EBEAE3] hover:bg-[#DCDAD0] text-[#33332D] font-bold flex items-center justify-center cursor-pointer active:scale-95"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>

                <input
                  type="number"
                  step="any"
                  value={item.quantity}
                  onChange={(e) => setDirectQuantity(item.product.id, e.target.value)}
                  className="w-12 text-center py-1 text-xs font-bold border border-[#DCDAD0] rounded-md focus:ring-1 focus:ring-[#4A5D3F] bg-white text-[#2C2C24]"
                />

                <button
                  type="button"
                  onClick={() => updateQuantity(item.product.id, 1)}
                  className="w-7 h-7 rounded-lg bg-[#EBEAE3] hover:bg-[#DCDAD0] text-[#33332D] font-bold flex items-center justify-center cursor-pointer active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Item Total & Remove */}
              <div className="text-right shrink-0 min-w-[70px]">
                <div className="font-bold text-[#2C2C24] text-sm">
                  {settings.currencySymbol} {item.total.toLocaleString()}
                </div>
                <button
                  type="button"
                  onClick={() => removeFromCart(item.product.id)}
                  className="text-[11px] text-[#9E3628] hover:underline cursor-pointer"
                >
                  Remove
                </button>
              </div>

            </div>
          ))}

          {cart.length === 0 && (
            <div className="py-16 text-center text-[#787865]">
              <ShoppingCart className="w-10 h-10 mx-auto mb-2 opacity-30 text-[#787865]" />
              <p className="text-sm font-medium">{getTranslation(lang, 'emptyCart')}</p>
              <p className="text-xs text-[#787865] mt-1">Scan barcode or click items from catalog</p>
            </div>
          )}
        </div>

        {/* Financial Summary & Payment Options */}
        <div className="p-3.5 bg-[#F2F1EA] border-t border-[#E2E1D8] space-y-3">
          
          {/* Subtotal & Discount Row */}
          <div className="space-y-1 text-xs text-[#5A5A40]">
            <div className="flex justify-between">
              <span>{getTranslation(lang, 'subtotal')}:</span>
              <span className="font-semibold text-[#2C2C24]">{settings.currencySymbol} {subtotal.toLocaleString()}</span>
            </div>

            <div className="flex items-center justify-between gap-2">
              <span>{getTranslation(lang, 'discount')} (Rs):</span>
              <input
                id="pos-discount-input"
                type="number"
                min="0"
                value={discountAmount || ''}
                onChange={(e) => setDiscountAmount(Math.max(0, parseFloat(e.target.value) || 0))}
                placeholder="0"
                className="w-20 text-right py-0.5 px-2 bg-white border border-[#DCDAD0] rounded text-xs font-semibold text-[#9E3628]"
              />
            </div>

            {/* GRAND TOTAL */}
            <div className="flex justify-between items-center text-base font-black text-[#2C2C24] pt-2 border-t border-[#DCDAD0]">
              <span className="tracking-tight">{getTranslation(lang, 'grandTotal')}:</span>
              <span className="text-xl text-[#384923] font-mono">
                {settings.currencySymbol} {grandTotal.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="text-[11px] font-bold text-[#5A5A40] uppercase tracking-wider block mb-1.5">
              {getTranslation(lang, 'paymentMethod')}
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                id="payment-cash-btn"
                onClick={() => setPaymentMethod('cash')}
                className={`py-2 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  paymentMethod === 'cash'
                    ? 'bg-[#4A5D3F] text-white shadow-2xs'
                    : 'bg-white border border-[#DCDAD0] text-[#434338] hover:bg-[#EBEAE3]'
                }`}
              >
                <Banknote className="w-3.5 h-3.5" />
                <span>{getTranslation(lang, 'cash')}</span>
              </button>

              <button
                type="button"
                id="payment-credit-btn"
                onClick={() => setPaymentMethod('credit')}
                className={`py-2 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  paymentMethod === 'credit'
                    ? 'bg-[#8A5214] text-white shadow-2xs'
                    : 'bg-white border border-[#DCDAD0] text-[#434338] hover:bg-[#EBEAE3]'
                }`}
              >
                <DollarSign className="w-3.5 h-3.5" />
                <span>{getTranslation(lang, 'creditUdhaar')}</span>
              </button>

              <button
                type="button"
                id="payment-split-btn"
                onClick={() => setPaymentMethod('split')}
                className={`py-2 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  paymentMethod === 'split'
                    ? 'bg-[#5A5A40] text-white shadow-2xs'
                    : 'bg-white border border-[#DCDAD0] text-[#434338] hover:bg-[#EBEAE3]'
                }`}
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>{getTranslation(lang, 'splitPayment')}</span>
              </button>
            </div>
          </div>

          {/* Cash Received & Quick Currency Buttons (Only for Cash / Split) */}
          {paymentMethod !== 'credit' && (
            <div className="space-y-2 pt-1 border-t border-[#DCDAD0]">
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <label className="text-[11px] font-semibold text-[#5A5A40] block mb-0.5">
                    {getTranslation(lang, 'amountReceived')} ({settings.currencySymbol}):
                  </label>
                  <input
                    id="pos-cash-received-input"
                    type="number"
                    value={cashReceived}
                    onChange={(e) => setCashReceived(e.target.value)}
                    placeholder={grandTotal.toString()}
                    className="w-full px-3 py-1.5 bg-white border border-[#DCDAD0] rounded-lg text-sm font-bold text-[#2C2C24]"
                  />
                </div>

                <div className="flex-1">
                  <label className="text-[11px] font-semibold text-[#5A5A40] block mb-0.5">
                    {getTranslation(lang, 'changeToReturn')}:
                  </label>
                  <div className="px-3 py-1.5 bg-[#EEF4EC] border border-[#D4E4CE] rounded-lg text-sm font-black text-[#24331C] text-right">
                    {settings.currencySymbol} {changeToReturn.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Quick Cash Note Buttons */}
              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pt-1">
                <button
                  type="button"
                  onClick={() => setCashReceived(grandTotal.toString())}
                  className="px-2 py-1 bg-white hover:bg-[#EBEAE3] border border-[#DCDAD0] rounded text-[11px] font-bold text-[#434338] cursor-pointer whitespace-nowrap"
                >
                  {getTranslation(lang, 'exactAmount')}
                </button>
                {[100, 500, 1000, 5000].map(val => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setCashReceived(val.toString())}
                    className="px-2 py-1 bg-white hover:bg-[#EBEAE3] border border-[#DCDAD0] rounded text-[11px] font-semibold text-[#434338] cursor-pointer whitespace-nowrap"
                  >
                    +{val}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Toast / Feedback Notice */}
          {feedbackMsg && (
            <div className={`p-2 rounded-lg text-xs font-bold text-center ${
              feedbackMsg.type === 'success' ? 'bg-[#EEF4EC] text-[#24331C]' : 'bg-[#FDF0EE] text-[#9E3628]'
            }`}>
              {feedbackMsg.text}
            </div>
          )}

          {/* GIANT COMPLETE SALE BUTTON */}
          <button
            id="pos-complete-sale-btn"
            type="button"
            disabled={cart.length === 0}
            onClick={handleCheckout}
            className={`w-full py-4 rounded-xl text-base font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer ${
              cart.length === 0
                ? 'bg-[#DCDAD0] text-[#787865] cursor-not-allowed'
                : 'bg-[#4A5D3F] hover:bg-[#3E5034] text-white active:scale-98 shadow-sm'
            }`}
          >
            <CheckCircle className="w-5 h-5" />
            <span>{getTranslation(lang, 'completeSale')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

        </div>

      </div>

      {/* Quick Customer Modal */}
      {showQuickCustModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="bg-[#FAF9F5] border border-[#E2E1D8] rounded-2xl p-5 max-w-sm w-full shadow-xl">
            <h3 className="font-bold text-base text-[#2C2C24] mb-3">{getTranslation(lang, 'addCustomer')}</h3>
            <form onSubmit={handleCreateQuickCustomer} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-[#434338] block mb-1">Name:</label>
                <input
                  type="text"
                  required
                  value={newCustName}
                  onChange={(e) => setNewCustName(e.target.value)}
                  placeholder="e.g. Haji Irfan"
                  className="w-full px-3 py-2 border border-[#DCDAD0] bg-white text-[#2C2C24] rounded-lg text-sm"
                  autoFocus
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-[#434338] block mb-1">Phone:</label>
                <input
                  type="text"
                  required
                  value={newCustPhone}
                  onChange={(e) => setNewCustPhone(e.target.value)}
                  placeholder="0300-1234567"
                  className="w-full px-3 py-2 border border-[#DCDAD0] bg-white text-[#2C2C24] rounded-lg text-sm"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowQuickCustModal(false)}
                  className="flex-1 py-2 border border-[#DCDAD0] rounded-lg text-xs font-semibold text-[#5A5A40] hover:bg-[#EBEAE3]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-[#4A5D3F] hover:bg-[#3E5034] text-white rounded-lg text-xs font-bold"
                >
                  Save Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
