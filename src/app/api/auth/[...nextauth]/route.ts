import { handlers } from '@/lib/auth'
import { NextRequest } from 'next/server'

const NEXT_BASE_PATH = '/fsm-demo'

function rewriteRequest(req: NextRequest): NextRequest {
  // Next.js strips basePath from request.url, but Auth.js needs it
  // to match its own basePath config. We add it back.
  const url = new URL(req.url)

  // Use forwarded headers when behind reverse proxy
  const forwardedHost = req.headers.get('x-forwarded-host')
  const forwardedProto = req.headers.get('x-forwarded-proto')
  if (forwardedHost) url.host = forwardedHost
  if (forwardedProto) url.protocol = forwardedProto + ':'

  // Prepend the Next.js basePath back to the pathname
  url.pathname = NEXT_BASE_PATH + url.pathname

  return new NextRequest(url, req)
}

export async function GET(req: NextRequest) {
  return handlers.GET(rewriteRequest(req))
}

export async function POST(req: NextRequest) {
  return handlers.POST(rewriteRequest(req))
}
