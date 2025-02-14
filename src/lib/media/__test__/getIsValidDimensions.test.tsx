import { getIsValidDimensions } from '../getIsValidDimensions'

describe('getIsValidDimensions', () => {
  it('should return true for valid dimensions', () => {
    const dimensions = { width: 100, height: 100 }
    const result = getIsValidDimensions(dimensions)
    expect(result).toBe(true)
  })

  it('should return false for missing width', () => {
    const dimensions = { height: 100 }
    const result = getIsValidDimensions(dimensions)
    expect(result).toBe(false)
  })

  it('should return false for missing height', () => {
    const dimensions = { width: 100 }
    const result = getIsValidDimensions(dimensions)
    expect(result).toBe(false)
  })

  it('should return false for null dimensions', () => {
    const result = getIsValidDimensions(null)
    expect(result).toBe(false)
  })

  it('should return false for undefined dimensions', () => {
    const result = getIsValidDimensions(undefined)
    expect(result).toBe(false)
  })
})
