@echo off
REM Quick Fix: Link Users to Employees
REM Run this to fix the "User.getEmployee() is null" error

echo ================================
echo Link Users to Employee Records
echo ================================
echo.

REM Configuration
set DB_NAME=hrms_db
set DB_HOST=localhost
set DB_PORT=3306

set /p DB_USER="Enter MySQL username (default: root): "
if "%DB_USER%"=="" set DB_USER=root

set "PSCOMMAND=powershell -Command "$pword = read-host 'Enter MySQL password' -AsSecureString ; ^
    $BSTR=[System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($pword); ^
    [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)""
for /f "usebackq delims=" %%p in (`%PSCOMMAND%`) do set DB_PASS=%%p

echo.
echo Running SQL script...
echo.

REM Run the quick fix SQL
mysql -h %DB_HOST% -P %DB_PORT% -u %DB_USER% -p%DB_PASS% %DB_NAME% < backend\scripts\quick_fix_employee_link.sql

if %ERRORLEVEL% EQU 0 (
    echo.
    echo SUCCESS! User accounts have been linked to employee records.
    echo.
    echo Please try accessing the Leave Management page again.
) else (
    echo.
    echo ERROR! Failed to execute SQL script.
    echo Please check your database credentials and try again.
)

echo.
pause
