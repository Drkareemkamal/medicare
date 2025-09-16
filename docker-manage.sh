#!/bin/bash

# MediCare Docker Management Script

set -e

COMPOSE_FILE="docker-compose.yml"
OVERRIDE_FILE="docker-compose.override.yml"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        log_error "Docker is not running. Please start Docker first."
        exit 1
    fi
}

# Setup environment
setup_env() {
    if [ ! -f .env ]; then
        log_info "Creating .env file from .env.example"
        cp .env.example .env
        log_warn "Please edit .env file with your configuration"
    else
        log_info ".env file already exists"
    fi
}

# Start services
start() {
    check_docker
    setup_env

    if [ "$1" = "dev" ]; then
        log_info "Starting in development mode..."
        docker-compose -f $COMPOSE_FILE -f $OVERRIDE_FILE up --build -d
    else
        log_info "Starting in production mode..."
        docker-compose -f $COMPOSE_FILE up --build -d
    fi
}

# Stop services
stop() {
    log_info "Stopping services..."
    docker-compose -f $COMPOSE_FILE -f $OVERRIDE_FILE down
}

# View logs
logs() {
    if [ "$1" = "app" ]; then
        docker-compose -f $COMPOSE_FILE -f $OVERRIDE_FILE logs -f app
    elif [ "$1" = "db" ]; then
        docker-compose -f $COMPOSE_FILE -f $OVERRIDE_FILE logs -f db
    else
        docker-compose -f $COMPOSE_FILE -f $OVERRIDE_FILE logs -f
    fi
}

# Run database migrations
migrate() {
    log_info "Running database migrations..."
    docker-compose -f $COMPOSE_FILE -f $OVERRIDE_FILE exec app npx prisma migrate dev
}

# Generate Prisma client
generate() {
    log_info "Generating Prisma client..."
    docker-compose -f $COMPOSE_FILE -f $OVERRIDE_FILE exec app npx prisma generate
}

# Access database
db_shell() {
    log_info "Connecting to database..."
    docker-compose -f $COMPOSE_FILE -f $OVERRIDE_FILE exec db psql -U postgres -d medicare_db
}

# Clean up
clean() {
    log_warn "This will remove all containers, volumes, and images"
    read -p "Are you sure? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        log_info "Cleaning up..."
        docker-compose -f $COMPOSE_FILE -f $OVERRIDE_FILE down -v --rmi all
        docker system prune -f
    fi
}

# Show help
help() {
    echo "MediCare Docker Management Script"
    echo ""
    echo "Usage: $0 [command] [options]"
    echo ""
    echo "Commands:"
    echo "  start [dev]     Start services (add 'dev' for development mode)"
    echo "  stop            Stop services"
    echo "  logs [service]  View logs (app, db, or all)"
    echo "  migrate         Run database migrations"
    echo "  generate        Generate Prisma client"
    echo "  db-shell        Access database shell"
    echo "  clean           Clean up containers and volumes"
    echo "  help            Show this help"
    echo ""
    echo "Examples:"
    echo "  $0 start dev    # Start in development mode"
    echo "  $0 logs app     # View app logs"
    echo "  $0 migrate      # Run migrations"
}

# Main script
case "$1" in
    start)
        start "$2"
        ;;
    stop)
        stop
        ;;
    logs)
        logs "$2"
        ;;
    migrate)
        migrate
        ;;
    generate)
        generate
        ;;
    db-shell)
        db_shell
        ;;
    clean)
        clean
        ;;
    help|*)
        help
        ;;
esac
