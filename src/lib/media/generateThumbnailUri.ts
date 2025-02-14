import * as FileSystem from 'expo-file-system'

import { FILE_PREVIEW_NAME_PREFIX } from '@holepunchto/keet-store/store/media/file'

import { getFileName } from '../fs'

export const generateThumbnailUri = (uri: string) =>
  `${FileSystem.cacheDirectory}${FILE_PREVIEW_NAME_PREFIX}-${getFileName(uri)}`
