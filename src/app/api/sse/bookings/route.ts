import { NextRequest } from 'next/server'
import { subscribeToBookings } from '@/lib/eventEmitter'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  const encoder = new TextEncoder()
  
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode(': connected\n\n'))
      
      const unsubscribe = subscribeToBookings((event) => {
        try {
          const message = `data: ${JSON.stringify(event)}\n\n`
          controller.enqueue(encoder.encode(message))
        } catch (error) {
          console.error('[SSE] Failed to send event:', error)
        }
      })

      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(': heartbeat\n\n'))
        } catch (error) {
          clearInterval(heartbeat)
          unsubscribe()
        }
      }, 15000)

      const cleanup = () => {
        clearInterval(heartbeat)
        unsubscribe()
      }

      req.signal.addEventListener('abort', cleanup)
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  })
}
