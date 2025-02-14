import { useCallback } from 'react'
import { useSelector } from 'react-redux'

import { FileStatsParsed, selectFileStats } from '../helpers/selectFileStats'

export const useFileStats = (fileId: string): FileStatsParsed<false> => {
  const statsSelector = useCallback(
    (state: unknown) => selectFileStats(state, fileId),
    [fileId],
  )

  return useSelector(statsSelector)
}
