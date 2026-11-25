@echo off
title OHANA ACADEMY LMS - Local Server (Port 3005)
cd /d "%~dp0"
echo ====================================================
echo   KHOI DONG HE THONG E-LEARNING OHANA ACADEMY LMS
echo   Mo trinh duyet tai: http://localhost:3005
echo ====================================================
start http://localhost:3005
npm.cmd run dev
pause
