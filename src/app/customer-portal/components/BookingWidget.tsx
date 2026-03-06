'use client'
import { useState } from 'react'

const SERVICE_TYPES = [
  'Drain Cleaning',
  'Water Heater Install',
  'Water Heater Repair',
  'Leak Detection',
  'Pipe Repair',
  'Pipe Replacement',
  'Fixture Installation',
  'Toilet Repair / Replacement',
  'Sewer Line Service',
  'Emergency Service',
  'Other',
]

type Step = 'form' | 'submitting' | 'success' | 'error'

interface FormData {
  name: string
  email: string
  phone: string
  serviceType: string
  preferredDate: string
  preferredTime: string
  description: string
}

const EMPTY_FORM: FormData = {
  name: '',
  email: '',
  phone: '',
  serviceType: '',
  preferredDate: '',
  preferredTime: '',
  description: '',
}

export default function BookingWidget({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [step, setStep] = useState<Step>('form')
  const [form, setForm] = useState<FormData>(EMPTY_FORM)
  const [errorMsg, setErrorMsg] = useState('')

  function set(field: keyof FormData, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  function reset() {
    setForm(EMPTY_FORM)
    setStep('form')
    setErrorMsg('')
  }

  function handleClose() {
    reset()
    onClose()
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name || !form.email || !form.serviceType) return
    setStep('submitting')
    try {
      const res = await fetch('/api/customer-portal/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Booking failed')
      }
      setStep('success')
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
      setStep('error')
    }
  }

  if (!open) return null

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" onClick={handleClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg pointer-events-auto max-h-[90vh] overflow-y-auto">

          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Book a Service</h2>
              <p className="text-sm text-gray-500 mt-0.5">We&apos;ll confirm within 2 hours</p>
            </div>
            <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 transition p-1 rounded-lg hover:bg-gray-100">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          </div>

          {step === 'form' && (
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name <span className="text-red-500">*</span></label>
                  <input type="text" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Jane Smith" required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email <span className="text-red-500">*</span></label>
                  <input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="jane@example.com" required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="(412) 555-0100" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Service Needed <span className="text-red-500">*</span></label>
                  <select value={form.serviceType} onChange={e => set('serviceType', e.target.value)} required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white">
                    <option value="">Select a service…</option>
                    {SERVICE_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Date</label>
                  <input type="date" value={form.preferredDate} onChange={e => set('preferredDate', e.target.value)} min={new Date().toISOString().split('T')[0]} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Time</label>
                  <select value={form.preferredTime} onChange={e => set('preferredTime', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white">
                    <option value="">Any time</option>
                    <option value="Morning (8am–12pm)">Morning (8am–12pm)</option>
                    <option value="Afternoon (12pm–5pm)">Afternoon (12pm–5pm)</option>
                    <option value="Evening (5pm–8pm)">Evening (5pm–8pm)</option>
                    <option value="ASAP / Emergency">ASAP / Emergency</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Describe the Problem</label>
                  <textarea value={form.description} onChange={e => set('description', e.target.value)} placeholder="e.g. Kitchen drain is completely blocked, water backing up into the sink…" rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none" />
                </div>
              </div>
              <button type="submit" className="w-full bg-blue-700 text-white font-semibold py-2.5 rounded-lg hover:bg-blue-800 transition text-sm">Request Booking</button>
              <p className="text-xs text-center text-gray-400">We&apos;ll confirm your appointment by email and phone within 2 hours.</p>
            </form>
          )}

          {step === 'submitting' && (
            <div className="p-12 flex flex-col items-center gap-4 text-center">
              <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
              <p className="text-gray-600 text-sm">Submitting your request…</p>
            </div>
          )}

          {step === 'success' && (
            <div className="p-8 flex flex-col items-center gap-4 text-center">
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="3"><polyline points="20,6 9,17 4,12"/></svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">Booking Received!</h3>
                <p className="text-gray-500 text-sm">Thanks, <strong>{form.name}</strong>. We&apos;ve got your request for <strong>{form.serviceType}</strong> and will confirm within 2 hours at <strong>{form.email}</strong>.</p>
              </div>
              <div className="w-full bg-gray-50 rounded-xl p-4 text-sm text-left space-y-1 text-gray-600">
                {form.preferredDate && <p><span className="font-medium">Date:</span> {form.preferredDate}</p>}
                {form.preferredTime && <p><span className="font-medium">Time:</span> {form.preferredTime}</p>}
                {form.phone && <p><span className="font-medium">Phone:</span> {form.phone}</p>}
              </div>
              <button onClick={handleClose} className="w-full bg-blue-700 text-white font-semibold py-2.5 rounded-lg hover:bg-blue-800 transition text-sm">Done</button>
              <a href="/login" className="inline-flex items-center gap-1.5 text-gray-400 hover:text-blue-600 transition text-xs mt-1">
                <svg width="12" height="12" viewBox="0 0 32 32" fill="none">
                  <path d="M8 10h10M8 16h16M8 22h12" stroke="#60a5fa" strokeWidth="2.5" strokeLinecap="round"/>
                  <circle cx="23" cy="10" r="3" fill="#60a5fa"/>
                </svg>
                Booking managed by FieldFlow — the operating system for service businesses
              </a>
            </div>
          )}

          {step === 'error' && (
            <div className="p-8 flex flex-col items-center gap-4 text-center">
              <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">Something went wrong</h3>
                <p className="text-gray-500 text-sm">{errorMsg}</p>
              </div>
              <div className="flex gap-3 w-full">
                <button onClick={() => setStep('form')} className="flex-1 bg-blue-700 text-white font-semibold py-2.5 rounded-lg hover:bg-blue-800 transition text-sm">Try Again</button>
                <button onClick={handleClose} className="flex-1 border border-gray-300 text-gray-700 font-semibold py-2.5 rounded-lg hover:bg-gray-50 transition text-sm">Close</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}