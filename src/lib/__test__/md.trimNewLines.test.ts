import { trimNewLines } from 'lib/md'

describe('trimNewLines', () => {
  it('should remove leading newlines', () => {
    const text = '\n\nHello'
    const result = trimNewLines(text)
    expect(result).toBe('Hello')
  })

  it('should remove trailing newlines', () => {
    const text = 'Hello\n\n'
    const result = trimNewLines(text)
    expect(result).toBe('Hello')
  })

  it('should remove both leading and trailing newlines', () => {
    const text = '\n\nHello\n\n'
    const result = trimNewLines(text)
    expect(result).toBe('Hello')
  })

  it('should not change text without newlines', () => {
    const text = 'Hello'
    const result = trimNewLines(text)
    expect(result).toBe('Hello')
  })

  it('should handle empty string', () => {
    const text = ''
    const result = trimNewLines(text)
    expect(result).toBe('')
  })
})
