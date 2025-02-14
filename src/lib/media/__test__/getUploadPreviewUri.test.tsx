import { copyAsync } from 'expo-file-system'

import { createImagePreview, createVideoPreview } from 'lib/fileManager'
import { getPathFromUri } from 'lib/fs'

import { generateThumbnailUri } from '../generateThumbnailUri'
import { getUploadPreviewUri } from '../getUploadPreviewUri'

jest.mock('lib/fileManager', () => ({
  createImagePreview: jest.fn(),
  createVideoPreview: jest.fn(),
}))

jest.mock('lib/fs', () => ({
  getPathFromUri: jest.fn(),
}))

jest.mock('../generateThumbnailUri', () => ({
  generateThumbnailUri: jest.fn(),
}))

jest.mock('expo-file-system', () => ({
  copyAsync: jest.fn(),
}))

describe('getUploadPreviewUri', () => {
  const getURIs = (prefix: string) => ({
    uri: `${prefix}-uri`,
    thumbnailUri: `${prefix}-thumbnail-uri`,
    thumbnailSpecificPath: `${prefix}-thumbnail-specific-path`,
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should generate image preview URI', async () => {
    const { uri, thumbnailUri, thumbnailSpecificPath } = getURIs(
      `image-${Date.now()}`,
    )
    ;(createImagePreview as jest.Mock).mockResolvedValue(thumbnailUri)
    ;(generateThumbnailUri as jest.Mock).mockReturnValue(thumbnailSpecificPath)
    ;(getPathFromUri as jest.Mock).mockReturnValue(thumbnailSpecificPath)

    const result = await getUploadPreviewUri({ uri, isVideo: false })

    expect(createImagePreview).toHaveBeenCalledWith(uri, {
      isBase64Output: false,
      compress: 0.5,
    })
    expect(generateThumbnailUri).toHaveBeenCalledWith(thumbnailUri)
    expect(copyAsync).toHaveBeenCalledWith({
      from: thumbnailUri,
      to: thumbnailSpecificPath,
    })
    expect(getPathFromUri).toHaveBeenCalledWith(thumbnailSpecificPath)
    expect(result).toBe(thumbnailSpecificPath)
  })

  it('should generate video preview URI', async () => {
    const { uri, thumbnailUri, thumbnailSpecificPath } = getURIs(
      `video-${Date.now()}`,
    )

    ;(createVideoPreview as jest.Mock).mockResolvedValue(thumbnailUri)
    ;(generateThumbnailUri as jest.Mock).mockReturnValue(thumbnailSpecificPath)
    ;(getPathFromUri as jest.Mock).mockReturnValue(thumbnailSpecificPath)

    const result = await getUploadPreviewUri({ uri, isVideo: true })

    expect(createVideoPreview).toHaveBeenCalledWith(uri, {
      isBase64Output: false,
      compress: 0.5,
    })
    expect(generateThumbnailUri).toHaveBeenCalledWith(thumbnailUri)
    expect(copyAsync).toHaveBeenCalledWith({
      from: thumbnailUri,
      to: thumbnailSpecificPath,
    })
    expect(getPathFromUri).toHaveBeenCalledWith(thumbnailSpecificPath)
    expect(result).toBe(thumbnailSpecificPath)
  })
})
