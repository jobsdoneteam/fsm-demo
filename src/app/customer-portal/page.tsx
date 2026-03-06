'use client'
import { useState } from 'react'
import BookingWidget from './components/BookingWidget'

const SERVICES = [
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
        <path d="M8 12h8M12 8v8"/>
      </svg>
    ),
    title: 'Drain Cleaning',
    desc: 'Clogged drains cleared fast. We use hydro-jetting and snake tools to restore full flow — no mess, no damage.',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 14.5A7.5 7.5 0 0 1 12 22C7.03 22 3 17.97 3 13c0-3.5 2-6.5 5-8"/>
        <path d="M12 2v6M12 2l3 3M12 2l-3 3"/>
      </svg>
    ),
    title: 'Water Heater Install & Repair',
    desc: 'Tank and tankless systems. Same-day replacement available for failed units — hot water back fast.',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <ellipse cx="12" cy="5" rx="9" ry="3"/>
        <path d="M3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5"/>
        <path d="M3 12c0 1.66 4.03 3 9 3s9-1.34 9-3"/>
      </svg>
    ),
    title: 'Leak Detection',
    desc: 'Hidden leaks found without tearing up walls. Electronic detection locates source precisely before any work begins.',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22V12M12 12C12 7 7 4 3 6M12 12c0-5 5-8 9-6"/>
      </svg>
    ),
    title: 'Pipe Repair & Replacement',
    desc: 'Burst pipes, pinhole leaks, corroded lines. We handle copper, PVC, and PEX — residential and light commercial.',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v3"/>
        <rect x="9" y="11" width="14" height="10" rx="2"/>
        <path d="M16 11v-1a2 2 0 0 0-2-2h-1"/>
      </svg>
    ),
    title: 'Fixture Installation',
    desc: 'Sinks, faucets, toilets, showers, garbage disposals. Supply-and-install or bring your own fixture.',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L2 7l10 5 10-5-10-5z"/>
        <path d="M2 17l10 5 10-5M2 12l10 5 10-5"/>
      </svg>
    ),
    title: '24/7 Emergency Service',
    desc: 'Flooding, burst pipes, sewage backups — we answer every call. Trucks roll within hour, day or night.',
    isEmergency: true,
  },
]

const REVIEWS = [
  { name: 'Maria T.', stars: 5, text: 'Showed up within 45 minutes of my call at 11pm. Fixed a burst pipe under the sink and cleaned up everything. Will never call anyone else.' },
  { name: 'Dave K.', stars: 5, text: 'Replaced our water heater same day. The tech walked me through everything and price was exactly what they quoted — no surprises.' },
  { name: 'Sandra L.', stars: 5, text: 'Our drain had been slow for months. They cleared it in under an hour and explained what caused it. Very professional.' },
]

function StarRating({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill="#f59e0b" stroke="none">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      ))}
    </div>
  )
}

export default function CustomerPortalPage() {
  const [bookingOpen, setBookingOpen] = useState(false)

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Nav */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-700 rounded-md flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M12 2C8 2 5 5 5 9c0 5 7 13 7 13s7-8 7-13c0-4-3-7-7-7z"/><circle cx="12" cy="9" r="2.5" fill="white" stroke="none"/></svg>
            </div>
            <span className="text-lg font-bold text-gray-900">Apex Plumbing</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm text-gray-600">
            <a href="#services" className="hover:text-blue-700 transition">Services</a>
            <a href="#about" className="hover:text-blue-700 transition">About</a>
            <a href="#reviews" className="hover:text-blue-700 transition">Reviews</a>
            <a href="tel:+14125550198" className="font-semibold text-blue-700">(412) 555-0198</a>
          </nav>
          <button
            onClick={() => setBookingOpen(true)}
            className="bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-blue-800 transition"
          >
            Book a Service
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="relative bg-gradient-to-br from-blue-800 to-blue-600 text-white">
        <div className="absolute inset-0 z-0">
          <img
            src="/plumber.jpg"
            alt="Professional Plumber"
            className="absolute inset-0 w-full h-full object-cover opacity-35"
          />
        </div>
        <div className="relative z-10 max-w-6xl mx-auto px-6 py-20 md:py-28 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-blue-500/30 text-blue-100 text-xs font-semibold px-3 py-1 rounded-full mb-6">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse inline-block"></span>
              Available Now — Same-Day Appointments Open
            </div>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4">
              Pittsburgh&apos;s Most Trusted Plumbers
            </h1>
            <p className="text-blue-100 text-lg mb-8">
              Fast, honest, licensed. We fix it right the first time — or we come back free.
              Serving Allegheny County for over 18 years.
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setBookingOpen(true)}
                className="bg-white text-blue-800 font-bold px-6 py-3 rounded-lg hover:bg-blue-50 transition text-sm"
              >
                Book a Service
              </button>
              <a
                href="tel:+14125550198"
                className="border border-white/40 text-white font-semibold px-6 py-3 rounded-lg hover:bg-white/10 transition text-sm flex items-center gap-2"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.44 2 2 0 0 1 3.6 1.28h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.96a16 16 0 0 0 6.08 6.08l1.04-1.04a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                Emergency Line
              </a>
            </div>
          </div>
          <div className="hidden md:grid grid-cols-2 gap-4">
            {[
              { val: '18+', label: 'Years in Business' },
              { val: '4.9★', label: 'Google Rating' },
              { val: '3,200+', label: 'Jobs Completed' },
              { val: '1hr', label: 'Avg Response Time' },
            ].map(s => (
              <div key={s.label} className="bg-white/10 rounded-xl p-5 text-center">
                <div className="text-3xl font-bold">{s.val}</div>
                <div className="text-blue-200 text-sm mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Emergency bar */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 text-white text-center py-5 px-6 shadow-lg border-b-4 border-red-800">
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center animate-pulse">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
            </div>
            <div className="text-left">
              <p className="font-bold text-lg leading-tight">🚨 PLUMBING EMERGENCY?</p>
              <p className="text-red-100 text-sm">We&apos;re available 24/7 — trucks roll within 1 hour</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="tel:+14125550198"
              className="bg-white text-red-700 font-bold px-6 py-3 rounded-lg hover:bg-red-50 transition flex items-center gap-2 shadow-md"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.44 2 2 0 0 1 3.6 1.28h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.96a16 16 0 0 0 6.08 6.08l1.04-1.04a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
              Call Now
            </a>
            <button
              onClick={() => setBookingOpen(true)}
              className="bg-red-500 text-white font-bold px-6 py-3 rounded-lg hover:bg-red-400 transition shadow-md border-2 border-white/30"
            >
              Book Emergency
            </button>
          </div>
        </div>
      </div>

      {/* Services */}
      <section id="services" className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Our Services</h2>
            <p className="text-gray-500">Licensed, insured, and ready to handle any plumbing challenge.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {SERVICES.map(s => (
              <div key={s.title} className={`${s.isEmergency ? 'bg-red-50 border-red-200 ring-2 ring-red-200' : 'bg-white border-gray-100'} rounded-xl p-6 shadow-sm border hover:shadow-md transition ${s.isEmergency ? 'hover:ring-red-300' : ''}`}>
                <div className={`${s.isEmergency ? 'text-red-600' : 'text-blue-600'} mb-3`}>{s.icon}</div>
                <h3 className={`font-bold mb-2 ${s.isEmergency ? 'text-red-800' : 'text-gray-900'}`}>{s.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
                {s.isEmergency && (
                  <div className="mt-4 pt-4 border-t border-red-200">
                    <button
                      onClick={() => setBookingOpen(true)}
                      className="w-full bg-red-600 text-white font-bold py-2.5 rounded-lg hover:bg-red-700 transition text-sm flex items-center justify-center gap-2"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                        <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                      </svg>
                      Book Emergency Now
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <button
              onClick={() => setBookingOpen(true)}
              className="bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg hover:bg-blue-800 transition"
            >
              Schedule Any Service
            </button>
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Pittsburgh Trusts Apex</h2>
            <p className="text-gray-500 mb-6 leading-relaxed">
              Founded in 2006 by licensed master plumber Jim Kowalski, Apex has been the go-to plumbing company
              for homeowners and businesses across Allegheny County. We&apos;re fully licensed, bonded, and insured —
              and every tech on our crew holds at least a journeyman license.
            </p>
            <ul className="space-y-3">
              {[
                'PA Master Plumber License #MP-041987',
                'Fully bonded & insured — $2M liability coverage',
                'BBB Accredited Business — A+ rating since 2009',
                'Which? Trusted Trader verified',
                'Flat-rate pricing — no surprise charges',
                '100% satisfaction guarantee or we return free',
              ].map(item => (
                <li key={item} className="flex items-start gap-3 text-sm text-gray-700">
                  <svg className="shrink-0 mt-0.5 text-green-500" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20,6 9,17 4,12"/></svg>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 rounded-xl p-6 text-center col-span-2">
              <div className="text-4xl font-bold text-blue-700 mb-1">18 Years</div>
              <div className="text-gray-500 text-sm">Serving Pittsburgh area</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-6 text-center">
              <div className="text-3xl font-bold text-gray-900 mb-1">3,200+</div>
              <div className="text-gray-500 text-sm">Jobs completed</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-6 text-center">
              <div className="text-3xl font-bold text-gray-900 mb-1">4.9 / 5</div>
              <div className="text-gray-500 text-sm">Google Reviews</div>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section id="reviews" className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">What Customers Say</h2>
            <div className="flex items-center justify-center gap-2">
              <StarRating count={5} />
              <span className="text-gray-500 text-sm">4.9 average from 312 Google reviews</span>
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {REVIEWS.map(r => (
              <div key={r.name} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <StarRating count={r.stars} />
                <p className="text-gray-700 text-sm mt-3 leading-relaxed">&ldquo;{r.text}&rdquo;</p>
                <p className="text-xs text-gray-400 font-semibold mt-4">— {r.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA banner */}
      <section className="bg-blue-700 text-white py-16">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-3">Ready to book?</h2>
          <p className="text-blue-200 mb-8">Same-day and next-day appointments available. Takes 60 seconds to schedule.</p>
          <button
            onClick={() => setBookingOpen(true)}
            className="bg-white text-blue-800 font-bold px-8 py-3 rounded-lg hover:bg-blue-50 transition"
          >
            Book a Service Now
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
          <div>
            <p className="font-semibold text-white">Apex Plumbing Co.</p>
            <p>Pittsburgh, PA · (412) 555-0198 · apex@example.com</p>
            <p className="mt-1">PA Master Plumber License #MP-041987</p>
          </div>
          <div className="flex flex-col items-center md:items-end gap-2">
            <p>© 2024 Apex Plumbing Co. All rights reserved.</p>
            <a
              href="/login"
              className="inline-flex items-center gap-1.5 bg-gray-800 hover:bg-gray-700 transition text-gray-300 text-xs font-medium px-3 py-1.5 rounded-full border border-gray-700"
            >
              <svg width="12" height="12" viewBox="0 0 32 32" fill="none">
                <path d="M8 10h10M8 16h16M8 22h12" stroke="#60a5fa" strokeWidth="2.5" strokeLinecap="round"/>
                <circle cx="23" cy="10" r="3" fill="#60a5fa"/>
              </svg>
              Powered by FieldFlow
            </a>
          </div>
        </div>
      </footer>

      <BookingWidget open={bookingOpen} onClose={() => setBookingOpen(false)} />
    </div>
  )
}
