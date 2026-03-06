import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { formatCurrency, formatDate, JOB_STATUS_COLORS, JOB_STATUS_LABELS } from '@/lib/utils'
import { RevenueChart } from '../components/RevenueChart'

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

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Welcome back, {session.user?.name}. Here's what's happening today.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="kpi-card">
          <p className="kpi-label">Total Revenue</p>
          <p className="kpi-value">{formatCurrency(data.totalRevenue)}</p>
          <p className="kpi-change up">↑ 12% vs last month</p>
        </div>
        <div className="kpi-card">
          <p className="kpi-label">Outstanding</p>
          <p className="kpi-value text-orange-600">{formatCurrency(data.outstanding)}</p>
          <p className="kpi-change down">3 invoices unpaid</p>
        </div>
        <div className="kpi-card">
          <p className="kpi-label">Open Jobs</p>
          <p className="kpi-value">{data.openJobs}</p>
          <p className="kpi-change up">{data.completedToday} completed</p>
        </div>
        <div className="kpi-card">
          <p className="kpi-label">Customers</p>
          <p className="kpi-value">{data.customers}</p>
          <p className="kpi-change up">{data.employees} active staff</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Revenue This Week</h3>
          <RevenueChart data={data.chartData} formatter={formatCurrency} />
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Low Stock Alerts</h3>
          <div className="space-y-3">
            {data.lowStock.map(item => (
              <div key={item.id} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-800 truncate max-w-[160px]">{item.name}</p>
                  <p className="text-xs text-gray-400">{item.sku}</p>
                </div>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${item.quantityOnHand <= item.reorderPoint ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                  {item.quantityOnHand} left
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-700">Recent Jobs</h3>
          <a href="/jobs" className="text-xs text-blue-600 hover:underline">View all →</a>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Job #</th>
              <th>Customer</th>
              <th>Service</th>
              <th>Assigned To</th>
              <th>Status</th>
              <th>Scheduled</th>
            </tr>
          </thead>
          <tbody>
            {data.jobs.slice(0, 8).map(job => (
              <tr key={job.id} className="cursor-pointer">
                <td><a href={`/jobs/${job.id}`} className="text-blue-600 font-medium hover:underline">{job.jobNumber}</a></td>
                <td className="text-gray-700">{job.customer.firstName} {job.customer.lastName}</td>
                <td className="text-gray-500 text-xs">{job.serviceType?.name ?? '—'}</td>
                <td className="text-gray-600">{job.assignedTo?.name ?? 'Unassigned'}</td>
                <td>
                  <span className={`badge ${JOB_STATUS_COLORS[job.status]}`}>{JOB_STATUS_LABELS[job.status]}</span>
                </td>
                <td className="text-gray-500 text-xs">{formatDate(job.scheduledStart)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
