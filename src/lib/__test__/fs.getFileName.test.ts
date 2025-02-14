import { getFileName } from 'lib/fs'

describe('getFileName', () => {
  it('should return the file name from a URI', () => {
    const uri = 'http://example.com/path/to/file.txt'
    const result = getFileName(uri)
    expect(result).toBe('file.txt')
  })

  it('should return the file name without query parameters', () => {
    const uri = 'http://example.com/path/to/file.txt?version=1'
    const result = getFileName(uri)
    expect(result).toBe('file.txt')
  })

  it('should return an empty string if the URI is empty', () => {
    const uri = ''
    const result = getFileName(uri)
    expect(result).toBe('')
  })

  it('should return an empty string if the URI does not contain a file name', () => {
    const uri = 'http://example.com/path/to/'
    const result = getFileName(uri)
    expect(result).toBe('')
  })

  it('should decode URI components', () => {
    const uri = 'http://example.com/path/to/file%20name.txt'
    const result = getFileName(uri)
    expect(result).toBe('file name.txt')
  })
})
