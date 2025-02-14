import { useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import isEqual from 'react-fast-compare'

/**
 * Custom hook that caches the value of a Redux selector.
 *
 * @template T - The type of the value returned by the selector.
 * @param {function} selector - The Redux selector
 * @param {T} defaultValue - The default value to be used initially and when the selector returns undefined.
 * @returns {T} - The current value from the selector, cached and updated as the Redux state changes.
 *
 * @example
 * const count = useCachedSelector<number>(getChatMessageCount, -1);
 *
 * @note Use this hook only when Redux is causing unnecessary re-renders by returning the same value repeatedly.
 */
const useCachedSelector = <T,>(
  selector: (state: any) => T,
  defaultValue: T,
): T => {
  const cachedValue = useRef<T>(defaultValue)
  const [newValue, setNewValue] = useState<T>(cachedValue.current)

  useSelector(selector, (_, next) => {
    if (!isEqual(cachedValue.current, next)) {
      setNewValue(next)
      cachedValue.current = next
    }
    return true
  })

  return newValue
}

export default useCachedSelector
