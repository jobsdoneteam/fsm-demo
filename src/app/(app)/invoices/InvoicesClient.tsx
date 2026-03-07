'use client'

import { useState } from 'react'
import Link from 'next/link'
import { formatCurrency, formatDate, INVOICE_STATUS_COLORS, INVOICE_STATUS_LABELS } from '@/lib/utils'
import InvoiceFormModal, { InvoiceFormData } from '@/components/InvoiceFormModal'

interface Invoice {
  id: string
  invoiceNumber: string
  status: string
  total: number
  balance: number
  issueDate: string
  dueDate: string | null
  customer: {
    id: string
    firstName: string
    lastName: string
  }
  job: {
    id: string
    jobNumber: string
  } | null
}

interface Customer {
  id: string
  firstName: string
  lastName: string
  email: string | null
  phone: string
}

interface InvoicesClientProps {
  initialInvoices: Invoice[]
  initialStatusCounts: Record<string, number>
  customers: Customer[]
}

export default function InvoicesClient({
  initialInvoices,
  initialStatusCounts,
  customers,
}: InvoicesClientProps) {
  const [invoices, setInvoices] = useState(initialInvoices)
  const [statusCounts, setStatusCounts] = useState(initialStatusCounts)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const totalPaid = invoices
    .filter(i => i.status === 'PAID')
    .reduce((s, i) => s + i.total, 0)
  const totalOutstanding = invoices
    .filter(i => ['SENT', 'OVERDUE', 'PARTIAL'].includes(i.status))
    .reduce((s, i) => s + i.balance, 0)
  const totalInvoiced = invoices.reduce((s, i) => s + i.total, 0)

  const handleCreateInvoice = async (data: InvoiceFormData) => {
    const res = await fetch('/api/invoices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (!res.ok) {
      throw new Error('Failed to create invoice')
    }

    const newInvoice = await res.json()
    setInvoices([newInvoice, ...invoices])
    setStatusCounts(prev => ({
      ...prev,
      [newInvoice.status]: (prev[newInvoice.status] ?? 0) + 1,
    }))
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
          <p className="text-sm text-gray-500 mt-1">{invoices.length} total</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700"
        >
          + New Invoice
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="kpi-card">
          <p className="kpi-label">Collected</p>
          <p className="kpi-value text-green-600">{formatCurrency(totalPaid)}</p>
        </div>
        <div className="kpi-card">
          <p className="kpi-label">Outstanding</p>
          <p className="kpi-value text-orange-500">{formatCurrency(totalOutstanding)}</p>
        </div>
        <div className="kpi-card">
          <p className="kpi-label">Total Invoiced</p>
          <p className="kpi-value">{formatCurrency(totalInvoiced)}</p>
        </div>
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {Object.entries(INVOICE_STATUS_LABELS).map(([status, label]) => (
          <div key={status} className={`badge ${INVOICE_STATUS_COLORS[status]} cursor-pointer hover:opacity-80`}>
            {label} {statusCounts[status] ? `(${statusCounts[status]})` : ''}
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="data-table">
          <thead>
            <tr>
              <th>Invoice #</th>
              <th>Customer</th>
              <th>Job</th>
              <th>Issue Date</th>
              <th>Due Date</th>
              <th>Total</th>
              <th>Balance</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map(inv => (
              <tr key={inv.id}>
                <td>
                  <Link href={`/invoices/${inv.id}`} className="text-blue-600 font-semibold hover:underline">
                    {inv.invoiceNumber}
                  </Link>
                </td>
                <td className="text-gray-700">
                  {inv.customer.firstName} {inv.customer.lastName}
                </td>
                <td className="text-gray-500 text-xs">{inv.job?.jobNumber ?? '—'}</td>
                <td className="text-gray-500 text-xs">{formatDate(inv.issueDate)}</td>
                <td className="text-gray-500 text-xs">{formatDate(inv.dueDate)}</td>
                <td className="font-semibold text-gray-800">{formatCurrency(inv.total)}</td>
                <td className={`font-semibold ${inv.balance > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                  {formatCurrency(inv.balance)}
                </td>
                <td>
                  <span className={`badge ${INVOICE_STATUS_COLORS[inv.status]}`}>
                    {INVOICE_STATUS_LABELS[inv.status]}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <InvoiceFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateInvoice}
        customers={customers}
      />
    </div>
  )
}
