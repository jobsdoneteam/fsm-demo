import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { formatTime, JOB_STATUS_COLORS, JOB_STATUS_LABELS } from '@/lib/utils'

export default async function SchedulePage() {
  const session = await auth()
  if (!session) redirect('/login')
  const tenantId = (session.user as any).tenantId
  const today = new Date()
  const start = new Date(today); start.setHours(0,0,0,0)
  const end = new Date(today); end.setDate(end.getDate() + 7); end.setHours(23,59,59,999)
  const [jobs, techs] = await Promise.all([
    prisma.job.findMany({
      where: { tenantId, scheduledStart: { gte: start, lte: end }, status: { notIn: ['CANCELLED'] } },
      include: { customer: true, assignedTo: true, serviceType: true },
      orderBy: { scheduledStart: 'asc' },
    }),
    prisma.user.findMany({ where: { tenantId, role: { in: ['TECH','APPRENTICE'] }, isActive: true }, orderBy: { name: 'asc' } }),
  ])
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-bold text-gray-900">Schedule & Dispatch</h1><p className="text-sm text-gray-500 mt-1">Next 7 days — {jobs.length} scheduled jobs</p></div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Jobs list */}
        <div className="lg:col-span-2 space-y-3">
          {jobs.length === 0 && <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-400">No scheduled jobs in the next 7 days.</div>}
          {jobs.map(job => (
            <div key={job.id} className="bg-white rounded-xl border border-gray-200 p-4 flex gap-4">
              <div className="w-1 rounded-full flex-shrink-0" style={{ background: job.serviceType?.color ?? '#3b82f6' }} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="font-semibold text-gray-900 text-sm truncate">{job.title}</span>
                  <span className={`badge ${JOB_STATUS_COLORS[job.status]} flex-shrink-0`}>{JOB_STATUS_LABELS[job.status]}</span>
                </div>
                <p className="text-xs text-gray-500 mb-2">{job.customer.firstName} {job.customer.lastName} &bull; {job.city}, {job.state}</p>
                <div className="flex items-center gap-4 text-xs text-gray-400">
                  <span>&#128336; {formatTime(job.scheduledStart)} – {formatTime(job.scheduledEnd)}</span>
                  <span>&#128119; {job.assignedTo?.name ?? 'Unassigned'}</span>
                  <span>#{job.jobNumber}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        {/* Tech availability */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Tech Workload (Next 7 Days)</h3>
          <div className="space-y-4">
            {techs.map(tech => {
              const techJobs = jobs.filter(j => j.assignedToId === tech.id)
              return (
                <div key={tech.id}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">
                        {tech.name.split(' ').map(n=>n[0]).join('')}
                      </div>
                      <span className="text-sm font-medium text-gray-800">{tech.name}</span>
                    </div>
                    <span className="text-xs font-semibold text-gray-600">{techJobs.length} jobs</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full transition-all" style={{ width: `${Math.min(techJobs.length / 7 * 100, 100)}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
