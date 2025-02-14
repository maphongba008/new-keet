import { useEffect, useRef } from 'react'

// https://usehooks.com/usePrevious Hook
export const usePrevious = <T>(value: T): T | undefined => {
  const ref = useRef<T>()
  useEffect(() => {
    ref.current = value
  })
  return ref.current
}
