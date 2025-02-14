import { getFileSize } from 'lib/fileManager'
import { getMediaType, getPathFromUri } from 'lib/fs'
import { SendFilesInfo } from 'lib/types'

import { getAudioMetaData } from '../getAudioMetaData'
import { getImageMetaData } from '../getImageMetaData'
import { getSvgMetaData } from '../getSvgMetaData'
import { getUploadFile } from '../getUploadFile'
import { getVideoMetaData } from '../getVideoMetaData'

jest.mock('lib/fs', () => ({
  getMediaType: jest.fn(),
  getPathFromUri: jest.fn(),
}))
jest.mock('../getSvgMetaData', () => ({
  getSvgMetaData: jest.fn(),
}))
jest.mock('../getImageMetaData', () => ({
  getImageMetaData: jest.fn(),
}))
jest.mock('../getVideoMetaData', () => ({
  getVideoMetaData: jest.fn(),
}))
jest.mock('../getAudioMetaData', () => ({
  getAudioMetaData: jest.fn(),
}))
jest.mock('lib/fileManager', () => ({
  getFileSize: jest.fn(),
}))

describe('getUploadFile', () => {
  const uri = 'test-uri'
  const type = 'image/jpeg'
  const name = 'test-file'
  const byteLength = 1234
  const dimensions = { width: 100, height: 100 }
  const sendFilesInfo: SendFilesInfo = {
    uri,
    type,
    name,
    byteLength,
    dimensions,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return an UploadFile object with SVG metadata', async () => {
    ;(getMediaType as jest.Mock).mockReturnValue({
      isImage: false,
      isVideo: false,
      isAudio: false,
      isSVG: true,
    })
    ;(getPathFromUri as jest.Mock).mockReturnValue('test-path')
    ;(getSvgMetaData as jest.Mock).mockResolvedValue({ dimensions })

    const result = await getUploadFile(sendFilesInfo)

    expect(getMediaType).toHaveBeenCalledWith(uri, type)
    expect(getPathFromUri).toHaveBeenCalledWith(uri)
    expect(getSvgMetaData).toHaveBeenCalledWith(uri, expect.any(Object))
    expect(result).toEqual({
      id: expect.any(String),
      path: 'test-path',
      type,
      byteLength,
      isLinkPreview: false,
      dimensions,
    })
  })

  it('should return an UploadFile object with image metadata', async () => {
    ;(getMediaType as jest.Mock).mockReturnValue({
      isImage: true,
      isVideo: false,
      isAudio: false,
      isSVG: false,
    })
    ;(getPathFromUri as jest.Mock).mockReturnValue('test-path')
    ;(getImageMetaData as jest.Mock).mockResolvedValue({
      dimensions,
      previewPath: 'preview-path',
    })

    const result = await getUploadFile(sendFilesInfo)

    expect(getMediaType).toHaveBeenCalledWith(uri, type)
    expect(getPathFromUri).toHaveBeenCalledWith(uri)
    expect(getImageMetaData).toHaveBeenCalledWith(uri, expect.any(Object))
    expect(result).toEqual({
      id: expect.any(String),
      path: 'test-path',
      type,
      byteLength,
      isLinkPreview: false,
      dimensions,
      previewPath: 'preview-path',
    })
  })

  it('should return an UploadFile object with video metadata', async () => {
    ;(getMediaType as jest.Mock).mockReturnValue({
      isImage: false,
      isVideo: true,
      isAudio: false,
      isSVG: false,
    })
    ;(getPathFromUri as jest.Mock).mockReturnValue('test-path')
    ;(getVideoMetaData as jest.Mock).mockResolvedValue({
      dimensions,
      duration: 120,
      previewPath: 'preview-path',
    })

    const result = await getUploadFile(sendFilesInfo)

    expect(getMediaType).toHaveBeenCalledWith(uri, type)
    expect(getPathFromUri).toHaveBeenCalledWith(uri)
    expect(getVideoMetaData).toHaveBeenCalledWith(uri, expect.any(Object))
    expect(result).toEqual({
      id: expect.any(String),
      path: 'test-path',
      type,
      byteLength,
      isLinkPreview: false,
      dimensions,
      duration: 120,
      previewPath: 'preview-path',
    })
  })

  it('should return an UploadFile object with audio metadata', async () => {
    const audioMetaData = {
      duration: 120,
    }
    ;(getMediaType as jest.Mock).mockReturnValue({
      isImage: false,
      isVideo: false,
      isAudio: true,
      isSVG: false,
    })
    ;(getPathFromUri as jest.Mock).mockReturnValue('test-path')
    ;(getAudioMetaData as jest.Mock).mockResolvedValue(audioMetaData)

    const result = await getUploadFile(sendFilesInfo)

    expect(getMediaType).toHaveBeenCalledWith(uri, type)
    expect(getPathFromUri).toHaveBeenCalledWith(uri)
    expect(getAudioMetaData).toHaveBeenCalledWith(uri)
    expect(result).toEqual({
      id: expect.any(String),
      path: 'test-path',
      type,
      byteLength,
      isLinkPreview: false,
      ...audioMetaData,
    })
  })

  it('should return an UploadFile object without additional metadata for other file types', async () => {
    ;(getMediaType as jest.Mock).mockReturnValue({
      isImage: false,
      isVideo: false,
      isAudio: false,
      isSVG: false,
    })
    ;(getPathFromUri as jest.Mock).mockReturnValue('test-path')

    const result = await getUploadFile(sendFilesInfo)

    expect(getMediaType).toHaveBeenCalledWith(uri, type)
    expect(getPathFromUri).toHaveBeenCalledWith(uri)
    expect(result).toEqual({
      id: expect.any(String),
      path: 'test-path',
      type,
      byteLength,
      isLinkPreview: false,
    })
  })

  it('should return an UploadFile object with file size if byteLength is not provided', async () => {
    ;(getMediaType as jest.Mock).mockReturnValue({
      isImage: false,
      isVideo: false,
      isAudio: false,
      isSVG: false,
    })
    ;(getPathFromUri as jest.Mock).mockReturnValue('test-path')
    ;(getFileSize as jest.Mock).mockResolvedValue(5678)

    const result = await getUploadFile({
      ...sendFilesInfo,
      byteLength: 0,
    })

    expect(getMediaType).toHaveBeenCalledWith(uri, type)
    expect(getPathFromUri).toHaveBeenCalledWith(uri)
    expect(getFileSize).toHaveBeenCalledWith(uri)
    expect(result).toEqual({
      id: expect.any(String),
      path: 'test-path',
      type,
      byteLength: 5678,
      isLinkPreview: false,
    })
  })
})
