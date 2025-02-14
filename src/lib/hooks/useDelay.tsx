import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

/**
 * useVisibleDelay hook
 * @param {number} ms - The duration in milliseconds after which the boolean turns true.
 * @param {boolean} [trigger=true] - A flag to control whether the delay should start.
 *                                   If false, the visibility resets to `initialValue`.
 * @param {boolean} [initialValue=false] - The initial value of `isVisible`. Defaults to `false`.
 * @returns {boolean} - The visibility state. Returns true after the specified delay when the trigger is active.
 */
export function useVisibleDelay(
  ms: number,
  trigger: boolean = true,
  initialValue: boolean = false,
): boolean {
  const [isVisible, setIsVisible] = useState(initialValue)

  useEffect(() => {
    if (trigger) {
      const timer = setTimeout(() => setIsVisible(true), ms)
      return () => clearTimeout(timer)
    } else {
      setIsVisible(initialValue)
    }
  }, [ms, trigger, initialValue])

  return isVisible
}

export function useTimeout<T>(callback: (_: T) => any, delay: number = 0) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>()
  const callbackRef = useRef<Function>(callback)

  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  useEffect(() => {
    return () => clearTimeout(timeoutRef.current)
  }, [])

  const memoizedCallback = useCallback(
    (args?: T) => {
      timeoutRef.current && clearTimeout(timeoutRef.current)
      timeoutRef.current = setTimeout(() => callbackRef.current?.(args), delay)
    },
    [delay],
  )

  return useMemo(() => memoizedCallback, [memoizedCallback])
}
