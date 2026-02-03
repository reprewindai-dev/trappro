@echo off
echo ========================================
echo  PUSH TRAPMASTERPRO TO GITHUB
echo ========================================
echo.
echo STEP 1: Create repo at https://github.com/new
echo        Name: trap-master-pro
echo        DON'T check "Initialize with README"
echo.
pause
echo.
echo STEP 2: Enter your GitHub username:
set /p GITHUB_USER="GitHub Username: "
echo.
echo STEP 3: Adding remote and pushing...
echo.
cd /d "%~dp0"
git remote remove origin 2>nul
git remote add origin https://github.com/%GITHUB_USER%/trap-master-pro.git
git branch -M main
git push -u origin main
echo.
echo ========================================
echo  DONE! Check GitHub for your repo
echo ========================================
pause
