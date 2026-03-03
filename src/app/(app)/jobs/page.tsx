import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { formatDate, JOB_STATUS_COLORS, JOB_STATUS_LABELS, PRIORITY_COLORS } from '@/lib/utils'

export default async function JobsPage() {
  const session = await auth()
  if (!session) redirect('/login')
  const tenantId = (session.user as any).tenantId

  const jobs = await prisma.job.findMany({
    where: { tenantId },
    include: {
      customer: true,
      assignedTo: true,
      serviceType: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  const statusCounts = jobs.reduce((acc, j) => {
    acc[j.status] = (acc[j.status] ?? 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Jobs</h1>
          <p className="text-sm text-gray-500 mt-1">{jobs.length} total jobs</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700">
          + New Job
        </button>
      </div>

      {/* Status summary */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {Object.entries(JOB_STATUS_LABELS).map(([status, label]) => (
          <div key={status} className={`badge ${JOB_STATUS_COLORS[status]} cursor-pointer hover:opacity-80`}>
            {label} {statusCounts[status] ? `(${statusCounts[status]})` : ''}
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="data-table">
          <thead>
            <tr>
              <th>Job #</th>
              <th>Title</th>
              <th>Customer</th>
              <th>Service</th>
              <th>Tech</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Scheduled</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map(job => (
              <tr key={job.id}>
                <td>
                  <Link href={`/jobs/${job.id}`} className="text-blue-600 font-semibold hover:underline">
                    {job.jobNumber}
                  </Link>
                </td>
                <td className="font-medium text-gray-800 max-w-[200px] truncate">{job.title}</td>
                <td className="text-gray-600">{job.customer.firstName} {job.customer.lastName}</td>
                <td className="text-gray-500 text-xs">{job.serviceType?.name ?? '—'}</td>
                <td className="text-gray-600">{job.assignedTo?.name ?? <span className="text-gray-400">Unassigned</span>}</td>
                <td><span className={`badge ${PRIORITY_COLORS[job.priority]}`}>{job.priority}</span></td>
                <td><span className={`badge ${JOB_STATUS_COLORS[job.status]}`}>{JOB_STATUS_LABELS[job.status]}</span></td>
                <td className="text-gray-500 text-xs">{formatDate(job.scheduledStart)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
