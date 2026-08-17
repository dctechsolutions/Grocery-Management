import { Product, Category, Supplier, Customer, Sale, Expense, CustomerLedgerEntry, StoreSettings, User, StoreState } from '../types';

export function generateMySQLDump(
  arg1: Product[] | StoreState,
  categories?: Category[],
  suppliers?: Supplier[],
  customers?: Customer[],
  sales?: Sale[],
  expenses?: Expense[],
  customerLedger?: CustomerLedgerEntry[],
  settings?: StoreSettings,
  users?: User[]
): string {
  let productsList: Product[] = [];
  let categoriesList: Category[] = [];
  let suppliersList: Supplier[] = [];
  let customersList: Customer[] = [];
  let salesList: Sale[] = [];
  let expensesList: Expense[] = [];
  let customerLedgerList: CustomerLedgerEntry[] = [];
  let settingsObj: StoreSettings = {
    storeName: 'Al-Madina Super Store',
    storeNameUrdu: 'المدینہ سپر اسٹور',
    phone: '0300-1234567',
    address: 'Main Bazar, Grocery Market',
    currency: 'PKR',
    currencySymbol: 'Rs.',
    receiptHeader: 'AL-MADINA SUPER STORE\nQuality Groceries & Daily Needs',
    receiptFooter: 'Thank you for shopping with us!\nItems once sold can be returned within 3 days with receipt.',
    receiptFooterUrdu: 'خریداری کا شکریہ۔ اشیاء 3 دن میں رسید کے ساتھ تبدیل ہو سکتی ہیں۔',
    paperSize: '80mm',
    defaultLanguage: 'en'
  };
  let usersList: User[] = [];

  if (arg1 && 'products' in arg1 && 'settings' in arg1) {
    // It's a StoreState
    const state = arg1 as StoreState;
    productsList = state.products || [];
    categoriesList = state.categories || [];
    suppliersList = state.suppliers || [];
    customersList = state.customers || [];
    salesList = state.sales || [];
    expensesList = state.expenses || [];
    customerLedgerList = state.customerLedger || [];
    settingsObj = state.settings || settingsObj;
    usersList = state.users || [];
  } else if (Array.isArray(arg1)) {
    productsList = arg1;
    categoriesList = categories || [];
    suppliersList = suppliers || [];
    customersList = customers || [];
    salesList = sales || [];
    expensesList = expenses || [];
    customerLedgerList = customerLedger || [];
    settingsObj = settings || settingsObj;
    usersList = users || [];
  }

  const products = productsList;
  const categoriesArr = categoriesList;
  const suppliersArr = suppliersList;
  const customersArr = customersList;
  const salesArr = salesList;
  const expensesArr = expensesList;
  const customerLedgerArr = customerLedgerList;
  const settingsData = settingsObj;
  const usersArr = usersList;

  const dateStr = new Date().toISOString().replace('T', ' ').substring(0, 19);

  return `-- ==========================================================
-- GROCERY STORE MANAGEMENT SYSTEM (XAMPP / MySQL / MariaDB)
-- Generated on: ${dateStr}
-- Compatible with: MySQL 5.7+, MySQL 8.0+, MariaDB 10.3+
-- Engine: InnoDB | Charset: utf8mb4 | Collation: utf8mb4_unicode_ci
-- ==========================================================

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

CREATE DATABASE IF NOT EXISTS \`grocery_store\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE \`grocery_store\`;

-- --------------------------------------------------------
-- Table: \`users\`
-- --------------------------------------------------------
DROP TABLE IF EXISTS \`users\`;
CREATE TABLE \`users\` (
  \`id\` varchar(50) NOT NULL,
  \`name\` varchar(100) NOT NULL,
  \`username\` varchar(50) NOT NULL UNIQUE,
  \`password_hash\` varchar(255) NOT NULL,
  \`role\` enum('admin','cashier') NOT NULL DEFAULT 'cashier',
  \`pin\` varchar(10) DEFAULT '1234',
  \`created_at\` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table: \`categories\`
-- --------------------------------------------------------
DROP TABLE IF EXISTS \`categories\`;
CREATE TABLE \`categories\` (
  \`id\` varchar(50) NOT NULL,
  \`name\` varchar(100) NOT NULL,
  \`name_urdu\` varchar(150) DEFAULT NULL,
  \`color\` varchar(20) DEFAULT '#3b82f6',
  \`created_at\` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table: \`suppliers\`
-- --------------------------------------------------------
DROP TABLE IF EXISTS \`suppliers\`;
CREATE TABLE \`suppliers\` (
  \`id\` varchar(50) NOT NULL,
  \`name\` varchar(150) NOT NULL,
  \`contact_person\` varchar(100) DEFAULT NULL,
  \`phone\` varchar(50) NOT NULL,
  \`address\` text DEFAULT NULL,
  \`notes\` text DEFAULT NULL,
  \`total_purchases\` decimal(12,2) DEFAULT 0.00,
  \`total_paid\` decimal(12,2) DEFAULT 0.00,
  \`balance_payable\` decimal(12,2) DEFAULT 0.00,
  \`created_at\` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table: \`customers\`
-- --------------------------------------------------------
DROP TABLE IF EXISTS \`customers\`;
CREATE TABLE \`customers\` (
  \`id\` varchar(50) NOT NULL,
  \`name\` varchar(150) NOT NULL,
  \`phone\` varchar(50) NOT NULL,
  \`address\` text DEFAULT NULL,
  \`notes\` text DEFAULT NULL,
  \`credit_limit\` decimal(12,2) DEFAULT 10000.00,
  \`total_purchases\` decimal(12,2) DEFAULT 0.00,
  \`total_paid\` decimal(12,2) DEFAULT 0.00,
  \`outstanding_credit\` decimal(12,2) DEFAULT 0.00,
  \`created_at\` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`),
  KEY \`idx_cust_phone\` (\`phone\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table: \`products\`
-- --------------------------------------------------------
DROP TABLE IF EXISTS \`products\`;
CREATE TABLE \`products\` (
  \`id\` varchar(50) NOT NULL,
  \`name\` varchar(150) NOT NULL,
  \`name_urdu\` varchar(150) DEFAULT NULL,
  \`barcode\` varchar(50) NOT NULL,
  \`category_id\` varchar(50) NOT NULL,
  \`brand\` varchar(100) DEFAULT NULL,
  \`unit\` enum('piece','kg','gram','liter','ml','dozen','box','packet') NOT NULL DEFAULT 'piece',
  \`purchase_price\` decimal(10,2) NOT NULL,
  \`selling_price\` decimal(10,2) NOT NULL,
  \`current_stock\` decimal(10,2) NOT NULL DEFAULT 0.00,
  \`min_stock_level\` decimal(10,2) NOT NULL DEFAULT 5.00,
  \`supplier_id\` varchar(50) DEFAULT NULL,
  \`expiry_date\` date DEFAULT NULL,
  \`status\` enum('active','inactive') NOT NULL DEFAULT 'active',
  \`created_at\` timestamp DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`),
  KEY \`idx_prod_barcode\` (\`barcode\`),
  KEY \`idx_prod_category\` (\`category_id\`),
  CONSTRAINT \`fk_prod_category\` FOREIGN KEY (\`category_id\`) REFERENCES \`categories\` (\`id\`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table: \`sales\`
-- --------------------------------------------------------
DROP TABLE IF EXISTS \`sales\`;
CREATE TABLE \`sales\` (
  \`id\` varchar(50) NOT NULL,
  \`invoice_number\` varchar(50) NOT NULL UNIQUE,
  \`date_time\` datetime NOT NULL,
  \`customer_id\` varchar(50) DEFAULT NULL,
  \`customer_name\` varchar(150) DEFAULT NULL,
  \`subtotal\` decimal(12,2) NOT NULL,
  \`discount_total\` decimal(10,2) DEFAULT 0.00,
  \`grand_total\` decimal(12,2) NOT NULL,
  \`paid_amount\` decimal(12,2) NOT NULL,
  \`change_amount\` decimal(10,2) DEFAULT 0.00,
  \`credit_amount\` decimal(12,2) DEFAULT 0.00,
  \`payment_method\` enum('cash','credit','easypaisa','jazzcash','card','split') NOT NULL DEFAULT 'cash',
  \`cashier_id\` varchar(50) NOT NULL,
  \`cashier_name\` varchar(100) NOT NULL,
  \`status\` enum('completed','returned','partially_returned') NOT NULL DEFAULT 'completed',
  \`notes\` text DEFAULT NULL,
  \`created_at\` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`),
  KEY \`idx_sales_date\` (\`date_time\`),
  KEY \`idx_sales_cust\` (\`customer_id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table: \`sale_items\`
-- --------------------------------------------------------
DROP TABLE IF EXISTS \`sale_items\`;
CREATE TABLE \`sale_items\` (
  \`id\` varchar(50) NOT NULL,
  \`sale_id\` varchar(50) NOT NULL,
  \`product_id\` varchar(50) NOT NULL,
  \`product_name\` varchar(150) NOT NULL,
  \`unit\` varchar(20) NOT NULL,
  \`quantity\` decimal(10,2) NOT NULL,
  \`purchase_price\` decimal(10,2) NOT NULL,
  \`selling_price\` decimal(10,2) NOT NULL,
  \`discount_percent\` decimal(5,2) DEFAULT 0.00,
  \`subtotal\` decimal(12,2) NOT NULL,
  PRIMARY KEY (\`id\`),
  KEY \`idx_si_sale\` (\`sale_id\`),
  KEY \`idx_si_product\` (\`product_id\`),
  CONSTRAINT \`fk_si_sale\` FOREIGN KEY (\`sale_id\`) REFERENCES \`sales\` (\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table: \`customer_ledger\`
-- --------------------------------------------------------
DROP TABLE IF EXISTS \`customer_ledger\`;
CREATE TABLE \`customer_ledger\` (
  \`id\` varchar(50) NOT NULL,
  \`customer_id\` varchar(50) NOT NULL,
  \`date_time\` datetime NOT NULL,
  \`type\` enum('sale_credit','payment_received','return_credit_adjustment') NOT NULL,
  \`invoice_or_ref_number\` varchar(50) NOT NULL,
  \`debit\` decimal(12,2) DEFAULT 0.00,
  \`credit\` decimal(12,2) DEFAULT 0.00,
  \`balance\` decimal(12,2) NOT NULL,
  \`notes\` text DEFAULT NULL,
  \`received_by\` varchar(100) NOT NULL,
  \`created_at\` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`),
  KEY \`idx_cl_cust\` (\`customer_id\`),
  CONSTRAINT \`fk_cl_cust\` FOREIGN KEY (\`customer_id\`) REFERENCES \`customers\` (\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table: \`expenses\`
-- --------------------------------------------------------
DROP TABLE IF EXISTS \`expenses\`;
CREATE TABLE \`expenses\` (
  \`id\` varchar(50) NOT NULL,
  \`category\` varchar(50) NOT NULL,
  \`amount\` decimal(10,2) NOT NULL,
  \`date\` date NOT NULL,
  \`description\` text NOT NULL,
  \`payment_method\` enum('cash','bank','other') NOT NULL DEFAULT 'cash',
  \`recorded_by\` varchar(100) NOT NULL,
  \`created_at\` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table: \`stock_movements\`
-- --------------------------------------------------------
DROP TABLE IF EXISTS \`stock_movements\`;
CREATE TABLE \`stock_movements\` (
  \`id\` varchar(50) NOT NULL,
  \`date_time\` datetime NOT NULL,
  \`product_id\` varchar(50) NOT NULL,
  \`product_name\` varchar(150) NOT NULL,
  \`type\` enum('sale','purchase','return','damage','expired','manual_adjustment') NOT NULL,
  \`quantity_change\` decimal(10,2) NOT NULL,
  \`previous_stock\` decimal(10,2) NOT NULL,
  \`new_stock\` decimal(10,2) NOT NULL,
  \`reference_number\` varchar(50) DEFAULT NULL,
  \`reason\` text DEFAULT NULL,
  \`performed_by\` varchar(100) NOT NULL,
  PRIMARY KEY (\`id\`),
  KEY \`idx_sm_prod\` (\`product_id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table: \`store_settings\`
-- --------------------------------------------------------
DROP TABLE IF EXISTS \`store_settings\`;
CREATE TABLE \`store_settings\` (
  \`key_name\` varchar(50) NOT NULL,
  \`value\` text NOT NULL,
  PRIMARY KEY (\`key_name\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table: \`audit_logs\`
-- --------------------------------------------------------
DROP TABLE IF EXISTS \`audit_logs\`;
CREATE TABLE \`audit_logs\` (
  \`id\` varchar(50) NOT NULL,
  \`date_time\` datetime NOT NULL,
  \`user_id\` varchar(50) NOT NULL,
  \`user_name\` varchar(100) NOT NULL,
  \`user_role\` varchar(20) NOT NULL,
  \`action\` varchar(150) NOT NULL,
  \`details\` text NOT NULL,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================================
-- SEED DATA INSERTION
-- ==========================================================

-- Insert Users (Default Password for admin: admin123, Cashier: cashier123)
INSERT INTO \`users\` (\`id\`, \`name\`, \`username\`, \`password_hash\`, \`role\`, \`pin\`) VALUES
('user_1', 'Muhammad Tariq (Owner)', 'admin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', '1234'),
('user_2', 'Bilal Ahmed (Cashier)', 'cashier', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'cashier', '0000');

-- Insert Categories
${categoriesArr.map(c => `INSERT INTO \`categories\` (\`id\`, \`name\`, \`name_urdu\`, \`color\`) VALUES ('${c.id}', '${escapeSql(c.name)}', '${escapeSql(c.nameUrdu || '')}', '${c.color}');`).join('\n')}

-- Insert Suppliers
${suppliersArr.map(s => `INSERT INTO \`suppliers\` (\`id\`, \`name\`, \`contact_person\`, \`phone\`, \`address\`, \`notes\`, \`total_purchases\`, \`total_paid\`, \`balance_payable\`) VALUES ('${s.id}', '${escapeSql(s.name)}', '${escapeSql(s.contactPerson || '')}', '${escapeSql(s.phone)}', '${escapeSql(s.address || '')}', '${escapeSql(s.notes || '')}', ${s.totalPurchases || 0}, ${s.totalPaid || 0}, ${s.balancePayable || 0});`).join('\n')}

-- Insert Customers
${customersArr.map(c => `INSERT INTO \`customers\` (\`id\`, \`name\`, \`phone\`, \`address\`, \`notes\`, \`credit_limit\`, \`total_purchases\`, \`total_paid\`, \`outstanding_credit\`) VALUES ('${c.id}', '${escapeSql(c.name)}', '${escapeSql(c.phone)}', '${escapeSql(c.address || '')}', '${escapeSql(c.notes || '')}', ${c.creditLimit || 0}, ${c.totalPurchases || 0}, ${c.totalPaid || 0}, ${c.outstandingCredit || 0});`).join('\n')}

-- Insert Products
${products.map(p => `INSERT INTO \`products\` (\`id\`, \`name\`, \`name_urdu\`, \`barcode\`, \`category_id\`, \`brand\`, \`unit\`, \`purchase_price\`, \`selling_price\`, \`current_stock\`, \`min_stock_level\`, \`supplier_id\`, \`status\`) VALUES ('${p.id}', '${escapeSql(p.name)}', '${escapeSql(p.nameUrdu || '')}', '${p.barcode}', '${p.categoryId}', '${escapeSql(p.brand || '')}', '${p.unit}', ${p.purchasePrice}, ${p.sellingPrice}, ${p.currentStock}, ${p.minStockLevel}, ${p.supplierId ? `'${p.supplierId}'` : 'NULL'}, '${p.status}');`).join('\n')}

-- Insert Settings
INSERT INTO \`store_settings\` (\`key_name\`, \`value\`) VALUES
('store_name', '${escapeSql(settingsData.storeName)}'),
('store_name_urdu', '${escapeSql(settingsData.storeNameUrdu)}'),
('phone', '${escapeSql(settingsData.phone)}'),
('address', '${escapeSql(settingsData.address)}'),
('currency', '${escapeSql(settingsData.currency)}'),
('currency_symbol', '${escapeSql(settingsData.currencySymbol)}'),
('receipt_header', '${escapeSql(settingsData.receiptHeader)}'),
('receipt_footer', '${escapeSql(settingsData.receiptFooter)}'),
('receipt_footer_urdu', '${escapeSql(settingsData.receiptFooterUrdu || '')}'),
('paper_size', '${escapeSql(settingsData.paperSize || '80mm')}'),
('default_language', '${escapeSql(settingsData.defaultLanguage || 'en')}');

COMMIT;
`;
}

export const generateFullSqlDump = generateMySQLDump;

function escapeSql(str: string): string {
  if (!str) return '';
  return str.replace(/'/g, "''").replace(/\\/g, "\\\\");
}
