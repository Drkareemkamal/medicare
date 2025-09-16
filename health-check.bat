@echo off
REM Health Check Script for MediCare Docker Setup (Windows)
REM This script verifies that all services are running correctly

setlocal enabledelayedexpansion

REM Colors for Windows (limited support)
set "GREEN=[INFO]"
set "RED=[ERROR]"
set "YELLOW=[WARNING]"
set "BLUE=[INFO]"

echo ========================================
echo MediCare Docker Health Check
echo ========================================
echo This script will verify that your Docker setup is working correctly.
echo.

REM Check if Docker is running
echo Checking Docker Status...
docker info >nul 2>&1
if errorlevel 1 (
    echo %RED% Docker is not running. Please start Docker first.
    exit /b 1
)
echo %GREEN% Docker is running
echo.

REM Check if services are running
echo Checking Service Status...
docker-compose ps | findstr "Up" >nul 2>&1
if errorlevel 1 (
    echo %RED% No services are running. Please start the services first.
    echo %GREEN% Run: docker-compose up -d
    exit /b 1
)

REM Check specific services
set "services=db app"
for %%s in (%services%) do (
    docker-compose ps | findstr "%%s.*Up" >nul 2>&1
    if errorlevel 1 (
        echo %RED% %%s service is not running
    ) else (
        echo %GREEN% %%s service is running
    )
)

REM Check optional pgadmin
docker-compose ps | findstr "pgadmin.*Up" >nul 2>&1
if errorlevel 1 (
    echo %YELLOW% pgadmin service is not running (optional)
) else (
    echo %GREEN% pgadmin service is running
)
echo.

REM Check database connectivity
echo Checking Database Connectivity...
echo Waiting for database to be ready...
docker-compose exec -T db pg_isready -U postgres -d medicare_db >nul 2>&1
if errorlevel 1 (
    echo %RED% Database is not ready
    exit /b 1
)
echo %GREEN% Database is ready

REM Test database connection
docker-compose exec -T db psql -U postgres -d medicare_db -c "SELECT 1;" >nul 2>&1
if errorlevel 1 (
    echo %RED% Database connection failed
    exit /b 1
)
echo %GREEN% Database connection successful
echo.

REM Check application health
echo Checking Application Health...
echo Waiting for application to be ready...

set "max_attempts=30"
set "attempt=1"

:check_app_loop
if %attempt% gtr %max_attempts% (
    echo %RED% Application health check failed after %max_attempts% attempts
    exit /b 1
)

curl -f http://localhost:3000/api/health >nul 2>&1
if errorlevel 1 (
    echo %GREEN% Attempt %attempt%/%max_attempts% - waiting for application...
    timeout /t 2 /nobreak >nul
    set /a "attempt+=1"
    goto check_app_loop
)

echo %GREEN% Application is responding

REM Test main application endpoint
curl -f http://localhost:3000 >nul 2>&1
if errorlevel 1 (
    echo %RED% Main application endpoint is not accessible
    exit /b 1
)
echo %GREEN% Main application endpoint is accessible
echo.

REM Check volumes and permissions
echo Checking Volumes and Permissions...
docker-compose exec -T app test -w /app/uploads >nul 2>&1
if errorlevel 1 (
    echo %RED% Uploads directory is not writable
    exit /b 1
)
echo %GREEN% Uploads directory is writable

docker volume ls | findstr "medicare_postgres_data" >nul 2>&1
if errorlevel 1 (
    echo %YELLOW% Database volume not found
) else (
    echo %GREEN% Database volume exists
)
echo.

echo ========================================
echo Health Check Complete
echo ========================================
echo %GREEN% All checks passed^! Your MediCare Docker setup is working correctly.
echo.
echo %GREEN% You can now access:
echo   - Application: http://localhost:3000
echo   - pgAdmin (if enabled): http://localhost:5050
echo.
echo %GREEN% To view logs: docker-compose logs -f
echo %GREEN% To stop services: docker-compose down
echo.

pause
