import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { formatCurrency, formatDate, INVOICE_STATUS_COLORS, INVOICE_STATUS_LABELS } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default async function InvoiceDetailPage({ params }: { params: { id: string } }) {
  const session = await auth()
  if (!session) redirect('/login')

  const invoice = await prisma.invoice.findUnique({
    where: { id: params.id },
    include: {
      customer: true,
      job: {
        include: {
          serviceType: true,
        },
      },
      lineItems: {
        orderBy: { sortOrder: 'asc' },
      },
      payments: {
        orderBy: { paidAt: 'desc' },
      },
    },
  })

  if (!invoice) {
    redirect('/invoices')
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <Link href="/invoices" className="text-sm text-blue-600 hover:underline">
          ← Back to Invoices
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-8">
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{invoice.invoiceNumber}</h1>
            <p className="text-sm text-gray-500 mt-1">
              Issued {formatDate(invoice.issueDate)}
              {invoice.dueDate && ` · Due ${formatDate(invoice.dueDate)}`}
            </p>
          </div>
          <span className={`badge ${INVOICE_STATUS_COLORS[invoice.status]} text-base px-4 py-2`}>
            {INVOICE_STATUS_LABELS[invoice.status]}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <h2 className="text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wider">Bill To</h2>
            <p className="text-gray-900 font-medium">
              {invoice.customer.firstName} {invoice.customer.lastName}
            </p>
            {invoice.customer.email && (
              <p className="text-sm text-gray-600">{invoice.customer.email}</p>
            )}
            <p className="text-sm text-gray-600">{invoice.customer.phone}</p>
            {invoice.customer.address && (
              <div className="text-sm text-gray-600 mt-1">
                <p>{invoice.customer.address}</p>
                <p>
                  {[invoice.customer.city, invoice.customer.state, invoice.customer.zip]
                    .filter(Boolean)
                    .join(', ')}
                </p>
              </div>
            )}
          </div>

          {invoice.job && (
            <div>
              <h2 className="text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wider">Related Job</h2>
              <Link
                href={`/jobs/${invoice.job.id}`}
                className="text-blue-600 font-medium hover:underline"
              >
                {invoice.job.jobNumber}
              </Link>
              {invoice.job.serviceType && (
                <p className="text-sm text-gray-600 mt-1">{invoice.job.serviceType.name}</p>
              )}
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 pt-6">
          <table className="w-full mb-6">
            <thead>
              <tr className="text-left text-sm text-gray-600 border-b border-gray-200">
                <th className="pb-3 font-semibold">Description</th>
                <th className="pb-3 font-semibold text-right">Qty</th>
                <th className="pb-3 font-semibold text-right">Unit Price</th>
                <th className="pb-3 font-semibold text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {invoice.lineItems.map((item, index) => (
                <tr key={index} className="border-b border-gray-100">
                  <td className="py-3 text-gray-900">
                    {item.description}
                    {item.taxable && <span className="text-xs text-gray-400 ml-2">Taxable</span>}
                  </td>
                  <td className="py-3 text-right text-gray-600">{item.quantity}</td>
                  <td className="py-3 text-right text-gray-600">{formatCurrency(item.unitPrice)}</td>
                  <td className="py-3 text-right font-medium text-gray-900">
                    {formatCurrency(item.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-end">
            <div className="w-64 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium text-gray-900">{formatCurrency(invoice.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">
                  Tax ({(invoice.taxRate * 100).toFixed(1)}%)
                </span>
                <span className="font-medium text-gray-900">{formatCurrency(invoice.taxAmount)}</span>
              </div>
              <div className="flex justify-between text-base pt-2 border-t border-gray-200">
                <span className="font-semibold text-gray-900">Total</span>
                <span className="font-bold text-gray-900">{formatCurrency(invoice.total)}</span>
              </div>
              {invoice.amountPaid > 0 && (
                <>
                  <div className="flex justify-between text-sm pt-2 border-t border-gray-200">
                    <span className="text-gray-600">Amount Paid</span>
                    <span className="font-medium text-green-600">
                      -{formatCurrency(invoice.amountPaid)}
                    </span>
                  </div>
                  <div className="flex justify-between text-base pt-2 border-t border-gray-200">
                    <span className="font-semibold text-gray-900">Balance Due</span>
                    <span className="font-bold text-orange-600">
                      {formatCurrency(invoice.balance)}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {invoice.notes && (
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Notes</h3>
            <p className="text-sm text-gray-600">{invoice.notes}</p>
          </div>
        )}

        {invoice.terms && (
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Terms</h3>
            <p className="text-sm text-gray-600">{invoice.terms}</p>
          </div>
        )}

        {invoice.payments.length > 0 && (
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Payments</h3>
            <div className="space-y-2">
              {invoice.payments.map(payment => (
                <div key={payment.id} className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded">
                  <div>
                    <span className="text-sm font-medium text-gray-900">
                      {formatCurrency(payment.amount)}
                    </span>
                    <span className="text-xs text-gray-500 ml-2">via {payment.method}</span>
                  </div>
                  <span className="text-xs text-gray-500">{formatDate(payment.paidAt)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-gray-200 flex gap-3">
          <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
            Print Invoice
          </button>
          {invoice.status === 'DRAFT' && (
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
              Send Invoice
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
