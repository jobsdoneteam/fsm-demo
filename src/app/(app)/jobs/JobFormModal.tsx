'use client'

import { useState, useEffect, useRef } from 'react'
import CustomerAutocomplete from '@/components/CustomerAutocomplete'
import UnsavedChangesDialog from '@/components/UnsavedChangesDialog'
import CustomerFormModal, { CustomerFormData } from '../customers/CustomerFormModal'

interface JobFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: JobFormData) => Promise<void>
  customers: { id: string; firstName: string; lastName: string; email?: string | null; phone?: string }[]
  serviceTypes: { id: string; name: string }[]
  technicians: { id: string; name: string }[]
  onCustomerCreated?: (customer: any) => void
}

export interface JobFormData {
  title: string
  description?: string
  customerId: string | null
  serviceTypeId?: string
  assignedToId?: string
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT'
  scheduledStart?: string
  scheduledEnd?: string
}

export default function JobFormModal({
  isOpen,
  onClose,
  onSubmit,
  customers,
  serviceTypes,
  technicians,
  onCustomerCreated,
}: JobFormModalProps) {
  const [formData, setFormData] = useState<JobFormData>({
    title: '',
    description: '',
    customerId: '',
    serviceTypeId: '',
    assignedToId: '',
    priority: 'NORMAL',
    scheduledStart: '',
    scheduledEnd: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showCustomerModal, setShowCustomerModal] = useState(false)
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  const initialFormData = useRef<JobFormData>({
    title: '',
    description: '',
    customerId: '',
    serviceTypeId: '',
    assignedToId: '',
    priority: 'NORMAL',
    scheduledStart: '',
    scheduledEnd: '',
  })

  useEffect(() => {
    if (isOpen) {
      initialFormData.current = { ...formData }
    }
  }, [isOpen])

  useEffect(() => {
    const hasChanges = Object.keys(formData).some(key => {
      const formValue = formData[key as keyof JobFormData]
      const initialValue = initialFormData.current[key as keyof JobFormData]
      return formValue !== initialValue
    })
    setHasUnsavedChanges(hasChanges)
  }, [formData])

  const handleClose = () => {
    if (hasUnsavedChanges) {
      setShowUnsavedDialog(true)
    } else {
      onClose()
    }
  }

  const handleConfirmClose = () => {
    setShowUnsavedDialog(false)
    setHasUnsavedChanges(false)
    onClose()
    setFormData({
      title: '',
      description: '',
      customerId: '',
      serviceTypeId: '',
      assignedToId: '',
      priority: 'NORMAL',
      scheduledStart: '',
      scheduledEnd: '',
    })
  }

  const handleCustomerCreated = (customer: any) => {
    setShowCustomerModal(false)
    setFormData({ ...formData, customerId: customer.id })
    if (onCustomerCreated) {
      onCustomerCreated(customer)
    }
  }

  const handleCreateCustomer = async (data: CustomerFormData) => {
    const res = await fetch('/api/customers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (!res.ok) {
      throw new Error('Failed to create customer')
    }

    return await res.json()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.customerId) {
      setError('Customer is required')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      await onSubmit(formData)
      onClose()
      setFormData({
        title: '',
        description: '',
        customerId: '',
        serviceTypeId: '',
        assignedToId: '',
        priority: 'NORMAL',
        scheduledStart: '',
        scheduledEnd: '',
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create job')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">New Job</h2>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Kitchen sink repair"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Customer *
                </label>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <CustomerAutocomplete
                      customers={customers}
                      value={formData.customerId}
                      onChange={(value) => setFormData({ ...formData, customerId: value ?? '' })}
                      placeholder="Search or select customer..."
                      required
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowCustomerModal(true)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 whitespace-nowrap"
                  >
                    + New
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Service Type
                </label>
                <select
                  value={formData.serviceTypeId}
                  onChange={(e) => setFormData({ ...formData, serviceTypeId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select service...</option>
                  {serviceTypes.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assigned To
                </label>
                <select
                  value={formData.assignedToId}
                  onChange={(e) => setFormData({ ...formData, assignedToId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Unassigned</option>
                  {technicians.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="LOW">Low</option>
                  <option value="NORMAL">Normal</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Scheduled Start
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.scheduledStart}
                    onChange={(e) => setFormData({ ...formData, scheduledStart: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Scheduled End
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.scheduledEnd}
                    onChange={(e) => setFormData({ ...formData, scheduledEnd: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Job details..."
                />
              </div>

              {error && (
                <div className="text-red-600 text-sm">{error}</div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                >
                  {isSubmitting ? 'Creating...' : 'Create Job'}
                </button>
              </div>
            </form>
          </div>
        </div>

        <UnsavedChangesDialog
          isOpen={showUnsavedDialog}
          onConfirm={handleConfirmClose}
          onCancel={() => setShowUnsavedDialog(false)}
        />
      </div>

      <CustomerFormModal
        isOpen={showCustomerModal}
        onClose={() => setShowCustomerModal(false)}
        onSubmit={handleCreateCustomer}
        onCustomerCreated={handleCustomerCreated}
      />
    </>
  )
}
