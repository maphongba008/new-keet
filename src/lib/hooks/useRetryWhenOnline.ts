import { useEffect, useRef } from 'react'

import { getFileStats } from '@holepunchto/keet-store/store/media/file'

import { useDeepEqualSelector } from './useDeepEqualSelector'

export const useRetryWhenOnline = (fileId: string, isMounted: boolean) => {
  const retryCallback = useRef<() => void>()
  const isAccessible = useDeepEqualSelector((state) => {
    const peers = getFileStats(state, fileId)?.peers
    if (typeof peers === 'number') {
      return peers > 0
    }

    return true
  })
  const prevAccessibility = useRef<boolean>(isAccessible)

  const retryWhenOnline = (callback: () => void) => {
    retryCallback.current = callback
  }

  useEffect(() => {
    if (isMounted) return
    if (isAccessible && !prevAccessibility.current) {
      retryCallback.current?.()
      retryCallback.current = undefined
    }
    prevAccessibility.current = isAccessible
  }, [isAccessible, prevAccessibility, isMounted])

  return retryWhenOnline
}
