import { getFileName } from 'lib/fs'

import { generateThumbnailUri } from '../generateThumbnailUri'

jest.mock('expo-file-system', () => ({
  cacheDirectory: 'cache-directory/',
}))

jest.mock('lib/fs', () => ({
  getFileName: jest.fn(),
}))

jest.mock('@holepunchto/keet-store/store/media/file', () => ({
  FILE_PREVIEW_NAME_PREFIX: 'preview-prefix',
}))

describe('generateThumbnailUri', () => {
  const uri = 'http://example.com/path/to/file.txt'
  const fileName = 'file.txt'
  const FILE_PREVIEW_NAME_PREFIX = 'preview-prefix'

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should generate the correct thumbnail URI', () => {
    ;(getFileName as jest.Mock).mockReturnValue(fileName)

    const result = generateThumbnailUri(uri)

    expect(getFileName).toHaveBeenCalledWith(uri)
    expect(result).toBe(
      `cache-directory/${FILE_PREVIEW_NAME_PREFIX}-${fileName}`,
    )
  })

  it('should handle URIs without a file name', () => {
    ;(getFileName as jest.Mock).mockReturnValue('')

    const result = generateThumbnailUri(uri)

    expect(getFileName).toHaveBeenCalledWith(uri)
    expect(result).toBe(`cache-directory/${FILE_PREVIEW_NAME_PREFIX}-`)
  })
})
