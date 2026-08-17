@echo off
TITLE Grocery Store Management Launcher
COLOR 0A
echo =================================================================
echo        GROCERY STORE MANAGEMENT SYSTEM - 1-CLICK LAUNCHER
echo =================================================================
echo.
echo Starting local Apache and MySQL services...
echo.

:: Check if XAMPP is in standard location
IF EXIST "C:\xampp\xampp_start.exe" (
    start "" "C:\xampp\xampp_start.exe"
    timeout /t 2 /nobreak >nul
)

:: Launch the application in default web browser
echo Opening Grocery Store in browser...
start http://localhost/grocery-store

echo.
echo System started successfully!
echo You can minimize this window.
echo =================================================================
timeout /t 5
exit
