// import { RNCgetVideoMetaData } from 'react-native-video'
import { getVideoMetaData as RNCgetVideoMetaData } from 'react-native-compressor'

import { getImageDimensions } from 'lib/fileManager'
import { UploadFile } from 'lib/uploads'

import { getIsValidDimensions } from '../getIsValidDimensions'
import { getUploadPreviewUri } from '../getUploadPreviewUri'
import { getVideoMetaData } from '../getVideoMetaData'

jest.mock('react-native-compressor', () => ({
  getVideoMetaData: jest.fn(),
}))

jest.mock('lib/fileManager', () => ({
  getImageDimensions: jest.fn(),
}))

jest.mock('../getUploadPreviewUri', () => ({
  getUploadPreviewUri: jest.fn(),
}))

jest.mock('../getIsValidDimensions', () => ({
  getIsValidDimensions: jest.fn(),
}))

describe('getVideoMetaData', () => {
  const uri = 'test-uri'
  const validDimensions = { width: 100, height: 100 }
  const invalidDimensions = null
  const previewPath = 'preview-path'
  const duration = 120
  const getFile = (dimensions: UploadFile['dimensions']) =>
    ({
      dimensions,
    }) as UploadFile

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return valid dimensions from file if they are valid', async () => {
    const file = getFile(validDimensions)
    ;(getIsValidDimensions as jest.Mock).mockReturnValue(true)
    ;(getUploadPreviewUri as jest.Mock).mockResolvedValue(previewPath)
    ;(RNCgetVideoMetaData as jest.Mock).mockResolvedValue({ duration })

    const result = await getVideoMetaData(uri, file)

    expect(getIsValidDimensions).toHaveBeenCalledWith(validDimensions)
    expect(getUploadPreviewUri).toHaveBeenCalledWith({ uri, isVideo: true })
    expect(RNCgetVideoMetaData).toHaveBeenCalledWith(uri)
    expect(result).toEqual({
      dimensions: validDimensions,
      duration,
      previewPath,
    })
  })

  it('should return dimensions from getImageDimensions if file dimensions are invalid', async () => {
    const file = getFile(invalidDimensions)
    ;(getIsValidDimensions as jest.Mock).mockReturnValue(false)
    ;(getImageDimensions as jest.Mock).mockResolvedValue(validDimensions)
    ;(getUploadPreviewUri as jest.Mock).mockResolvedValue(previewPath)
    ;(RNCgetVideoMetaData as jest.Mock).mockResolvedValue({ duration })

    const result = await getVideoMetaData(uri, file)

    expect(getIsValidDimensions).toHaveBeenCalledWith(invalidDimensions)
    expect(getImageDimensions).toHaveBeenCalledWith(uri)
    expect(getUploadPreviewUri).toHaveBeenCalledWith({ uri, isVideo: true })
    expect(RNCgetVideoMetaData).toHaveBeenCalledWith(uri)
    expect(result).toEqual({
      dimensions: validDimensions,
      duration,
      previewPath,
    })
  })

  it('should handle missing duration in video metadata', async () => {
    const file = getFile(invalidDimensions)
    ;(getIsValidDimensions as jest.Mock).mockReturnValue(false)
    ;(getImageDimensions as jest.Mock).mockResolvedValue(validDimensions)
    ;(getUploadPreviewUri as jest.Mock).mockResolvedValue(previewPath)
    ;(RNCgetVideoMetaData as jest.Mock).mockResolvedValue({})

    const result = await getVideoMetaData(uri, file)

    expect(getIsValidDimensions).toHaveBeenCalledWith(invalidDimensions)
    expect(getImageDimensions).toHaveBeenCalledWith(uri)
    expect(getUploadPreviewUri).toHaveBeenCalledWith({ uri, isVideo: true })
    expect(RNCgetVideoMetaData).toHaveBeenCalledWith(uri)
    expect(result).toEqual({
      dimensions: validDimensions,
      duration: 0,
      previewPath,
    })
  })
})
