import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import DashboardClient from './DashboardClient'

export const dynamic = 'force-dynamic'
export const revalidate = 0

async function getDashboardData(tenantId: string) {
  const [jobs, invoices, customers, employees, lowStock] = await Promise.all([
    prisma.job.findMany({
      where: { tenantId },
      include: { customer: true, assignedTo: true, serviceType: true },
      orderBy: { createdAt: 'desc' },
      take: 10,
    }),
    prisma.invoice.findMany({ where: { tenantId } }),
    prisma.customer.count({ where: { tenantId } }),
    prisma.user.count({ where: { tenantId, isActive: true } }),
    prisma.inventoryItem.findMany({
      where: { tenantId, isActive: true },
      orderBy: { quantityOnHand: 'asc' },
      take: 5,
    }),
  ])

  const totalRevenue = invoices.filter(i => i.status === 'PAID').reduce((s, i) => s + i.total, 0)
  const outstanding = invoices.filter(i => ['SENT', 'OVERDUE', 'PARTIAL'].includes(i.status)).reduce((s, i) => s + i.balance, 0)
  const openJobs = jobs.filter(j => ['NEW', 'SCHEDULED', 'DISPATCHED', 'IN_PROGRESS'].includes(j.status)).length
  const completedToday = jobs.filter(j => j.status === 'COMPLETED').length

  const chartData = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => ({
    day,
    revenue: Math.round(800 + Math.random() * 1200 + i * 150),
  }))

  return { jobs, totalRevenue, outstanding, openJobs, completedToday, customers, employees, lowStock, chartData }
}

export default async function DashboardPage() {
  const session = await auth()
  if (!session) redirect('/login')
  const tenantId = (session.user as any).tenantId
  const data = await getDashboardData(tenantId)

  const serializedJobs = data.jobs.map(job => ({
    ...job,
    createdAt: job.createdAt.toISOString(),
    scheduledStart: job.scheduledStart?.toISOString() ?? null,
    startedAt: job.startedAt?.toISOString() ?? null,
    completedAt: job.completedAt?.toISOString() ?? null,
    customer: {
      firstName: job.customer.firstName,
      lastName: job.customer.lastName,
    },
  }))

  const serializedLowStock = data.lowStock.map(item => ({
    id: item.id,
    name: item.name,
    sku: item.sku,
    quantityOnHand: item.quantityOnHand,
    reorderPoint: item.reorderPoint,
  }))

  return (
    <DashboardClient
      initialJobs={serializedJobs}
      initialTotalRevenue={data.totalRevenue}
      initialOutstanding={data.outstanding}
      initialOpenJobs={data.openJobs}
      initialCompletedToday={data.completedToday}
      initialCustomers={data.customers}
      initialEmployees={data.employees}
      lowStock={serializedLowStock}
      chartData={data.chartData}
      userName={session.user?.name ?? 'User'}
    />
  )
}
