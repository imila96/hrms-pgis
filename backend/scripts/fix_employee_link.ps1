# Quick Fix: Link Users to Employees
# This script connects to your MySQL database and links user accounts to employee records

$mysqlPath = "mysql"  # Adjust if MySQL is not in PATH
$database = "hrms_db"  # Your database name
$host = "localhost"
$port = "3306"

Write-Host "================================" -ForegroundColor Cyan
Write-Host "Link Users to Employee Records" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Prompt for database credentials
$username = Read-Host "Enter MySQL username (default: root)"
if ([string]::IsNullOrWhiteSpace($username)) {
    $username = "root"
}

$password = Read-Host "Enter MySQL password" -AsSecureString
$passwordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [Runtime.InteropServices.Marshal]::SecureStringToBSTR($password)
)

Write-Host ""
Write-Host "Running SQL script..." -ForegroundColor Yellow

# Run the SQL script
$sqlScript = ".\backend\scripts\link_user_to_employee.sql"

if (Test-Path $sqlScript) {
    & $mysqlPath -h $host -P $port -u $username -p$passwordPlain $database < $sqlScript
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✓ Successfully executed!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Your user account should now be linked to an employee record." -ForegroundColor Green
        Write-Host "Please try accessing the Leave Management page again." -ForegroundColor Green
    } else {
        Write-Host ""
        Write-Host "✗ Error executing SQL script" -ForegroundColor Red
        Write-Host "Please check your database credentials and try again." -ForegroundColor Red
    }
} else {
    Write-Host "Error: SQL script not found at $sqlScript" -ForegroundColor Red
    Write-Host "Please ensure you're running this from the project root directory." -ForegroundColor Red
}

Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
