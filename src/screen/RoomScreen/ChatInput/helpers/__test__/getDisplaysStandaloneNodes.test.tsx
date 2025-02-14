import { DISPLAY_TYPES } from '@holepunchto/keet-core-api'

import { MarkedTokenType } from 'lib/markdownTypes'

import { getDisplaysStandaloneNodes } from '../getDisplaysStandaloneNodes'

describe('getDisplaysStandaloneNodes', () => {
  it('should append new lines for space type', () => {
    const result = getDisplaysStandaloneNodes({
      type: 'space',
      textToAppend: 'test',
      start: 0,
      length: 4,
    })

    expect(result).toEqual({
      _textToAppend: 'test\n\n',
      _display: [],
    })
  })

  it('should add a code span token for codespan type', () => {
    const result = getDisplaysStandaloneNodes({
      type: 'codespan',
      textToAppend: 'test',
      start: 0,
      length: 4,
    })

    expect(result).toEqual({
      _textToAppend: 'test',
      _display: [{ type: DISPLAY_TYPES.CODE, start: 0, length: 4 }],
    })
  })

  it('should add a code block token and append new line for code type', () => {
    const result = getDisplaysStandaloneNodes({
      type: 'code',
      textToAppend: 'test',
      start: 0,
      length: 4,
    })

    expect(result).toEqual({
      _textToAppend: 'test\n',
      _display: [{ type: DISPLAY_TYPES.CODE_BLOCK, start: 0, length: 4 }],
    })
  })

  it('should replace <br> with new line for html type', () => {
    const result = getDisplaysStandaloneNodes({
      type: 'html',
      textToAppend: '<br>',
      start: 0,
      length: 4,
    })

    expect(result).toEqual({
      _textToAppend: '\n',
      _display: [],
    })
  })

  it('should not modify textToAppend or display for unknown type', () => {
    const result = getDisplaysStandaloneNodes({
      type: 'unknown' as MarkedTokenType,
      textToAppend: 'test',
      start: 0,
      length: 4,
    })

    expect(result).toEqual({
      _textToAppend: 'test',
      _display: [],
    })
  })
})
