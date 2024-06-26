import React, { PropsWithChildren, useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { SessionProvider } from '@penx/session'
import { getLocalSession, setLocalSession } from '@penx/storage'

function OnlineProvider({ children }: PropsWithChildren) {
  const { data: session, status } = useSession()

  useEffect(() => {
    setLocalSession(session as any)
  }, [session, status])

  if (status === 'loading') return null

  return (
    <SessionProvider
      value={{
        data: session as any,
        loading: false,
      }}
    >
      {children}
    </SessionProvider>
  )
}

function OfflineProvider({ children }: PropsWithChildren) {
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState<any>()

  useEffect(() => {
    getLocalSession().then((session) => {
      if (!session) {
        // TODO:
        // go to login page
        return
      }
      setSession(session)
      setLoading(false)
    })
  }, [])

  if (loading || !session) return null

  return (
    <SessionProvider
      value={{
        data: session,
        loading: false,
      }}
    >
      {children}
    </SessionProvider>
  )
}

export function AuthProvider({ children }: PropsWithChildren) {
  const isOnline = navigator.onLine

  if (isOnline) return <OnlineProvider>{children}</OnlineProvider>
  return <OfflineProvider>{children}</OfflineProvider>
}
