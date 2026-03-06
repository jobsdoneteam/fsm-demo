'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'
import CustomerFormModal, { CustomerFormData } from './CustomerFormModal'

interface Customer {
  id: string
  firstName: string
  lastName: string
  email: string | null
  phone: string
  city: string | null
  state: string | null
  status: string
  isActive: boolean
  createdAt: Date | string
  _count: {
    jobs: number
    invoices: number
  }
}

interface BookingEvent {
  type: string
  data: {
    customer: {
      id: string
      firstName: string
      lastName: string
      email: string | null
      phone: string
    }
  }
}

interface CustomersClientProps {
  initialCustomers: Customer[]
}

export default function CustomersClient({ initialCustomers }: CustomersClientProps) {
  const [customers, setCustomers] = useState(initialCustomers)
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false)

  useEffect(() => {
    async function fetchCustomers() {
      setIsLoading(true)
      try {
        const res = await fetch('/api/customers')
        if (res.ok) {
          const data = await res.json()
          setCustomers(data)
        }
      } catch (error) {
        console.error('[Customers] Failed to fetch:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchCustomers()
  }, [])

  useEffect(() => {
    const eventSource = new EventSource('/api/sse/bookings')

    eventSource.onopen = () => {
      setIsConnected(true)
    }

    eventSource.onerror = () => {
      setIsConnected(false)
    }

    eventSource.onmessage = (event) => {
      try {
        const bookingEvent: BookingEvent = JSON.parse(event.data)

        if (bookingEvent.type === 'NEW_BOOKING') {
          const { customer: newCustomer } = bookingEvent.data

          const formattedCustomer: Customer = {
            id: newCustomer.id,
            firstName: newCustomer.firstName,
            lastName: newCustomer.lastName,
            email: newCustomer.email,
            phone: newCustomer.phone,
            city: null,
            state: null,
            status: 'INQUIRY',
            isActive: true,
            createdAt: new Date(),
            _count: {
              jobs: 1,
              invoices: 0,
            },
          }

          setCustomers((prev) => {
            const exists = prev.some(c => c.id === formattedCustomer.id)
            if (exists) return prev
            return [formattedCustomer, ...prev]
          })
        }
      } catch (error) {
        console.error('[Customers] Failed to parse SSE event:', error)
      }
    }

    return () => {
      eventSource.close()
    }
  }, [])

  const handleCreateCustomer = async (data: CustomerFormData) => {
    const res = await fetch('/api/customers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (!res.ok) {
      throw new Error('Failed to create customer')
    }

    const newCustomer = await res.json()
    setCustomers([newCustomer, ...customers])
  }

  const STATUS_COLORS: Record<string, string> = {
    INQUIRY: 'bg-yellow-100 text-yellow-700',
    ACTIVE: 'bg-green-100 text-green-700',
    INACTIVE: 'bg-gray-100 text-gray-500',
  }

  const STATUS_LABELS: Record<string, string> = {
    INQUIRY: 'Inquiry',
    ACTIVE: 'Active',
    INACTIVE: 'Inactive',
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-sm text-gray-500">
              {isLoading ? 'Loading...' : `${customers.length} total customers`}
            </p>
            {isConnected && (
              <span className="flex items-center gap-1 text-xs text-green-600">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                LIVE
              </span>
            )}
          </div>
        </div>
        <button
          onClick={() => setIsCustomerModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700"
        >
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
                  <span className={`badge ${STATUS_COLORS[c.status] || STATUS_COLORS.ACTIVE}`}>
                    {STATUS_LABELS[c.status] || 'Active'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <CustomerFormModal
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        onSubmit={handleCreateCustomer}
      />
    </div>
  )
}
