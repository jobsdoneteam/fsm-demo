'use client'

import { SessionProvider } from 'next-auth/react'
import * as Toast from '@radix-ui/react-toast'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider basePath="/fsm-demo/api/auth">
      <Toast.Provider swipeDirection="right">
        {children}
        <Toast.Viewport className="fixed bottom-0 right-0 flex flex-col gap-2 w-96 max-w-[100vw] p-4 z-50" />
      </Toast.Provider>
    </SessionProvider>
  )
}
