'use client'

import { useState, useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import CustomerAutocomplete from '@/components/CustomerAutocomplete'
import UnsavedChangesDialog from '@/components/UnsavedChangesDialog'

export interface InvoiceLineItem {
  id?: string
  description: string
  quantity: number
  unitPrice: number
  taxable: boolean
}

export interface InvoiceFormData {
  customerId: string
  jobId?: string
  lineItems: InvoiceLineItem[]
  taxRate: number
  notes?: string
  terms?: string
  dueDate?: string
}

interface InvoiceFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: InvoiceFormData) => Promise<void>
  customers: { id: string; firstName: string; lastName: string; email?: string | null; phone?: string }[]
  initialData?: Partial<InvoiceFormData & {
    customer?: any
    job?: any
    subtotal?: number
  }>
  mode?: 'create' | 'edit'
}

const DEFAULT_LINE_ITEM: InvoiceLineItem = {
  description: '',
  quantity: 1,
  unitPrice: 0,
  taxable: true,
}

export default function InvoiceFormModal({
  isOpen,
  onClose,
  onSubmit,
  customers: initialCustomers,
  initialData,
  mode = 'create',
}: InvoiceFormModalProps) {
  const [customerId, setCustomerId] = useState<string | null>(initialData?.customerId || null)
  const [lineItems, setLineItems] = useState<InvoiceLineItem[]>(
    initialData?.lineItems?.length ? initialData.lineItems : [{ ...DEFAULT_LINE_ITEM }]
  )
  const [taxRate, setTaxRate] = useState(initialData?.taxRate || 0.08)
  const [notes, setNotes] = useState(initialData?.notes || '')
  const [terms, setTerms] = useState(initialData?.terms || '')
  const [dueDate, setDueDate] = useState(initialData?.dueDate || '')
  const [customers, setCustomers] = useState(initialCustomers)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  const initialFormState = useRef<string>('')

  useEffect(() => {
    const state = JSON.stringify({ customerId, lineItems, taxRate, notes, terms, dueDate })
    if (!initialFormState.current) {
      initialFormState.current = state
    }
    setHasChanges(state !== initialFormState.current)
  }, [customerId, lineItems, taxRate, notes, terms, dueDate])

  useEffect(() => {
    if (isOpen && initialData) {
      setCustomerId(initialData.customerId || '')
      setLineItems(initialData.lineItems?.length ? initialData.lineItems : [{ ...DEFAULT_LINE_ITEM }])
      setTaxRate(initialData.taxRate || 0.08)
      setNotes(initialData.notes || '')
      setTerms(initialData.terms || '')
      setDueDate(initialData.dueDate || '')
      
      setTimeout(() => {
        const state = JSON.stringify({
          customerId: initialData.customerId || '',
          lineItems: initialData.lineItems?.length ? initialData.lineItems : [{ ...DEFAULT_LINE_ITEM }],
          taxRate: initialData.taxRate || 0.08,
          notes: initialData.notes || '',
          terms: initialData.terms || '',
          dueDate: initialData.dueDate || '',
        })
        initialFormState.current = state
        setHasChanges(false)
      }, 0)
    } else if (!isOpen) {
      setCustomerId('')
      setLineItems([{ ...DEFAULT_LINE_ITEM }])
      setTaxRate(0.08)
      setNotes('')
      setTerms('')
      setDueDate('')
      initialFormState.current = ''
      setHasChanges(false)
    }
  }, [isOpen, initialData])

  const refreshCustomers = async () => {
    try {
      const res = await fetch('/api/customers')
      if (res.ok) {
        const data = await res.json()
        setCustomers(data)
      }
    } catch (error) {
      console.error('[InvoiceFormModal] Failed to refresh customers:', error)
    }
  }

  const handleClose = () => {
    if (hasChanges) {
      setShowUnsavedDialog(true)
    } else {
      onClose()
    }
  }

  const handleConfirmClose = () => {
    setShowUnsavedDialog(false)
    onClose()
  }

  const updateLineItem = (index: number, field: keyof InvoiceLineItem, value: any) => {
    const updated = [...lineItems]
    updated[index] = { ...updated[index], [field]: value }
    setLineItems(updated)
  }

  const addLineItem = () => {
    setLineItems([...lineItems, { ...DEFAULT_LINE_ITEM }])
  }

  const removeLineItem = (index: number) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter((_, i) => i !== index))
    }
  }

  const subtotal = lineItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
  const taxableSubtotal = lineItems
    .filter(item => item.taxable)
    .reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
  const taxAmount = taxableSubtotal * taxRate
  const total = subtotal + taxAmount

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!customerId) {
      alert('Please select a customer')
      return
    }

    setIsSubmitting(true)
    try {
      await onSubmit({
        customerId,
        jobId: initialData?.jobId,
        lineItems,
        taxRate,
        notes: notes || undefined,
        terms: terms || undefined,
        dueDate: dueDate || undefined,
      })
      initialFormState.current = JSON.stringify({ customerId, lineItems, taxRate, notes, terms, dueDate })
      setHasChanges(false)
      onClose()
    } catch (error) {
      console.error('Failed to submit invoice:', error)
      alert('Failed to save invoice')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">
              {mode === 'edit' ? 'Edit Invoice' : 'Create Invoice'}
            </h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {initialData?.job && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <span className="font-semibold">From Job:</span>{' '}
                  {initialData.job.jobNumber} - {initialData.job.title}
                </p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Customer <span className="text-red-500">*</span>
              </label>
              <CustomerAutocomplete
                customers={customers}
                value={customerId}
                onChange={(id) => setCustomerId(id || '')}
                placeholder="Search customers..."
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-700">Line Items</label>
                <button
                  type="button"
                  onClick={addLineItem}
                  className="text-sm text-blue-600 font-medium hover:underline"
                >
                  + Add Item
                </button>
              </div>

              <div className="space-y-3">
                {lineItems.map((item, index) => (
                  <div key={index} className="grid grid-cols-12 gap-3 items-start">
                    <div className="col-span-5">
                      <input
                        type="text"
                        value={item.description}
                        onChange={e => updateLineItem(index, 'description', e.target.value)}
                        placeholder="Description"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div className="col-span-2">
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={e => updateLineItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                        placeholder="Qty"
                        step="0.01"
                        min="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div className="col-span-2">
                      <input
                        type="number"
                        value={item.unitPrice}
                        onChange={e => updateLineItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                        placeholder="Price"
                        step="0.01"
                        min="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div className="col-span-2 flex items-center gap-2 pt-2">
                      <input
                        type="checkbox"
                        checked={item.taxable}
                        onChange={e => updateLineItem(index, 'taxable', e.target.checked)}
                        className="rounded border-gray-300"
                      />
                      <span className="text-xs text-gray-600">Tax</span>
                    </div>
                    <div className="col-span-1">
                      {lineItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeLineItem(index)}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tax Rate</label>
                <input
                  type="number"
                  value={taxRate}
                  onChange={e => setTaxRate(parseFloat(e.target.value) || 0)}
                  step="0.001"
                  min="0"
                  max="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {(taxRate * 100).toFixed(1)}%
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={e => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium text-gray-900">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tax ({(taxRate * 100).toFixed(1)}%)</span>
                <span className="font-medium text-gray-900">{formatCurrency(taxAmount)}</span>
              </div>
              <div className="flex justify-between text-base pt-2 border-t border-gray-300">
                <span className="font-semibold text-gray-900">Total</span>
                <span className="font-bold text-gray-900">{formatCurrency(total)}</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="Additional notes..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Terms</label>
              <textarea
                value={terms}
                onChange={e => setTerms(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="Payment terms..."
              />
            </div>

            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !customerId}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Saving...' : mode === 'edit' ? 'Update Invoice' : 'Create Invoice'}
              </button>
            </div>
          </form>
        </div>
      </div>

      <UnsavedChangesDialog
        isOpen={showUnsavedDialog}
        onCancel={() => setShowUnsavedDialog(false)}
        onConfirm={handleConfirmClose}
      />
    </>
  )
}
