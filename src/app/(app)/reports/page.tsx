import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { formatCurrency } from '@/lib/utils'

export default async function ReportsPage() {
  const session = await auth()
  if (!session) redirect('/login')
  const tenantId = (session.user as any).tenantId
  const [jobs, invoices, timeEntries, employees] = await Promise.all([
    prisma.job.findMany({ where: { tenantId }, include: { assignedTo: true, serviceType: true } }),
    prisma.invoice.findMany({ where: { tenantId } }),
    prisma.timeEntry.findMany({ where: { user: { tenantId } }, include: { user: true } }),
    prisma.user.findMany({ where: { tenantId, isActive: true } }),
  ])
  const revenue = invoices.filter(i => i.status === 'PAID').reduce((s, i) => s + i.total, 0)
  const outstanding = invoices.filter(i => ['SENT','OVERDUE','PARTIAL'].includes(i.status)).reduce((s, i) => s + i.balance, 0)
  const completedJobs = jobs.filter(j => ['COMPLETED','INVOICED'].includes(j.status)).length
  const totalHours = timeEntries.filter(e => e.status === 'APPROVED').reduce((s, e) => s + (e.hours ?? 0), 0)
  const byTech = employees.map(emp => {
    const empJobs = jobs.filter(j => j.assignedToId === emp.id)
    const empHours = timeEntries.filter(e => e.userId === emp.id && e.status === 'APPROVED').reduce((s, e) => s + (e.hours ?? 0), 0)
    return { name: emp.name, jobs: empJobs.length, completed: empJobs.filter(j => ['COMPLETED','INVOICED'].includes(j.status)).length, hours: empHours }
  })
  const byService = await prisma.serviceType.findMany({
    where: { tenantId },
    include: { _count: { select: { jobs: true } } },
  })
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6"><h1 className="text-2xl font-bold text-gray-900">Reports</h1><p className="text-sm text-gray-500 mt-1">Business performance overview</p></div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="kpi-card"><p className="kpi-label">Revenue Collected</p><p className="kpi-value text-green-600">{formatCurrency(revenue)}</p></div>
        <div className="kpi-card"><p className="kpi-label">Outstanding</p><p className="kpi-value text-orange-500">{formatCurrency(outstanding)}</p></div>
        <div className="kpi-card"><p className="kpi-label">Jobs Completed</p><p className="kpi-value">{completedJobs}</p><p className="text-xs text-gray-400 mt-1">of {jobs.length} total</p></div>
        <div className="kpi-card"><p className="kpi-label">Approved Hours</p><p className="kpi-value">{totalHours.toFixed(1)}h</p></div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Tech Performance</h3>
          <table className="data-table text-sm">
            <thead><tr><th>Technician</th><th>Jobs</th><th>Completed</th><th>Hours</th><th>Completion %</th></tr></thead>
            <tbody>
              {byTech.map(t => (
                <tr key={t.name}>
                  <td className="font-medium text-gray-800">{t.name}</td>
                  <td>{t.jobs}</td>
                  <td className="text-green-600 font-semibold">{t.completed}</td>
                  <td>{t.hours.toFixed(1)}h</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-100 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${t.jobs > 0 ? Math.round(t.completed/t.jobs*100) : 0}%` }} />
                      </div>
                      <span className="text-xs text-gray-500">{t.jobs > 0 ? Math.round(t.completed/t.jobs*100) : 0}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Jobs by Service Type</h3>
          <div className="space-y-3">
            {byService.sort((a,b) => b._count.jobs - a._count.jobs).map(st => (
              <div key={st.id} className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: st.color }} />
                <span className="text-sm text-gray-700 flex-1">{st.name}</span>
                <span className="text-sm font-semibold text-gray-900">{st._count.jobs}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
