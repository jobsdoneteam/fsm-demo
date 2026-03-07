import { handlers } from '@/lib/auth'
import { NextRequest } from 'next/server'

const originalGET = handlers.GET
const originalPOST = handlers.POST

export async function GET(req: NextRequest) {
  console.log('[AUTH DEBUG] GET url:', req.url)
  console.log('[AUTH DEBUG] GET nextUrl.pathname:', req.nextUrl.pathname)
  console.log('[AUTH DEBUG] GET nextUrl.basePath:', req.nextUrl.basePath)
  console.log('[AUTH DEBUG] GET headers:', JSON.stringify({
    host: req.headers.get('host'),
    'x-forwarded-host': req.headers.get('x-forwarded-host'),
    'x-forwarded-proto': req.headers.get('x-forwarded-proto'),
  }))
  return originalGET(req)
}

export async function POST(req: NextRequest) {
  console.log('[AUTH DEBUG] POST url:', req.url)
  console.log('[AUTH DEBUG] POST nextUrl.pathname:', req.nextUrl.pathname)
  console.log('[AUTH DEBUG] POST nextUrl.basePath:', req.nextUrl.basePath)
  console.log('[AUTH DEBUG] POST headers:', JSON.stringify({
    host: req.headers.get('host'),
    'x-forwarded-host': req.headers.get('x-forwarded-host'),
    'x-forwarded-proto': req.headers.get('x-forwarded-proto'),
  }))
  return originalPOST(req)
}
