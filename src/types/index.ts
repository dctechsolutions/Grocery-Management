export type Language = 'en' | 'ur';

export type UserRole = 'admin' | 'cashier';

export interface User {
  id: string;
  name: string;
  username: string;
  role: UserRole;
  pin: string; // 4-digit PIN for quick cashier login
  avatar?: string;
  status?: 'active' | 'inactive';
}

export type UnitType = 'piece' | 'kg' | 'gram' | 'liter' | 'ml' | 'dozen' | 'box' | 'packet';

export interface Category {
  id: string;
  name: string;
  nameUrdu: string;
  icon?: string;
  color?: string;
}

export interface Product {
  id: string;
  name: string;
  nameUrdu?: string;
  barcode: string;
  categoryId: string;
  brand?: string;
  unit: UnitType;
  purchasePrice: number; // Cost price
  sellingPrice: number; // Retail price
  currentStock: number;
  minStockLevel: number;
  supplierId?: string;
  expiryDate?: string;
  status: 'active' | 'inactive';
  createdAt?: string;
  updatedAt?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  sellingPrice: number; // In case of manual price override
  discountPercent?: number;
  total: number;
  purchasePrice: number; // Locked cost price for COGS
}

export type PaymentMethod = 'cash' | 'credit' | 'easypaisa' | 'jazzcash' | 'card' | 'split';

export interface SaleItem {
  id: string;
  saleId: string;
  productId: string;
  productName: string;
  productNameUrdu?: string;
  unit: UnitType;
  quantity: number;
  purchasePrice: number; // COGS at moment of sale
  sellingPrice: number;
  discountPercent: number;
  subtotal: number;
  total?: number;
}

export interface Sale {
  id: string;
  invoiceNumber: string;
  dateTime: string;
  customerId?: string;
  customerName?: string;
  items: SaleItem[];
  subtotal: number;
  discountTotal: number;
  grandTotal: number;
  paidAmount: number;
  changeAmount: number;
  creditAmount: number;
  paymentMethod: PaymentMethod;
  cashierId: string;
  cashierName: string;
  status: 'completed' | 'returned' | 'partially_returned';
  notes?: string;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson?: string;
  phone: string;
  address?: string;
  notes?: string;
  totalPurchases?: number;
  totalPaid?: number;
  balancePayable: number;
  status?: 'active' | 'inactive';
}

export interface PurchaseItem {
  id: string;
  purchaseId: string;
  productId: string;
  productName: string;
  quantity: number;
  unit: UnitType;
  purchasePrice: number;
  total: number;
}

export interface Purchase {
  id: string;
  invoiceNumber: string;
  supplierId: string;
  supplierName: string;
  date: string;
  items: PurchaseItem[];
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  paymentMethod: 'cash' | 'bank' | 'credit';
  notes?: string;
  createdAt: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address?: string;
  notes?: string;
  creditLimit: number;
  totalPurchases?: number;
  totalPaid?: number;
  outstandingCredit: number; // Total Udhaar
  lastPaymentDate?: string;
  status?: 'active' | 'inactive';
}

export interface CustomerLedgerEntry {
  id: string;
  customerId: string;
  dateTime: string;
  type: 'sale_credit' | 'payment_received' | 'return_credit_adjustment';
  invoiceOrRefNumber: string;
  debit: number; // Udhaar added
  credit: number; // Amount paid by customer
  balance: number; // Remaining Udhaar balance after this transaction
  notes?: string;
  receivedBy: string;
}

export interface SupplierLedgerEntry {
  id: string;
  supplierId: string;
  dateTime: string;
  type: 'purchase_credit' | 'payment_made';
  invoiceOrRefNumber: string;
  debit: number; // Amount paid to supplier
  credit: number; // Bill amount added
  balance: number; // Remaining payable to supplier
  notes?: string;
}

export type ExpenseCategory = 
  | 'tea_refreshment'
  | 'electricity_utility'
  | 'shop_rent'
  | 'staff_salary'
  | 'transport_delivery'
  | 'bags_packaging'
  | 'maintenance_repair'
  | 'other'
  | 'Rent' 
  | 'Electricity' 
  | 'Salary' 
  | 'Transport' 
  | 'Maintenance' 
  | 'Packaging' 
  | 'Tea_Snacks' 
  | 'Internet' 
  | 'Other'
  | string;

export interface Expense {
  id: string;
  category: ExpenseCategory;
  amount: number;
  date: string;
  description: string;
  paidFromDrawer?: boolean;
  paymentMethod?: 'cash' | 'bank' | 'other';
  recordedBy: string;
  notes?: string;
}

export interface CashSession {
  id: string;
  date: string;
  openedAt: string;
  closedAt?: string;
  openedBy: string;
  closedBy?: string;
  openingCash: number;
  totalCashSales?: number;
  totalCustomerPayments?: number;
  totalCashExpenses?: number;
  totalSupplierPayments?: number;
  cashSales?: number;
  customerCashPayments?: number;
  cashExpenses?: number;
  cashSupplierPayments?: number;
  cashRefunds?: number;
  expectedCash: number;
  actualCash?: number;
  difference?: number;
  status: 'open' | 'closed';
  notes?: string;
}

export type StockMovementType = 
  | 'sale' 
  | 'purchase' 
  | 'return' 
  | 'damage' 
  | 'expired' 
  | 'manual_adjustment';

export interface StockMovement {
  id: string;
  dateTime: string;
  productId: string;
  productName: string;
  type: StockMovementType;
  quantityChange: number; // Positive or negative
  previousStock: number;
  newStock: number;
  referenceNumber?: string;
  reason?: string;
  performedBy: string;
}

export interface ReturnItem {
  productId: string;
  saleItemId?: string;
  productName: string;
  quantity?: number;
  returnedQuantity?: number;
  unit?: UnitType;
  unitPrice?: number;
  refundAmount: number;
}

export interface SaleReturn {
  id: string;
  returnNumber?: string;
  saleId: string;
  saleInvoiceNumber?: string;
  invoiceNumber?: string;
  customerName?: string;
  items: ReturnItem[];
  totalRefundAmount?: number;
  totalRefund?: number;
  refundMethod?: 'cash' | 'credit_reduction';
  reason: string;
  dateTime: string;
  processedBy: string;
  notes?: string;
}

export interface StoreSettings {
  storeName: string;
  storeNameUrdu: string;
  phone: string;
  address: string;
  currency: string;
  currencySymbol: string;
  taxRate?: number;
  taxNumber?: string;
  enableTax?: boolean;
  receiptHeader: string;
  receiptFooter: string;
  receiptFooterUrdu?: string;
  paperSize?: '58mm' | '80mm' | 'A4';
  lowStockThresholdDefault?: number;
  defaultLanguage?: Language;
  allowCashierDiscount?: boolean;
  autoPrintReceipt?: boolean;
  logoUrl?: string;
}

export interface AuditLog {
  id: string;
  dateTime: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  actionUrdu?: string;
  details: string;
  ipAddress?: string;
}

export interface StoreState {
  products: Product[];
  categories: Category[];
  suppliers: Supplier[];
  customers: Customer[];
  sales: Sale[];
  expenses: Expense[];
  customerLedger: CustomerLedgerEntry[];
  supplierLedger: SupplierLedgerEntry[];
  stockMovements: StockMovement[];
  returns: SaleReturn[];
  cashSession: CashSession;
  settings: StoreSettings;
  users: User[];
  auditLogs: AuditLog[];
}
