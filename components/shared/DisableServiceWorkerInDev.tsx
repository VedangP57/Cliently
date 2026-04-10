'use client'

import { useEffect } from 'react'

export function DisableServiceWorkerInDev() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return
    if (!('serviceWorker' in navigator)) return

    void navigator.serviceWorker
      .getRegistrations()
      .then((registrations) => Promise.all(registrations.map((registration) => registration.unregister())))
      .catch(() => {
        // Ignore unregister errors in dev.
      })
  }, [])

  return null
}
