import { DEFAULT_SVG_DIMENSIONS } from 'lib/constants'

import { getSvgDimensions } from '../getSvgDimensions'

global.fetch = jest.fn()

describe('getSvgDimensions', () => {
  const uri = 'test-uri'
  const svgXml = '<svg width="100" height="200"></svg>'
  const svgXmlWithoutDimensions = '<svg></svg>'

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return dimensions from SVG tag', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      text: jest.fn().mockResolvedValue(svgXml),
    })

    const result = await getSvgDimensions(uri)

    expect(global.fetch).toHaveBeenCalledWith(uri)
    expect(result).toEqual({ width: 100, height: 200 })
  })

  it('should return default dimensions if SVG tag does not contain width and height', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      text: jest.fn().mockResolvedValue(svgXmlWithoutDimensions),
    })

    const result = await getSvgDimensions(uri)

    expect(global.fetch).toHaveBeenCalledWith(uri)
    expect(result).toEqual(DEFAULT_SVG_DIMENSIONS)
  })

  it('should return default dimensions if SVG tag is not found', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      text: jest.fn().mockResolvedValue(''),
    })

    const result = await getSvgDimensions(uri)

    expect(global.fetch).toHaveBeenCalledWith(uri)
    expect(result).toEqual(DEFAULT_SVG_DIMENSIONS)
  })

  it('should return default dimensions if fetch fails', async () => {
    ;(global.fetch as jest.Mock).mockRejectedValue(new Error('Error'))

    const result = await getSvgDimensions(uri)

    expect(global.fetch).toHaveBeenCalledWith(uri)
    expect(result).toEqual(DEFAULT_SVG_DIMENSIONS)
  })
})
