import { handlers } from '@/lib/auth'

const originalGET = handlers.GET
const originalPOST = handlers.POST

export async function GET(req: Request) {
  console.log('[AUTH DEBUG] GET url:', req.url)
  console.log('[AUTH DEBUG] GET headers:', JSON.stringify({
    host: req.headers.get('host'),
    'x-forwarded-host': req.headers.get('x-forwarded-host'),
    'x-forwarded-proto': req.headers.get('x-forwarded-proto'),
    'x-forwarded-for': req.headers.get('x-forwarded-for'),
  }))
  return originalGET(req)
}

export async function POST(req: Request) {
  console.log('[AUTH DEBUG] POST url:', req.url)
  console.log('[AUTH DEBUG] POST headers:', JSON.stringify({
    host: req.headers.get('host'),
    'x-forwarded-host': req.headers.get('x-forwarded-host'),
    'x-forwarded-proto': req.headers.get('x-forwarded-proto'),
    'x-forwarded-for': req.headers.get('x-forwarded-for'),
  }))
  return originalPOST(req)
}
