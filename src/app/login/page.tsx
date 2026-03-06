'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'

const DEMO_CREDENTIALS = {
  email: 'owner@fieldflowdemo.com',
  password: 'demo1234',
}

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin(e?: React.FormEvent, prefill?: { email: string; password: string }) {
    e?.preventDefault()
    setLoading(true)
    setError('')
    const creds = prefill ?? { email, password }
    const res = await signIn('credentials', { ...creds, redirect: false })
    if (res?.ok) {
      router.push('/dashboard')
    } else {
      setError('Invalid email or password')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left — branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-blue-700 flex-col justify-between p-12 text-white">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 32 32" fill="none"><path d="M8 10h10M8 16h16M8 22h12" stroke="white" strokeWidth="2.5" strokeLinecap="round"/><circle cx="23" cy="10" r="3" fill="white" fillOpacity="0.6"/></svg>
          </div>
          <span className="text-xl font-bold">FieldFlow</span>
        </div>
        <div>
          <h1 className="text-4xl font-bold leading-tight mb-4">The operating system for service businesses.</h1>
          <p className="text-blue-200 text-lg">Jobs. Dispatch. Invoicing. Inventory. Time Cards. All in one place.</p>
        </div>
        <div className="space-y-4">
          <p className="text-sm text-blue-300 font-semibold uppercase tracking-wider">What you can explore</p>
          {[
            'Full job lifecycle — new to invoiced',
            'Dispatch board with tech assignment',
            'Invoicing & payment tracking',
            'Inventory with low-stock alerts',
            'Time cards & weekly payroll summary',
            'Revenue & utilization reports',
            'Customer booking portal — embed on any website',
          ].map(f => (
            <div key={f} className="flex items-center gap-2 text-sm text-blue-100">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20,6 9,17 4,12"/></svg>
              {f}
            </div>
          ))}
        </div>
      </div>

      {/* Right — login form */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-16">
        <div className="mx-auto w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 32 32" fill="none"><path d="M8 10h10M8 16h16M8 22h12" stroke="white" strokeWidth="2.5" strokeLinecap="round"/></svg>
            </div>
            <span className="text-lg font-bold text-gray-900">FieldFlow</span>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-1">Explore the Demo</h2>
          <p className="text-gray-500 text-sm mb-6">Choose your perspective</p>

          {/* Demo info box */}
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-sm font-semibold text-blue-900 mb-1">Demo Company: Apex Plumbing</p>
                <p className="text-xs text-blue-700">
                  Business login: <code className="bg-blue-100 px-1.5 py-0.5 rounded font-mono text-blue-900">{DEMO_CREDENTIALS.email}</code>
                </p>
                <p className="text-xs text-blue-700 mt-1">
                  Password: <code className="bg-blue-100 px-1.5 py-0.5 rounded font-mono text-blue-900">{DEMO_CREDENTIALS.password}</code>
                </p>
              </div>
            </div>
          </div>

          {/* Role selection cards */}
          <div className="space-y-3 mb-6">
            {/* Business login */}
            <button
              onClick={() => handleLogin(undefined, DEMO_CREDENTIALS)}
              disabled={loading}
              className="w-full flex items-center gap-4 p-4 rounded-lg border-2 border-blue-600 bg-blue-600 hover:bg-blue-700 transition-all text-left disabled:opacity-50 group"
            >
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-blue-600 text-lg font-bold shrink-0">
                B
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-base font-bold text-white">Business Owner</p>
                <p className="text-sm text-blue-100">Dashboard, jobs, customers, invoicing, inventory & more</p>
              </div>
              <svg className="shrink-0 text-white group-hover:translate-x-1 transition-transform" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
            </button>

            {/* Customer portal */}
            <button
              onClick={() => router.push('/customer-portal')}
              disabled={loading}
              className="w-full flex items-center gap-4 p-4 rounded-lg border-2 border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 transition-all text-left disabled:opacity-50 group"
            >
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 text-lg font-bold shrink-0">
                C
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-base font-bold text-gray-900">Customer Portal</p>
                <p className="text-sm text-gray-500">See how customers book services online</p>
              </div>
              <svg className="shrink-0 text-gray-400 group-hover:translate-x-1 transition-transform" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
            </button>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
            <div className="relative flex justify-center text-xs text-gray-400 bg-gray-50 px-2">or sign in manually</div>
          </div>

          {/* Manual login form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-gray-400">
            Demo environment — all data is synthetic and resets periodically.
          </p>
        </div>
      </div>
    </div>
  )
}