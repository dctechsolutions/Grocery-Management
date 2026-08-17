import React, { useState } from 'react';
import { 
  FileCode2, 
  Download, 
  Copy, 
  Check, 
  Terminal, 
  FolderTree, 
  Database, 
  ExternalLink, 
  Laptop, 
  HelpCircle,
  Code2
} from 'lucide-react';
import { StoreState } from '../types';
import { generateFullSqlDump } from '../services/sqlGenerator';

interface XamppExportModalProps {
  storeState: StoreState;
}

export const XamppExportModal: React.FC<XamppExportModalProps> = ({ storeState }) => {
  const [selectedFile, setSelectedFile] = useState<string>('database/grocery_store.sql');
  const [copied, setCopied] = useState(false);

  const phpFiles: { [path: string]: { name: string; type: string; content: string } } = {
    'database/grocery_store.sql': {
      name: 'grocery_store.sql',
      type: 'sql',
      content: generateFullSqlDump(storeState)
    },
    'config/database.php': {
      name: 'database.php',
      type: 'php',
      content: `<?php
/**
 * Local Grocery Store Management System
 * Database Connection using PHP Data Objects (PDO)
 * Target: MySQL / MariaDB on Windows XAMPP
 */

declare(strict_types=1);

class Database {
    private static ?PDO $instance = null;
    private static string $host = '127.0.0.1';
    private static string $db   = 'grocery_store';
    private static string $user = 'root';
    private static string $pass = '';
    private static string $charset = 'utf8mb4';

    public static function getConnection(): PDO {
        if (self::$instance === null) {
            $dsn = "mysql:host=" . self::$host . ";dbname=" . self::$db . ";charset=" . self::$charset;
            $options = [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
            ];
            try {
                self::$instance = new PDO($dsn, self::$user, self::$pass, $options);
            } catch (PDOException $e) {
                die("Database connection failed: " . $e->getMessage() . "<br>Make sure MySQL is started in XAMPP Control Panel.");
            }
        }
        return self::$instance;
    }
}
`
    },
    'public/index.php': {
      name: 'index.php',
      type: 'php',
      content: `<?php
/**
 * Front Controller & URL Router
 * Entry point: http://localhost/grocery-store/public/
 */

session_start();
require_once __DIR__ . '/../config/database.php';

// Simple Router
$route = $_GET['route'] ?? 'pos';

switch ($route) {
    case 'pos':
        require_once __DIR__ . '/../app/controllers/POSController.php';
        $controller = new POSController();
        $controller->index();
        break;

    case 'products':
        require_once __DIR__ . '/../app/controllers/ProductsController.php';
        $controller = new ProductsController();
        $controller->index();
        break;

    case 'customers':
        require_once __DIR__ . '/../app/controllers/CustomersController.php';
        $controller = new CustomersController();
        $controller->index();
        break;

    case 'reports':
        require_once __DIR__ . '/../app/controllers/ReportsController.php';
        $controller = new ReportsController();
        $controller->index();
        break;

    default:
        header("Location: index.php?route=pos");
        exit;
}
`
    },
    'app/controllers/POSController.php': {
      name: 'POSController.php',
      type: 'php',
      content: `<?php
/**
 * POS Controller
 * Handles Fast Point of Sale checkout, barcode scanning, receipt generation, and Udhaar
 */

class POSController {
    private PDO $db;

    public function __construct() {
        $this->db = Database::getConnection();
    }

    public function index(): void {
        // Fetch active products with categories
        $stmt = $this->db->query("SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.status = 'active' ORDER BY p.name ASC");
        $products = $stmt->fetchAll();

        // Fetch categories
        $categories = $this->db->query("SELECT * FROM categories ORDER BY name ASC")->fetchAll();

        // Fetch customers for Udhaar selection
        $customers = $this->db->query("SELECT id, name, phone, outstanding_credit FROM customers ORDER BY name ASC")->fetchAll();

        require_once __DIR__ . '/../views/pos/index.php';
    }

    public function completeSale(): void {
        // Atomic MySQL Transaction: Inserts sale, adds items, deducts stock, records ledger
        header('Content-Type: application/json');
        $payload = json_decode(file_get_contents('php://input'), true);

        try {
            $this->db->beginTransaction();

            $invoiceNumber = 'INV-' . strtoupper(dechex(time()));
            $stmt = $this->db->prepare("INSERT INTO sales (invoice_number, customer_id, subtotal, discount, grand_total, paid_amount, payment_method, cashier_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([
                $invoiceNumber,
                $payload['customer_id'] ?? null,
                $payload['subtotal'],
                $payload['discount'],
                $payload['grand_total'],
                $payload['paid_amount'],
                $payload['payment_method'],
                1 // Admin
            ]);

            $saleId = (int)$this->db->lastInsertId();

            foreach ($payload['items'] as $item) {
                // Insert sale item
                $itemStmt = $this->db->prepare("INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, cost_price, total) VALUES (?, ?, ?, ?, ?, ?)");
                $itemStmt->execute([
                    $saleId,
                    $item['product_id'],
                    $item['quantity'],
                    $item['unit_price'],
                    $item['cost_price'],
                    $item['total']
                ]);

                // Deduct inventory stock
                $stockStmt = $this->db->prepare("UPDATE products SET current_stock = current_stock - ? WHERE id = ?");
                $stockStmt->execute([$item['quantity'], $item['product_id']]);
            }

            // If Udhaar, add to customer outstanding balance & customer ledger
            if ($payload['payment_method'] === 'credit' && !empty($payload['customer_id'])) {
                $due = $payload['grand_total'] - $payload['paid_amount'];
                $custStmt = $this->db->prepare("UPDATE customers SET outstanding_credit = outstanding_credit + ? WHERE id = ?");
                $custStmt->execute([$due, $payload['customer_id']]);
            }

            $this->db->commit();
            echo json_encode(['success' => true, 'invoice_number' => $invoiceNumber, 'sale_id' => $saleId]);
        } catch (Exception $e) {
            $this->db->rollBack();
            echo json_encode(['success' => false, 'error' => $e->getMessage()]);
        }
        exit;
    }
}
`
    },
    'app/models/Product.php': {
      name: 'Product.php',
      type: 'php',
      content: `<?php
/**
 * Product Model
 */

class Product {
    private PDO $db;

    public function __construct(PDO $db) {
        $this->db = $db;
    }

    public function getAllActive(): array {
        $stmt = $this->db->query("SELECT * FROM products WHERE status = 'active' ORDER BY name ASC");
        return $stmt->fetchAll();
    }

    public function findByBarcode(string $barcode): ?array {
        $stmt = $this->db->prepare("SELECT * FROM products WHERE barcode = ? AND status = 'active' LIMIT 1");
        $stmt->execute([$barcode]);
        $row = $stmt->fetch();
        return $row ?: null;
    }

    public function adjustStock(int $id, float $qtyChange, string $type, string $reason): bool {
        $stmt = $this->db->prepare("UPDATE products SET current_stock = current_stock + ? WHERE id = ?");
        return $stmt->execute([$qtyChange, $id]);
    }
}
`
    },
    'Start_Grocery_Store.bat': {
      name: 'Start_Grocery_Store.bat',
      type: 'bat',
      content: `@echo off
title Grocery Store Management System
color 0A
echo ======================================================
echo    STARTING LOCAL GROCERY STORE MANAGEMENT SYSTEM
echo ======================================================
echo.

REM 1. Check if XAMPP is installed in default directory
if exist "C:\\xampp\\xampp_start.exe" (
    echo [1/3] Starting Apache and MySQL servers...
    start "" "C:\\xampp\\xampp_start.exe"
) else (
    echo [NOTE] Please ensure Apache and MySQL are running in XAMPP.
)

REM 2. Wait 2 seconds for services to initialize
timeout /t 2 /nobreak > nul

REM 3. Open the Grocery POS System in default web browser
echo [2/3] Launching POS interface in your browser...
start http://localhost/grocery-store/public/

echo.
echo ======================================================
echo    APPLICATION IS RUNNING! DO NOT CLOSE THIS WINDOW.
echo ======================================================
echo Press any key to stop or exit.
pause > nul
`
    },
    'INSTALLATION.md': {
      name: 'INSTALLATION.md',
      type: 'markdown',
      content: `# 🛒 Grocery Store Management System - Windows XAMPP Setup

## Quick 3-Step Installation:

### Step 1: Install XAMPP
1. Download **XAMPP for Windows** (PHP 8.2+) from [apachefriends.org](https://www.apachefriends.org).
2. Install to default location: \`C:\\xampp\`.
3. Open **XAMPP Control Panel** and click **Start** next to **Apache** and **MySQL**.

### Step 2: Copy Files
1. Copy the \`grocery-store\` folder to: \`C:\\xampp\\htdocs\\grocery-store\`

### Step 3: Import Database
1. Open your browser and go to: [http://localhost/phpmyadmin](http://localhost/phpmyadmin)
2. Click **New** on the left sidebar, enter database name: \`grocery_store\`, and click **Create**.
3. Click the **Import** tab at the top.
4. Click **Choose File**, select \`database/grocery_store.sql\`, and click **Import** at the bottom.

### Step 4: Run the Application!
- Double click **\`Start_Grocery_Store.bat\`** or open:
- [http://localhost/grocery-store/public/](http://localhost/grocery-store/public/)
`
    }
  };

  const handleCopyFile = () => {
    const file = phpFiles[selectedFile];
    if (!file) return;
    navigator.clipboard.writeText(file.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div id="xampp-export-view" className="space-y-4 animate-in fade-in duration-150">
      
      {/* Header Banner */}
      <div className="bg-[#4A5D3F] p-6 rounded-2xl text-white shadow-2xs border border-[#3E5034] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white text-xs font-bold flex items-center gap-1">
              <Laptop className="w-3.5 h-3.5" />
              Windows XAMPP / PHP 8+ MVC Package
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black mt-2 tracking-tight">
            Local Deployment Source Code & Schema
          </h2>
          <p className="text-[#EEF4EC] text-xs mt-1">
            Complete, self-contained offline architecture ready to place into <code className="bg-[#384923] px-1.5 py-0.5 rounded font-mono">C:\xampp\htdocs\grocery-store</code>.
          </p>
        </div>

        <button
          onClick={() => {
            const sqlBlob = new Blob([generateFullSqlDump(storeState)], { type: 'text/sql' });
            const url = URL.createObjectURL(sqlBlob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'grocery_store.sql';
            a.click();
            URL.revokeObjectURL(url);
          }}
          className="px-4 py-2.5 bg-white text-[#2C2C24] hover:bg-[#F5F4EE] rounded-xl text-xs font-bold flex items-center gap-2 shadow-2xs transition-colors cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Download MySQL .SQL Dump</span>
        </button>
      </div>

      {/* Code Browser */}
      <div className="bg-[#FAF9F5] rounded-2xl border border-[#E2E1D8] shadow-2xs overflow-hidden flex flex-col md:flex-row min-h-[500px]">
        
        {/* File Tree Sidebar */}
        <div className="w-full md:w-64 bg-[#F2F1EA] border-r border-[#E2E1D8] p-3 space-y-1">
          <div className="px-3 py-2 text-xs font-bold text-[#787865] uppercase tracking-wider flex items-center gap-1.5">
            <FolderTree className="w-4 h-4 text-[#4A5D3F]" />
            <span>Project File Tree</span>
          </div>

          <div className="space-y-0.5 text-xs">
            {Object.keys(phpFiles).map(path => (
              <button
                key={path}
                onClick={() => setSelectedFile(path)}
                className={`w-full text-left px-3 py-2 rounded-xl font-mono flex items-center gap-2 transition-colors cursor-pointer ${
                  selectedFile === path
                    ? 'bg-[#EEF4EC] text-[#24331C] font-bold border border-[#DCEAD7]'
                    : 'text-[#434338] hover:bg-[#EBEAE3]'
                }`}
              >
                <Code2 className="w-3.5 h-3.5 shrink-0 text-[#787865]" />
                <span className="truncate">{path}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Code Content Viewer */}
        <div className="flex-1 flex flex-col bg-[#1E1E18] text-[#E8E6DF] font-mono text-xs overflow-hidden">
          
          {/* File Toolbar */}
          <div className="p-3 bg-[#2C2C24] border-b border-[#3D3D32] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[#DCEAD7] font-bold">{selectedFile}</span>
            </div>

            <button
              onClick={handleCopyFile}
              className="px-3 py-1 bg-[#3E5034] hover:bg-[#32422A] text-white rounded-lg flex items-center gap-1.5 cursor-pointer text-[11px]"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[#DCEAD7]" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy Code'}</span>
            </button>
          </div>

          {/* Pre Code */}
          <div className="flex-1 p-4 overflow-y-auto max-h-[500px]">
            <pre className="whitespace-pre-wrap leading-relaxed">
              <code>{phpFiles[selectedFile]?.content}</code>
            </pre>
          </div>

        </div>

      </div>

    </div>
  );
};
