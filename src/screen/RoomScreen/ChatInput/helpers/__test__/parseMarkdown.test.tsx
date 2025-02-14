import { unescape as htmlUnescape } from 'html-escaper'

import { MarkdownToken, MarkedTokenType, MdToken } from 'lib/markdownTypes'

import { getDisplaysParentStyles } from '../getDisplaysParentStyles'
import { parseMarkdown } from '../parseMarkdown'

jest.mock('../getDisplaysParentStyles', () => ({
  getDisplaysParentStyles: jest.fn(),
}))

jest.mock('html-escaper', () => ({
  unescape: jest.fn(),
}))

describe('parseMarkdown', () => {
  const tokens: MarkdownToken[] = [
    {
      type: 'text',
      raw: 'raw-text',
      text: 'text_0',
      href: '',
      tokens: undefined,
    },
    {
      type: 'link',
      raw: 'raw-link',
      text: 'link_0',
      href: 'href',
      tokens: [
        {
          type: 'text',
          raw: 'raw-text',
          text: 'text_1',
          href: '',
          tokens: undefined,
        },
      ],
    },
  ]
  const getParentTypes = (params: MarkedTokenType[]) =>
    new Set<MarkedTokenType>(params)
  const getResult = () => ({ finalText: '', display: [] as MdToken[] })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should parse tokens and update result', () => {
    const result = getResult()
    const parentTypes = getParentTypes([])
    ;(getDisplaysParentStyles as jest.Mock).mockImplementation(
      jest.requireActual('../getDisplaysParentStyles').getDisplaysParentStyles,
    )
    ;(htmlUnescape as jest.Mock).mockImplementation((text) => text)

    parseMarkdown({
      tokens,
      parentTypes,
      linkContent: '',
      linkContentRaw: '',
      result,
    })
    expect(htmlUnescape).toHaveBeenCalledTimes(3)
    expect(htmlUnescape).toHaveBeenNthCalledWith(1, 'text_0')
    expect(htmlUnescape).toHaveBeenNthCalledWith(2, 'link_0')
    expect(htmlUnescape).toHaveBeenNthCalledWith(3, 'text_1')

    expect(result.finalText).toBe('text_0text_1')
  })

  it('should handle nested tokens', () => {
    const result = getResult()
    const nestedTokens: MarkdownToken[] = [
      {
        type: 'text',
        raw: 'raw-text',
        text: 'text',
        href: '',
        tokens: undefined,
      },
    ]
    const parentTypesWithStyles = getParentTypes(['link'])

    ;(htmlUnescape as jest.Mock).mockImplementation((text) => text)
    ;(getDisplaysParentStyles as jest.Mock).mockReturnValue({
      _textToAppend: 'styled-text',
      _display: [],
    })

    parseMarkdown({
      tokens: nestedTokens,
      parentTypes: parentTypesWithStyles,
      linkContent: '',
      linkContentRaw: '',
      result,
    })

    expect(getDisplaysParentStyles).toHaveBeenCalledWith({
      parentTypes: parentTypesWithStyles,
      start: 0,
      length: 4,
      linkContent: '',
      linkContentRaw: '',
      textWithoutMd: 'text',
    })
    expect(result.finalText).toBe('styled-text')
  })
})
