import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'

export default async function CustomersPage() {
  const session = await auth()
  if (!session) redirect('/login')
  const tenantId = (session.user as any).tenantId

  const customers = await prisma.customer.findMany({
    where: { tenantId },
    include: {
      _count: { select: { jobs: true, invoices: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
          <p className="text-sm text-gray-500 mt-1">{customers.length} total customers</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700">
          + New Customer
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Location</th>
              <th>Jobs</th>
              <th>Invoices</th>
              <th>Since</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {customers.map(c => (
              <tr key={c.id}>
                <td>
                  <Link href={`/customers/${c.id}`} className="font-semibold text-blue-600 hover:underline">
                    {c.firstName} {c.lastName}
                  </Link>
                </td>
                <td className="text-gray-600">{c.phone}</td>
                <td className="text-gray-500 text-xs">{c.email ?? '—'}</td>
                <td className="text-gray-500 text-xs">{c.city ? `${c.city}, ${c.state}` : '—'}</td>
                <td className="font-semibold text-gray-700">{c._count.jobs}</td>
                <td className="font-semibold text-gray-700">{c._count.invoices}</td>
                <td className="text-gray-500 text-xs">{formatDate(c.createdAt)}</td>
                <td>
                  <span className={`badge ${c.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {c.isActive ? 'Active' : 'Inactive'}
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
