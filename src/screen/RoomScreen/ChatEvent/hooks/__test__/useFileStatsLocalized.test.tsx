import { renderHookWithProviders } from 'lib/testUtils'

import { preloadedStateWithFileStats } from '../../helpers/__test__/preloadedState'
import { useFileStatsLocalized } from '../useFileStatsLocalized'

describe('useFileStatsLocalized', () => {
  it('should return the correct localized file stats for file1', () => {
    const { result } = renderHookWithProviders(
      () => useFileStatsLocalized('file1'),
      {
        preloadedState: preloadedStateWithFileStats,
      },
    )
    expect(result.current).toEqual({
      downloadSpeed: '100 B/s',
      fileSize: '1.02 kB',
      isAccessible: true,
      isDownloading: true,
      isUploading: true,
      peersCount: 1,
      uploadSpeed: '50 B/s',
    })
  })

  it('should return the correct localized file stats for file2', () => {
    const { result } = renderHookWithProviders(
      () => useFileStatsLocalized('file2'),
      {
        preloadedState: preloadedStateWithFileStats,
      },
    )
    expect(result.current).toEqual({
      downloadSpeed: '200 B/s',
      fileSize: '2.05 kB',
      isAccessible: true,
      isDownloading: true,
      isUploading: true,
      peersCount: 5,
      uploadSpeed: '100 B/s',
    })
  })

  it('should return undefined for a non-existent fileId', () => {
    const { result } = renderHookWithProviders(
      () => useFileStatsLocalized('file3'),
      {
        preloadedState: preloadedStateWithFileStats,
      },
    )
    expect(result.current).toEqual({
      downloadSpeed: '0 B/s',
      fileSize: '0 B',
      isAccessible: false,
      isDownloading: false,
      isUploading: false,
      peersCount: 0,
      uploadSpeed: '0 B/s',
    })
  })
})
