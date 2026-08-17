import { Category, Product, Supplier, Customer, Expense, StoreSettings, User, Sale, CustomerLedgerEntry, CashSession, AuditLog } from '../types';

export const initialUsers: User[] = [
  {
    id: 'user_1',
    name: 'Muhammad Tariq (Owner)',
    username: 'admin',
    role: 'admin',
    pin: '1234',
  },
  {
    id: 'user_2',
    name: 'Bilal Ahmed (Cashier)',
    username: 'cashier',
    role: 'cashier',
    pin: '0000',
  }
];

export const initialCategories: Category[] = [
  { id: 'cat_staples', name: 'Flour, Rice & Grains', nameUrdu: 'آٹا، چاول اور دالیں', color: '#f59e0b' },
  { id: 'cat_oil_ghee', name: 'Cooking Oil & Ghee', nameUrdu: 'کوکنگ آئل اور گھی', color: '#eab308' },
  { id: 'cat_dairy', name: 'Dairy & Eggs', nameUrdu: 'دودھ، دہی اور انڈے', color: '#3b82f6' },
  { id: 'cat_beverages', name: 'Tea & Beverages', nameUrdu: 'چائے، جوس اور مشروبات', color: '#10b981' },
  { id: 'cat_spices', name: 'Sugar, Salt & Spices', nameUrdu: 'چینی، نمک اور مصالحہ جات', color: '#ef4444' },
  { id: 'cat_bakery', name: 'Bakery & Biscuits', nameUrdu: 'بسکٹ اور بیکری اشیاء', color: '#8b5cf6' },
  { id: 'cat_personal_care', name: 'Soaps & Toiletries', nameUrdu: 'صابن اور صفائی اشیاء', color: '#06b6d4' },
  { id: 'cat_household', name: 'Household & Cleaning', nameUrdu: 'گھریلو اشیاء اور ڈٹرجنٹ', color: '#64748b' }
];

export const initialSuppliers: Supplier[] = [
  {
    id: 'sup_1',
    name: 'Al-Madina Grain Wholesale Market',
    contactPerson: 'Haji Aslam',
    phone: '0300-5551234',
    address: 'Shop # 14, Grain Market, Wholesale Plaza',
    notes: 'Major supplier for flour, basmati rice, sugar & pulses',
    totalPurchases: 185000,
    totalPaid: 155000,
    balancePayable: 30000
  },
  {
    id: 'sup_2',
    name: 'Habib Oil & Ghee Distributors',
    contactPerson: 'Farooq Bhai',
    phone: '0321-4447890',
    address: 'Warehouse 8, Industrial Estate',
    notes: 'Delivery every Tuesday and Friday',
    totalPurchases: 92000,
    totalPaid: 80000,
    balancePayable: 12000
  },
  {
    id: 'sup_3',
    name: 'National Foods & Unilever Agency',
    contactPerson: 'Khurram Shehzad',
    phone: '0333-8889911',
    address: 'Depot Rd, Main Hub',
    notes: 'Spices, tea, detergents and soaps',
    totalPurchases: 64000,
    totalPaid: 64000,
    balancePayable: 0
  }
];

export const initialCustomers: Customer[] = [
  {
    id: 'cust_1',
    name: 'Ahmed Khan (House #12)',
    phone: '0301-9988771',
    address: 'Street 4, Sector G-9',
    notes: 'Regular customer. Pays at beginning of every month.',
    creditLimit: 15000,
    totalPurchases: 32000,
    totalPaid: 26500,
    outstandingCredit: 5500,
    lastPaymentDate: '2026-08-10'
  },
  {
    id: 'cust_2',
    name: 'Chaudhry Rashid (Landlord)',
    phone: '0322-1122334',
    address: 'Main Bazar Corner House',
    notes: 'Weekly settlement',
    creditLimit: 25000,
    totalPurchases: 48000,
    totalPaid: 40000,
    outstandingCredit: 8000,
    lastPaymentDate: '2026-08-12'
  },
  {
    id: 'cust_3',
    name: 'Master Jameel (School Teacher)',
    phone: '0345-6677889',
    address: 'Quarter 18, Model Town',
    notes: 'Clear salary account',
    creditLimit: 10000,
    totalPurchases: 19000,
    totalPaid: 15500,
    outstandingCredit: 3500,
    lastPaymentDate: '2026-08-05'
  },
  {
    id: 'cust_4',
    name: 'Baji Yasmeen',
    phone: '0315-4433221',
    address: 'House 55, Lane 2',
    notes: 'Daily small purchases',
    creditLimit: 8000,
    totalPurchases: 12000,
    totalPaid: 11000,
    outstandingCredit: 1000,
    lastPaymentDate: '2026-08-14'
  }
];

export const initialProducts: Product[] = [
  {
    id: 'prod_1',
    name: 'Super Basmati Rice (Premium)',
    nameUrdu: 'سپر باسمتی چاول (اعلیٰ)',
    barcode: '89640001001',
    categoryId: 'cat_staples',
    brand: 'Falak',
    unit: 'kg',
    purchasePrice: 280,
    sellingPrice: 340,
    currentStock: 120,
    minStockLevel: 25,
    supplierId: 'sup_1',
    status: 'active',
    createdAt: '2026-08-01',
    updatedAt: '2026-08-15'
  },
  {
    id: 'prod_2',
    name: 'White Sugar (Refined)',
    nameUrdu: 'چینی (صاف شفاف)',
    barcode: '89640001002',
    categoryId: 'cat_spices',
    brand: 'Pak Pure',
    unit: 'kg',
    purchasePrice: 135,
    sellingPrice: 155,
    currentStock: 250,
    minStockLevel: 50,
    supplierId: 'sup_1',
    status: 'active',
    createdAt: '2026-08-01',
    updatedAt: '2026-08-15'
  },
  {
    id: 'prod_3',
    name: 'Chakki Wheat Flour (Atta)',
    nameUrdu: 'چکی کا خالص آٹا',
    barcode: '89640001003',
    categoryId: 'cat_staples',
    brand: 'Al-Madina',
    unit: 'kg',
    purchasePrice: 115,
    sellingPrice: 130,
    currentStock: 18, // Low stock on purpose
    minStockLevel: 30,
    supplierId: 'sup_1',
    status: 'active',
    createdAt: '2026-08-01',
    updatedAt: '2026-08-15'
  },
  {
    id: 'prod_4',
    name: 'Dal Chana (Gram Pulse)',
    nameUrdu: 'دال چنا (اسپیشل)',
    barcode: '89640001004',
    categoryId: 'cat_staples',
    brand: 'Desi',
    unit: 'kg',
    purchasePrice: 210,
    sellingPrice: 260,
    currentStock: 45,
    minStockLevel: 15,
    supplierId: 'sup_1',
    status: 'active',
    createdAt: '2026-08-01',
    updatedAt: '2026-08-15'
  },
  {
    id: 'prod_5',
    name: 'Cooking Oil 1L Pouch',
    nameUrdu: 'کوکنگ آئل 1 لیٹر پاؤچ',
    barcode: '89640002001',
    categoryId: 'cat_oil_ghee',
    brand: 'Dalda',
    unit: 'packet',
    purchasePrice: 470,
    sellingPrice: 520,
    currentStock: 4, // Very low stock
    minStockLevel: 12,
    supplierId: 'sup_2',
    status: 'active',
    createdAt: '2026-08-01',
    updatedAt: '2026-08-15'
  },
  {
    id: 'prod_6',
    name: 'Banaspati Ghee 1kg Pouch',
    nameUrdu: 'بناسپتی گھی 1 کلو پاؤچ',
    barcode: '89640002002',
    categoryId: 'cat_oil_ghee',
    brand: 'Habib',
    unit: 'packet',
    purchasePrice: 480,
    sellingPrice: 535,
    currentStock: 30,
    minStockLevel: 10,
    supplierId: 'sup_2',
    status: 'active',
    createdAt: '2026-08-01',
    updatedAt: '2026-08-15'
  },
  {
    id: 'prod_7',
    name: 'Fresh Farm Eggs (Grade A)',
    nameUrdu: 'تازہ فارمی انڈے',
    barcode: '89640003001',
    categoryId: 'cat_dairy',
    brand: 'Poultry Farm',
    unit: 'dozen',
    purchasePrice: 290,
    sellingPrice: 330,
    currentStock: 15,
    minStockLevel: 5,
    status: 'active',
    createdAt: '2026-08-01',
    updatedAt: '2026-08-15'
  },
  {
    id: 'prod_8',
    name: 'Full Cream Milk (UHT 1 Liter)',
    nameUrdu: 'اولپرز فل کریم دودھ 1 لیٹر',
    barcode: '89640003002',
    categoryId: 'cat_dairy',
    brand: 'Olper\'s',
    unit: 'piece',
    purchasePrice: 270,
    sellingPrice: 295,
    currentStock: 48,
    minStockLevel: 15,
    status: 'active',
    expiryDate: '2026-09-30',
    createdAt: '2026-08-01',
    updatedAt: '2026-08-15'
  },
  {
    id: 'prod_9',
    name: 'Danedar Black Tea 430g',
    nameUrdu: 'دانے دار چائے 430 گرام',
    barcode: '89640004001',
    categoryId: 'cat_beverages',
    brand: 'Tapal',
    unit: 'packet',
    purchasePrice: 620,
    sellingPrice: 690,
    currentStock: 22,
    minStockLevel: 8,
    supplierId: 'sup_3',
    status: 'active',
    createdAt: '2026-08-01',
    updatedAt: '2026-08-15'
  },
  {
    id: 'prod_10',
    name: 'Red Chilli Powder (Lal Mirch 200g)',
    nameUrdu: 'لال مرچ پاؤڈر 200 گرام',
    barcode: '89640005001',
    categoryId: 'cat_spices',
    brand: 'National',
    unit: 'packet',
    purchasePrice: 190,
    sellingPrice: 230,
    currentStock: 35,
    minStockLevel: 10,
    supplierId: 'sup_3',
    status: 'active',
    createdAt: '2026-08-01',
    updatedAt: '2026-08-15'
  },
  {
    id: 'prod_11',
    name: 'Iodized Table Salt 800g',
    nameUrdu: 'آیوڈین ملا نمک 800 گرام',
    barcode: '89640005002',
    categoryId: 'cat_spices',
    brand: 'National',
    unit: 'packet',
    purchasePrice: 45,
    sellingPrice: 60,
    currentStock: 60,
    minStockLevel: 15,
    supplierId: 'sup_3',
    status: 'active',
    createdAt: '2026-08-01',
    updatedAt: '2026-08-15'
  },
  {
    id: 'prod_12',
    name: 'Super Crisp Biscuits (Family Pack)',
    nameUrdu: 'سپر بسکٹ فیملی پیک',
    barcode: '89640006001',
    categoryId: 'cat_bakery',
    brand: 'Peek Freans',
    unit: 'packet',
    purchasePrice: 110,
    sellingPrice: 130,
    currentStock: 40,
    minStockLevel: 10,
    status: 'active',
    createdAt: '2026-08-01',
    updatedAt: '2026-08-15'
  },
  {
    id: 'prod_13',
    name: 'Beauty Soap 140g Bar',
    nameUrdu: 'صابن 140 گرام',
    barcode: '89640007001',
    categoryId: 'cat_personal_care',
    brand: 'Lux',
    unit: 'piece',
    purchasePrice: 130,
    sellingPrice: 150,
    currentStock: 0, // Out of stock on purpose
    minStockLevel: 10,
    supplierId: 'sup_3',
    status: 'active',
    createdAt: '2026-08-01',
    updatedAt: '2026-08-15'
  },
  {
    id: 'prod_14',
    name: 'Washing Powder / Detergent 1kg',
    nameUrdu: 'واشنگ پاؤڈر سرف 1 کلو',
    barcode: '89640008001',
    categoryId: 'cat_household',
    brand: 'Surf Excel',
    unit: 'packet',
    purchasePrice: 460,
    sellingPrice: 510,
    currentStock: 16,
    minStockLevel: 6,
    supplierId: 'sup_3',
    status: 'active',
    createdAt: '2026-08-01',
    updatedAt: '2026-08-15'
  },
  {
    id: 'prod_15',
    name: 'Dishwashing Bar (Lemon Max)',
    nameUrdu: 'برتن دھونے کا صابن',
    barcode: '89640008002',
    categoryId: 'cat_household',
    brand: 'Lemon Max',
    unit: 'piece',
    purchasePrice: 65,
    sellingPrice: 80,
    currentStock: 50,
    minStockLevel: 12,
    status: 'active',
    createdAt: '2026-08-01',
    updatedAt: '2026-08-15'
  },
  {
    id: 'prod_16',
    name: 'Mineral Water 1.5L Bottle',
    nameUrdu: 'منرل واٹر 1.5 لیٹر بوتل',
    barcode: '89640004002',
    categoryId: 'cat_beverages',
    brand: 'Nestle Pure Life',
    unit: 'piece',
    purchasePrice: 90,
    sellingPrice: 110,
    currentStock: 28,
    minStockLevel: 10,
    status: 'active',
    createdAt: '2026-08-01',
    updatedAt: '2026-08-15'
  }
];

export const initialStoreSettings: StoreSettings = {
  storeName: "Madina Super Grocery & General Store",
  storeNameUrdu: "مدینہ سپر کریانہ و جنرل اسٹور",
  phone: "0300-1234567 / 051-9876543",
  address: "Shop # 1-3, Main Commercial Market, Sector G-9, Islamabad",
  currency: "PKR",
  currencySymbol: "Rs.",
  taxRate: 0,
  enableTax: false,
  receiptHeader: "Fresh Groceries • Wholesale Rates • Quality Guaranteed",
  receiptFooter: "Goods once sold can be returned within 3 days with bill.",
  receiptFooterUrdu: "خریداری کا شکریہ! فروخت شدہ مال 3 دن میں بل کے ہمراہ واپس ہو سکتا ہے۔",
  paperSize: "80mm",
  lowStockThresholdDefault: 10,
  defaultLanguage: "en",
  allowCashierDiscount: true,
  autoPrintReceipt: true,
  logoUrl: ""
};

export const initialCustomerLedger: CustomerLedgerEntry[] = [
  {
    id: 'cld_1',
    customerId: 'cust_1',
    dateTime: '2026-08-08 11:30',
    type: 'sale_credit',
    invoiceOrRefNumber: 'INV-1002',
    debit: 4500,
    credit: 0,
    balance: 7500,
    notes: 'Grocery items on monthly udhaar',
    receivedBy: 'Muhammad Tariq'
  },
  {
    id: 'cld_2',
    customerId: 'cust_1',
    dateTime: '2026-08-10 17:45',
    type: 'payment_received',
    invoiceOrRefNumber: 'PAY-801',
    debit: 0,
    credit: 2000,
    balance: 5500,
    notes: 'Cash payment received via brother',
    receivedBy: 'Muhammad Tariq'
  },
  {
    id: 'cld_3',
    customerId: 'cust_2',
    dateTime: '2026-08-12 14:20',
    type: 'sale_credit',
    invoiceOrRefNumber: 'INV-1008',
    debit: 8000,
    credit: 0,
    balance: 8000,
    notes: 'Monthly ration package',
    receivedBy: 'Bilal Ahmed'
  }
];

export const initialExpenses: Expense[] = [
  {
    id: 'exp_1',
    category: 'Electricity',
    amount: 14500,
    date: '2026-08-15',
    description: 'IESCO Commercial electricity bill for July/August',
    paymentMethod: 'cash',
    recordedBy: 'Muhammad Tariq'
  },
  {
    id: 'exp_2',
    category: 'Tea_Snacks',
    amount: 350,
    date: '2026-08-16',
    description: 'Afternoon tea & biscuits for staff and wholesale supplier',
    paymentMethod: 'cash',
    recordedBy: 'Bilal Ahmed'
  },
  {
    id: 'exp_3',
    category: 'Packaging',
    amount: 1800,
    date: '2026-08-14',
    description: 'Plastic carrier bags (shopper bags) 5 bundles',
    paymentMethod: 'cash',
    recordedBy: 'Muhammad Tariq'
  },
  {
    id: 'exp_4',
    category: 'Salary',
    amount: 25000,
    date: '2026-08-05',
    description: 'Staff monthly helper salary',
    paymentMethod: 'cash',
    recordedBy: 'Muhammad Tariq'
  }
];

export const initialSales: Sale[] = [
  {
    id: 'sale_101',
    invoiceNumber: 'INV-101',
    dateTime: '2026-08-16 10:15:00',
    items: [
      {
        id: 'si_1',
        saleId: 'sale_101',
        productId: 'prod_1',
        productName: 'Super Basmati Rice (Premium)',
        productNameUrdu: 'سپر باسمتی چاول (اعلیٰ)',
        unit: 'kg',
        quantity: 5,
        purchasePrice: 280,
        sellingPrice: 340,
        discountPercent: 0,
        subtotal: 1700
      },
      {
        id: 'si_2',
        saleId: 'sale_101',
        productId: 'prod_2',
        productName: 'White Sugar (Refined)',
        productNameUrdu: 'چینی (صاف شفاف)',
        unit: 'kg',
        quantity: 3,
        purchasePrice: 135,
        sellingPrice: 155,
        discountPercent: 0,
        subtotal: 465
      },
      {
        id: 'si_3',
        saleId: 'sale_101',
        productId: 'prod_8',
        productName: 'Full Cream Milk (UHT 1 Liter)',
        productNameUrdu: 'اولپرز فل کریم دودھ 1 لیٹر',
        unit: 'piece',
        quantity: 2,
        purchasePrice: 270,
        sellingPrice: 295,
        discountPercent: 0,
        subtotal: 590
      }
    ],
    subtotal: 2755,
    discountTotal: 55,
    grandTotal: 2700,
    paidAmount: 3000,
    changeAmount: 300,
    creditAmount: 0,
    paymentMethod: 'cash',
    cashierId: 'user_1',
    cashierName: 'Muhammad Tariq',
    status: 'completed'
  },
  {
    id: 'sale_102',
    invoiceNumber: 'INV-102',
    dateTime: '2026-08-16 11:45:00',
    customerId: 'cust_1',
    customerName: 'Ahmed Khan (House #12)',
    items: [
      {
        id: 'si_4',
        saleId: 'sale_102',
        productId: 'prod_5',
        productName: 'Cooking Oil 1L Pouch',
        productNameUrdu: 'کوکنگ آئل 1 لیٹر پاؤچ',
        unit: 'packet',
        quantity: 2,
        purchasePrice: 470,
        sellingPrice: 520,
        discountPercent: 0,
        subtotal: 1040
      },
      {
        id: 'si_5',
        saleId: 'sale_102',
        productId: 'prod_9',
        productName: 'Danedar Black Tea 430g',
        productNameUrdu: 'دانے دار چائے 430 گرام',
        unit: 'packet',
        quantity: 1,
        purchasePrice: 620,
        sellingPrice: 690,
        discountPercent: 0,
        subtotal: 690
      }
    ],
    subtotal: 1730,
    discountTotal: 0,
    grandTotal: 1730,
    paidAmount: 0,
    changeAmount: 0,
    creditAmount: 1730,
    paymentMethod: 'credit',
    cashierId: 'user_2',
    cashierName: 'Bilal Ahmed',
    status: 'completed',
    notes: 'Added to monthly udhaar account'
  }
];

export const initialCashSession: CashSession = {
  id: 'cs_today',
  date: '2026-08-16',
  openedAt: '2026-08-16 08:30:00',
  openedBy: 'Muhammad Tariq',
  openingCash: 10000,
  cashSales: 2700,
  customerCashPayments: 2000,
  cashExpenses: 350,
  cashSupplierPayments: 0,
  cashRefunds: 0,
  expectedCash: 14350,
  actualCash: 14350,
  difference: 0,
  status: 'open'
};

export const initialAuditLogs: AuditLog[] = [
  {
    id: 'log_1',
    dateTime: '2026-08-16 08:30:00',
    userId: 'user_1',
    userName: 'Muhammad Tariq',
    userRole: 'admin',
    action: 'Cash Drawer Opened',
    actionUrdu: 'کیش گلہ کھولا گیا',
    details: 'Opened morning cash drawer with Rs. 10,000 opening float.'
  },
  {
    id: 'log_2',
    dateTime: '2026-08-16 10:15:00',
    userId: 'user_1',
    userName: 'Muhammad Tariq',
    userRole: 'admin',
    action: 'Completed Sale',
    actionUrdu: 'فروخت مکمل',
    details: 'Invoice #INV-101 generated for Rs. 2,700 (Cash).'
  },
  {
    id: 'log_3',
    dateTime: '2026-08-16 11:45:00',
    userId: 'user_2',
    userName: 'Bilal Ahmed',
    userRole: 'cashier',
    action: 'Credit Sale Created',
    actionUrdu: 'ادھار فروخت درج',
    details: 'Invoice #INV-102 for Rs. 1,730 added to Ahmed Khan Udhaar ledger.'
  }
];
