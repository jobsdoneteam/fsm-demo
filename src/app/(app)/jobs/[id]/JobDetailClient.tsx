'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { formatDateTime, formatTime, JOB_STATUS_LABELS, JOB_STATUS_COLORS, PRIORITY_COLORS } from '@/lib/utils'
import InvoiceFormModal, { InvoiceFormData } from '@/components/InvoiceFormModal'

interface Job {
  id: string
  jobNumber: string
  title: string
  description: string | null
  status: string
  priority: string
  scheduledStart: string | null
  scheduledEnd: string | null
  startedAt: string | null
  completedAt: string | null
  address: string | null
  city: string | null
  state: string | null
  zip: string | null
  internalNotes: string | null
  techNotes: string | null
  tags: string[]
  customer: {
    id: string
    firstName: string
    lastName: string
    email: string | null
    phone: string
    address: string | null
    city: string | null
    state: string | null
    zip: string | null
  }
  assignedTo: { id: string; name: string } | null
  serviceType: { id: string; name: string } | null
  createdBy: { name: string } | null
  createdAt: string
  lineItems: Array<{
    id: string
    description: string
    quantity: number
    unitPrice: number
    taxable: boolean
  }>
  timeEntries: Array<{
    id: string
    clockIn: string
    clockOut: string | null
    breakMins: number
    hours: number | null
    notes: string | null
    status: string
    user: { name: string } | null
  }>
  invoices: Array<{
    id: string
    invoiceNumber: string
    status: string
    total: number
    balance: number
    issueDate: string
  }>
}

interface Employee {
  id: string
  name: string
  role: string
}

interface ServiceType {
  id: string
  name: string
}

interface JobDetailClientProps {
  initialJob: Job
  employees: Employee[]
  serviceTypes: ServiceType[]
}

const STATUS_FLOW = ['NEW', 'SCHEDULED', 'DISPATCHED', 'IN_PROGRESS', 'COMPLETED', 'INVOICED'] as const

export default function JobDetailClient({ initialJob, employees, serviceTypes }: JobDetailClientProps) {
  const router = useRouter()
  const [job, setJob] = useState(initialJob)
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'details' | 'notes' | 'time'>('details')
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false)
  const [invoiceInitialData, setInvoiceInitialData] = useState<any>(null)

  const totalHours = job.timeEntries.reduce((sum, te) => sum + (te.hours || 0), 0)
  const totalLabor = totalHours * 85

  async function handleUpdate(updates: any) {
    setIsSaving(true)
    try {
      const res = await fetch(`/api/jobs/${job.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })
      if (res.ok) {
        if (updates.status !== undefined) {
          setJob(prev => ({ ...prev, status: updates.status }))
        }
        if (updates.priority !== undefined) {
          setJob(prev => ({ ...prev, priority: updates.priority }))
        }
        if (updates.assignedToId !== undefined) {
          const emp = employees.find(e => e.id === updates.assignedToId)
          setJob(prev => ({ ...prev, assignedTo: emp ? { id: emp.id, name: emp.name } : null }))
        }
        if (updates.serviceTypeId !== undefined) {
          const st = serviceTypes.find(s => s.id === updates.serviceTypeId)
          setJob(prev => ({ ...prev, serviceType: st ? { id: st.id, name: st.name } : null }))
        }
        if (updates.title !== undefined) setJob(prev => ({ ...prev, title: updates.title }))
        if (updates.description !== undefined) setJob(prev => ({ ...prev, description: updates.description }))
        if (updates.address !== undefined) setJob(prev => ({ ...prev, address: updates.address }))
        if (updates.city !== undefined) setJob(prev => ({ ...prev, city: updates.city }))
        if (updates.state !== undefined) setJob(prev => ({ ...prev, state: updates.state }))
        if (updates.zip !== undefined) setJob(prev => ({ ...prev, zip: updates.zip }))
        if (updates.scheduledStart !== undefined) setJob(prev => ({ ...prev, scheduledStart: updates.scheduledStart }))
        if (updates.scheduledEnd !== undefined) setJob(prev => ({ ...prev, scheduledEnd: updates.scheduledEnd }))
        if (updates.internalNotes !== undefined) setJob(prev => ({ ...prev, internalNotes: updates.internalNotes }))
        if (updates.techNotes !== undefined) setJob(prev => ({ ...prev, techNotes: updates.techNotes }))
      }
    } catch (error) {
      console.error('Failed to update job:', error)
    } finally {
      setIsSaving(false)
    }
  }

  async function handleStatusChange(status: string) {
    await handleUpdate({ status })
  }

  function getNextStatus() {
    const currentIndex = STATUS_FLOW.indexOf(job.status as any)
    return currentIndex < STATUS_FLOW.length - 1 ? STATUS_FLOW[currentIndex + 1] : null
  }

  function getPrevStatus() {
    const currentIndex = STATUS_FLOW.indexOf(job.status as any)
    return currentIndex > 0 ? STATUS_FLOW[currentIndex - 1] : null
  }

  const handleCreateInvoice = async () => {
    try {
      const res = await fetch('/api/invoices/from-job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId: job.id }),
      })
      
      if (res.ok) {
        const data = await res.json()
        setInvoiceInitialData(data)
        setIsInvoiceModalOpen(true)
      }
    } catch (error) {
      console.error('Failed to prepare invoice:', error)
      alert('Failed to create invoice')
    }
  }

  const handleInvoiceSubmit = async (data: InvoiceFormData) => {
    const res = await fetch('/api/invoices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    
    if (!res.ok) {
      throw new Error('Failed to create invoice')
    }
    
    const newInvoice = await res.json()
    setJob(prev => ({
      ...prev,
      invoices: [...prev.invoices, {
        id: newInvoice.id,
        invoiceNumber: newInvoice.invoiceNumber,
        status: newInvoice.status,
        total: newInvoice.total,
        balance: newInvoice.balance,
        issueDate: newInvoice.issueDate,
      }],
    }))
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Link href="/jobs" className="text-sm text-blue-600 hover:underline">← Back to Jobs</Link>
            <h1 className="text-2xl font-bold text-gray-900">{job.jobNumber}</h1>
          </div>
          <p className="text-sm text-gray-500">
            Created {formatDateTime(job.createdAt)} · by {job.createdBy?.name || 'Unknown'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`badge ${JOB_STATUS_COLORS[job.status]}`}>
            {JOB_STATUS_LABELS[job.status]}
          </span>
          <span className={`badge ${PRIORITY_COLORS[job.priority]}`}>
            {job.priority}
          </span>
        </div>
      </div>

      {/* Quick actions */}
      <div className="flex gap-2 mb-6">
        {getPrevStatus() && (
          <button
            onClick={() => handleStatusChange(getPrevStatus()!)}
            disabled={isSaving}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            ← {JOB_STATUS_LABELS[getPrevStatus()!]}
          </button>
        )}
        {getNextStatus() && (
          <button
            onClick={() => handleStatusChange(getNextStatus()!)}
            disabled={isSaving}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {JOB_STATUS_LABELS[getNextStatus()!]} →
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="flex gap-6">
              <button
                onClick={() => setActiveTab('details')}
                className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'details' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Details
              </button>
              <button
                onClick={() => setActiveTab('notes')}
                className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'notes' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Notes
              </button>
              <button
                onClick={() => setActiveTab('time')}
                className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'time' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Time Entries ({job.timeEntries.length})
              </button>
            </nav>
          </div>

          {activeTab === 'details' && (
            <>
              {/* Job info */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Job Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <input
                      type="text"
                      value={job.title}
                      onChange={e => setJob(prev => ({ ...prev, title: e.target.value }))}
                      onBlur={() => handleUpdate({ title: job.title })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Service Type</label>
                    <select
                      value={job.serviceType?.id || ''}
                      onChange={e => {
                        const st = serviceTypes.find(s => s.id === e.target.value)
                        handleUpdate({ serviceTypeId: st?.id || null })
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      <option value="">Select service type...</option>
                      {serviceTypes.map(st => (
                        <option key={st.id} value={st.id}>{st.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={job.status}
                      onChange={e => handleStatusChange(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      {Object.entries(JOB_STATUS_LABELS).map(([status, label]) => (
                        <option key={status} value={status}>{label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                    <select
                      value={job.priority}
                      onChange={e => handleUpdate({ priority: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      <option value="LOW">Low</option>
                      <option value="NORMAL">Normal</option>
                      <option value="HIGH">High</option>
                      <option value="URGENT">Urgent</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Scheduled Start</label>
                    <input
                      type="datetime-local"
                      value={job.scheduledStart ? job.scheduledStart.slice(0, 16) : ''}
                      onChange={e => handleUpdate({ scheduledStart: e.target.value || null })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Scheduled End</label>
                    <input
                      type="datetime-local"
                      value={job.scheduledEnd ? job.scheduledEnd.slice(0, 16) : ''}
                      onChange={e => handleUpdate({ scheduledEnd: e.target.value || null })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={job.description || ''}
                      onChange={e => setJob(prev => ({ ...prev, description: e.target.value }))}
                      onBlur={() => handleUpdate({ description: job.description })}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      placeholder="Describe the work to be done..."
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Service Address</label>
                    <input
                      type="text"
                      value={job.address || ''}
                      onChange={e => setJob(prev => ({ ...prev, address: e.target.value }))}
                      onBlur={() => handleUpdate({ address: job.address })}
                      placeholder="Street address"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      <input
                        type="text"
                        value={job.city || ''}
                        onChange={e => setJob(prev => ({ ...prev, city: e.target.value }))}
                        onBlur={() => handleUpdate({ city: job.city })}
                        placeholder="City"
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="text"
                        value={job.state || ''}
                        onChange={e => setJob(prev => ({ ...prev, state: e.target.value }))}
                        onBlur={() => handleUpdate({ state: job.state })}
                        placeholder="State"
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="text"
                        value={job.zip || ''}
                        onChange={e => setJob(prev => ({ ...prev, zip: e.target.value }))}
                        onBlur={() => handleUpdate({ zip: job.zip })}
                        placeholder="ZIP"
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Line items */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Line Items</h2>
                  <button className="text-sm text-blue-600 font-medium hover:underline">+ Add Item</button>
                </div>
                <div className="space-y-2">
                  {job.lineItems.length === 0 && (
                    <p className="text-sm text-gray-400 text-center py-4">No line items added yet</p>
                  )}
                  {job.lineItems.map(li => (
                    <div key={li.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-gray-800">{li.description}</p>
                        <p className="text-xs text-gray-500">{li.quantity} × ${li.unitPrice.toFixed(2)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-900">${(li.quantity * li.unitPrice).toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {activeTab === 'notes' && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Internal Notes</h2>
                <textarea
                  value={job.internalNotes || ''}
                  onChange={e => setJob(prev => ({ ...prev, internalNotes: e.target.value }))}
                  onBlur={() => handleUpdate({ internalNotes: job.internalNotes })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Internal notes visible to office staff only..."
                />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Tech Notes</h2>
                <textarea
                  value={job.techNotes || ''}
                  onChange={e => setJob(prev => ({ ...prev, techNotes: e.target.value }))}
                  onBlur={() => handleUpdate({ techNotes: job.techNotes })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Tech notes for on-site reference..."
                />
              </div>
            </div>
          )}

          {activeTab === 'time' && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Time Entries</h2>
                <div className="text-sm text-gray-500">
                  Total: <span className="font-semibold text-gray-900">{totalHours.toFixed(1)}h</span>
                </div>
              </div>
              <div className="space-y-3">
                {job.timeEntries.length === 0 && (
                  <p className="text-sm text-gray-400 text-center py-4">No time entries recorded yet</p>
                )}
                {job.timeEntries.map(te => (
                  <div key={te.id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="text-sm font-medium text-gray-800">{te.user?.name || 'Unknown'}</p>
                        <p className="text-xs text-gray-500">{formatDateTime(te.clockIn)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-900">{te.hours?.toFixed(1) || '—'}h</p>
                        <span className={`text-xs px-2 py-0.5 rounded ${te.status === 'APPROVED' ? 'bg-green-100 text-green-700' : te.status === 'REJECTED' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {te.status}
                        </span>
                      </div>
                    </div>
                    {te.notes && <p className="text-xs text-gray-600 mt-1">{te.notes}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer card */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wider">Customer</h2>
            <div className="space-y-3">
              <div>
                <Link href={`/customers/${job.customer.id}`} className="text-blue-600 font-medium hover:underline">
                  {job.customer.firstName} {job.customer.lastName}
                </Link>
              </div>
              {job.customer.email && (
                <a href={`mailto:${job.customer.email}`} className="text-sm text-gray-600 hover:text-blue-600">
                  {job.customer.email}
                </a>
              )}
              <a href={`tel:${job.customer.phone}`} className="text-sm text-gray-600 hover:text-blue-600">
                {job.customer.phone}
              </a>
              {(job.customer.address || job.customer.city) && (
                <div className="text-sm text-gray-600">
                  {job.customer.address && <div>{job.customer.address}</div>}
                  {(job.customer.city || job.customer.state || job.customer.zip) && (
                    <div>{[job.customer.city, job.customer.state, job.customer.zip].filter(Boolean).join(', ')}</div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Assignment */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wider">Assigned To</h2>
            <select
              value={job.assignedTo?.id || ''}
              onChange={e => {
                const emp = employees.find(emp => emp.id === e.target.value)
                handleUpdate({ assignedToId: emp?.id || null })
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">Unassigned</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.name}</option>
              ))}
            </select>
          </div>

          {/* Quick stats */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wider">Job Summary</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Hours</span>
                <span className="font-semibold text-gray-900">{totalHours.toFixed(1)}h</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Est. Labor</span>
                <span className="font-semibold text-gray-900">${totalLabor.toFixed(2)}</span>
              </div>
              <button
                onClick={handleCreateInvoice}
                className="w-full mt-3 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700"
              >
                + Create Invoice
              </button>
              {job.invoices.length > 0 && (
                <>
                  <div className="border-t border-gray-100 pt-3">
                    <p className="text-xs text-gray-400 mb-2">Invoices</p>
                    {job.invoices.map(inv => (
                      <Link key={inv.id} href={`/invoices/${inv.id}`} className="flex justify-between py-1 hover:text-blue-600">
                        <span className="text-gray-700">{inv.invoiceNumber}</span>
                        <span className={`text-xs ${inv.status === 'PAID' ? 'text-green-600' : 'text-orange-600'}`}>
                          ${inv.total.toFixed(2)}
                        </span>
                      </Link>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <InvoiceFormModal
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
        onSubmit={handleInvoiceSubmit}
        customers={[{
          id: job.customer.id,
          firstName: job.customer.firstName,
          lastName: job.customer.lastName,
          email: job.customer.email,
          phone: job.customer.phone,
        }]}
        initialData={invoiceInitialData}
      />
    </div>
  )
}
