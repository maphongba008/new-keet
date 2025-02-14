import { getFileName } from 'lib/fs'

import { getQueryParams, parseURLToGetKey } from '../parseURLToGetKey'

// Mock the getFileName function
jest.mock('lib/fs', () => ({
  getFileName: jest.fn(),
}))

describe('getQueryParams', () => {
  it('should extract key and version from URL query parameters', () => {
    const uri = 'https://example.com/path?key=test-key&version=1'
    const result = getQueryParams(uri)

    expect(result).toEqual({
      key: 'test-key',
      version: '1',
    })
  })

  it('should handle URLs with no query parameters', () => {
    const uri = 'https://example.com/path'
    const result = getQueryParams(uri)

    expect(result).toEqual({
      key: undefined,
      version: undefined,
    })
  })

  it('should handle URLs with only one parameter', () => {
    const uri = 'https://example.com/path?key=test-key'
    const result = getQueryParams(uri)

    expect(result).toEqual({
      key: 'test-key',
      version: undefined,
    })
  })

  it('should handle URLs with additional parameters', () => {
    const uri = 'https://example.com/path?key=test-key&version=1&extra=value'
    const result = getQueryParams(uri)

    expect(result).toEqual({
      key: 'test-key',
      version: '1',
    })
  })

  it('should handle encoded parameter values', () => {
    const uri = 'https://example.com/path?key=test%20key&version=1'
    const result = getQueryParams(uri)

    expect(result).toEqual({
      key: 'test%20key',
      version: '1',
    })
  })
})

describe('parseURLToGetKey', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return correct key with version', () => {
    const uri = 'https://example.com/file.txt?version=1'
    ;(getFileName as jest.Mock).mockReturnValue('file.txt')

    const result = parseURLToGetKey(uri)
    expect(result).toBe('file1')
    expect(getFileName).toHaveBeenCalledWith(uri)
  })

  it('should use version -1 when version is not provided', () => {
    const uri = 'https://example.com/file.txt'
    ;(getFileName as jest.Mock).mockReturnValue('file.txt')

    const result = parseURLToGetKey(uri)
    expect(result).toBe('file-1')
    expect(getFileName).toHaveBeenCalledWith(uri)
  })

  it('should return empty string when getFileName returns null', () => {
    const uri = 'https://example.com/file.txt'
    ;(getFileName as jest.Mock).mockReturnValue(null)

    const result = parseURLToGetKey(uri)
    expect(result).toBe('')
    expect(getFileName).toHaveBeenCalledWith(uri)
  })

  it('should return empty string when getFileName throws error', () => {
    const uri = 'https://example.com/file.txt'
    ;(getFileName as jest.Mock).mockImplementation(() => {
      throw new Error('Test error')
    })

    const result = parseURLToGetKey(uri)
    expect(result).toBe('')
    expect(getFileName).toHaveBeenCalledWith(uri)
  })

  it('should handle files with multiple dots in name', () => {
    const uri = 'https://example.com/file.test.txt?version=2'
    ;(getFileName as jest.Mock).mockReturnValue('file.test.txt')

    const result = parseURLToGetKey(uri)
    expect(result).toBe('file.test2')
    expect(getFileName).toHaveBeenCalledWith(uri)
  })
})
