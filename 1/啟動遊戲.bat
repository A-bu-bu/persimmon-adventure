@echo off
chcp 65001 >nul
title 柿柿順利大冒險 - 本機伺服器
echo =======================================================
echo   🍊 正在啟動《柿柿順利大冒險》遊戲伺服器...
echo =======================================================
powershell -ExecutionPolicy Bypass -File "%~dp0server.ps1"
pause
