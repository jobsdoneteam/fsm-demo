'use client'

import { useState } from 'react'
import Link from 'next/link'
import { formatDate, JOB_STATUS_COLORS, JOB_STATUS_LABELS, PRIORITY_COLORS } from '@/lib/utils'
import JobFormModal, { JobFormData } from './JobFormModal'

interface Job {
  id: string
  jobNumber: string
  title: string
  status: string
  priority: string
  scheduledStart: string | null
  customer: {
    firstName: string
    lastName: string
  }
  assignedTo: {
    name: string | null
  } | null
  serviceType: {
    name: string | null
  } | null
}

interface JobsClientProps {
  initialJobs: Job[]
  initialStatusCounts: Record<string, number>
  customers: { id: string; firstName: string; lastName: string; email?: string | null; phone?: string }[]
  serviceTypes: { id: string; name: string }[]
  technicians: { id: string; name: string }[]
}

export default function JobsClient({
  initialJobs,
  initialStatusCounts,
  customers: initialCustomers,
  serviceTypes,
  technicians,
}: JobsClientProps) {
  const [jobs, setJobs] = useState(initialJobs)
  const [statusCounts, setStatusCounts] = useState(initialStatusCounts)
  const [isJobModalOpen, setIsJobModalOpen] = useState(false)
  const [customers, setCustomers] = useState(initialCustomers)

  const refreshCustomers = async () => {
    try {
      const res = await fetch('/api/customers')
      if (res.ok) {
        const data = await res.json()
        setCustomers(data)
      }
    } catch (error) {
      console.error('[JobsClient] Failed to refresh customers:', error)
    }
  }

  const handleCustomerCreated = async () => {
    await refreshCustomers()
  }

  const handleCreateJob = async (data: JobFormData) => {
    const res = await fetch('/api/jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (!res.ok) {
      throw new Error('Failed to create job')
    }

    const newJob = await res.json()
    setJobs([newJob, ...jobs])
    setStatusCounts(prev => ({
      ...prev,
      [newJob.status]: (prev[newJob.status] ?? 0) + 1,
    }))
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Jobs</h1>
          <p className="text-sm text-gray-500 mt-1">{jobs.length} total jobs</p>
        </div>
        <button
          onClick={() => setIsJobModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700"
        >
          + New Job
        </button>
      </div>

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

      <JobFormModal
        isOpen={isJobModalOpen}
        onClose={() => setIsJobModalOpen(false)}
        onSubmit={handleCreateJob}
        customers={customers}
        serviceTypes={serviceTypes}
        technicians={technicians}
        onCustomerCreated={handleCustomerCreated}
      />
    </div>
  )
}
