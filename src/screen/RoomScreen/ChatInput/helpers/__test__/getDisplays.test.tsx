import { marked } from 'marked'

import { getDisplays } from '../getDisplays'
import { parseMarkdown } from '../parseMarkdown'

jest.mock('marked', () => ({
  ...jest.requireActual('marked'),
  marked: {
    ...jest.requireActual('marked').marked,
    setOptions: jest.fn(),
    use: jest.fn(),
    lexer: jest.fn(),
  },
}))

jest.mock('../parseMarkdown', () => ({
  parseMarkdown: jest.fn(),
}))

describe('getDisplays', () => {
  const originalText = 'test text'
  const tokens = [
    {
      type: 'text',
      raw: 'raw-text',
      text: 'text',
      href: '',
      tokens: undefined,
    },
  ]

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should set marked options and disable heading and list tokenization', () => {
    let result
    ;(marked.lexer as jest.Mock).mockReturnValue(tokens)
    ;(parseMarkdown as jest.Mock).mockImplementation(({ result: _result }) => {
      result = _result
      result.finalText = 'parsed text'
    })

    const displays = getDisplays(originalText)

    expect(marked.setOptions).toHaveBeenCalledWith({ mangle: false })
    expect(marked.use).toHaveBeenCalledWith({
      tokenizer: {
        heading: expect.any(Function),
        list: expect.any(Function),
        escape: expect.any(Function),
        blockquote: expect.any(Function),
      },
    })
    expect(marked.lexer).toHaveBeenCalledWith(originalText)
    expect(parseMarkdown).toHaveBeenCalledWith({
      tokens,
      parentTypes: new Set(),
      linkContent: '',
      linkContentRaw: '',
      result,
    })
    expect(displays).toEqual({ finalText: 'parsed text', display: [] })
  })

  it('should return original text if no tokens are found', () => {
    ;(marked.lexer as jest.Mock).mockReturnValue([])

    const displays = getDisplays(originalText)

    expect(marked.lexer).toHaveBeenCalledWith(originalText)
    expect(displays).toEqual({ finalText: originalText, display: [] })
  })
})
