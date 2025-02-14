import { useMemo } from 'react'

import {
  FilePointer,
  getFileId,
} from '@holepunchto/keet-store/store/media/file'

export const useFileId = (filePointer: FilePointer): string =>
  useMemo(() => getFileId(filePointer), [filePointer])
