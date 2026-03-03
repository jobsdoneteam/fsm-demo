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

## Modules
Dashboard, Jobs, Customers, Schedule/Dispatch, Invoices, Inventory, Employees, Time Cards, Reports

## Deploy
Push to `main` — GitHub Actions SSHes to `/var/www/fsm-demo`, builds, and restarts pm2.
