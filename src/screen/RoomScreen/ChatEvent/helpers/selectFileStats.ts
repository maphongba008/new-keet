import { createSelector } from '@reduxjs/toolkit'

import {
  FileStats,
  getFileStats,
} from '@holepunchto/keet-store/store/media/file'

export interface FileStatsParsed<IsLocalized> {
  downloadSpeed: IsLocalized extends true ? string : number
  uploadSpeed: IsLocalized extends true ? string : number
  fileSize: IsLocalized extends true ? string : number
  peersCount: number
  isDownloading: boolean
  isUploading: boolean
  isAccessible: boolean
}

export const selectFileStats = createSelector(
  getFileStats,
  (stats: FileStats | undefined): FileStatsParsed<false> => {
    const downloadSpeed = stats?.downloadStats.speed || 0
    const uploadSpeed = stats?.uploadStats.speed || 0
    const fileSize = stats?.blob.byteLength || 0
    const peersCount = stats?.peers || 0

    return {
      downloadSpeed,
      uploadSpeed,
      fileSize,
      peersCount,
      isDownloading: downloadSpeed > 0,
      isUploading: uploadSpeed > 0,
      isAccessible: peersCount > 0,
    }
  },
)
