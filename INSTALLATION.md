# 🛒 Grocery Store Management System - XAMPP Windows Installation Guide

Welcome to the **Grocery Store Management System**! This guide is written in very simple, step-by-step language so you can set up and run the system on any Windows laptop without needing internet, programming knowledge, or command lines.

---

## 📋 System Requirements
* Any Windows Laptop / PC (Windows 10 or 11 recommended)
* [XAMPP for Windows](https://www.apachefriends.org/) (Version 8.0 or newer with PHP 8+ and MariaDB/MySQL)
* Google Chrome, Microsoft Edge, or Mozilla Firefox web browser
* **No Internet connection required** — works 100% offline!

---

## 🚀 Step 1: Install XAMPP
1. Download **XAMPP for Windows (PHP 8.2 or 8.1)** from [apachefriends.org](https://www.apachefriends.org).
2. Double-click the installer and install it to the default folder: `C:\xampp`
3. When installation finishes, open **XAMPP Control Panel**.
4. Click **Start** next to **Apache** (it will turn green).
5. Click **Start** next to **MySQL** (it will turn green).

---

## 📁 Step 2: Copy the Project Files
1. Copy the `grocery-store` application folder.
2. Paste it directly into your XAMPP `htdocs` folder:
   ```text
   C:\xampp\htdocs\grocery-store
   ```
3. Your folder structure inside `C:\xampp\htdocs\grocery-store` should look like:
   ```text
   app/
   config/
   database/
   public/
   storage/
   Start_Grocery_Store.bat
   ```

---

## 🗄️ Step 3: Create & Import the Database
1. Open your web browser (Chrome or Edge) and go to:
   ```text
   http://localhost/phpmyadmin
   ```
2. On the left side, click **New** to create a database.
3. In the "Database name" box, type:
   ```text
   grocery_store
   ```
   Select collation: `utf8mb4_unicode_ci` and click **Create**.
4. Click on `grocery_store` in the left sidebar, then click the **Import** tab at the top.
5. Click **Choose File** (Browse) and select:
   ```text
   C:\xampp\htdocs\grocery-store\database\grocery_store.sql
   ```
6. Scroll down and click **Import** (or **Go**).
7. You will see a green message: *"Import has been successfully finished."*

---

## 🔐 Step 4: Default Login Credentials

| Role | Username | Default Password | Quick PIN |
| :--- | :--- | :--- | :--- |
| **Owner / Admin** | `admin` | `admin123` | `1234` |
| **Cashier** | `cashier` | `cashier123` | `0000` |

> 💡 *Note: You can change passwords and store information anytime in **Settings**.*

---

## 🖥️ Step 5: Start & Use the Application
Open your browser and navigate to:
```text
http://localhost/grocery-store
```
or double-click the **`Start_Grocery_Store.bat`** file on your desktop!

---

## ⚡ 1-Click Desktop Launcher (`Start_Grocery_Store.bat`)
We have included a simple launcher file: `Start_Grocery_Store.bat`.
You can right-click it and choose **Send to -> Desktop (create shortcut)**.
Double-clicking this shortcut will automatically:
1. Ensure Apache and MySQL are running.
2. Launch Google Chrome / Edge directly to `http://localhost/grocery-store`.

---

## 🛠️ Troubleshooting Common Problems

### Problem 1: Apache won't start (Port 80 conflict with Skype/IIS)
* Open XAMPP Control Panel.
* Click **Config** on Apache row -> `httpd.conf`.
* Find `Listen 80` and change it to `Listen 8080`.
* Restart Apache and open: `http://localhost:8080/grocery-store`.

### Problem 2: MySQL won't start (Port 3306 blocked)
* Open Task Manager -> Services -> Stop any existing `mysqld` service.
* In XAMPP Control Panel, click **Config** on MySQL -> `my.ini` -> change port from `3306` to `3307`.
* Update `config/database.php` port to `3307`.

### Problem 3: Database Connection Failed
* Ensure MySQL is running (green light in XAMPP).
* Check `config/database.php` to ensure:
  - `DB_HOST = 'localhost'`
  - `DB_USER = 'root'`
  - `DB_PASS = ''` (empty password by default in XAMPP)
  - `DB_NAME = 'grocery_store'`

---

## 🔄 Moving the System to a New Client Laptop
1. On your current laptop, open **Backup & Restore** inside the app.
2. Click **Download SQL Backup File**.
3. Install XAMPP on the client's laptop.
4. Copy the `C:\xampp\htdocs\grocery-store` folder to the client's laptop.
5. In phpMyAdmin on the client laptop, create `grocery_store` and import your exported SQL file.
6. Place the `Start_Grocery_Store.bat` shortcut on the client's desktop.
7. Done! The client can now run their store without internet.
