@echo off
title Rider V Sync

cd /d "%~dp0"

echo ==========================================
echo        RIDER V-SYNC LAUNCHER
echo ==========================================
echo.

echo [1/2] Starting Node TCP + HTTP server...
start "Rider V Sync - Server" cmd /k "npm run dev"

timeout /t 3 /nobreak >nul

echo [2/2] Starting Python Computer Vision...
start "Rider V Sync - Computer Vision" cmd /k ".venv\Scripts\python.exe opencv\main.py"

timeout /t 3 /nobreak >nul

echo.
echo ==========================================
echo       RIDER V-SYNC IS RUNNING
echo ==========================================
echo.
echo Website: http://localhost:3000
echo TCP:     localhost:5000
echo.

start "" "http://localhost:3000"

exit