@echo off
title Scrap Sathi Android App Builder
echo ====================================================================
echo Scrap Sathi Android App Builder (Capacitor Native Android)
echo Problem Statement 26229 - Kabadiwala Connect
echo ====================================================================

echo [1/3] Building Web Production Assets...
cd client
call npm run build

echo [2/3] Syncing Assets and Native Android Plugins...
call npx cap sync android

echo [3/3] Opening Native Project in Android Studio...
call npx cap open android

echo.
echo If Android Studio is open, click: Build -^> Build Bundle(s) / APK(s) -^> Build APK(s)
echo The native Android code is located in: client\android\
pause
