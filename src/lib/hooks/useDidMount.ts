import { useEffect } from 'react'

import { consoleError } from 'lib/errors'

export const useDidMount = (fn: () => void) => {
  useEffect(() => {
    try {
      fn?.()
    } catch (error) {
      consoleError(error, { lifecycle: 'didMount' })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}
