'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { cn, ROLE_LABELS } from '@/lib/utils'

const NAV = [
  { href: '/dashboard', label: 'Dashboard', icon: '▦' },
  { href: '/jobs', label: 'Jobs', icon: '⚙' },
  { href: '/customers', label: 'Customers', icon: '👥' },
  { href: '/schedule', label: 'Schedule', icon: '📅' },
  { href: '/invoices', label: 'Invoices', icon: '💳' },
  { href: '/inventory', label: 'Inventory', icon: '📦' },
  { href: '/employees', label: 'Employees', icon: '👷' },
  { href: '/timecards', label: 'Time Cards', icon: '⏱' },
  { href: '/reports', label: 'Reports', icon: '📊' },
]

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { data: session } = useSession()

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-56 bg-white border-r border-gray-200 flex flex-col flex-shrink-0">
        {/* Logo */}
        <div className="px-4 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 32 32" fill="none">
                <path d="M8 10h10M8 16h16M8 22h12" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
                <circle cx="23" cy="10" r="3" fill="white" fillOpacity="0.7"/>
              </svg>
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">FieldFlow</p>
              <p className="text-xs text-gray-400">Demo</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
          {NAV.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                pathname.startsWith(item.href)
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              )}
            >
              <span className="text-base leading-none">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        {/* User */}
        <div className="p-3 border-t border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
              {session?.user?.name?.charAt(0) ?? '?'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-gray-900 truncate">{session?.user?.name}</p>
              <p className="text-xs text-gray-400">{ROLE_LABELS[(session?.user as any)?.role] ?? 'User'}</p>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="w-full text-xs text-gray-500 hover:text-gray-800 py-1 text-left px-1"
          >
            Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
