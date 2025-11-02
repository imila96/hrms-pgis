@echo off
REM MySQL Migration Script Runner for Windows
REM This script will update the database schema for the unidirectional relationship

echo ========================================
echo HRMS Database Migration
echo ========================================
echo.
echo This will modify your database schema.
echo MAKE SURE YOU HAVE A BACKUP!
echo.
pause

echo.
echo Running migration script...
echo.

REM Update these values if different
set MYSQL_USER=hrms_user
set MYSQL_PASSWORD=SuperSecret123!
set MYSQL_DATABASE=hrms_dev
set MYSQL_HOST=localhost
set MYSQL_PORT=3306

REM Path to MySQL (update if needed)
set MYSQL_PATH="C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"

REM Alternative path for XAMPP
if not exist %MYSQL_PATH% (
    set MYSQL_PATH="C:\xampp\mysql\bin\mysql.exe"
)

REM Check if mysql exists
if not exist %MYSQL_PATH% (
    echo ERROR: MySQL client not found!
    echo Please update MYSQL_PATH in this script.
    echo.
    pause
    exit /b 1
)

REM Run the migration
%MYSQL_PATH% -h %MYSQL_HOST% -P %MYSQL_PORT% -u %MYSQL_USER% -p%MYSQL_PASSWORD% %MYSQL_DATABASE% < mysql_update_employee_user_relationship.sql

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo Migration completed successfully!
    echo ========================================
) else (
    echo.
    echo ========================================
    echo Migration failed! Check errors above.
    echo ========================================
)

echo.
pause
