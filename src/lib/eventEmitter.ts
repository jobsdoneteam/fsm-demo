type BookingEventListener = (event: { type: string; data: unknown }) => void

const globalForEmitter = globalThis as unknown as {
  bookingListeners: Set<BookingEventListener> | undefined
}

function getListeners(): Set<BookingEventListener> {
  if (!globalForEmitter.bookingListeners) {
    globalForEmitter.bookingListeners = new Set<BookingEventListener>()
  }
  return globalForEmitter.bookingListeners
}

export function subscribeToBookings(callback: BookingEventListener) {
  const listeners = getListeners()
  listeners.add(callback)
  
  return () => {
    const currentListeners = getListeners()
    currentListeners.delete(callback)
  }
}

export function broadcastBookingEvent(event: { type: string; data: unknown }) {
  const listeners = getListeners()
  listeners.forEach(callback => {
    try {
      callback(event)
    } catch (error) {
      console.error('[EventEmitter] Failed to send event:', error)
    }
  })
}
