Here’s a cleaned, upgraded prompt that switches the stack to **Next.js (full-stack)** while keeping all your requirements. You can paste this as-is for an AI/dev agent.

---

# Role

You are a **Principal Full-Stack Developer**.

# Goal

Build a **web-based medical application** using **Next.js (App Router) + TypeScript** as a full-stack framework (frontend + backend via API Route Handlers). Use **PostgreSQL** as the database, **JWT** for auth, and deliver **Docker Compose** for one-command deployment. The UI must be modern and clean.

# Tech Stack & Standards

* **Frontend/Backend**: Next.js (App Router, TypeScript), API Route Handlers for server endpoints, Server Actions where appropriate.
* **UI**: Tailwind CSS + shadcn/ui components. Mobile-first, accessible (WCAG 2.1 AA).
* **Auth**: JWT (HTTP-only cookies), role-based access control: `EMPLOYEE`, `ADMIN`.
* **ORM**: Prisma with PostgreSQL.
* **Storage**: Local volume or S3-compatible bucket (configurable) for PDFs and images.
* **Validation**: Zod schemas (server + client).
* **Logging**: Simple request/error logging.
* **Env Config**: `.env` with typed runtime checks.
* **Security**: Helmet-equivalent headers via Next middleware, rate limiting on auth & uploads, input sanitization, file type/size checks.
* **Testing**: Minimal API tests (happy path) where feasible.

# Core Use Cases

1. **Public emergency page (no authentication)**

   * Purpose: In case of emergency, any colleague can view a specific employee’s critical info.
   * Access pattern: `/e/{employeeId}` (public, read-only, no index by robots).
   * Fields shown (read-only): `Photo`, `Payroll`, `Name`, `DOB`, `Position`, `Department`, `State`, `JobID`, `Blood Group`, `Special Habit`, `Chronic Disease` (e.g., DM, HTN, arrhythmias), `Address`, `Emergency Note`, `Mobile`.
   * **Privacy**: Only display these emergency fields; hide lab/scan PDFs and any non-emergency data. Add a visible privacy disclaimer.

2. **Employee portal (after authentication)**

   * Pages:

     * **Dashboard**: View personal profile + emergency fields.
     * **Medical Documents**: Upload/list/download **PDF** files (lab analyses, scan reports, etc.).

       * Metadata: title, type (lab/scan/other), date, size, checksum.
       * File validations: PDF only, up to a configurable size; virus check placeholder hook.
     * **Profile Edit**: Edit allowed personal fields; **cannot** change role.
   * CSV Import (personal one-time self-seed optional): Allow user to upload a CSV to auto-fill their profile fields matching the defined schema.

3. **Admin console (role = ADMIN)**

   * Manage employees: list/search, view details, **edit personal fields**, reset passwords, deactivate users.
   * Access all medical data for each employee (including PDFs), with audit logs.
   * CSV bulk import/seed: Upload a CSV matching the schema to create/update employee records.
   * Role management: Promote/demote roles (except self-demotion lock).

# Data Model (Prisma)

Create a PostgreSQL schema that originates from the CSV columns:

**CSV Columns (exact names):**
`payroll, Name, DOB, position, department, State, job ID, Blood Group, Special Habit, Note, Chronic Dis, Address, Mob`

**Normalized tables (suggested):**

* `User`

  * `id (UUID PK)`
  * `email (unique)`
  * `passwordHash`
  * `role` enum: `EMPLOYEE | ADMIN`
  * `createdAt`, `updatedAt`, `isActive`
* `EmployeeProfile` (1–1 with User)

  * `userId (FK)`
  * `payroll` (string)
  * `name`
  * `dob` (date)
  * `position`
  * `department`
  * `state`
  * `jobId`
  * `bloodGroup`
  * `specialHabit`
  * `note` (emergency note)
  * `chronicDisease`
  * `address`
  * `mobile`
  * `photoUrl`
* `MedicalDocument`

  * `id (UUID PK)`
  * `userId (FK)`
  * `title`
  * `type` enum: `LAB | SCAN | OTHER`
  * `fileUrl`
  * `filesize`
  * `checksum`
  * `uploadedAt`
* `AuditLog`

  * `id`, `actorUserId`, `action`, `targetUserId`, `createdAt`, `details (JSON)`

Ensure a CSV import mapper that maps the CSV headers to the normalized fields (e.g., `job ID` → `jobId`, `Chronic Dis` → `chronicDisease`, `Mob` → `mobile`).

# Pages & Routes (App Router)

* `/login` (credentials → JWT cookie)
* `/e/[employeeId]` (public emergency page; no auth; robots noindex)
* `/app` (protected)

  * `/app/dashboard`
  * `/app/profile` (view/edit own profile)
  * `/app/documents` (list/upload/download/delete own PDFs)
* `/admin` (protected: ADMIN)

  * `/admin/employees` (table with search/sort/pagination)
  * `/admin/employees/[userId]` (profile + docs)
  * `/admin/import` (CSV bulk import)
  * `/admin/audit`

# API Endpoints (Route Handlers)

* `POST /api/auth/login` → set JWT cookie (HTTP-only, Secure).
* `POST /api/auth/logout` → clear cookie.
* `GET /api/emergency/[employeeId]` → limited public profile payload.
* **Authed (EMPLOYEE):**

  * `GET /api/me` (profile), `PUT /api/me` (update allowed fields)
  * `GET /api/me/documents`, `POST /api/me/documents` (PDF upload), `DELETE /api/me/documents/[id]`
* **Admin only:**

  * `GET /api/admin/users` (list/search), `GET /api/admin/users/[id]`, `PUT /api/admin/users/[id]`, `POST /api/admin/users`
  * `POST /api/admin/import/csv`
  * `GET /api/admin/audit`

Include middleware to protect `/app/**` and `/admin/**`, and to attach `req.user` from JWT. Add rate-limits to `/api/auth/*` and uploads.

# CSV Import Requirements

* Accept CSV with **exact headers** listed above; provide a downloadable template.
* Validate headers and rows; show preview table and errors before commit.
* Upsert by (`payroll`, or `jobId`) with clear matching rule.
* For each row, create/update `User` + `EmployeeProfile`.
* Optional mapping UI for alternative header names.

# File Uploads (PDFs & Photos)

* PDFs: only from authenticated employee/admin; max size configurable; store URL + metadata.
* Photos: used on the emergency page; allow employee to upload/update their photo.
* Provide a file service abstraction that supports either local disk (Docker volume) or S3-compatible bucket via env flags.
* Sanity checks: MIME sniffing, extension whitelist, size limit, simple checksum.

# UI/UX

* Use shadcn/ui (Cards, Table, Tabs, Dialog, Toast), Tailwind, and sensible empty states.
* Public emergency page: large readable typography, quick-scan layout, print-friendly.
* Admin tables: sticky headers, column sorting, server pagination, quick filters.
* Dark mode toggle.

# Privacy & Security

* Public route only exposes emergency subset.
* Disallow search engine indexing for public emergency pages (`robots` headers).
* JWT in HTTP-only secure cookies; short access token, rotating refresh or short sessions.
* RBAC enforced server-side.
* Audit all admin reads/writes.
* Add basic CSRF protection on mutating routes (same-site cookies + CSRF token for forms).
* Helmet-like security headers via Next middleware.

# Environment Variables (example)

```
DATABASE_URL=postgresql://postgres:postgres@db:5432/medapp
JWT_SECRET=change_me
NEXT_PUBLIC_STORAGE_PROVIDER=local   # or s3
STORAGE_LOCAL_PATH=/data/uploads
S3_ENDPOINT=http://minio:9000
S3_BUCKET=medical-docs
S3_ACCESS_KEY=minio
S3_SECRET_KEY=miniosecret
S3_REGION=us-east-1
```

# Docker Compose (deliver fully working)

* Services:

  * `web`: Next.js app (production build), depends on db & optional storage.
  * `db`: Postgres 16 with mounted volume.
  * `pgadmin`: optional for local admin.
  * `minio`: optional S3-compatible storage with console.
* Volumes for Postgres and uploads.
* Healthchecks.
* One command to: build, migrate Prisma schema, seed from CSV (if provided), and start.

## 🚀 Quick Start with Docker

### Prerequisites
- Docker and Docker Compose installed
- Git

### Setup and Run

1. **Clone the repository**
   ```bash
   git clone https://github.com/Drkareemkamal/medicare.git
   cd medicare
   ```

2. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your preferred settings
   ```

3. **Start the application**
   ```bash
   # For production
   docker-compose up --build

   # For development (with hot reload)
   docker-compose -f docker-compose.yml -f docker-compose.override.yml up --build
   ```

4. **Access the application**
   - Web App: http://localhost:3000
   - Database: localhost:5432 (from host machine)
   - PostgreSQL Admin (if enabled): http://localhost:5050

### Database Setup

The application will automatically:
- Create the PostgreSQL database
- Run Prisma migrations
- Set up initial schema

### Using Management Scripts

For easier Docker management, use the provided scripts:

**Linux/Mac:**
```bash
# Start in development mode
./docker-manage.sh start dev

# Start in production mode
./docker-manage.sh start

# View app logs
./docker-manage.sh logs app

# Run database migrations
./docker-manage.sh migrate

# Access database shell
./docker-manage.sh db-shell

# Stop services
./docker-manage.sh stop

# Check system health
./health-check.sh
```

**Windows:**
```cmd
REM Start in development mode
docker-manage.bat start dev

REM Start in production mode
docker-manage.bat start

REM View app logs
docker-manage.bat logs app

REM Run database migrations
docker-manage.bat migrate

REM Check system health
health-check.bat
```

### Docker Configuration Files

The project includes multiple Docker Compose files for different environments:

- **`docker-compose.yml`**: Base configuration with PostgreSQL and application
- **`docker-compose.override.yml`**: Development overrides with hot reload and debugging
- **`docker-compose.prod.yml`**: Production configuration with security hardening
- **`docker-compose.test.yml`**: Test environment for automated testing
- **`docker-compose.ci.yml`**: CI/CD environment for pipelines
- **`.dockerignore`**: Optimized Docker build context
- **`init.sql`**: Database initialization script
- **`health-check.sh` / `health-check.bat`**: System health verification scripts
- **`docker-manage.sh` / `docker-manage.bat`**: Docker management utilities

### Environment-Specific Setup

**Development:**
```bash
# Start with development overrides
docker-compose -f docker-compose.yml -f docker-compose.override.yml up --build
```

**Production:**
```bash
# Start with production configuration
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up --build -d
```

**Testing:**
```bash
# Start test environment
docker-compose -f docker-compose.test.yml up --build
```

**CI/CD:**
```bash
# Start CI environment
docker-compose -f docker-compose.ci.yml up --build
```

### Manual Docker Commands

If you prefer to use Docker Compose directly:

```bash
# Development mode
docker-compose -f docker-compose.yml -f docker-compose.override.yml up --build

# Production mode
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up --build -d

# With pgAdmin for database management
docker-compose --profile admin -f docker-compose.yml -f docker-compose.prod.yml up --build -d

# Run database migrations
docker-compose exec app npx prisma migrate dev

# Access database
docker-compose exec db psql -U postgres -d medicare_db

# View logs
docker-compose logs -f app
```

### Service URLs

- **MediCare App**: http://localhost:3000
- **pgAdmin** (when enabled): http://localhost:5050
  - Email: admin@medicare.com (or your configured email)
  - Password: admin (or your configured password)
- **PostgreSQL**: localhost:5432 (from host machine)

### Sample Data and Testing

A sample CSV file is provided for testing the import functionality:

- **`sample-employees.csv`**: Contains sample employee data with all required fields
- Use this file to test the CSV import feature in the admin panel
- Includes various employee profiles with different departments and emergency information

### Health Monitoring

The application includes comprehensive health monitoring:

- **`/api/health`**: Application health endpoint
- **`health-check.sh` / `health-check.bat`**: Automated health verification scripts
- Database connectivity checks
- Service availability monitoring
- Volume and permission validation

Run health checks after deployment:
```bash
# Linux/Mac
./health-check.sh

# Windows
health-check.bat
```

### Troubleshooting

**Common Issues and Solutions:**

1. **Port conflicts:**
   ```bash
   # Check what's using ports
   netstat -tulpn | grep :3000
   netstat -tulpn | grep :5432

   # Change ports in .env file
   APP_PORT=3001
   DB_PORT=5433
   ```

2. **Database connection issues:**
   ```bash
   # Check database logs
   docker-compose logs db

   # Test database connection
   docker-compose exec db psql -U postgres -d medicare_db -c "SELECT 1;"

   # Reset database
   docker-compose down -v
   docker-compose up --build
   ```

3. **Permission issues:**
   ```bash
   # Fix file permissions
   sudo chown -R $USER:$USER .

   # Check Docker permissions
   docker-compose exec app ls -la /app/uploads
   ```

4. **Build failures:**
   ```bash
   # Clear Docker cache
   docker system prune -f

   # Rebuild without cache
   docker-compose build --no-cache
   ```

5. **Migration issues:**
   ```bash
   # Reset and re-run migrations
   docker-compose exec app npx prisma migrate reset --force

   # Generate Prisma client
   docker-compose exec app npx prisma generate
   ```

**Getting Help:**

- Check the logs: `docker-compose logs -f`
- Run health check: `./health-check.sh`
- Verify environment variables in `.env`
- Ensure Docker has sufficient resources allocated

# Developer Experience

* Scripts:

  * `dev`: run Next.js dev + Prisma generate
  * `db:migrate`, `db:seed` (accept a CSV path)
  * `build` and `start` (production)
* Include a sample CSV template and README with setup steps, roles, and screenshots.

# Acceptance Criteria

* Public emergency page works by direct URL and shows only the defined fields + photo.
* Employee can sign in, edit allowed profile fields, and upload/download/delete own PDFs.
* Admin can view/edit any employee, import CSV to seed/update, view audit logs.
* Data persists in Postgres; files persist in volume/S3.
* Docker Compose brings the full stack up; minimal configuration via `.env`.
* UI is clean, responsive, and accessible.

---

**Note:** Preserve exact CSV column names for import, but map them internally to normalized field names.
