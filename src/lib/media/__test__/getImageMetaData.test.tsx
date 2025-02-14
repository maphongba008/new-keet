import { getImageDimensions } from 'lib/fileManager'
import { UploadFile } from 'lib/uploads'

import { getImageMetaData } from '../getImageMetaData'
import { getIsValidDimensions } from '../getIsValidDimensions'
import { getUploadPreviewUri } from '../getUploadPreviewUri'

jest.mock('../getIsValidDimensions', () => ({
  getIsValidDimensions: jest.fn(),
}))

jest.mock('lib/fileManager', () => ({
  getImageDimensions: jest.fn(),
}))

jest.mock('../getUploadPreviewUri', () => ({
  getUploadPreviewUri: jest.fn(),
}))

describe('getImageMetaData', () => {
  const uri = 'test-uri'
  const validDimensions = { width: 100, height: 100 }
  const invalidDimensions = null
  const previewPath = 'preview-path'
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

    const result = await getImageMetaData(uri, file)

    expect(getIsValidDimensions).toHaveBeenCalledWith(validDimensions)
    expect(getUploadPreviewUri).toHaveBeenCalledWith({ uri })
    expect(result).toEqual({ dimensions: validDimensions, previewPath })
  })

  it('should return dimensions from getImageDimensions if file dimensions are invalid', async () => {
    const file = getFile(invalidDimensions)
    ;(getIsValidDimensions as jest.Mock).mockReturnValue(false)
    ;(getImageDimensions as jest.Mock).mockResolvedValue(validDimensions)
    ;(getUploadPreviewUri as jest.Mock).mockResolvedValue(previewPath)

    const result = await getImageMetaData(uri, file)

    expect(getIsValidDimensions).toHaveBeenCalledWith(invalidDimensions)
    expect(getImageDimensions).toHaveBeenCalledWith(uri)
    expect(getUploadPreviewUri).toHaveBeenCalledWith({ uri })
    expect(result).toEqual({ dimensions: validDimensions, previewPath })
  })
})
