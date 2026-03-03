import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { formatDate, ROLE_LABELS } from '@/lib/utils'

export default async function EmployeesPage() {
  const session = await auth()
  if (!session) redirect('/login')
  const tenantId = (session.user as any).tenantId
  const employees = await prisma.user.findMany({
    where: { tenantId },
    include: { _count: { select: { assignedJobs: true, timeEntries: true } } },
    orderBy: { name: 'asc' },
  })
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-bold text-gray-900">Employees</h1><p className="text-sm text-gray-500 mt-1">{employees.length} team members</p></div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700">+ Add Employee</button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {employees.map(emp => (
          <div key={emp.id} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-11 h-11 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm flex-shrink-0">
                {emp.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <p className="font-semibold text-gray-900">{emp.name}</p>
                <p className="text-xs text-gray-500">{emp.title}</p>
              </div>
              <span className={`ml-auto badge text-xs ${emp.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                {emp.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div className="space-y-1 text-xs text-gray-500">
              <p><span className="font-medium text-gray-700">Role:</span> {ROLE_LABELS[emp.role]}</p>
              <p><span className="font-medium text-gray-700">Phone:</span> {emp.phone ?? '—'}</p>
              <p><span className="font-medium text-gray-700">Email:</span> {emp.email}</p>
              <p><span className="font-medium text-gray-700">Hired:</span> {formatDate(emp.hireDate)}</p>
              {emp.hourlyRate ? <p><span className="font-medium text-gray-700">Rate:</span> ${emp.hourlyRate}/hr</p> : null}
            </div>
            {emp.certifications.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1">
                {emp.certifications.map(c => (
                  <span key={c} className="badge bg-blue-50 text-blue-600 text-xs">{c}</span>
                ))}
              </div>
            )}
            <div className="mt-3 flex gap-4 text-xs text-gray-500 border-t border-gray-100 pt-3">
              <span><span className="font-semibold text-gray-700">{emp._count.assignedJobs}</span> jobs assigned</span>
              <span><span className="font-semibold text-gray-700">{emp._count.timeEntries}</span> time entries</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
