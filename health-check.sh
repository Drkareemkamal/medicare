#!/bin/bash

# Health Check Script for MediCare Docker Setup
# This script verifies that all services are running correctly

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}================================${NC}"
}

# Check if Docker is running
check_docker() {
    print_header "Checking Docker Status"
    if ! docker info >/dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker first."
        exit 1
    fi
    print_status "Docker is running"
}

# Check if services are running
check_services() {
    print_header "Checking Service Status"

    # Check if containers are running
    if ! docker-compose ps | grep -q "Up"; then
        print_error "No services are running. Please start the services first."
        print_status "Run: docker-compose up -d"
        exit 1
    fi

    # Check specific services
    services=("db" "app")
    for service in "${services[@]}"; do
        if docker-compose ps | grep -q "${service}.*Up"; then
            print_status "${service} service is running"
        else
            print_error "${service} service is not running"
        fi
    done

    # Check optional pgadmin
    if docker-compose ps | grep -q "pgadmin.*Up"; then
        print_status "pgadmin service is running"
    else
        print_warning "pgadmin service is not running (optional)"
    fi
}

# Check database connectivity
check_database() {
    print_header "Checking Database Connectivity"

    # Wait for database to be ready
    print_status "Waiting for database to be ready..."
    if ! docker-compose exec -T db pg_isready -U postgres -d medicare_db >/dev/null 2>&1; then
        print_error "Database is not ready"
        exit 1
    fi
    print_status "Database is ready"

    # Test database connection
    if docker-compose exec -T db psql -U postgres -d medicare_db -c "SELECT 1;" >/dev/null 2>&1; then
        print_status "Database connection successful"
    else
        print_error "Database connection failed"
        exit 1
    fi
}

# Check application health
check_application() {
    print_header "Checking Application Health"

    # Wait for app to be ready
    print_status "Waiting for application to be ready..."
    max_attempts=30
    attempt=1

    while [ $attempt -le $max_attempts ]; do
        if curl -f http://localhost:3000/api/health >/dev/null 2>&1; then
            print_status "Application is responding"
            break
        fi

        if [ $attempt -eq $max_attempts ]; then
            print_error "Application health check failed after $max_attempts attempts"
            exit 1
        fi

        print_status "Attempt $attempt/$max_attempts - waiting for application..."
        sleep 2
        ((attempt++))
    done

    # Test main application endpoint
    if curl -f http://localhost:3000 >/dev/null 2>&1; then
        print_status "Main application endpoint is accessible"
    else
        print_error "Main application endpoint is not accessible"
        exit 1
    fi
}

# Check volumes and permissions
check_volumes() {
    print_header "Checking Volumes and Permissions"

    # Check if uploads directory exists and is writable
    if docker-compose exec -T app test -w /app/uploads; then
        print_status "Uploads directory is writable"
    else
        print_error "Uploads directory is not writable"
        exit 1
    fi

    # Check database data persistence
    if docker volume ls | grep -q "medicare_postgres_data"; then
        print_status "Database volume exists"
    else
        print_warning "Database volume not found"
    fi
}

# Main execution
main() {
    print_header "MediCare Docker Health Check"
    echo "This script will verify that your Docker setup is working correctly."
    echo

    check_docker
    echo

    check_services
    echo

    check_database
    echo

    check_application
    echo

    check_volumes
    echo

    print_header "Health Check Complete"
    print_status "All checks passed! Your MediCare Docker setup is working correctly."
    echo
    print_status "You can now access:"
    echo "  - Application: http://localhost:3000"
    echo "  - pgAdmin (if enabled): http://localhost:5050"
    echo
    print_status "To view logs: docker-compose logs -f"
    print_status "To stop services: docker-compose down"
}

# Run main function
main "$@"
