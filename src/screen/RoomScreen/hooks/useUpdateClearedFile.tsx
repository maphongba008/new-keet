import { useCallback } from 'react'
import { useDispatch } from 'react-redux'

import { updateFileEntryCleared } from '@holepunchto/keet-store/store/media/file'

export function useUpdateClearedFile(): (
  fileId: string,
  cleared: boolean,
) => void {
  const dispatch = useDispatch()
  const toggleClearFile = useCallback(
    (fileId: string, cleared: boolean) => {
      dispatch(
        updateFileEntryCleared({
          fileId,
          cleared,
        }),
      )
    },
    [dispatch],
  )

  return toggleClearFile
}
