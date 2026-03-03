import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { formatDate, formatTime, formatHours } from '@/lib/utils'

export default async function TimecardsPage() {
  const session = await auth()
  if (!session) redirect('/login')
  const tenantId = (session.user as any).tenantId
  const entries = await prisma.timeEntry.findMany({
    where: { user: { tenantId } },
    include: { user: true, job: true },
    orderBy: { clockIn: 'desc' },
    take: 100,
  })
  const pending = entries.filter(e => e.status === 'PENDING').length
  const totalHours = entries.filter(e => e.status === 'APPROVED').reduce((s, e) => s + (e.hours ?? 0), 0)
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-bold text-gray-900">Time Cards</h1><p className="text-sm text-gray-500 mt-1">Track and approve employee time</p></div>
      </div>
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="kpi-card"><p className="kpi-label">Pending Approval</p><p className="kpi-value text-orange-500">{pending}</p></div>
        <div className="kpi-card"><p className="kpi-label">Approved Hours (Week)</p><p className="kpi-value">{totalHours.toFixed(1)}h</p></div>
        <div className="kpi-card"><p className="kpi-label">Total Entries</p><p className="kpi-value">{entries.length}</p></div>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="data-table">
          <thead><tr><th>Employee</th><th>Date</th><th>Clock In</th><th>Clock Out</th><th>Break</th><th>Hours</th><th>Job</th><th>Status</th></tr></thead>
          <tbody>
            {entries.map(e => (
              <tr key={e.id}>
                <td className="font-medium text-gray-800">{e.user.name}</td>
                <td className="text-gray-600">{formatDate(e.clockIn)}</td>
                <td className="text-gray-600">{formatTime(e.clockIn)}</td>
                <td className="text-gray-600">{e.clockOut ? formatTime(e.clockOut) : <span className="text-green-600 font-semibold">Active</span>}</td>
                <td className="text-gray-500">{e.breakMins}m</td>
                <td className="font-semibold text-gray-800">{formatHours(e.hours)}</td>
                <td className="text-gray-500 text-xs">{e.job?.jobNumber ?? '—'}</td>
                <td>
                  <span className={`badge ${e.status === 'APPROVED' ? 'bg-green-100 text-green-700' : e.status === 'REJECTED' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {e.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
