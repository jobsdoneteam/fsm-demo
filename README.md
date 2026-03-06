# FieldFlow FSM Demo

Full-featured Field Service Management demo application built with Next.js 14.

## Demo Logins
| Role | Email | Password |
|------|-------|----------|
| Owner/Admin | owner@fieldflowdemo.com | demo1234 |
| Dispatcher | dispatch@fieldflowdemo.com | demo1234 |
| Field Tech | tech1@fieldflowdemo.com | demo1234 |

## Setup
1. Copy `.env.example` to `.env` and fill values
2. `npm install`
3. `npm run db:push`
4. `npm run db:seed`
5. `npm run dev`

## Docker Setup

### Quick Start with Docker Compose
```bash
# Build and start all services (PostgreSQL + App)
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop all services
docker-compose down
```

### Development with Docker (Database only)
```bash
# Start PostgreSQL container only
docker-compose -f docker-compose.dev.yml up -d

# Then run the app locally with npm
npm install
npm run db:push
npm run db:seed
npm run dev
```

### Database Commands in Docker
```bash
# Access the database container
docker-compose exec postgres psql -U postgres -d fsm_demo

# Run Prisma Studio
docker-compose exec app npx prisma studio

# Push schema changes
docker-compose exec app npx prisma db push
```

## Modules
Dashboard, Jobs, Customers, Schedule/Dispatch, Invoices, Inventory, Employees, Time Cards, Reports

## Deploy
Push to `main` — GitHub Actions SSHes to `/var/www/fsm-demo`, builds, and restarts pm2.
