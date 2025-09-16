@echo off
REM MediCare Docker Management Script for Windows

setlocal enabledelayedexpansion

set COMPOSE_FILE=docker-compose.yml
set OVERRIDE_FILE=docker-compose.override.yml

REM Colors (using color codes)
set GREEN=[92m
set YELLOW=[93m
set RED=[91m
set NC=[0m

:log_info
echo [INFO] %~1
goto :eof

:log_warn
echo [WARN] %~1
goto :eof

:log_error
echo [ERROR] %~1
goto :eof

:check_docker
docker info >nul 2>&1
if errorlevel 1 (
    call :log_error "Docker is not running. Please start Docker first."
    exit /b 1
)
goto :eof

:setup_env
if not exist .env (
    call :log_info "Creating .env file from .env.example"
    copy .env.example .env
    call :log_warn "Please edit .env file with your configuration"
) else (
    call :log_info ".env file already exists"
)
goto :eof

:start
call :check_docker
call :setup_env

if "%1"=="dev" (
    call :log_info "Starting in development mode..."
    docker-compose -f %COMPOSE_FILE% -f %OVERRIDE_FILE% up --build -d
) else (
    call :log_info "Starting in production mode..."
    docker-compose -f %COMPOSE_FILE% up --build -d
)
goto :eof

:stop
call :log_info "Stopping services..."
docker-compose -f %COMPOSE_FILE% -f %OVERRIDE_FILE% down
goto :eof

:logs
if "%1"=="app" (
    docker-compose -f %COMPOSE_FILE% -f %OVERRIDE_FILE% logs -f app
) else if "%1"=="db" (
    docker-compose -f %COMPOSE_FILE% -f %OVERRIDE_FILE% logs -f db
) else (
    docker-compose -f %COMPOSE_FILE% -f %OVERRIDE_FILE% logs -f
)
goto :eof

:migrate
call :log_info "Running database migrations..."
docker-compose -f %COMPOSE_FILE% -f %OVERRIDE_FILE% exec app npx prisma migrate dev
goto :eof

:generate
call :log_info "Generating Prisma client..."
docker-compose -f %COMPOSE_FILE% -f %OVERRIDE_FILE% exec app npx prisma generate
goto :eof

:db_shell
call :log_info "Connecting to database..."
docker-compose -f %COMPOSE_FILE% -f %OVERRIDE_FILE% exec db psql -U postgres -d medicare_db
goto :eof

:clean
call :log_warn "This will remove all containers, volumes, and images"
set /p choice="Are you sure? (y/N): "
if /i "!choice!"=="y" (
    call :log_info "Cleaning up..."
    docker-compose -f %COMPOSE_FILE% -f %OVERRIDE_FILE% down -v --rmi all
    docker system prune -f
)
goto :eof

:help
echo MediCare Docker Management Script for Windows
echo.
echo Usage: %0 [command] [options]
echo.
echo Commands:
echo   start [dev]     Start services (add 'dev' for development mode)
echo   stop            Stop services
echo   logs [service]  View logs (app, db, or all)
echo   migrate         Run database migrations
echo   generate        Generate Prisma client
echo   db-shell        Access database shell
echo   clean           Clean up containers and volumes
echo   help            Show this help
echo.
echo Examples:
echo   %0 start dev    # Start in development mode
echo   %0 logs app     # View app logs
echo   %0 migrate      # Run migrations
goto :eof

REM Main script logic
if "%1"=="start" (
    call :start %2
) else if "%1"=="stop" (
    call :stop
) else if "%1"=="logs" (
    call :logs %2
) else if "%1"=="migrate" (
    call :migrate
) else if "%1"=="generate" (
    call :generate
) else if "%1"=="db-shell" (
    call :db_shell
) else if "%1"=="clean" (
    call :clean
) else (
    call :help
)
