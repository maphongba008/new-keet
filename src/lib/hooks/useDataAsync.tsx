import { useCallback, useEffect, useRef, useState } from 'react'

export enum DataAsyncStatus {
  isError = 'isError',
  isLoading = 'isLoading',
  isReady = 'isReady',
  isCached = 'isCached',
}

export interface UseDataAsyncLoading {
  status: DataAsyncStatus.isLoading
}

export interface UseDataAsyncSuccess<T> {
  result: T
  status: DataAsyncStatus.isReady | DataAsyncStatus.isCached
}

export interface UseDataAsyncFail {
  error: unknown
  status: DataAsyncStatus.isError
}

const cacheData = new Map()

export const getIsDataAsyncCached = (cacheKey: string) =>
  cacheData.has(cacheKey)

export const useDataAsyncClearCache = () => {
  useEffect(() => {
    return () => cacheData.clear()
  }, [])
}

export const useDataAsync = <T extends unknown>(
  mountCallback: (
    refreshData: (updatedData: T, isForceRerender?: boolean) => void,
    cache?: T,
  ) => Promise<{ output: T; unmount?: () => void }>,
  deps: any[] = [],
  cacheKey?: string,
): UseDataAsyncSuccess<T> | UseDataAsyncLoading | UseDataAsyncFail => {
  const isMounted = useRef(false)
  const isCached = Boolean(cacheKey)
  // the result is a ref to avoid redundant re-renders when we set loading status and data
  const result = useRef<T>()
  const errorResult = useRef<unknown>()
  const [_status, setStatus] = useState(
    isCached ? DataAsyncStatus.isCached : DataAsyncStatus.isLoading,
  )
  let status = _status
  const [, setTicker] = useState(false)
  const prevCacheKey = useRef(cacheKey)

  const setResultData = useCallback(
    (data: T, isForceRerender: boolean = true) => {
      result.current = data
      if (isForceRerender) {
        setTicker((v) => !v)
      }
    },
    [],
  )

  useEffect(() => {
    let onUnmount: Function | undefined
    ;(async () => {
      try {
        const mountResult = await mountCallback(
          setResultData,
          cacheData.get(cacheKey),
        )

        onUnmount = mountResult.unmount
        setResultData(mountResult.output, false)
        setStatus(DataAsyncStatus.isReady)

        if (cacheKey) cacheData.set(cacheKey, mountResult.output)
      } catch (error) {
        if (!isMounted.current) return
        errorResult.current = error
        setStatus(DataAsyncStatus.isError)
      }
    })()

    return () => {
      onUnmount?.()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  if (prevCacheKey.current !== cacheKey) {
    prevCacheKey.current = cacheKey
    status = isCached ? DataAsyncStatus.isCached : DataAsyncStatus.isLoading
    isMounted.current = false
    result.current = undefined
    errorResult.current = undefined
    setStatus(status)
  }

  if (status === DataAsyncStatus.isCached)
    return { result: cacheData.get(cacheKey) as T, status }

  if (status === DataAsyncStatus.isError)
    return { error: errorResult.current, status }

  if (status === DataAsyncStatus.isReady)
    return { result: result.current as T, status }

  return { status }
}

export const getIsDataLoading = (status: DataAsyncStatus) =>
  status === DataAsyncStatus.isLoading
