// https://github.com/holepunchto/keet-desktop/blob/main/src/components/chat/hooks.js
import { useEffect, useRef, useState } from 'react'

import {
  FileEntry,
  getFileEntryById,
} from '@holepunchto/keet-store/store/media/file'

import { useDeepEqualSelector } from './useDeepEqualSelector'

export const MEDIA_TIMEOUT = 5000

type FileEntryError = 'timeout' | 'unknown'

export interface FileEntryStatus {
  isLoading: boolean
  error?: FileEntryError
}

export function useFile(fileId: string): [FileEntry | null, FileEntryStatus] {
  const [error, setError] = useState<FileEntryError>()
  const timeoutIdRef = useRef<ReturnType<typeof setTimeout>>()
  const fileEntry = useDeepEqualSelector(
    (state) => getFileEntryById(state, fileId) || null,
  )

  useEffect(() => {
    const clearCurrentTimeout = () =>
      timeoutIdRef.current && clearTimeout(timeoutIdRef.current)
    if (fileId) {
      clearCurrentTimeout()
      return
    }

    timeoutIdRef.current = setTimeout(() => {
      if (!fileId) {
        setError('timeout')
      }
    }, MEDIA_TIMEOUT)

    return clearCurrentTimeout
  }, [fileId])

  if (fileEntry) {
    return [fileEntry, { isLoading: false }]
  }

  return [null, { isLoading: !error, error }]
}
