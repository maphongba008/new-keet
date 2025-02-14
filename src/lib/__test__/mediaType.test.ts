import { getFileName, getMediaType, getMediaTypeFromExtension } from '../fs'

// Mock dependencies
jest.mock('../fs', () => {
  const originalModule = jest.requireActual('../fs')
  return {
    ...originalModule,
    getFileName: jest.fn(),
    getMediaTypeFromExtension: jest.fn(),
    getIsUnsupportedFileType: jest.fn(),
  }
})

jest.mock('react-native/Libraries/Utilities/Platform', () => ({
  OS: 'ios',
  select: jest.fn(),
}))

describe('getMediaType', () => {
  beforeEach(() => {
    // Default mock implementations
    ;(getFileName as jest.Mock).mockReturnValue('test.jpg')
  })

  afterEach(() => {
    jest.resetAllMocks()
    jest.clearAllMocks()
  })

  test('should identify image from file extension when type is not provided', () => {
    ;(getMediaTypeFromExtension as jest.Mock).mockReturnValue({
      isAudio: false,
      isImage: false,
      isVideo: false,
      isSVG: false,
      isSupportedFileType: false,
    })

    const result = getMediaType('test.jpg')

    expect(result).toEqual({
      isImage: true,
      isVideo: false,
      isAudio: false,
      isSVG: false,
      isSupportedFileType: true,
    })
  })

  test('should identify image from mime type', () => {
    const result = getMediaType('test.unknown', 'image/jpeg')

    expect(result.isImage).toBe(true)
  })

  test('should identify SVG from file extension', () => {
    ;(getMediaTypeFromExtension as jest.Mock).mockReturnValue({
      isAudio: false,
      isImage: false,
      isVideo: false,
      isSVG: true,
      isSupportedFileType: true,
    })

    const result = getMediaType('test.svg')

    expect(result.isSVG).toBe(true)
  })

  test('should identify SVG from mime type', () => {
    const result = getMediaType('test.unknown', 'image/svg+xml')

    expect(result.isSVG).toBe(true)
  })

  test('should identify video when both extension and mime type match', () => {
    ;(getMediaTypeFromExtension as jest.Mock).mockReturnValue({
      isAudio: false,
      isImage: false,
      isVideo: true,
      isSVG: false,
      isSupportedFileType: true,
    })

    const result = getMediaType('test.mp4', 'video/mp4')

    expect(result.isVideo).toBe(true)
  })

  test('should not identify unsupported video types', () => {
    ;(getMediaTypeFromExtension as jest.Mock).mockReturnValue({
      isAudio: false,
      isImage: false,
      isVideo: false,
      isSVG: false,
      isSupportedFileType: false,
    })

    const result = getMediaType('test.unsupported', 'video/unsupported')

    expect(result.isVideo).toBe(false)
    expect(result.isSupportedFileType).toBe(false)
  })

  test('should identify audio from mime type', () => {
    const result = getMediaType('test.mp3', 'audio/mpeg')

    expect(result.isAudio).toBe(true)
  })

  test('should handle null type parameter', () => {
    ;(getMediaTypeFromExtension as jest.Mock).mockReturnValue({
      isAudio: false,
      isImage: true,
      isVideo: false,
      isSVG: false,
      isSupportedFileType: true,
    })

    const result = getMediaType('test.jpg', null)

    expect(result).toEqual({
      isAudio: false,
      isImage: true,
      isVideo: false,
      isSVG: false,
      isSupportedFileType: true,
    })
  })
})
