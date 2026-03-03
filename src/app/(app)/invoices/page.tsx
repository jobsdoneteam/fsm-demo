import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { formatCurrency, formatDate, INVOICE_STATUS_COLORS } from '@/lib/utils'

export default async function InvoicesPage() {
  const session = await auth()
  if (!session) redirect('/login')
  const tenantId = (session.user as any).tenantId
  const invoices = await prisma.invoice.findMany({
    where: { tenantId },
    include: { customer: true, job: true },
    orderBy: { createdAt: 'desc' },
  })
  const totalPaid = invoices.filter(i => i.status === 'PAID').reduce((s, i) => s + i.total, 0)
  const totalOutstanding = invoices.filter(i => ['SENT','OVERDUE','PARTIAL'].includes(i.status)).reduce((s, i) => s + i.balance, 0)
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="text-2xl font-bold text-gray-900">Invoices</h1><p className="text-sm text-gray-500 mt-1">{invoices.length} total</p></div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700">+ New Invoice</button>
      </div>
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="kpi-card"><p className="kpi-label">Collected</p><p className="kpi-value text-green-600">{formatCurrency(totalPaid)}</p></div>
        <div className="kpi-card"><p className="kpi-label">Outstanding</p><p className="kpi-value text-orange-500">{formatCurrency(totalOutstanding)}</p></div>
        <div className="kpi-card"><p className="kpi-label">Total Invoiced</p><p className="kpi-value">{formatCurrency(invoices.reduce((s,i)=>s+i.total,0))}</p></div>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="data-table">
          <thead><tr><th>Invoice #</th><th>Customer</th><th>Job</th><th>Issue Date</th><th>Due Date</th><th>Total</th><th>Balance</th><th>Status</th></tr></thead>
          <tbody>
            {invoices.map(inv => (
              <tr key={inv.id}>
                <td><Link href={`/invoices/${inv.id}`} className="text-blue-600 font-semibold hover:underline">{inv.invoiceNumber}</Link></td>
                <td className="text-gray-700">{inv.customer.firstName} {inv.customer.lastName}</td>
                <td className="text-gray-500 text-xs">{inv.job?.jobNumber ?? '—'}</td>
                <td className="text-gray-500 text-xs">{formatDate(inv.issueDate)}</td>
                <td className="text-gray-500 text-xs">{formatDate(inv.dueDate)}</td>
                <td className="font-semibold text-gray-800">{formatCurrency(inv.total)}</td>
                <td className={`font-semibold ${inv.balance > 0 ? 'text-orange-600' : 'text-green-600'}`}>{formatCurrency(inv.balance)}</td>
                <td><span className={`badge ${INVOICE_STATUS_COLORS[inv.status]}`}>{inv.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
