-- ==========================================================
-- GROCERY STORE MANAGEMENT SYSTEM (XAMPP / MySQL / MariaDB)
-- Complete Database Schema & Initial Seed Data
-- ==========================================================

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

CREATE DATABASE IF NOT EXISTS `grocery_store` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `grocery_store`;

-- --------------------------------------------------------
-- Table structure for table `users`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` varchar(50) NOT NULL,
  `name` varchar(100) NOT NULL,
  `username` varchar(50) NOT NULL UNIQUE,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('admin','cashier') NOT NULL DEFAULT 'cashier',
  `pin` varchar(10) DEFAULT '1234',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for table `categories`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `categories`;
CREATE TABLE `categories` (
  `id` varchar(50) NOT NULL,
  `name` varchar(100) NOT NULL,
  `name_urdu` varchar(150) DEFAULT NULL,
  `color` varchar(20) DEFAULT '#3b82f6',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for table `suppliers`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `suppliers`;
CREATE TABLE `suppliers` (
  `id` varchar(50) NOT NULL,
  `name` varchar(150) NOT NULL,
  `contact_person` varchar(100) DEFAULT NULL,
  `phone` varchar(50) NOT NULL,
  `address` text DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `total_purchases` decimal(12,2) DEFAULT 0.00,
  `total_paid` decimal(12,2) DEFAULT 0.00,
  `balance_payable` decimal(12,2) DEFAULT 0.00,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for table `customers`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `customers`;
CREATE TABLE `customers` (
  `id` varchar(50) NOT NULL,
  `name` varchar(150) NOT NULL,
  `phone` varchar(50) NOT NULL,
  `address` text DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `credit_limit` decimal(12,2) DEFAULT 10000.00,
  `total_purchases` decimal(12,2) DEFAULT 0.00,
  `total_paid` decimal(12,2) DEFAULT 0.00,
  `outstanding_credit` decimal(12,2) DEFAULT 0.00,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_cust_phone` (`phone`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for table `products`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `products`;
CREATE TABLE `products` (
  `id` varchar(50) NOT NULL,
  `name` varchar(150) NOT NULL,
  `name_urdu` varchar(150) DEFAULT NULL,
  `barcode` varchar(50) NOT NULL,
  `category_id` varchar(50) NOT NULL,
  `brand` varchar(100) DEFAULT NULL,
  `unit` enum('piece','kg','gram','liter','ml','dozen','box','packet') NOT NULL DEFAULT 'piece',
  `purchase_price` decimal(10,2) NOT NULL,
  `selling_price` decimal(10,2) NOT NULL,
  `current_stock` decimal(10,2) NOT NULL DEFAULT 0.00,
  `min_stock_level` decimal(10,2) NOT NULL DEFAULT 5.00,
  `supplier_id` varchar(50) DEFAULT NULL,
  `expiry_date` date DEFAULT NULL,
  `status` enum('active','inactive') NOT NULL DEFAULT 'active',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_prod_barcode` (`barcode`),
  KEY `idx_prod_category` (`category_id`),
  CONSTRAINT `fk_prod_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for table `sales`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `sales`;
CREATE TABLE `sales` (
  `id` varchar(50) NOT NULL,
  `invoice_number` varchar(50) NOT NULL UNIQUE,
  `date_time` datetime NOT NULL,
  `customer_id` varchar(50) DEFAULT NULL,
  `customer_name` varchar(150) DEFAULT NULL,
  `subtotal` decimal(12,2) NOT NULL,
  `discount_total` decimal(10,2) DEFAULT 0.00,
  `grand_total` decimal(12,2) NOT NULL,
  `paid_amount` decimal(12,2) NOT NULL,
  `change_amount` decimal(10,2) DEFAULT 0.00,
  `credit_amount` decimal(12,2) DEFAULT 0.00,
  `payment_method` enum('cash','credit','easypaisa','jazzcash','card','split') NOT NULL DEFAULT 'cash',
  `cashier_id` varchar(50) NOT NULL,
  `cashier_name` varchar(100) NOT NULL,
  `status` enum('completed','returned','partially_returned') NOT NULL DEFAULT 'completed',
  `notes` text DEFAULT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_sales_date` (`date_time`),
  KEY `idx_sales_cust` (`customer_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for table `sale_items`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `sale_items`;
CREATE TABLE `sale_items` (
  `id` varchar(50) NOT NULL,
  `sale_id` varchar(50) NOT NULL,
  `product_id` varchar(50) NOT NULL,
  `product_name` varchar(150) NOT NULL,
  `unit` varchar(20) NOT NULL,
  `quantity` decimal(10,2) NOT NULL,
  `purchase_price` decimal(10,2) NOT NULL,
  `selling_price` decimal(10,2) NOT NULL,
  `discount_percent` decimal(5,2) DEFAULT 0.00,
  `subtotal` decimal(12,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_si_sale` (`sale_id`),
  KEY `idx_si_product` (`product_id`),
  CONSTRAINT `fk_si_sale` FOREIGN KEY (`sale_id`) REFERENCES `sales` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for table `customer_ledger`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `customer_ledger`;
CREATE TABLE `customer_ledger` (
  `id` varchar(50) NOT NULL,
  `customer_id` varchar(50) NOT NULL,
  `date_time` datetime NOT NULL,
  `type` enum('sale_credit','payment_received','return_credit_adjustment') NOT NULL,
  `invoice_or_ref_number` varchar(50) NOT NULL,
  `debit` decimal(12,2) DEFAULT 0.00,
  `credit` decimal(12,2) DEFAULT 0.00,
  `balance` decimal(12,2) NOT NULL,
  `notes` text DEFAULT NULL,
  `received_by` varchar(100) NOT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_cl_cust` (`customer_id`),
  CONSTRAINT `fk_cl_cust` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for table `expenses`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `expenses`;
CREATE TABLE `expenses` (
  `id` varchar(50) NOT NULL,
  `category` varchar(50) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `date` date NOT NULL,
  `description` text NOT NULL,
  `payment_method` enum('cash','bank','other') NOT NULL DEFAULT 'cash',
  `recorded_by` varchar(100) NOT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for table `stock_movements`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `stock_movements`;
CREATE TABLE `stock_movements` (
  `id` varchar(50) NOT NULL,
  `date_time` datetime NOT NULL,
  `product_id` varchar(50) NOT NULL,
  `product_name` varchar(150) NOT NULL,
  `type` enum('sale','purchase','return','damage','expired','manual_adjustment') NOT NULL,
  `quantity_change` decimal(10,2) NOT NULL,
  `previous_stock` decimal(10,2) NOT NULL,
  `new_stock` decimal(10,2) NOT NULL,
  `reference_number` varchar(50) DEFAULT NULL,
  `reason` text DEFAULT NULL,
  `performed_by` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_sm_prod` (`product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for table `store_settings`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `store_settings`;
CREATE TABLE `store_settings` (
  `key_name` varchar(50) NOT NULL,
  `value` text NOT NULL,
  PRIMARY KEY (`key_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table structure for table `audit_logs`
-- --------------------------------------------------------
DROP TABLE IF EXISTS `audit_logs`;
CREATE TABLE `audit_logs` (
  `id` varchar(50) NOT NULL,
  `date_time` datetime NOT NULL,
  `user_id` varchar(50) NOT NULL,
  `user_name` varchar(100) NOT NULL,
  `user_role` varchar(20) NOT NULL,
  `action` varchar(150) NOT NULL,
  `details` text NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================================
-- SEED DATA
-- ==========================================================

INSERT INTO `users` (`id`, `name`, `username`, `password_hash`, `role`, `pin`) VALUES
('user_1', 'Muhammad Tariq (Owner)', 'admin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', '1234'),
('user_2', 'Bilal Ahmed (Cashier)', 'cashier', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'cashier', '0000');

INSERT INTO `categories` (`id`, `name`, `name_urdu`, `color`) VALUES
('cat_staples', 'Flour, Rice & Grains', 'آٹا، چاول اور دالیں', '#f59e0b'),
('cat_oil_ghee', 'Cooking Oil & Ghee', 'کوکنگ آئل اور گھی', '#eab308'),
('cat_dairy', 'Dairy & Eggs', 'دودھ، دہی اور انڈے', '#3b82f6'),
('cat_beverages', 'Tea & Beverages', 'چائے، جوس اور مشروبات', '#10b981'),
('cat_spices', 'Sugar, Salt & Spices', 'چینی، نمک اور مصالحہ جات', '#ef4444'),
('cat_bakery', 'Bakery & Biscuits', 'بسکٹ اور بیکری اشیاء', '#8b5cf6'),
('cat_personal_care', 'Soaps & Toiletries', 'صابن اور صفائی اشیاء', '#06b6d4'),
('cat_household', 'Household & Cleaning', 'گھریلو اشیاء اور ڈٹرجنٹ', '#64748b');

INSERT INTO `suppliers` (`id`, `name`, `contact_person`, `phone`, `address`, `notes`, `total_purchases`, `total_paid`, `balance_payable`) VALUES
('sup_1', 'Al-Madina Grain Wholesale Market', 'Haji Aslam', '0300-5551234', 'Shop # 14, Grain Market, Wholesale Plaza', 'Major supplier for staples', 185000.00, 155000.00, 30000.00),
('sup_2', 'Habib Oil & Ghee Distributors', 'Farooq Bhai', '0321-4447890', 'Warehouse 8, Industrial Estate', 'Weekly delivery', 92000.00, 80000.00, 12000.00),
('sup_3', 'National Foods & Unilever Agency', 'Khurram Shehzad', '0333-8889911', 'Depot Rd, Main Hub', 'Spices, tea, detergents', 64000.00, 64000.00, 0.00);

INSERT INTO `customers` (`id`, `name`, `phone`, `address`, `notes`, `credit_limit`, `total_purchases`, `total_paid`, `outstanding_credit`) VALUES
('cust_1', 'Ahmed Khan (House #12)', '0301-9988771', 'Street 4, Sector G-9', 'Regular customer. Pays beginning of month.', 15000.00, 32000.00, 26500.00, 5500.00),
('cust_2', 'Chaudhry Rashid (Landlord)', '0322-1122334', 'Main Bazar Corner House', 'Weekly settlement', 25000.00, 48000.00, 40000.00, 8000.00),
('cust_3', 'Master Jameel (School Teacher)', '0345-6677889', 'Quarter 18, Model Town', 'Clear salary account', 10000.00, 19000.00, 15500.00, 3500.00),
('cust_4', 'Baji Yasmeen', '0315-4433221', 'House 55, Lane 2', 'Daily small purchases', 8000.00, 12000.00, 11000.00, 1000.00);

INSERT INTO `products` (`id`, `name`, `name_urdu`, `barcode`, `category_id`, `brand`, `unit`, `purchase_price`, `selling_price`, `current_stock`, `min_stock_level`, `supplier_id`, `status`) VALUES
('prod_1', 'Super Basmati Rice (Premium)', 'سپر باسمتی چاول (اعلیٰ)', '89640001001', 'cat_staples', 'Falak', 'kg', 280.00, 340.00, 120.00, 25.00, 'sup_1', 'active'),
('prod_2', 'White Sugar (Refined)', 'چینی (صاف شفاف)', '89640001002', 'cat_spices', 'Pak Pure', 'kg', 135.00, 155.00, 250.00, 50.00, 'sup_1', 'active'),
('prod_3', 'Chakki Wheat Flour (Atta)', 'چکی کا خالص آٹا', '89640001003', 'cat_staples', 'Al-Madina', 'kg', 115.00, 130.00, 18.00, 30.00, 'sup_1', 'active'),
('prod_4', 'Dal Chana (Gram Pulse)', 'دال چنا (اسپیشل)', '89640001004', 'cat_staples', 'Desi', 'kg', 210.00, 260.00, 45.00, 15.00, 'sup_1', 'active'),
('prod_5', 'Cooking Oil 1L Pouch', 'کوکنگ آئل 1 لیٹر پاؤچ', '89640002001', 'cat_oil_ghee', 'Dalda', 'packet', 470.00, 520.00, 4.00, 12.00, 'sup_2', 'active'),
('prod_6', 'Banaspati Ghee 1kg Pouch', 'بناسپتی گھی 1 کلو پاؤچ', '89640002002', 'cat_oil_ghee', 'Habib', 'packet', 480.00, 535.00, 30.00, 10.00, 'sup_2', 'active'),
('prod_7', 'Fresh Farm Eggs (Grade A)', 'تازہ فارمی انڈے', '89640003001', 'cat_dairy', 'Poultry Farm', 'dozen', 290.00, 330.00, 15.00, 5.00, NULL, 'active'),
('prod_8', 'Full Cream Milk (UHT 1 Liter)', 'اولپرز فل کریم دودھ 1 لیٹر', '89640003002', 'cat_dairy', 'Olpers', 'piece', 270.00, 295.00, 48.00, 15.00, NULL, 'active'),
('prod_9', 'Danedar Black Tea 430g', 'دانے دار چائے 430 گرام', '89640004001', 'cat_beverages', 'Tapal', 'packet', 620.00, 690.00, 22.00, 8.00, 'sup_3', 'active'),
('prod_10', 'Red Chilli Powder (Lal Mirch 200g)', 'لال مرچ پاؤڈر 200 گرام', '89640005001', 'cat_spices', 'National', 'packet', 190.00, 230.00, 35.00, 10.00, 'sup_3', 'active'),
('prod_11', 'Iodized Table Salt 800g', 'آیوڈین ملا نمک 800 گرام', '89640005002', 'cat_spices', 'National', 'packet', 45.00, 60.00, 60.00, 15.00, 'sup_3', 'active'),
('prod_12', 'Super Crisp Biscuits (Family Pack)', 'سپر بسکٹ فیملی پیک', '89640006001', 'cat_bakery', 'Peek Freans', 'packet', 110.00, 130.00, 40.00, 10.00, NULL, 'active'),
('prod_13', 'Beauty Soap 140g Bar', 'صابن 140 گرام', '89640007001', 'cat_personal_care', 'Lux', 'piece', 130.00, 150.00, 0.00, 10.00, 'sup_3', 'active'),
('prod_14', 'Washing Powder / Detergent 1kg', 'واشنگ پاؤڈر سرف 1 کلو', '89640008001', 'cat_household', 'Surf Excel', 'packet', 460.00, 510.00, 16.00, 6.00, 'sup_3', 'active'),
('prod_15', 'Dishwashing Bar (Lemon Max)', 'برتن دھونے کا صابن', '89640008002', 'cat_household', 'Lemon Max', 'piece', 65.00, 80.00, 50.00, 12.00, NULL, 'active'),
('prod_16', 'Mineral Water 1.5L Bottle', 'منرل واٹر 1.5 لیٹر بوتل', '89640004002', 'cat_beverages', 'Nestle', 'piece', 90.00, 110.00, 28.00, 10.00, NULL, 'active');

INSERT INTO `store_settings` (`key_name`, `value`) VALUES
('store_name', 'Madina Super Grocery & General Store'),
('store_name_urdu', 'مدینہ سپر کریانہ و جنرل اسٹور'),
('phone', '0300-1234567 / 051-9876543'),
('address', 'Shop # 1-3, Main Commercial Market, Sector G-9, Islamabad'),
('currency', 'PKR'),
('currency_symbol', 'Rs.'),
('receipt_header', 'Fresh Groceries • Wholesale Rates • Quality Guaranteed'),
('receipt_footer', 'Goods once sold can be returned within 3 days with bill.'),
('receipt_footer_urdu', 'خریداری کا شکریہ! فروخت شدہ مال 3 دن میں بل کے ہمراہ واپس ہو سکتا ہے۔'),
('paper_size', '80mm'),
('default_language', 'en');

COMMIT;
