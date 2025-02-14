import { renderHookWithProviders } from 'lib/testUtils'

import {
  FILE_1_STATS,
  FILE_2_STATS,
  preloadedStateWithFileStats,
  preloadedStateWithoutFileStats,
} from '../../helpers/__test__/preloadedState'
import { useFileStats } from '../useFileStats'

describe('useFileStats', () => {
  it('should return the correct file stats for file1', () => {
    const { result } = renderHookWithProviders(() => useFileStats('file1'), {
      preloadedState: preloadedStateWithFileStats,
    })

    expect(result.current).toEqual({
      downloadSpeed: FILE_1_STATS.downloadStats.speed,
      fileSize: FILE_1_STATS.blob.byteLength,
      isAccessible: true,
      isDownloading: true,
      isUploading: true,
      peersCount: FILE_1_STATS.peers,
      uploadSpeed: FILE_1_STATS.uploadStats.speed,
    })
  })

  it('should return the correct file stats for file2', () => {
    const { result } = renderHookWithProviders(() => useFileStats('file2'), {
      preloadedState: preloadedStateWithFileStats,
    })
    expect(result.current).toEqual({
      downloadSpeed: FILE_2_STATS.downloadStats.speed,
      fileSize: FILE_2_STATS.blob.byteLength,
      isAccessible: true,
      isDownloading: true,
      isUploading: true,
      peersCount: FILE_2_STATS.peers,
      uploadSpeed: FILE_2_STATS.uploadStats.speed,
    })
  })

  it('should return undefined for a non-existent fileId', () => {
    const { result } = renderHookWithProviders(() => useFileStats('file3'), {
      preloadedState: preloadedStateWithoutFileStats,
    })
    expect(result.current).toEqual({
      downloadSpeed: 0,
      fileSize: 0,
      isAccessible: false,
      isDownloading: false,
      isUploading: false,
      peersCount: 0,
      uploadSpeed: 0,
    })
  })
})
