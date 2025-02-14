import {
  preloadedStateWithFileStats,
  preloadedStateWithoutFileStats,
} from './preloadedState'
import { selectFileStats } from '../selectFileStats'

describe('selectFileStats', () => {
  it('should return the correct file stats for file1', () => {
    const result = selectFileStats(preloadedStateWithFileStats, 'file1')
    expect(result).toEqual({
      downloadSpeed: 100,
      fileSize: 1024,
      isAccessible: true,
      isDownloading: true,
      isUploading: true,
      peersCount: 1,
      uploadSpeed: 50,
    })
  })

  it('should return the correct file stats for file2', () => {
    const result = selectFileStats(preloadedStateWithFileStats, 'file2')
    expect(result).toEqual({
      downloadSpeed: 200,
      fileSize: 2048,
      isAccessible: true,
      isDownloading: true,
      isUploading: true,
      peersCount: 5,
      uploadSpeed: 100,
    })
  })

  it('should return isAccessible false for a non-existent fileId', () => {
    const result = selectFileStats(preloadedStateWithoutFileStats, 'file3')
    expect(result).toEqual({
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
