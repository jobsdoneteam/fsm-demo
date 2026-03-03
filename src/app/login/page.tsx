'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'

const DEMO_USERS = [
  { label: 'Owner / Admin', email: 'owner@fieldflowdemo.com', password: 'demo1234', color: 'bg-blue-600', desc: 'Full access — reports, settings, all modules' },
  { label: 'Dispatcher', email: 'dispatch@fieldflowdemo.com', password: 'demo1234', color: 'bg-green-600', desc: 'Dispatch board, job assignment, scheduling' },
  { label: 'Field Tech', email: 'tech1@fieldflowdemo.com', password: 'demo1234', color: 'bg-orange-500', desc: 'My jobs, time cards, job details' },
]

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
          {['Full job lifecycle — new to invoiced', 'Dispatch board with tech assignment', 'Invoicing & payment tracking', 'Inventory with low-stock alerts', 'Time cards & weekly payroll summary', 'Revenue & utilization reports'].map(f => (
            <div key={f} className="flex items-center gap-2 text-sm text-blue-100">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20,6 9,17 4,12"/></svg>
              {f}
            </div>
          ))}
        </div>
      </div>

      {/* Right — login */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-16">
        <div className="max-w-md w-full mx-auto">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 32 32" fill="none"><path d="M8 10h10M8 16h16M8 22h12" stroke="white" strokeWidth="2.5" strokeLinecap="round"/></svg>
            </div>
            <span className="text-lg font-bold text-gray-900">FieldFlow</span>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">Sign in to your account</h2>
          <p className="text-gray-500 text-sm mb-8">This is a live demo — use one-click login below or enter credentials manually.</p>

          {/* One-click demo logins */}
          <div className="mb-8">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">One-click demo access</p>
            <div className="space-y-2">
              {DEMO_USERS.map(u => (
                <button
                  key={u.email}
                  onClick={() => handleLogin(undefined, u)}
                  disabled={loading}
                  className="w-full flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-left group"
                >
                  <div className={`w-9 h-9 ${u.color} rounded-lg flex items-center justify-center text-white text-sm font-bold flex-shrink-0`}>
                    {u.label.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 group-hover:text-blue-700">{u.label}</p>
                    <p className="text-xs text-gray-500">{u.desc}</p>
                  </div>
                  <svg className="ml-auto text-gray-300 group-hover:text-blue-500" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9,18 15,12 9,6"/></svg>
                </button>
              ))}
            </div>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
            <div className="relative flex justify-center text-xs text-gray-400 bg-gray-50 px-3">or sign in manually</div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2 rounded-lg">{error}</div>}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password" value={password} onChange={e => setPassword(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit" disabled={loading}
              className="w-full bg-blue-600 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-xs text-gray-400 text-center mt-6">
            Demo credentials: any @fieldflowdemo.com / demo1234
          </p>
        </div>
      </div>
    </div>
  )
}
