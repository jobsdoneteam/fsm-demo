'use client'

import { useEffect, useState, useCallback } from 'react'
import * as Toast from '@radix-ui/react-toast'
import { formatCurrency, formatDate, JOB_STATUS_COLORS, JOB_STATUS_LABELS } from '@/lib/utils'

interface Job {
  id: string
  jobNumber: string
  title: string
  status: string
  priority: string
  scheduledStart: Date | string | null
  createdAt: Date | string
  customer: {
    firstName: string
    lastName: string
  }
  serviceType?: {
    name: string
  } | null
  assignedTo?: {
    name: string
  } | null
}

interface BookingEvent {
  type: string
  data: {
    job: {
      id: string
      jobNumber: string
      title: string
      status: string
      priority: string
      scheduledStart: Date | string | null
      createdAt: Date | string
    }
    customer: {
      id: string
      firstName: string
      lastName: string
      email: string | null
      phone: string
    }
  }
}

interface DashboardClientProps {
  initialJobs: Job[]
  initialTotalRevenue: number
  initialOutstanding: number
  initialOpenJobs: number
  initialCompletedToday: number
  initialCustomers: number
  initialEmployees: number
  lowStock: Array<{
    id: string
    name: string
    sku: string | null
    quantityOnHand: number
    reorderPoint: number
  }>
  chartData: Array<{ day: string; revenue: number }>
  userName: string
}

export default function DashboardClient({
  initialJobs,
  initialTotalRevenue,
  initialOutstanding,
  initialOpenJobs,
  initialCompletedToday,
  initialCustomers,
  initialEmployees,
  lowStock,
  chartData,
  userName,
}: DashboardClientProps) {
  const [jobs, setJobs] = useState(initialJobs)
  const [customerCount, setCustomerCount] = useState(initialCustomers)
  const [openJobsCount, setOpenJobsCount] = useState(initialOpenJobs)
  const [isConnected, setIsConnected] = useState(false)
  const [toastOpen, setToastOpen] = useState(false)
  const [latestBooking, setLatestBooking] = useState<BookingEvent['data'] | null>(null)

  useEffect(() => {
    const eventSource = new EventSource('/api/sse/bookings')

    eventSource.onopen = () => {
      setIsConnected(true)
    }

    eventSource.onerror = (error) => {
      console.error('[Dashboard] SSE connection error:', error)
      setIsConnected(false)
    }

    eventSource.onmessage = (event) => {
      try {
        const bookingEvent: BookingEvent = JSON.parse(event.data)

        if (bookingEvent.type === 'NEW_BOOKING') {
          const { job: newJob, customer } = bookingEvent.data

          setLatestBooking(bookingEvent.data)
          setToastOpen(true)

          const formattedJob: Job = {
            id: newJob.id,
            jobNumber: newJob.jobNumber,
            title: newJob.title,
            status: newJob.status,
            priority: newJob.priority,
            scheduledStart: newJob.scheduledStart,
            createdAt: newJob.createdAt,
            customer: {
              firstName: customer.firstName,
              lastName: customer.lastName,
            },
            serviceType: null,
            assignedTo: null,
          }

          setJobs((prev) => [formattedJob, ...prev].slice(0, 10))
          setCustomerCount((prev) => prev + 1)
          setOpenJobsCount((prev) => prev + 1)
        }
      } catch (error) {
        console.error('Failed to parse SSE event:', error)
      }
    }

    return () => {
      eventSource.close()
    }
  }, [])

  return (
    <>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-500 text-sm mt-1">Welcome back, {userName}. Here's what's happening today.</p>
          </div>
          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold ${
              isConnected 
                ? 'bg-green-100 text-green-700' 
                : 'bg-red-100 text-red-700'
            }`}>
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
              {isConnected ? 'LIVE' : 'Offline'}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="kpi-card">
            <p className="kpi-label">Total Revenue</p>
            <p className="kpi-value">{formatCurrency(initialTotalRevenue)}</p>
            <p className="kpi-change up">↑ 12% vs last month</p>
          </div>
          <div className="kpi-card">
            <p className="kpi-label">Outstanding</p>
            <p className="kpi-value text-orange-600">{formatCurrency(initialOutstanding)}</p>
            <p className="kpi-change down">3 invoices unpaid</p>
          </div>
          <div className="kpi-card">
            <p className="kpi-label">Open Jobs</p>
            <p className="kpi-value">{openJobsCount}</p>
            <p className="kpi-change up">{initialCompletedToday} completed</p>
          </div>
          <div className="kpi-card">
            <p className="kpi-label">Customers</p>
            <p className="kpi-value">{customerCount}</p>
            <p className="kpi-change up">{initialEmployees} active staff</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Revenue This Week</h3>
            <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
              [Chart placeholder - RevenueChart component]
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Low Stock Alerts</h3>
            <div className="space-y-3">
              {lowStock.map(item => (
                <div key={item.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-800 truncate max-w-[160px]">{item.name}</p>
                    <p className="text-xs text-gray-400">{item.sku}</p>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${item.quantityOnHand <= item.reorderPoint ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {item.quantityOnHand} left
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-700">Recent Jobs</h3>
            <a href="/jobs" className="text-xs text-blue-600 hover:underline">View all →</a>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Job #</th>
                <th>Customer</th>
                <th>Service</th>
                <th>Assigned To</th>
                <th>Status</th>
                <th>Scheduled</th>
              </tr>
            </thead>
            <tbody>
              {jobs.slice(0, 8).map(job => (
                <tr key={job.id} className="cursor-pointer">
                  <td><a href={`/jobs/${job.id}`} className="text-blue-600 font-medium hover:underline">{job.jobNumber}</a></td>
                  <td className="text-gray-700">{job.customer.firstName} {job.customer.lastName}</td>
                  <td className="text-gray-500 text-xs">{job.serviceType?.name ?? '—'}</td>
                  <td className="text-gray-600">{job.assignedTo?.name ?? 'Unassigned'}</td>
                  <td>
                    <span className={`badge ${JOB_STATUS_COLORS[job.status as keyof typeof JOB_STATUS_COLORS]}`}>
                      {JOB_STATUS_LABELS[job.status as keyof typeof JOB_STATUS_LABELS]}
                    </span>
                  </td>
                  <td className="text-gray-500 text-xs">{formatDate(job.scheduledStart)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Toast.Root 
        open={toastOpen} 
        onOpenChange={setToastOpen}
        className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 data-[state=open]:animate-slideIn data-[state=closed]:animate-hide data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=cancel]:translate-x-0 data-[swipe=end]:animate-swipeOut"
      >
        <div className="flex gap-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.5">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
                <path d="M8 12h8M12 8v8"/>
              </svg>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <Toast.Title className="text-sm font-semibold text-gray-900 mb-1">
              New Booking Received!
            </Toast.Title>
            <Toast.Description className="text-sm text-gray-600">
              {latestBooking && (
                <>
                  <strong>{latestBooking.customer.firstName} {latestBooking.customer.lastName}</strong>
                  {' '}requested{' '}
                  <strong>{latestBooking.job.title}</strong>
                </>
              )}
            </Toast.Description>
            <p className="text-xs text-gray-400 mt-2">
              {latestBooking && new Date(latestBooking.job.createdAt).toLocaleTimeString()}
            </p>
          </div>
          <Toast.Close className="text-gray-400 hover:text-gray-600 transition p-1">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </Toast.Close>
        </div>
      </Toast.Root>
    </>
  )
}
