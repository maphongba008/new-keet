import { Platform } from 'react-native'

import { getMediaTypeFromExtension } from '../fs'

describe('getMediaTypeFromExtension', () => {
  const originalSelect = Platform.select

  describe('iOS Platform', () => {
    beforeEach(() => {
      Platform.select = jest.fn((obj) => obj.ios)
    })

    afterEach(() => {
      // Restore the original implementation after each test
      Platform.select = originalSelect
      jest.clearAllMocks()
    })

    describe('Image Detection', () => {
      const validIOSImageTypes = [
        'test.jpg',
        'test.jpeg',
        'test.png',
        'test.gif',
        'test.bmp',
        'test.webp',
        'test.JPEG',
        'test.PNG',
        'test.tiff',
        'test.heic',
        'path/to/image.jpg',
      ]

      test.each(validIOSImageTypes)(
        'should identify %s as an image',
        (fileName) => {
          const result = getMediaTypeFromExtension(fileName)
          expect(result.isImage).toBe(true)
        },
      )

      const invalidIOSImageTypes = [
        'test.doc',
        'test.pdf',
        'test.txt',
        'test.mp4',
        'test',
      ]

      test.each(invalidIOSImageTypes)(
        'should not identify %s as an image',
        (fileName) => {
          const result = getMediaTypeFromExtension(fileName)
          expect(result.isImage).toBe(false)
        },
      )
    })

    describe('Video Detection', () => {
      const validIOSVideoTypes = [
        'test.mp4',
        'test.avi',
        'test.mov',
        'test.flv',
        'test.wmv',
        'test.mkv',
        'test.MP4',
        'test.webm',
        'path/to/video.mov',
      ]

      test.each(validIOSVideoTypes)(
        'should identify %s as a video',
        (fileName) => {
          const result = getMediaTypeFromExtension(fileName)
          expect(result.isVideo).toBe(true)
        },
      )

      const invalidIOSVideoTypes = ['test.jpg', 'test.doc', 'test']

      test.each(invalidIOSVideoTypes)(
        'should not identify %s as a video',
        (fileName) => {
          const result = getMediaTypeFromExtension(fileName)
          expect(result.isVideo).toBe(false)
        },
      )
    })
  })

  describe('Android Platform', () => {
    beforeEach(() => {
      Platform.select = jest.fn((obj) => obj.android)
    })

    afterEach(() => {
      // Restore the original implementation after each test
      Platform.select = originalSelect
      jest.clearAllMocks()
    })

    describe('Image Detection', () => {
      const validAndroidImageTypes = [
        'test.jpg',
        'test.jpeg',
        'test.png',
        'test.gif',
        'test.bmp',
        'test.webp',
        'test.PNG',
        'test.tiff',
        'test.heic',
        'path/to/image.jpg',
      ]

      test.each(validAndroidImageTypes)(
        'should identify %s as an image',
        (fileName) => {
          const result = getMediaTypeFromExtension(fileName)
          expect(result.isImage).toBe(true)
        },
      )

      const invalidAndroidImageTypes = ['test.doc', 'test.pdf', 'test']

      test.each(invalidAndroidImageTypes)(
        'should not identify %s as an image',
        (fileName) => {
          const result = getMediaTypeFromExtension(fileName)
          expect(result.isImage).toBe(false)
        },
      )
    })

    describe('Video Detection', () => {
      const validAndroidVideoTypes = [
        'test.mp4',
        'test.avi',
        'test.mov',
        'test.flv',
        'test.wmv',
        'test.mkv',
        'test.webm',
        'test.MP4',
        'path/to/video.webm',
      ]

      test.each(validAndroidVideoTypes)(
        'should identify %s as a video',
        (fileName) => {
          const result = getMediaTypeFromExtension(fileName)
          expect(result.isVideo).toBe(true)
        },
      )

      const invalidAndroidVideoTypes = ['test.jpg', 'test.doc', 'test']

      test.each(invalidAndroidVideoTypes)(
        'should not identify %s as a video',
        (fileName) => {
          const result = getMediaTypeFromExtension(fileName)
          expect(result.isVideo).toBe(false)
        },
      )
    })
  })

  describe('SVG Detection (Platform Independent)', () => {
    const validSVGTypes = ['test.svg', 'test.SVG', 'path/to/image.svg']

    test.each(validSVGTypes)('should identify %s as an SVG', (fileName) => {
      const result = getMediaTypeFromExtension(fileName)
      expect(result.isSVG).toBe(true)
    })

    const invalidSVGTypes = ['test.svgx', 'test.jpg', 'test']

    test.each(invalidSVGTypes)(
      'should not identify %s as an SVG',
      (fileName) => {
        const result = getMediaTypeFromExtension(fileName)
        expect(result.isSVG).toBe(false)
      },
    )
  })

  describe('Edge Cases', () => {
    test('should handle files with multiple dots', () => {
      const result = getMediaTypeFromExtension('test.backup.jpg')
      expect(result.isImage).toBe(true)
    })

    test('should handle files with no extension', () => {
      const result = getMediaTypeFromExtension('testfile')
      expect(result).toEqual({
        isAudio: false,
        isImage: false,
        isVideo: false,
        isSVG: false,
        isSupportedFileType: false,
      })
    })

    test('should handle empty string', () => {
      const result = getMediaTypeFromExtension('')
      expect(result).toEqual({
        isAudio: false,
        isImage: false,
        isVideo: false,
        isSVG: false,
        isSupportedFileType: false,
      })
    })

    test('should handle case-insensitive extensions', () => {
      const result = getMediaTypeFromExtension('test.JPG')
      expect(result.isImage).toBe(true)
    })
  })
})
