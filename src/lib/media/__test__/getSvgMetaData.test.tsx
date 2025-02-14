import { getSvgDimensions } from 'lib/fileManager'
import { UploadFile } from 'lib/uploads'

import { getIsValidDimensions } from '../getIsValidDimensions'
import { getSvgMetaData } from '../getSvgMetaData'

jest.mock('lib/fileManager', () => ({
  getSvgDimensions: jest.fn(),
}))

jest.mock('../getIsValidDimensions', () => ({
  getIsValidDimensions: jest.fn(),
}))

describe('getSvgMetaData', () => {
  const uri = 'test-uri'
  const validDimensions = { width: 100, height: 100 }
  const invalidDimensions = null
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

    const result = await getSvgMetaData(uri, file)

    expect(getIsValidDimensions).toHaveBeenCalledWith(validDimensions)
    expect(result).toEqual({ dimensions: validDimensions })
  })

  it('should return dimensions from getSvgDimensions if file dimensions are invalid', async () => {
    const file = getFile(invalidDimensions)
    ;(getIsValidDimensions as jest.Mock).mockReturnValue(false)
    ;(getSvgDimensions as jest.Mock).mockResolvedValue(validDimensions)

    const result = await getSvgMetaData(uri, file)

    expect(getIsValidDimensions).toHaveBeenCalledWith(invalidDimensions)
    expect(getSvgDimensions).toHaveBeenCalledWith(uri)
    expect(result).toEqual({ dimensions: validDimensions })
  })
})
