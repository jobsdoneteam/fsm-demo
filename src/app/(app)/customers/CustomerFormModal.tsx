'use client'

import { useState, useEffect, useRef } from 'react'
import UnsavedChangesDialog from '@/components/UnsavedChangesDialog'

interface CustomerFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: CustomerFormData) => Promise<any>
  onCustomerCreated?: (customer: any) => void
}

export interface CustomerFormData {
  firstName: string
  lastName: string
  email?: string
  phone: string
  city?: string
  state?: string
  address?: string
}

export default function CustomerFormModal({ isOpen, onClose, onSubmit, onCustomerCreated }: CustomerFormModalProps) {
  const [formData, setFormData] = useState<CustomerFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    city: '',
    state: '',
    address: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  const initialFormData = useRef<CustomerFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    city: '',
    state: '',
    address: '',
  })

  useEffect(() => {
    if (isOpen) {
      initialFormData.current = { ...formData }
    }
  }, [isOpen])

  useEffect(() => {
    const hasChanges = Object.keys(formData).some(key => {
      const formValue = formData[key as keyof CustomerFormData]
      const initialValue = initialFormData.current[key as keyof CustomerFormData]
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
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      city: '',
      state: '',
      address: '',
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const customer = await onSubmit(formData)
      setHasUnsavedChanges(false)
      if (onCustomerCreated && customer) {
        onCustomerCreated(customer)
      }
      onClose()
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        city: '',
        state: '',
        address: '',
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create customer')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">New Customer</h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone *
              </label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State
                </label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
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
                {isSubmitting ? 'Creating...' : 'Create Customer'}
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
  )
}
