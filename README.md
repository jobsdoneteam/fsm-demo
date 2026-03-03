# FieldFlow FSM Demo

Full-featured Field Service Management demo application.

## Stack
- Next.js 14 (App Router) + TypeScript
- PostgreSQL + Prisma ORM
- NextAuth v5 (credentials)
- Tailwind CSS + shadcn/ui
- Recharts for analytics
- pm2 for production process management

## Demo Logins
| Role | Email | Password |
|------|-------|----------|
| Owner/Admin | owner@fieldflowdemo.com | demo1234 |
| Dispatcher | dispatch@fieldflowdemo.com | demo1234 |
| Field Tech | tech1@fieldflowdemo.com | demo1234 |

## Setup
1. Copy `.env.example` to `.env` and fill in values
2. `npm install`
3. `npm run db:push` -- create tables
4. `npm run db:seed` -- seed demo data
5. `npm run dev` -- start at http://localhost:3001

## Modules
- Dashboard (KPIs + revenue chart)
- Jobs (full lifecycle: new -> invoiced)
- Customers (CRM with job history)
- Schedule & Dispatch (7-day view + tech workload)
- Invoices (generate, track, mark paid)
- Inventory (stock levels, low-stock alerts)
- Employees (profiles, certifications, roles)
- Time Cards (clock in/out, approval workflow)
- Reports (revenue, tech performance, job metrics)

## Deploy
Push to `main` -- GitHub Actions SSHes to `/var/www/fsm-demo`, builds, and restarts pm2.
See `ecosystem.config.js` for pm2 configuration.
