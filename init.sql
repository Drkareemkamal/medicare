-- Database initialization script for Medicare application
-- This script runs when the PostgreSQL container starts for the first time

-- Create the main database if it doesn't exist
-- Note: This is handled by POSTGRES_DB environment variable, but we can add additional setup here

-- Set timezone
SET timezone = 'UTC';

-- Create extensions if needed
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Add any additional database setup here
-- For example, you could create additional users or schemas

-- Note: The actual schema will be created by Prisma migrations
-- This file is for any pre-migration setup if needed
