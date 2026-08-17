import {
  Product,
  Category,
  Supplier,
  Customer,
  Sale,
  SaleItem,
  Expense,
  CustomerLedgerEntry,
  SupplierLedgerEntry,
  StockMovement,
  SaleReturn,
  ReturnItem,
  CashSession,
  StoreSettings,
  User,
  AuditLog,
  CartItem,
  PaymentMethod,
  StoreState
} from '../types';
import {
  initialProducts,
  initialCategories,
  initialSuppliers,
  initialCustomers,
  initialSales,
  initialExpenses,
  initialCustomerLedger,
  initialCashSession,
  initialStoreSettings,
  initialUsers,
  initialAuditLogs
} from '../data/initialData';
import { generateMySQLDump } from './sqlGenerator';

const STORAGE_KEYS = {
  PRODUCTS: 'gs_products_v1',
  CATEGORIES: 'gs_categories_v1',
  SUPPLIERS: 'gs_suppliers_v1',
  CUSTOMERS: 'gs_customers_v1',
  SALES: 'gs_sales_v1',
  EXPENSES: 'gs_expenses_v1',
  CUSTOMER_LEDGER: 'gs_customer_ledger_v1',
  SUPPLIER_LEDGER: 'gs_supplier_ledger_v1',
  STOCK_MOVEMENTS: 'gs_stock_movements_v1',
  RETURNS: 'gs_returns_v1',
  CASH_SESSION: 'gs_cash_session_v1',
  SETTINGS: 'gs_settings_v1',
  USERS: 'gs_users_v1',
  AUDIT_LOGS: 'gs_audit_logs_v1',
  CURRENT_USER_ID: 'gs_current_user_id_v1',
  CURRENT_LANG: 'gs_current_lang_v1',
};

export class StorageService {
  private getItem<T>(key: string, fallback: T): T {
    try {
      const data = localStorage.getItem(key);
      if (!data) return fallback;
      return JSON.parse(data);
    } catch (e) {
      console.error(`Error reading ${key} from storage:`, e);
      return fallback;
    }
  }

  private setItem<T>(key: string, val: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(val));
    } catch (e) {
      console.error(`Error saving ${key} to storage:`, e);
    }
  }

  // Getters
  getProducts(): Product[] {
    return this.getItem<Product[]>(STORAGE_KEYS.PRODUCTS, initialProducts);
  }

  getCategories(): Category[] {
    return this.getItem<Category[]>(STORAGE_KEYS.CATEGORIES, initialCategories);
  }

  getSuppliers(): Supplier[] {
    return this.getItem<Supplier[]>(STORAGE_KEYS.SUPPLIERS, initialSuppliers);
  }

  getCustomers(): Customer[] {
    return this.getItem<Customer[]>(STORAGE_KEYS.CUSTOMERS, initialCustomers);
  }

  getSales(): Sale[] {
    return this.getItem<Sale[]>(STORAGE_KEYS.SALES, initialSales);
  }

  getExpenses(): Expense[] {
    return this.getItem<Expense[]>(STORAGE_KEYS.EXPENSES, initialExpenses);
  }

  getCustomerLedger(): CustomerLedgerEntry[] {
    return this.getItem<CustomerLedgerEntry[]>(STORAGE_KEYS.CUSTOMER_LEDGER, initialCustomerLedger);
  }

  getSupplierLedger(): SupplierLedgerEntry[] {
    return this.getItem<SupplierLedgerEntry[]>(STORAGE_KEYS.SUPPLIER_LEDGER, []);
  }

  getStockMovements(): StockMovement[] {
    return this.getItem<StockMovement[]>(STORAGE_KEYS.STOCK_MOVEMENTS, []);
  }

  getReturns(): SaleReturn[] {
    return this.getItem<SaleReturn[]>(STORAGE_KEYS.RETURNS, []);
  }

  getCashSession(): CashSession {
    return this.getItem<CashSession>(STORAGE_KEYS.CASH_SESSION, initialCashSession);
  }

  getSettings(): StoreSettings {
    return this.getItem<StoreSettings>(STORAGE_KEYS.SETTINGS, initialStoreSettings);
  }

  getUsers(): User[] {
    return this.getItem<User[]>(STORAGE_KEYS.USERS, initialUsers);
  }

  getAuditLogs(): AuditLog[] {
    return this.getItem<AuditLog[]>(STORAGE_KEYS.AUDIT_LOGS, initialAuditLogs);
  }

  getCurrentUser(): User {
    const users = this.getUsers();
    const currentId = this.getItem<string>(STORAGE_KEYS.CURRENT_USER_ID, 'user_1');
    const user = users.find(u => u.id === currentId);
    return user || users[0];
  }

  setCurrentUser(user: User): void {
    this.setItem(STORAGE_KEYS.CURRENT_USER_ID, user.id);
    this.addAuditLog('User Login / Switch', 'صارف لاگ ان ہوا', `${user.name} (${user.role}) active.`);
  }

  // Audit Log helper
  addAuditLog(action: string, actionUrdu: string, details: string): void {
    const logs = this.getAuditLogs();
    const currentUser = this.getCurrentUser();
    const newLog: AuditLog = {
      id: 'log_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
      dateTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
      userId: currentUser?.id || 'sys',
      userName: currentUser?.name || 'System',
      userRole: currentUser?.role || 'admin',
      action,
      actionUrdu,
      details
    };
    logs.unshift(newLog);
    // Keep last 300 logs
    this.setItem(STORAGE_KEYS.AUDIT_LOGS, logs.slice(0, 300));
  }

  // Stock Movement Log Helper
  private addStockMovement(
    productId: string,
    productName: string,
    type: StockMovement['type'],
    quantityChange: number,
    previousStock: number,
    newStock: number,
    referenceNumber: string = '',
    reason: string = ''
  ): void {
    const movements = this.getStockMovements();
    const user = this.getCurrentUser();
    const movement: StockMovement = {
      id: 'sm_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
      dateTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
      productId,
      productName,
      type,
      quantityChange,
      previousStock,
      newStock,
      referenceNumber,
      reason,
      performedBy: user.name
    };
    movements.unshift(movement);
    this.setItem(STORAGE_KEYS.STOCK_MOVEMENTS, movements.slice(0, 500));
  }

  // Complete Sale (POS)
  processSale(
    items: CartItem[],
    discountTotal: number,
    paidAmount: number,
    paymentMethod: PaymentMethod,
    customerId?: string,
    notes?: string
  ): { success: boolean; sale?: Sale; error?: string } {
    if (!items || items.length === 0) {
      return { success: false, error: "Cart is empty." };
    }

    const products = this.getProducts();
    const subtotal = items.reduce((acc, item) => acc + item.total, 0);
    const grandTotal = Math.max(0, subtotal - discountTotal);
    
    let creditAmount = 0;
    let changeAmount = 0;

    if (paymentMethod === 'credit') {
      if (!customerId) {
        return { success: false, error: "Please select a customer for Udhaar/Credit sale." };
      }
      creditAmount = grandTotal;
      paidAmount = 0;
      changeAmount = 0;
    } else if (paymentMethod === 'split') {
      creditAmount = Math.max(0, grandTotal - paidAmount);
      changeAmount = 0;
    } else {
      // Cash / Card / Digital
      changeAmount = Math.max(0, paidAmount - grandTotal);
    }

    const invoiceNumber = 'INV-' + (1000 + this.getSales().length + 1);
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const user = this.getCurrentUser();
    
    let customerName = undefined;
    if (customerId) {
      const customers = this.getCustomers();
      const customer = customers.find(c => c.id === customerId);
      if (customer) {
        customerName = customer.name;
      }
    }

    // 1. Prepare Sale Items and Deduct Stock
    const saleItems = items.map((item, idx) => {
      // Deduct stock from product
      const pIndex = products.findIndex(p => p.id === item.product.id);
      if (pIndex !== -1) {
        const prev = products[pIndex].currentStock;
        const next = Math.max(0, prev - item.quantity);
        products[pIndex].currentStock = next;
        products[pIndex].updatedAt = nowStr;

        this.addStockMovement(
          item.product.id,
          item.product.name,
          'sale',
          -item.quantity,
          prev,
          next,
          invoiceNumber,
          `Sold in Invoice ${invoiceNumber}`
        );
      }

      return {
        id: 'si_' + Date.now() + '_' + idx,
        saleId: '',
        productId: item.product.id,
        productName: item.product.name,
        productNameUrdu: item.product.nameUrdu,
        unit: item.product.unit,
        quantity: item.quantity,
        purchasePrice: item.product.purchasePrice, // Stored historical COGS
        sellingPrice: item.sellingPrice,
        discountPercent: item.discountPercent || 0,
        subtotal: item.total
      };
    });

    // Save updated products
    this.setItem(STORAGE_KEYS.PRODUCTS, products);

    // 2. Build Sale Record
    const newSale: Sale = {
      id: 'sale_' + Date.now(),
      invoiceNumber,
      dateTime: nowStr,
      customerId,
      customerName,
      items: saleItems,
      subtotal,
      discountTotal,
      grandTotal,
      paidAmount,
      changeAmount,
      creditAmount,
      paymentMethod,
      cashierId: user.id,
      cashierName: user.name,
      status: 'completed',
      notes
    };

    newSale.items.forEach(i => i.saleId = newSale.id);

    const sales = this.getSales();
    sales.unshift(newSale);
    this.setItem(STORAGE_KEYS.SALES, sales);

    // 3. Handle Customer Udhaar if any credit involved
    if (customerId && creditAmount > 0) {
      const customers = this.getCustomers();
      const cIndex = customers.findIndex(c => c.id === customerId);
      if (cIndex !== -1) {
        const c = customers[cIndex];
        const newBal = (c.outstandingCredit || 0) + creditAmount;
        c.outstandingCredit = newBal;
        c.totalPurchases = (c.totalPurchases || 0) + grandTotal;
        this.setItem(STORAGE_KEYS.CUSTOMERS, customers);

        // Add Customer Ledger
        const ledger = this.getCustomerLedger();
        ledger.unshift({
          id: 'cld_' + Date.now(),
          customerId,
          dateTime: nowStr,
          type: 'sale_credit',
          invoiceOrRefNumber: invoiceNumber,
          debit: creditAmount,
          credit: 0,
          balance: newBal,
          notes: `Credit sale invoice #${invoiceNumber}`,
          receivedBy: user.name
        });
        this.setItem(STORAGE_KEYS.CUSTOMER_LEDGER, ledger);
      }
    }

    // 4. Update Daily Cash Session
    if (paymentMethod === 'cash' || paymentMethod === 'split') {
      const cashReceivedFromSale = paymentMethod === 'split' ? paidAmount : Math.min(paidAmount, grandTotal);
      if (cashReceivedFromSale > 0) {
        const session = this.getCashSession();
        session.cashSales = (session.cashSales || 0) + cashReceivedFromSale;
        session.expectedCash = this.calcExpectedCash(session);
        this.setItem(STORAGE_KEYS.CASH_SESSION, session);
      }
    }

    // 5. Add Audit Log
    this.addAuditLog(
      'New Sale Completed',
      'نئی فروخت مکمل',
      `Invoice #${invoiceNumber} total Rs. ${grandTotal} (${paymentMethod.toUpperCase()}) by ${user.name}`
    );

    return { success: true, sale: newSale };
  }

  // Calculate expected cash in drawer
  private calcExpectedCash(session: CashSession): number {
    const opening = session.openingCash || 0;
    const sales = session.cashSales || 0;
    const custPay = session.customerCashPayments || 0;
    const expenses = session.cashExpenses || 0;
    const supPay = session.cashSupplierPayments || 0;
    const refunds = session.cashRefunds || 0;
    return opening + sales + custPay - expenses - supPay - refunds;
  }

  // Record Customer Payment for Udhaar
  recordCustomerPayment(
    customerId: string,
    amount: number,
    paymentMethod: 'cash' | 'bank' | 'other' = 'cash',
    notes: string = ''
  ): { success: boolean; customer?: Customer; error?: string } {
    if (amount <= 0) return { success: false, error: "Payment amount must be greater than 0." };

    const customers = this.getCustomers();
    const cIndex = customers.findIndex(c => c.id === customerId);
    if (cIndex === -1) return { success: false, error: "Customer not found." };

    const customer = customers[cIndex];
    const prevBal = customer.outstandingCredit;
    const newBal = Math.max(0, prevBal - amount);
    customer.outstandingCredit = newBal;
    customer.totalPaid = (customer.totalPaid || 0) + amount;
    customer.lastPaymentDate = new Date().toISOString().split('T')[0];

    this.setItem(STORAGE_KEYS.CUSTOMERS, customers);

    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const ref = 'PAY-' + Math.floor(1000 + Math.random() * 9000);
    const user = this.getCurrentUser();

    // Customer Ledger Entry
    const ledger = this.getCustomerLedger();
    ledger.unshift({
      id: 'cld_' + Date.now(),
      customerId,
      dateTime: nowStr,
      type: 'payment_received',
      invoiceOrRefNumber: ref,
      debit: 0,
      credit: amount,
      balance: newBal,
      notes: notes || `Udhaar recovery payment (${paymentMethod})`,
      receivedBy: user.name
    });
    this.setItem(STORAGE_KEYS.CUSTOMER_LEDGER, ledger);

    // Update Drawer if cash
    if (paymentMethod === 'cash') {
      const session = this.getCashSession();
      session.customerCashPayments = (session.customerCashPayments || 0) + amount;
      session.expectedCash = this.calcExpectedCash(session);
      this.setItem(STORAGE_KEYS.CASH_SESSION, session);
    }

    this.addAuditLog(
      'Udhaar Payment Received',
      'ادھار وصولی',
      `Received Rs. ${amount} from ${customer.name}. New Balance: Rs. ${newBal}`
    );

    return { success: true, customer };
  }

  // Record Stock Purchase from Supplier
  recordPurchase(
    supplierId: string,
    invoiceNumber: string,
    items: { productId: string; quantity: number; purchasePrice: number }[],
    paidAmount: number,
    paymentMethod: 'cash' | 'bank' | 'credit' = 'cash',
    notes: string = ''
  ): { success: boolean; error?: string } {
    if (!items || items.length === 0) return { success: false, error: "No items in purchase invoice." };

    const suppliers = this.getSuppliers();
    const sIndex = suppliers.findIndex(s => s.id === supplierId);
    if (sIndex === -1) return { success: false, error: "Supplier not found." };

    const supplier = suppliers[sIndex];
    const totalAmount = items.reduce((acc, i) => acc + (i.quantity * i.purchasePrice), 0);
    const remainingAmount = Math.max(0, totalAmount - paidAmount);

    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const user = this.getCurrentUser();
    const products = this.getProducts();

    // Update Products stock & purchase price
    items.forEach(item => {
      const pIndex = products.findIndex(p => p.id === item.productId);
      if (pIndex !== -1) {
        const prev = products[pIndex].currentStock;
        const next = prev + item.quantity;
        products[pIndex].currentStock = next;
        products[pIndex].purchasePrice = item.purchasePrice; // Update latest cost
        products[pIndex].updatedAt = nowStr;

        this.addStockMovement(
          item.productId,
          products[pIndex].name,
          'purchase',
          item.quantity,
          prev,
          next,
          invoiceNumber,
          `Purchased from ${supplier.name}`
        );
      }
    });
    this.setItem(STORAGE_KEYS.PRODUCTS, products);

    // Update Supplier Balance
    supplier.totalPurchases += totalAmount;
    supplier.totalPaid += paidAmount;
    supplier.balancePayable += remainingAmount;
    this.setItem(STORAGE_KEYS.SUPPLIERS, suppliers);

    // Supplier Ledger
    const sLedger = this.getSupplierLedger();
    sLedger.unshift({
      id: 'sld_' + Date.now(),
      supplierId,
      dateTime: nowStr,
      type: 'purchase_credit',
      invoiceOrRefNumber: invoiceNumber,
      debit: paidAmount,
      credit: totalAmount,
      balance: supplier.balancePayable,
      notes: notes || `Goods purchase invoice #${invoiceNumber}`
    });
    this.setItem(STORAGE_KEYS.SUPPLIER_LEDGER, sLedger);

    // Deduct cash if paid from drawer
    if (paidAmount > 0 && paymentMethod === 'cash') {
      const session = this.getCashSession();
      session.cashSupplierPayments = (session.cashSupplierPayments || 0) + paidAmount;
      session.expectedCash = this.calcExpectedCash(session);
      this.setItem(STORAGE_KEYS.CASH_SESSION, session);
    }

    this.addAuditLog(
      'Recorded Purchase Invoice',
      'خریداری درج کی گئی',
      `Invoice #${invoiceNumber} from ${supplier.name} for Rs. ${totalAmount}. Paid: Rs. ${paidAmount}`
    );

    return { success: true };
  }

  // Record Expense
  recordExpense(
    category: Expense['category'],
    amount: number,
    description: string,
    paymentMethod: 'cash' | 'bank' | 'other' = 'cash',
    notes: string = ''
  ): { success: boolean; expense?: Expense; error?: string } {
    if (amount <= 0) return { success: false, error: "Expense amount must be greater than 0." };

    const user = this.getCurrentUser();
    const newExpense: Expense = {
      id: 'exp_' + Date.now(),
      category,
      amount,
      date: new Date().toISOString().split('T')[0],
      description,
      paymentMethod,
      recordedBy: user.name,
      notes
    };

    const expenses = this.getExpenses();
    expenses.unshift(newExpense);
    this.setItem(STORAGE_KEYS.EXPENSES, expenses);

    if (paymentMethod === 'cash') {
      const session = this.getCashSession();
      session.cashExpenses = (session.cashExpenses || 0) + amount;
      session.expectedCash = this.calcExpectedCash(session);
      this.setItem(STORAGE_KEYS.CASH_SESSION, session);
    }

    this.addAuditLog(
      'Expense Recorded',
      'خرچہ درج ہوا',
      `Rs. ${amount} for ${category}: ${description}`
    );

    return { success: true, expense: newExpense };
  }

  // Stock Adjustment (Damage / Expired / Count Correction)
  adjustStock(
    productId: string,
    adjustedQuantity: number, // positive or negative
    type: 'damage' | 'expired' | 'manual_adjustment',
    reason: string
  ): { success: boolean; error?: string } {
    const products = this.getProducts();
    const pIndex = products.findIndex(p => p.id === productId);
    if (pIndex === -1) return { success: false, error: "Product not found." };

    const prod = products[pIndex];
    const prev = prod.currentStock;
    const next = Math.max(0, prev + adjustedQuantity);
    prod.currentStock = next;
    prod.updatedAt = new Date().toISOString().replace('T', ' ').substring(0, 19);

    this.setItem(STORAGE_KEYS.PRODUCTS, products);

    this.addStockMovement(
      productId,
      prod.name,
      type,
      adjustedQuantity,
      prev,
      next,
      'ADJ-' + Date.now().toString().slice(-4),
      reason
    );

    this.addAuditLog(
      'Stock Adjusted',
      'اسٹاک درستگی',
      `${prod.name} stock changed by ${adjustedQuantity > 0 ? '+' : ''}${adjustedQuantity} (${type}). New Stock: ${next}`
    );

    return { success: true };
  }

  // Process Return / Refund
  processReturn(
    saleId: string,
    itemsToReturn: { saleItemId: string; productId: string; quantity: number; refundAmount: number }[],
    reason: SaleReturn['reason'],
    notes: string = ''
  ): { success: boolean; error?: string } {
    const sales = this.getSales();
    const sIndex = sales.findIndex(s => s.id === saleId);
    if (sIndex === -1) return { success: false, error: "Sale not found." };

    const sale = sales[sIndex];
    const products = this.getProducts();
    const user = this.getCurrentUser();
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);

    let totalRefund = 0;
    const returnItems: SaleReturn['items'] = [];

    itemsToReturn.forEach(ret => {
      const prod = products.find(p => p.id === ret.productId);
      if (prod) {
        const prev = prod.currentStock;
        const next = prev + ret.quantity;
        prod.currentStock = next;

        this.addStockMovement(
          ret.productId,
          prod.name,
          'return',
          ret.quantity,
          prev,
          next,
          sale.invoiceNumber,
          `Return for ${sale.invoiceNumber}: ${reason}`
        );

        returnItems.push({
          saleItemId: ret.saleItemId,
          productId: ret.productId,
          productName: prod.name,
          returnedQuantity: ret.quantity,
          refundAmount: ret.refundAmount,
          unit: prod.unit
        });

        totalRefund += ret.refundAmount;
      }
    });

    this.setItem(STORAGE_KEYS.PRODUCTS, products);

    // Record Return
    const returnNum = 'RET-' + Date.now().toString().slice(-6);
    const returns = this.getReturns();
    const newReturn: SaleReturn = {
      id: 'ret_' + Date.now(),
      returnNumber: returnNum,
      saleId: sale.id,
      invoiceNumber: sale.invoiceNumber,
      dateTime: nowStr,
      customerName: sale.customerName,
      items: returnItems,
      totalRefund,
      reason,
      processedBy: user.name,
      notes
    };
    returns.unshift(newReturn);
    this.setItem(STORAGE_KEYS.RETURNS, returns);

    // Update sale status
    sale.status = 'partially_returned';
    this.setItem(STORAGE_KEYS.SALES, sales);

    // Deduct cash refund from drawer
    const session = this.getCashSession();
    session.cashRefunds = (session.cashRefunds || 0) + totalRefund;
    session.expectedCash = this.calcExpectedCash(session);
    this.setItem(STORAGE_KEYS.CASH_SESSION, session);

    this.addAuditLog(
      'Sale Return Processed',
      'مال واپسی درج',
      `Return #${returnNum} for ${sale.invoiceNumber}. Refund: Rs. ${totalRefund}`
    );

    return { success: true };
  }

  // Cash Drawer Closing / Balancing
  saveCashSession(openingCash: number, actualCash: number, notes: string = ''): CashSession {
    const session = this.getCashSession();
    session.openingCash = openingCash;
    session.actualCash = actualCash;
    session.expectedCash = this.calcExpectedCash(session);
    session.difference = actualCash - session.expectedCash;
    session.notes = notes;
    session.closedAt = new Date().toISOString().replace('T', ' ').substring(0, 19);
    session.closedBy = this.getCurrentUser().name;

    this.setItem(STORAGE_KEYS.CASH_SESSION, session);

    this.addAuditLog(
      'Cash Drawer Count Saved',
      'گلے کی گنتی محفوظ',
      `Expected: Rs. ${session.expectedCash}, Actual: Rs. ${actualCash}, Diff: Rs. ${session.difference}`
    );

    return session;
  }

  // CRUD Product
  saveProduct(product: Partial<Product>): { success: boolean; product?: Product; error?: string } {
    if (!product.name || !product.name.trim()) return { success: false, error: "Product name is required." };
    if (!product.sellingPrice || product.sellingPrice <= 0) return { success: false, error: "Valid selling price is required." };

    const products = this.getProducts();
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);

    if (product.id) {
      // Edit
      const index = products.findIndex(p => p.id === product.id);
      if (index === -1) return { success: false, error: "Product not found." };

      const existing = products[index];
      const updated: Product = {
        ...existing,
        ...product,
        updatedAt: nowStr
      } as Product;

      products[index] = updated;
      this.setItem(STORAGE_KEYS.PRODUCTS, products);
      this.addAuditLog('Product Updated', 'پروڈکٹ تبدیل کی گئی', `Updated ${updated.name}`);
      return { success: true, product: updated };
    } else {
      // Add
      const newProd: Product = {
        id: 'prod_' + Date.now(),
        name: product.name.trim(),
        nameUrdu: product.nameUrdu || '',
        barcode: product.barcode || ('896' + Math.floor(10000000 + Math.random() * 90000000)),
        categoryId: product.categoryId || 'cat_staples',
        brand: product.brand || '',
        unit: product.unit || 'piece',
        purchasePrice: Number(product.purchasePrice) || 0,
        sellingPrice: Number(product.sellingPrice) || 0,
        currentStock: Number(product.currentStock) || 0,
        minStockLevel: Number(product.minStockLevel) || 5,
        supplierId: product.supplierId || '',
        expiryDate: product.expiryDate || '',
        status: product.status || 'active',
        createdAt: nowStr,
        updatedAt: nowStr
      };

      products.unshift(newProd);
      this.setItem(STORAGE_KEYS.PRODUCTS, products);
      this.addAuditLog('Product Added', 'نئی پروڈکٹ شامل', `Added ${newProd.name} (Stock: ${newProd.currentStock})`);
      return { success: true, product: newProd };
    }
  }

  deleteProduct(productId: string): { success: boolean; error?: string } {
    const products = this.getProducts();
    const index = products.findIndex(p => p.id === productId);
    if (index === -1) return { success: false, error: "Product not found." };

    const prod = products[index];

    // Check if product was used in sales history (soft delete safeguard)
    const sales = this.getSales();
    const hasSales = sales.some(s => s.items.some(i => i.productId === productId));

    if (hasSales) {
      // Soft delete: deactivate
      prod.status = 'inactive';
      prod.updatedAt = new Date().toISOString().replace('T', ' ').substring(0, 19);
      this.setItem(STORAGE_KEYS.PRODUCTS, products);
      this.addAuditLog('Product Deactivated', 'پروڈکٹ غیر فعال', `Deactivated ${prod.name} (Has sales history).`);
      return { success: true };
    }

    products.splice(index, 1);
    this.setItem(STORAGE_KEYS.PRODUCTS, products);
    this.addAuditLog('Product Deleted', 'پروڈکٹ حذف', `Removed ${prod.name}`);
    return { success: true };
  }

  // Customer Management
  saveCustomer(customer: Partial<Customer>): { success: boolean; customer?: Customer; error?: string } {
    if (!customer.name || !customer.name.trim()) return { success: false, error: "Customer name is required." };
    if (!customer.phone || !customer.phone.trim()) return { success: false, error: "Phone number is required." };

    const customers = this.getCustomers();
    if (customer.id) {
      const idx = customers.findIndex(c => c.id === customer.id);
      if (idx === -1) return { success: false, error: "Customer not found." };
      const updated = { ...customers[idx], ...customer };
      customers[idx] = updated;
      this.setItem(STORAGE_KEYS.CUSTOMERS, customers);
      this.addAuditLog('Customer Updated', 'گاہک معلومات تبدیل', `Updated ${updated.name}`);
      return { success: true, customer: updated };
    } else {
      const newCust: Customer = {
        id: 'cust_' + Date.now(),
        name: customer.name.trim(),
        phone: customer.phone.trim(),
        address: customer.address || '',
        notes: customer.notes || '',
        creditLimit: Number(customer.creditLimit) || 10000,
        totalPurchases: 0,
        totalPaid: 0,
        outstandingCredit: Number(customer.outstandingCredit) || 0
      };
      customers.unshift(newCust);
      this.setItem(STORAGE_KEYS.CUSTOMERS, customers);
      this.addAuditLog('Customer Added', 'نیا گاہک شامل', `Added ${newCust.name}`);
      return { success: true, customer: newCust };
    }
  }

  // Supplier Management
  saveSupplier(supplier: Partial<Supplier>): { success: boolean; supplier?: Supplier; error?: string } {
    if (!supplier.name || !supplier.name.trim()) return { success: false, error: "Supplier name is required." };

    const suppliers = this.getSuppliers();
    if (supplier.id) {
      const idx = suppliers.findIndex(s => s.id === supplier.id);
      if (idx === -1) return { success: false, error: "Supplier not found." };
      const updated = { ...suppliers[idx], ...supplier };
      suppliers[idx] = updated;
      this.setItem(STORAGE_KEYS.SUPPLIERS, suppliers);
      this.addAuditLog('Supplier Updated', 'سپلائر تبدیل', `Updated ${updated.name}`);
      return { success: true, supplier: updated };
    } else {
      const newSup: Supplier = {
        id: 'sup_' + Date.now(),
        name: supplier.name.trim(),
        contactPerson: supplier.contactPerson || '',
        phone: supplier.phone || '',
        address: supplier.address || '',
        notes: supplier.notes || '',
        totalPurchases: 0,
        totalPaid: 0,
        balancePayable: Number(supplier.balancePayable) || 0
      };
      suppliers.unshift(newSup);
      this.setItem(STORAGE_KEYS.SUPPLIERS, suppliers);
      this.addAuditLog('Supplier Added', 'نیا سپلائر شامل', `Added ${newSup.name}`);
      return { success: true, supplier: newSup };
    }
  }

  // Settings
  saveSettings(settings: StoreSettings): void {
    this.setItem(STORAGE_KEYS.SETTINGS, settings);
    this.addAuditLog('Settings Updated', 'سیٹنگز تبدیل', `Updated store profile settings.`);
  }

  // Reset to Sample Data
  resetToSampleData(): void {
    this.setItem(STORAGE_KEYS.PRODUCTS, initialProducts);
    this.setItem(STORAGE_KEYS.CATEGORIES, initialCategories);
    this.setItem(STORAGE_KEYS.SUPPLIERS, initialSuppliers);
    this.setItem(STORAGE_KEYS.CUSTOMERS, initialCustomers);
    this.setItem(STORAGE_KEYS.SALES, initialSales);
    this.setItem(STORAGE_KEYS.EXPENSES, initialExpenses);
    this.setItem(STORAGE_KEYS.CUSTOMER_LEDGER, initialCustomerLedger);
    this.setItem(STORAGE_KEYS.SUPPLIER_LEDGER, []);
    this.setItem(STORAGE_KEYS.STOCK_MOVEMENTS, []);
    this.setItem(STORAGE_KEYS.RETURNS, []);
    this.setItem(STORAGE_KEYS.CASH_SESSION, initialCashSession);
    this.setItem(STORAGE_KEYS.SETTINGS, initialStoreSettings);
    this.setItem(STORAGE_KEYS.USERS, initialUsers);
    this.setItem(STORAGE_KEYS.AUDIT_LOGS, initialAuditLogs);
    this.setItem(STORAGE_KEYS.CURRENT_USER_ID, 'user_1');
  }

  // Clean Store Data for brand new setup
  cleanStoreData(): void {
    this.setItem(STORAGE_KEYS.PRODUCTS, []);
    this.setItem(STORAGE_KEYS.SUPPLIERS, []);
    this.setItem(STORAGE_KEYS.CUSTOMERS, []);
    this.setItem(STORAGE_KEYS.SALES, []);
    this.setItem(STORAGE_KEYS.EXPENSES, []);
    this.setItem(STORAGE_KEYS.CUSTOMER_LEDGER, []);
    this.setItem(STORAGE_KEYS.SUPPLIER_LEDGER, []);
    this.setItem(STORAGE_KEYS.STOCK_MOVEMENTS, []);
    this.setItem(STORAGE_KEYS.RETURNS, []);
    this.setItem(STORAGE_KEYS.CASH_SESSION, {
      ...initialCashSession,
      openingCash: 0,
      cashSales: 0,
      customerCashPayments: 0,
      cashExpenses: 0,
      cashSupplierPayments: 0,
      cashRefunds: 0,
      expectedCash: 0,
      actualCash: 0,
      difference: 0
    });
    this.addAuditLog('Database Reset', 'ڈیٹا بیس ری سیٹ', `All store records cleared.`);
  }

  // Export JSON Backup
  exportJsonBackup(): string {
    const backupObj = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      products: this.getProducts(),
      categories: this.getCategories(),
      suppliers: this.getSuppliers(),
      customers: this.getCustomers(),
      sales: this.getSales(),
      expenses: this.getExpenses(),
      customerLedger: this.getCustomerLedger(),
      supplierLedger: this.getSupplierLedger(),
      stockMovements: this.getStockMovements(),
      returns: this.getReturns(),
      cashSession: this.getCashSession(),
      settings: this.getSettings(),
      users: this.getUsers(),
      auditLogs: this.getAuditLogs()
    };
    return JSON.stringify(backupObj, null, 2);
  }

  // Export SQL Dump
  exportSqlDump(): string {
    return generateMySQLDump(
      this.getProducts(),
      this.getCategories(),
      this.getSuppliers(),
      this.getCustomers(),
      this.getSales(),
      this.getExpenses(),
      this.getCustomerLedger(),
      this.getSettings(),
      this.getUsers()
    );
  }

  // Restore JSON Backup
  importJsonBackup(jsonStr: string): { success: boolean; error?: string } {
    try {
      const data = JSON.parse(jsonStr);
      if (!data.products || !data.settings) {
        return { success: false, error: "Invalid backup format." };
      }
      if (data.products) this.setItem(STORAGE_KEYS.PRODUCTS, data.products);
      if (data.categories) this.setItem(STORAGE_KEYS.CATEGORIES, data.categories);
      if (data.suppliers) this.setItem(STORAGE_KEYS.SUPPLIERS, data.suppliers);
      if (data.customers) this.setItem(STORAGE_KEYS.CUSTOMERS, data.customers);
      if (data.sales) this.setItem(STORAGE_KEYS.SALES, data.sales);
      if (data.expenses) this.setItem(STORAGE_KEYS.EXPENSES, data.expenses);
      if (data.customerLedger) this.setItem(STORAGE_KEYS.CUSTOMER_LEDGER, data.customerLedger);
      if (data.supplierLedger) this.setItem(STORAGE_KEYS.SUPPLIER_LEDGER, data.supplierLedger);
      if (data.stockMovements) this.setItem(STORAGE_KEYS.STOCK_MOVEMENTS, data.stockMovements);
      if (data.returns) this.setItem(STORAGE_KEYS.RETURNS, data.returns);
      if (data.cashSession) this.setItem(STORAGE_KEYS.CASH_SESSION, data.cashSession);
      if (data.settings) this.setItem(STORAGE_KEYS.SETTINGS, data.settings);
      if (data.users) this.setItem(STORAGE_KEYS.USERS, data.users);
      if (data.auditLogs) this.setItem(STORAGE_KEYS.AUDIT_LOGS, data.auditLogs);

      this.addAuditLog('Backup Restored', 'بیک اپ بحال کیا گیا', 'Restored complete database from backup file.');
      return { success: true };
    } catch (e: any) {
      return { success: false, error: "Failed to parse backup file: " + (e.message || "Invalid JSON") };
    }
  }

  // --- Static State Helpers for React UI ---
  static loadState(): StoreState {
    return {
      products: storage.getProducts(),
      categories: storage.getCategories(),
      suppliers: storage.getSuppliers(),
      customers: storage.getCustomers(),
      sales: storage.getSales(),
      expenses: storage.getExpenses(),
      customerLedger: storage.getCustomerLedger(),
      supplierLedger: storage.getSupplierLedger(),
      stockMovements: storage.getStockMovements(),
      returns: storage.getReturns(),
      cashSession: storage.getCashSession(),
      settings: storage.getSettings(),
      users: storage.getUsers(),
      auditLogs: storage.getAuditLogs(),
    };
  }

  static saveState(state: StoreState): void {
    storage.setItem(STORAGE_KEYS.PRODUCTS, state.products);
    storage.setItem(STORAGE_KEYS.CATEGORIES, state.categories);
    storage.setItem(STORAGE_KEYS.SUPPLIERS, state.suppliers);
    storage.setItem(STORAGE_KEYS.CUSTOMERS, state.customers);
    storage.setItem(STORAGE_KEYS.SALES, state.sales);
    storage.setItem(STORAGE_KEYS.EXPENSES, state.expenses);
    storage.setItem(STORAGE_KEYS.CUSTOMER_LEDGER, state.customerLedger);
    storage.setItem(STORAGE_KEYS.SUPPLIER_LEDGER, state.supplierLedger);
    storage.setItem(STORAGE_KEYS.STOCK_MOVEMENTS, state.stockMovements);
    storage.setItem(STORAGE_KEYS.RETURNS, state.returns);
    storage.setItem(STORAGE_KEYS.CASH_SESSION, state.cashSession);
    storage.setItem(STORAGE_KEYS.SETTINGS, state.settings);
    storage.setItem(STORAGE_KEYS.USERS, state.users);
    storage.setItem(STORAGE_KEYS.AUDIT_LOGS, state.auditLogs);
  }

  static createSale(
    prev: StoreState,
    items: CartItem[],
    discountTotal: number,
    paidAmount: number,
    paymentMethod: PaymentMethod,
    cashierId: string,
    customerId?: string,
    notes?: string
  ): { newState: StoreState; sale: Sale } {
    const subtotal = items.reduce((acc, item) => acc + item.total, 0);
    const grandTotal = Math.max(0, subtotal - discountTotal);
    
    let creditAmount = 0;
    let changeAmount = 0;

    if (paymentMethod === 'credit') {
      creditAmount = grandTotal;
      paidAmount = 0;
      changeAmount = 0;
    } else if (paymentMethod === 'split') {
      creditAmount = Math.max(0, grandTotal - paidAmount);
      changeAmount = 0;
    } else {
      changeAmount = Math.max(0, paidAmount - grandTotal);
    }

    const invoiceNumber = 'INV-' + (1000 + prev.sales.length + 1);
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const cashier = prev.users.find(u => u.id === cashierId) || prev.users[0];
    const customer = customerId ? prev.customers.find(c => c.id === customerId) : undefined;

    const products = [...prev.products];
    const stockMovements = [...prev.stockMovements];

    const saleItems: SaleItem[] = items.map((item, idx) => {
      const pIdx = products.findIndex(p => p.id === item.product.id);
      if (pIdx !== -1) {
        const prevStock = products[pIdx].currentStock;
        const nextStock = Math.max(0, prevStock - item.quantity);
        products[pIdx] = { ...products[pIdx], currentStock: nextStock, updatedAt: nowStr };

        stockMovements.unshift({
          id: 'sm_' + Date.now() + '_' + idx,
          dateTime: nowStr,
          productId: item.product.id,
          productName: item.product.name,
          type: 'sale',
          quantityChange: -item.quantity,
          previousStock: prevStock,
          newStock: nextStock,
          referenceNumber: invoiceNumber,
          reason: `Sold in Invoice ${invoiceNumber}`,
          performedBy: cashier?.name || 'Cashier'
        });
      }

      return {
        id: 'si_' + Date.now() + '_' + idx,
        saleId: '',
        productId: item.product.id,
        productName: item.product.name,
        productNameUrdu: item.product.nameUrdu,
        unit: item.product.unit,
        quantity: item.quantity,
        purchasePrice: item.product.purchasePrice,
        sellingPrice: item.sellingPrice,
        discountPercent: item.discountPercent || 0,
        subtotal: item.total,
        total: item.total
      };
    });

    const newSale: Sale = {
      id: 'sale_' + Date.now(),
      invoiceNumber,
      dateTime: nowStr,
      customerId,
      customerName: customer?.name,
      items: saleItems,
      subtotal,
      discountTotal,
      grandTotal,
      paidAmount,
      changeAmount,
      creditAmount,
      paymentMethod,
      cashierId: cashier?.id || 'user_1',
      cashierName: cashier?.name || 'Cashier',
      status: 'completed',
      notes
    };

    newSale.items.forEach(i => (i.saleId = newSale.id));

    // Customer Udhaar update
    let customers = [...prev.customers];
    let customerLedger = [...prev.customerLedger];

    if (customerId && creditAmount > 0) {
      const cIdx = customers.findIndex(c => c.id === customerId);
      if (cIdx !== -1) {
        const prevUdhaar = customers[cIdx].outstandingCredit || 0;
        const newUdhaar = prevUdhaar + creditAmount;
        customers[cIdx] = {
          ...customers[cIdx],
          outstandingCredit: newUdhaar,
          totalPurchases: (customers[cIdx].totalPurchases || 0) + grandTotal,
          totalPaid: (customers[cIdx].totalPaid || 0) + paidAmount
        };

        customerLedger.unshift({
          id: 'cl_' + Date.now(),
          customerId,
          dateTime: nowStr,
          type: 'sale_credit',
          invoiceOrRefNumber: invoiceNumber,
          debit: creditAmount,
          credit: 0,
          balance: newUdhaar,
          notes: `Bill credit for Invoice ${invoiceNumber}`,
          receivedBy: cashier?.name || 'Cashier'
        });
      }
    }

    // Cash Drawer Update
    const cashSession = { ...prev.cashSession };
    if (paymentMethod === 'cash' || paymentMethod === 'split') {
      const cashRec = paymentMethod === 'split' ? paidAmount : Math.min(paidAmount, grandTotal);
      cashSession.totalCashSales = (cashSession.totalCashSales || 0) + cashRec;
      cashSession.cashSales = (cashSession.cashSales || 0) + cashRec;
      cashSession.expectedCash = (cashSession.expectedCash || 0) + cashRec;
    }

    // Audit log
    const auditLogs = [
      {
        id: 'log_' + Date.now(),
        dateTime: nowStr,
        userId: cashier?.id || 'sys',
        userName: cashier?.name || 'Cashier',
        userRole: cashier?.role || 'cashier',
        action: 'Sale Completed',
        actionUrdu: 'فروخت مکمل ہوئی',
        details: `Invoice ${invoiceNumber} total ${grandTotal} via ${paymentMethod}`
      },
      ...prev.auditLogs
    ];

    const newState: StoreState = {
      ...prev,
      products,
      stockMovements: stockMovements.slice(0, 500),
      sales: [newSale, ...prev.sales],
      customers,
      customerLedger,
      cashSession,
      auditLogs: auditLogs.slice(0, 300)
    };

    return { newState, sale: newSale };
  }

  static adjustStock(
    prev: StoreState,
    productId: string,
    adjustedQty: number,
    type: 'damage' | 'expired' | 'manual_adjustment',
    reason: string,
    performedBy: string
  ): StoreState {
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const products = prev.products.map(p => {
      if (p.id === productId) {
        const prevStock = p.currentStock;
        const nextStock = Math.max(0, prevStock + adjustedQty);
        return { ...p, currentStock: nextStock, updatedAt: nowStr };
      }
      return p;
    });

    const prod = prev.products.find(p => p.id === productId);
    const prevStock = prod ? prod.currentStock : 0;
    const nextStock = Math.max(0, prevStock + adjustedQty);

    const stockMovements = [
      {
        id: 'sm_' + Date.now(),
        dateTime: nowStr,
        productId,
        productName: prod?.name || 'Product',
        type,
        quantityChange: adjustedQty,
        previousStock: prevStock,
        newStock: nextStock,
        referenceNumber: 'ADJ-' + Date.now().toString().slice(-4),
        reason,
        performedBy
      },
      ...prev.stockMovements
    ];

    return {
      ...prev,
      products,
      stockMovements: stockMovements.slice(0, 500)
    };
  }

  static recordPurchase(
    prev: StoreState,
    supplierId: string,
    invoiceNumber: string,
    items: { productId: string; quantity: number; purchasePrice: number }[],
    paidAmount: number,
    paymentMethod: 'cash' | 'bank' | 'credit',
    cashierId: string,
    notes: string
  ): StoreState {
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const cashier = prev.users.find(u => u.id === cashierId) || prev.users[0];

    const totalAmount = items.reduce((sum, item) => sum + item.quantity * item.purchasePrice, 0);
    const remainingAmount = Math.max(0, totalAmount - paidAmount);

    const products = [...prev.products];
    const stockMovements = [...prev.stockMovements];

    items.forEach(item => {
      const pIdx = products.findIndex(p => p.id === item.productId);
      if (pIdx !== -1) {
        const prevStock = products[pIdx].currentStock;
        const nextStock = prevStock + item.quantity;
        products[pIdx] = {
          ...products[pIdx],
          currentStock: nextStock,
          purchasePrice: item.purchasePrice,
          updatedAt: nowStr
        };

        stockMovements.unshift({
          id: 'sm_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
          dateTime: nowStr,
          productId: item.productId,
          productName: products[pIdx].name,
          type: 'purchase',
          quantityChange: item.quantity,
          previousStock: prevStock,
          newStock: nextStock,
          referenceNumber: invoiceNumber,
          reason: `Purchase Bill ${invoiceNumber}`,
          performedBy: cashier.name
        });
      }
    });

    const suppliers = prev.suppliers.map(s => {
      if (s.id === supplierId) {
        const prevBal = s.balancePayable || 0;
        const nextBal = prevBal + remainingAmount;
        return {
          ...s,
          balancePayable: nextBal,
          totalPurchases: (s.totalPurchases || 0) + totalAmount,
          totalPaid: (s.totalPaid || 0) + paidAmount
        };
      }
      return s;
    });

    const cashSession = { ...prev.cashSession };
    if (paymentMethod === 'cash' && paidAmount > 0) {
      cashSession.totalSupplierPayments = (cashSession.totalSupplierPayments || 0) + paidAmount;
      cashSession.cashSupplierPayments = (cashSession.cashSupplierPayments || 0) + paidAmount;
      cashSession.expectedCash = (cashSession.expectedCash || 0) - paidAmount;
    }

    return {
      ...prev,
      products,
      suppliers,
      stockMovements: stockMovements.slice(0, 500),
      cashSession
    };
  }

  static receiveCustomerPayment(
    prev: StoreState,
    customerId: string,
    amount: number,
    paymentMethod: string,
    receivedBy: string,
    notes: string
  ): StoreState {
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
    let newUdhaar = 0;

    const customers = prev.customers.map(c => {
      if (c.id === customerId) {
        const prevBal = c.outstandingCredit || 0;
        newUdhaar = Math.max(0, prevBal - amount);
        return {
          ...c,
          outstandingCredit: newUdhaar,
          totalPaid: (c.totalPaid || 0) + amount,
          lastPaymentDate: nowStr
        };
      }
      return c;
    });

    const customerLedger = [
      {
        id: 'cl_' + Date.now(),
        customerId,
        dateTime: nowStr,
        type: 'payment_received' as const,
        invoiceOrRefNumber: 'PAY-' + Date.now().toString().slice(-4),
        debit: 0,
        credit: amount,
        balance: newUdhaar,
        notes: notes || `Payment received via ${paymentMethod}`,
        receivedBy
      },
      ...prev.customerLedger
    ];

    const cashSession = { ...prev.cashSession };
    if (paymentMethod === 'cash') {
      cashSession.totalCustomerPayments = (cashSession.totalCustomerPayments || 0) + amount;
      cashSession.customerCashPayments = (cashSession.customerCashPayments || 0) + amount;
      cashSession.expectedCash = (cashSession.expectedCash || 0) + amount;
    }

    return {
      ...prev,
      customers,
      customerLedger,
      cashSession
    };
  }

  static paySupplier(
    prev: StoreState,
    supplierId: string,
    amount: number,
    paymentMethod: string,
    recordedBy: string,
    notes: string
  ): StoreState {
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
    let newPayable = 0;

    const suppliers = prev.suppliers.map(s => {
      if (s.id === supplierId) {
        const prevBal = s.balancePayable || 0;
        newPayable = Math.max(0, prevBal - amount);
        return {
          ...s,
          balancePayable: newPayable,
          totalPaid: (s.totalPaid || 0) + amount
        };
      }
      return s;
    });

    const supplierLedger = [
      {
        id: 'sl_' + Date.now(),
        supplierId,
        dateTime: nowStr,
        type: 'payment_made' as const,
        invoiceOrRefNumber: 'SUPPAY-' + Date.now().toString().slice(-4),
        debit: amount,
        credit: 0,
        balance: newPayable,
        notes: notes || `Payment made to distributor via ${paymentMethod}`
      },
      ...prev.supplierLedger
    ];

    const cashSession = { ...prev.cashSession };
    if (paymentMethod === 'cash') {
      cashSession.totalSupplierPayments = (cashSession.totalSupplierPayments || 0) + amount;
      cashSession.cashSupplierPayments = (cashSession.cashSupplierPayments || 0) + amount;
      cashSession.expectedCash = (cashSession.expectedCash || 0) - amount;
    }

    return {
      ...prev,
      suppliers,
      supplierLedger,
      cashSession
    };
  }

  static closeCashSession(
    prev: StoreState,
    actualCash: number,
    notes: string
  ): StoreState {
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const expected = prev.cashSession.expectedCash || 0;
    const difference = actualCash - expected;

    const cashSession: CashSession = {
      ...prev.cashSession,
      closedAt: nowStr,
      actualCash,
      difference,
      status: 'closed',
      notes
    };

    return {
      ...prev,
      cashSession
    };
  }

  static processSaleReturn(
    prev: StoreState,
    saleId: string,
    items: { productId: string; quantity: number; refundAmount: number }[],
    refundMethod: 'cash' | 'credit_reduction',
    reason: string,
    processedBy: string
  ): StoreState {
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const sale = prev.sales.find(s => s.id === saleId);
    const products = [...prev.products];
    const stockMovements = [...prev.stockMovements];
    let totalRefund = 0;

    const returnItems: ReturnItem[] = items.map(ret => {
      totalRefund += ret.refundAmount;
      const pIdx = products.findIndex(p => p.id === ret.productId);
      if (pIdx !== -1) {
        const prevStock = products[pIdx].currentStock;
        const nextStock = prevStock + ret.quantity;
        products[pIdx] = { ...products[pIdx], currentStock: nextStock, updatedAt: nowStr };

        stockMovements.unshift({
          id: 'sm_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
          dateTime: nowStr,
          productId: ret.productId,
          productName: products[pIdx].name,
          type: 'return',
          quantityChange: ret.quantity,
          previousStock: prevStock,
          newStock: nextStock,
          referenceNumber: sale?.invoiceNumber || '',
          reason: `Return: ${reason}`,
          performedBy: processedBy
        });
      }

      return {
        productId: ret.productId,
        productName: products.find(p => p.id === ret.productId)?.name || 'Item',
        quantity: ret.quantity,
        refundAmount: ret.refundAmount
      };
    });

    const newReturn: SaleReturn = {
      id: 'ret_' + Date.now(),
      returnNumber: 'RET-' + Date.now().toString().slice(-6),
      saleId,
      saleInvoiceNumber: sale?.invoiceNumber || '',
      invoiceNumber: sale?.invoiceNumber || '',
      customerName: sale?.customerName,
      items: returnItems,
      totalRefundAmount: totalRefund,
      totalRefund,
      refundMethod,
      reason,
      dateTime: nowStr,
      processedBy
    };

    const sales = prev.sales.map(s => s.id === saleId ? { ...s, status: 'partially_returned' as const } : s);

    const cashSession = { ...prev.cashSession };
    if (refundMethod === 'cash') {
      cashSession.cashRefunds = (cashSession.cashRefunds || 0) + totalRefund;
      cashSession.expectedCash = (cashSession.expectedCash || 0) - totalRefund;
    }

    return {
      ...prev,
      products,
      sales,
      returns: [newReturn, ...prev.returns],
      stockMovements: stockMovements.slice(0, 500),
      cashSession
    };
  }

  static resetStore(): StoreState {
    const fresh: StoreState = {
      products: initialProducts,
      categories: initialCategories,
      suppliers: initialSuppliers,
      customers: initialCustomers,
      sales: initialSales,
      expenses: initialExpenses,
      customerLedger: initialCustomerLedger,
      supplierLedger: [],
      stockMovements: [],
      returns: [],
      cashSession: initialCashSession,
      settings: initialStoreSettings,
      users: initialUsers,
      auditLogs: initialAuditLogs
    };
    StorageService.saveState(fresh);
    return fresh;
  }
}

export const storage = new StorageService();
