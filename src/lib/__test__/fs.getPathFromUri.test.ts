import { getPathFromUri } from 'lib/fs'

describe('getPathFromUri', () => {
  it('should return the original URI if it does not contain "://"', () => {
    const uri = 'test-uri'
    const result = getPathFromUri(uri)
    expect(result).toBe(uri)
  })

  it('should return the path part of the URI if it contains "://"', () => {
    const uri = 'scheme://path/to/resource'
    const result = getPathFromUri(uri)
    expect(result).toBe('path/to/resource')
  })

  it('should return an empty string if the URI is empty', () => {
    const uri = ''
    const result = getPathFromUri(uri)
    expect(result).toBe('')
  })

  it('should return the correct path if the URI contains multiple "://"', () => {
    const uri = 'scheme://path/to/resource://another/path'
    const result = getPathFromUri(uri)
    expect(result).toBe('path/to/resource://another/path')
  })
})
