import { useCallback, useState } from 'react'

export const useForceRender = (
  value?: String,
): [triggerRerender: () => void, renderKey: string] => {
  const [cacheIndex, setCacheIndex] = useState<number>(0)
  const triggerRerender = useCallback(() => {
    setCacheIndex((v) => v + 1)
  }, [])

  return [triggerRerender, `${cacheIndex}${value}`]
}
