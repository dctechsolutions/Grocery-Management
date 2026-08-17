import React, { useState, useEffect } from 'react';
import { 
  StoreState, 
  Product, 
  Sale, 
  Expense, 
  Customer, 
  Supplier, 
  CartItem, 
  PaymentMethod, 
  Language, 
  User, 
  UserRole, 
  StoreSettings,
  SaleReturn
} from './types';
import { StorageService } from './services/storage';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { POSModule } from './components/POSModule';
import { ProductsModule } from './components/ProductsModule';
import { InventoryModule } from './components/InventoryModule';
import { PurchasesModule } from './components/PurchasesModule';
import { CustomersModule } from './components/CustomersModule';
import { SuppliersModule } from './components/SuppliersModule';
import { ExpensesModule } from './components/ExpensesModule';
import { CashDrawerModule } from './components/CashDrawerModule';
import { SalesHistoryModule } from './components/SalesHistoryModule';
import { ReturnsModule } from './components/ReturnsModule';
import { ReportsModule } from './components/ReportsModule';
import { BackupRestoreModule } from './components/BackupRestoreModule';
import { SettingsModule } from './components/SettingsModule';
import { XamppExportModal } from './components/XamppExportModal';
import { ReceiptModal } from './components/ReceiptModal';

import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  Boxes, 
  Truck, 
  Users, 
  Building2, 
  Receipt, 
  DollarSign, 
  History, 
  RotateCcw, 
  BarChart3, 
  Database, 
  Settings as SettingsIcon,
  FileCode2
} from 'lucide-react';
import { getTranslation } from './i18n/translations';

export default function App() {
  // Master Store State
  const [storeState, setStoreState] = useState<StoreState>(() => StorageService.loadState());
  
  // Navigation & View
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [currentLang, setCurrentLang] = useState<Language>(storeState.settings.defaultLanguage || 'en');
  
  // Active User / Role
  const [currentUser, setCurrentUser] = useState<User>(storeState.users[0] || {
    id: 'user_1',
    name: 'Admin Owner',
    role: 'admin',
    pin: '1234',
    status: 'active'
  });

  // Receipt Modal State
  const [receiptSale, setReceiptSale] = useState<Sale | null>(null);

  // Return Pre-Selected Sale
  const [preSelectedSaleForReturn, setPreSelectedSaleForReturn] = useState<Sale | null>(null);

  // Synchronize state changes to persistence
  const updateState = (updater: (prev: StoreState) => StoreState) => {
    setStoreState(prev => {
      const next = updater(prev);
      StorageService.saveState(next);
      return next;
    });
  };

  // Keyboard Shortcuts (F1 = POS, F2 = Dashboard)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F1') {
        e.preventDefault();
        setCurrentTab('pos');
      } else if (e.key === 'F2') {
        e.preventDefault();
        setCurrentTab('dashboard');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Quick stats for alerts
  const lowStockCount = storeState.products.filter(p => p.currentStock > 0 && p.currentStock <= p.minStockLevel).length;
  const outOfStockCount = storeState.products.filter(p => p.currentStock <= 0).length;
  const totalUdhaar = storeState.customers.reduce((sum, c) => sum + (c.outstandingCredit || 0), 0);

  // POS Complete Sale Handler
  const handleCompleteSale = (
    items: CartItem[],
    discountTotal: number,
    paidAmount: number,
    paymentMethod: PaymentMethod,
    customerId?: string,
    notes?: string
  ) => {
    let resultSale: Sale | undefined;

    updateState(prevState => {
      const { newState, sale } = StorageService.createSale(
        prevState,
        items,
        discountTotal,
        paidAmount,
        paymentMethod,
        currentUser.id,
        customerId,
        notes
      );
      resultSale = sale;
      return newState;
    });

    return { success: true, sale: resultSale };
  };

  // Product Save Handler
  const handleSaveProduct = (productData: Partial<Product>) => {
    updateState(prev => {
      if (productData.id) {
        // Edit
        const products = prev.products.map(p => p.id === productData.id ? { ...p, ...productData } as Product : p);
        return { ...prev, products };
      } else {
        // Create new
        const newProduct: Product = {
          id: 'prod_' + Date.now(),
          name: productData.name || 'New Item',
          nameUrdu: productData.nameUrdu,
          barcode: productData.barcode || ('896' + Math.floor(10000000 + Math.random() * 90000000)),
          categoryId: productData.categoryId || prev.categories[0]?.id || 'cat_staples',
          brand: productData.brand,
          unit: productData.unit || 'piece',
          purchasePrice: productData.purchasePrice || 0,
          sellingPrice: productData.sellingPrice || 0,
          currentStock: productData.currentStock || 0,
          minStockLevel: productData.minStockLevel || 5,
          supplierId: productData.supplierId,
          status: productData.status || 'active'
        };
        return { ...prev, products: [newProduct, ...prev.products] };
      }
    });
    return { success: true };
  };

  // Product Delete / Deactivate Handler
  const handleDeleteProduct = (productId: string) => {
    updateState(prev => {
      // Check if product was used in sales
      const hasSales = prev.sales.some(s => s.items.some(i => i.productId === productId));
      if (hasSales) {
        // Soft-delete to preserve accounting integrity
        const products = prev.products.map(p => p.id === productId ? { ...p, status: 'inactive' as const } : p);
        return { ...prev, products };
      } else {
        const products = prev.products.filter(p => p.id !== productId);
        return { ...prev, products };
      }
    });
    return { success: true };
  };

  // Stock Adjustment Handler
  const handleAdjustStock = (
    productId: string,
    adjustedQty: number,
    type: 'damage' | 'expired' | 'manual_adjustment',
    reason: string
  ) => {
    updateState(prev => StorageService.adjustStock(prev, productId, adjustedQty, type, reason, currentUser.name));
    return { success: true };
  };

  // Purchases Handler
  const handleRecordPurchase = (
    supplierId: string,
    invoiceNumber: string,
    items: { productId: string; quantity: number; purchasePrice: number }[],
    paidAmount: number,
    paymentMethod: 'cash' | 'bank' | 'credit',
    notes: string
  ) => {
    updateState(prev => StorageService.recordPurchase(
      prev,
      supplierId,
      invoiceNumber,
      items,
      paidAmount,
      paymentMethod,
      currentUser.id,
      notes
    ));
    return { success: true };
  };

  // Customer Add Handler
  const handleAddCustomer = (custData: Partial<Customer>) => {
    const newCust: Customer = {
      id: 'cust_' + Date.now(),
      name: custData.name || 'New Customer',
      phone: custData.phone || '',
      address: custData.address || '',
      creditLimit: custData.creditLimit || 10000,
      outstandingCredit: custData.outstandingCredit || 0,
      status: 'active'
    };

    updateState(prev => ({
      ...prev,
      customers: [newCust, ...prev.customers]
    }));
    return { success: true };
  };

  // Customer Receive Payment Handler
  const handleReceiveCustomerPayment = (
    customerId: string,
    amount: number,
    paymentMethod: 'cash' | 'bank' | 'easypaisa' | 'jazzcash',
    notes: string
  ) => {
    updateState(prev => StorageService.receiveCustomerPayment(
      prev,
      customerId,
      amount,
      paymentMethod,
      currentUser.name,
      notes
    ));
    return { success: true };
  };

  // Supplier Add Handler
  const handleAddSupplier = (supData: Partial<Supplier>) => {
    const newSup: Supplier = {
      id: 'sup_' + Date.now(),
      name: supData.name || 'New Distributor',
      contactPerson: supData.contactPerson || '',
      phone: supData.phone || '',
      address: supData.address || '',
      balancePayable: supData.balancePayable || 0,
      status: 'active'
    };

    updateState(prev => ({
      ...prev,
      suppliers: [newSup, ...prev.suppliers]
    }));
    return { success: true };
  };

  // Supplier Pay Handler
  const handlePaySupplier = (
    supplierId: string,
    amount: number,
    paymentMethod: 'cash' | 'bank',
    notes: string
  ) => {
    updateState(prev => StorageService.paySupplier(
      prev,
      supplierId,
      amount,
      paymentMethod,
      currentUser.name,
      notes
    ));
    return { success: true };
  };

  // Expense Add Handler
  const handleAddExpense = (expData: Partial<Expense>) => {
    const newExp: Expense = {
      id: 'exp_' + Date.now(),
      category: expData.category || 'other',
      amount: expData.amount || 0,
      description: expData.description || 'Expense',
      paidFromDrawer: expData.paidFromDrawer !== false,
      date: expData.date || new Date().toISOString().split('T')[0],
      recordedBy: currentUser.name
    };

    updateState(prev => {
      let updatedCashSession = { ...prev.cashSession };
      if (newExp.paidFromDrawer) {
        updatedCashSession.totalCashExpenses += newExp.amount;
        updatedCashSession.expectedCash -= newExp.amount;
      }
      return {
        ...prev,
        expenses: [newExp, ...prev.expenses],
        cashSession: updatedCashSession
      };
    });
    return { success: true };
  };

  // Cash Drawer Close Session Handler
  const handleCloseCashSession = (actualCash: number, notes: string) => {
    updateState(prev => StorageService.closeCashSession(prev, actualCash, notes));
    return { success: true };
  };

  // Returns Process Handler
  const handleProcessReturn = (
    saleId: string,
    items: { productId: string; quantity: number; refundAmount: number }[],
    refundMethod: 'cash' | 'credit_reduction',
    reason: string
  ) => {
    updateState(prev => StorageService.processSaleReturn(
      prev,
      saleId,
      items,
      refundMethod,
      reason,
      currentUser.name
    ));
    return { success: true };
  };

  // Settings update
  const handleUpdateSettings = (newSettings: StoreSettings) => {
    updateState(prev => ({
      ...prev,
      settings: newSettings
    }));
  };

  // User PIN update
  const handleUpdateUserPin = (userId: string, newPin: string) => {
    updateState(prev => ({
      ...prev,
      users: prev.users.map(u => u.id === userId ? { ...u, pin: newPin } : u)
    }));
  };

  // Full Store Reset
  const handleResetStore = () => {
    const freshState = StorageService.resetStore();
    setStoreState(freshState);
  };

  // Sub-Navigation Tabs List
  const navTabs = [
    { id: 'dashboard', label: getTranslation(currentLang, 'dashboard'), icon: LayoutDashboard },
    { id: 'pos', label: getTranslation(currentLang, 'pos'), icon: ShoppingCart, highlight: true },
    { id: 'products', label: getTranslation(currentLang, 'products'), icon: Package },
    { id: 'inventory', label: getTranslation(currentLang, 'inventory'), icon: Boxes },
    { id: 'purchases', label: getTranslation(currentLang, 'purchases'), icon: Truck },
    { id: 'customers', label: getTranslation(currentLang, 'customers'), icon: Users },
    { id: 'suppliers', label: getTranslation(currentLang, 'suppliers'), icon: Building2 },
    { id: 'expenses', label: getTranslation(currentLang, 'expenses'), icon: Receipt },
    { id: 'cashDrawer', label: getTranslation(currentLang, 'cashDrawer'), icon: DollarSign },
    { id: 'salesHistory', label: getTranslation(currentLang, 'salesHistory'), icon: History },
    { id: 'returns', label: getTranslation(currentLang, 'returns'), icon: RotateCcw },
    { id: 'reports', label: getTranslation(currentLang, 'reports'), icon: BarChart3 },
    { id: 'backup', label: getTranslation(currentLang, 'backup'), icon: Database },
    { id: 'settings', label: getTranslation(currentLang, 'settings'), icon: SettingsIcon },
    { id: 'xamppExport', label: getTranslation(currentLang, 'xamppExport'), icon: FileCode2 }
  ];

  return (
    <div className="min-h-screen bg-[#F5F5F0] text-[#33332D] flex flex-col font-sans selection:bg-[#5A5A40] selection:text-white">
      
      {/* Top Main Navigation Header */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        currentUser={currentUser}
        onSwitchUser={setCurrentUser}
        users={storeState.users}
        settings={storeState.settings}
        cashSession={storeState.cashSession}
        currentLang={currentLang}
        onToggleLang={setCurrentLang}
        lowStockCount={lowStockCount}
        outOfStockCount={outOfStockCount}
        totalUdhaar={totalUdhaar}
      />

      {/* Secondary Quick Navigation Bar */}
      <nav className="bg-[#FAF9F5] border-b border-[#E2E1D8] px-4 sm:px-6 lg:px-8 shadow-2xs overflow-x-auto no-scrollbar py-2">
        <div className="max-w-7xl mx-auto flex items-center gap-1.5 min-w-max">
          {navTabs.map(tab => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;

            return (
              <button
                key={tab.id}
                id={`tab-${tab.id}`}
                onClick={() => setCurrentTab(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#35362B] text-[#FAF9F5] shadow-xs scale-102'
                    : tab.highlight
                    ? 'bg-[#EEF4EC] text-[#2D4021] hover:bg-[#E2EBDD] border border-[#C2D6BA]'
                    : 'text-[#5A5A40] hover:bg-[#EBEAE3] hover:text-[#2C2C24]'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#C7DDB8]' : tab.highlight ? 'text-[#4A5D3F]' : 'text-[#787865]'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-5 lg:p-6">
        
        {currentTab === 'dashboard' && (
          <Dashboard
            sales={storeState.sales}
            expenses={storeState.expenses}
            products={storeState.products}
            customers={storeState.customers}
            cashSession={storeState.cashSession}
            settings={storeState.settings}
            lang={currentLang}
            userRole={currentUser.role}
            onNavigate={setCurrentTab}
            onViewSale={setReceiptSale}
          />
        )}

        {currentTab === 'pos' && (
          <POSModule
            products={storeState.products}
            categories={storeState.categories}
            customers={storeState.customers}
            settings={storeState.settings}
            lang={currentLang}
            onCompleteSale={handleCompleteSale}
            onAddCustomer={handleAddCustomer}
            onOpenReceipt={setReceiptSale}
          />
        )}

        {currentTab === 'products' && (
          <ProductsModule
            products={storeState.products}
            categories={storeState.categories}
            suppliers={storeState.suppliers}
            settings={storeState.settings}
            lang={currentLang}
            userRole={currentUser.role}
            onSaveProduct={handleSaveProduct}
            onDeleteProduct={handleDeleteProduct}
          />
        )}

        {currentTab === 'inventory' && (
          <InventoryModule
            products={storeState.products}
            categories={storeState.categories}
            stockMovements={storeState.stockMovements}
            settings={storeState.settings}
            lang={currentLang}
            userRole={currentUser.role}
            onAdjustStock={handleAdjustStock}
          />
        )}

        {currentTab === 'purchases' && (
          <PurchasesModule
            products={storeState.products}
            suppliers={storeState.suppliers}
            settings={storeState.settings}
            lang={currentLang}
            userRole={currentUser.role}
            onRecordPurchase={handleRecordPurchase}
          />
        )}

        {currentTab === 'customers' && (
          <CustomersModule
            customers={storeState.customers}
            customerLedger={storeState.customerLedger}
            settings={storeState.settings}
            lang={currentLang}
            userRole={currentUser.role}
            onAddCustomer={handleAddCustomer}
            onReceivePayment={handleReceiveCustomerPayment}
          />
        )}

        {currentTab === 'suppliers' && (
          <SuppliersModule
            suppliers={storeState.suppliers}
            supplierLedger={storeState.supplierLedger}
            settings={storeState.settings}
            lang={currentLang}
            userRole={currentUser.role}
            onAddSupplier={handleAddSupplier}
            onPaySupplier={handlePaySupplier}
          />
        )}

        {currentTab === 'expenses' && (
          <ExpensesModule
            expenses={storeState.expenses}
            settings={storeState.settings}
            lang={currentLang}
            userRole={currentUser.role}
            onAddExpense={handleAddExpense}
          />
        )}

        {currentTab === 'cashDrawer' && (
          <CashDrawerModule
            cashSession={storeState.cashSession}
            settings={storeState.settings}
            lang={currentLang}
            userRole={currentUser.role}
            onUpdateSession={(updated) => updateState(prev => ({ ...prev, cashSession: { ...prev.cashSession, ...updated } }))}
            onCloseSession={handleCloseCashSession}
          />
        )}

        {currentTab === 'salesHistory' && (
          <SalesHistoryModule
            sales={storeState.sales}
            settings={storeState.settings}
            lang={currentLang}
            userRole={currentUser.role}
            onViewReceipt={setReceiptSale}
            onStartReturn={(sale) => {
              setPreSelectedSaleForReturn(sale);
              setCurrentTab('returns');
            }}
          />
        )}

        {currentTab === 'returns' && (
          <ReturnsModule
            returns={storeState.returns}
            sales={storeState.sales}
            products={storeState.products}
            settings={storeState.settings}
            lang={currentLang}
            userRole={currentUser.role}
            preSelectedSale={preSelectedSaleForReturn}
            onProcessReturn={handleProcessReturn}
          />
        )}

        {currentTab === 'reports' && (
          <ReportsModule
            sales={storeState.sales}
            expenses={storeState.expenses}
            products={storeState.products}
            customers={storeState.customers}
            categories={storeState.categories}
            settings={storeState.settings}
            lang={currentLang}
            userRole={currentUser.role}
          />
        )}

        {currentTab === 'backup' && (
          <BackupRestoreModule
            storeState={storeState}
            settings={storeState.settings}
            lang={currentLang}
            userRole={currentUser.role}
            onRestoreState={(restored) => setStoreState(restored)}
            onResetStore={handleResetStore}
          />
        )}

        {currentTab === 'settings' && (
          <SettingsModule
            settings={storeState.settings}
            users={storeState.users}
            lang={currentLang}
            userRole={currentUser.role}
            onUpdateSettings={handleUpdateSettings}
            onUpdateUserPin={handleUpdateUserPin}
          />
        )}

        {currentTab === 'xamppExport' && (
          <XamppExportModal
            storeState={storeState}
          />
        )}

      </main>

      {/* Reusable Receipt Print Modal */}
      {receiptSale && (
        <ReceiptModal
          sale={receiptSale}
          settings={storeState.settings}
          lang={currentLang}
          onClose={() => setReceiptSale(null)}
        />
      )}

      {/* Footer */}
      <footer className="bg-[#FAF9F5] border-t border-[#E2E1D8] py-3 px-4 text-center text-xs text-[#787865]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>
            <span className="font-bold text-[#35362B]">{storeState.settings.storeName}</span> • Offline Local Grocery POS System
          </p>
          <div className="flex items-center gap-3 text-[11px] text-[#787865]">
            <span>Shortcut: <kbd className="px-1.5 py-0.5 bg-[#EBEAE3] border border-[#DCDAD0] rounded font-mono text-[#35362B]">F1</kbd> POS</span>
            <span><kbd className="px-1.5 py-0.5 bg-[#EBEAE3] border border-[#DCDAD0] rounded font-mono text-[#35362B]">F2</kbd> Dashboard</span>
            <span className="text-[#4A5D3F] font-semibold">● 100% Offline Ready</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
