import React from 'react'

import {
  convertBackslashes,
  enforceNestedBlockquoteLayers,
  ESCAPE_REPLACEMENT_CHAR,
  escapeMarkdown,
  replaceLineBreaks,
} from 'lib/md'

describe('Md tests', () => {
  beforeEach(() => {
    jest.spyOn(React, 'useMemo').mockImplementation((f) => f())
  })
  it('removes excess blockquote layers separated by 0 or more space or tabs', () => {
    expect(enforceNestedBlockquoteLayers('>> world')).toBe('> world')
    expect(enforceNestedBlockquoteLayers(' > > world')).toBe(' > world')
    expect(enforceNestedBlockquoteLayers('Hello >\t> world')).toBe(
      'Hello >\t> world',
    )
    expect(enforceNestedBlockquoteLayers('>>> world')).toBe('> world')
    expect(enforceNestedBlockquoteLayers('> > > world')).toBe('> world')
    expect(enforceNestedBlockquoteLayers('>>>> world')).toBe('> world')
    expect(enforceNestedBlockquoteLayers('> > >     >\n world')).toBe(
      '>\n world',
    )
  })
  it('remove excess blockquote layers only in start', () => {
    expect(enforceNestedBlockquoteLayers('>>> world')).toBe('> world')
    expect(enforceNestedBlockquoteLayers(' > > world')).toBe(' > world')
    expect(enforceNestedBlockquoteLayers('\n\n>>> world')).toBe('\n\n> world')
    expect(enforceNestedBlockquoteLayers('   > > > world')).toBe('   > world')
    expect(enforceNestedBlockquoteLayers('      >>>> world')).toBe(
      '      > world',
    )
    expect(enforceNestedBlockquoteLayers('> > >     >\n world')).toBe(
      '>\n world',
    )
    expect(enforceNestedBlockquoteLayers('> world')).toBe('> world')
  })

  it('replace new line with symbol expect block quote', () => {
    expect(
      replaceLineBreaks()([
        '\n\n>  QUOTE_TEXT_1 \n> QUOTE_TEXT_2\n \nTEXT_1\nTEXT_2\n\n\nTEXT_3\n\n> QUOTE_TEXT_3\n \nTEXT_4',
      ]),
    ).toBe(
      '⟶\n>  QUOTE_TEXT_1 \n> QUOTE_TEXT_2\n \nTEXT_1\nTEXT_2⟶⟶\nTEXT_3⟶\n> QUOTE_TEXT_3\n \nTEXT_4',
    )
    expect(
      replaceLineBreaks()([
        'TEXT_0\n\n>  QUOTE_TEXT_1 \n> QUOTE_TEXT_2\n \nTEXT_1\nTEXT_2\n\n\nTEXT_3\n\n> QUOTE_TEXT_3\n \nTEXT_4',
      ]),
    ).toBe(
      'TEXT_0⟶\n>  QUOTE_TEXT_1 \n> QUOTE_TEXT_2\n \nTEXT_1\nTEXT_2⟶⟶\nTEXT_3⟶\n> QUOTE_TEXT_3\n \nTEXT_4',
    )
    expect(
      replaceLineBreaks()([
        '\n>  QUOTE_TEXT_1 \n> QUOTE_TEXT_2\n \nTEXT_1\nTEXT_2\n\n\nTEXT_3\n\n> QUOTE_TEXT_3\n \nTEXT_4\n\n\n',
      ]),
    ).toBe(
      '\n>  QUOTE_TEXT_1 \n> QUOTE_TEXT_2\n \nTEXT_1\nTEXT_2⟶⟶\nTEXT_3⟶\n> QUOTE_TEXT_3\n \nTEXT_4⟶⟶⟶',
    )
    expect(
      replaceLineBreaks()([
        '\n>  QUOTE_TEXT_1 \n\n> QUOTE_TEXT_2\n \nTEXT_1\nTEXT_2\n\n\nTEXT_3\n\n> QUOTE_TEXT_3\n \nTEXT_4\n\n\n',
      ]),
    ).toBe(
      '\n>  QUOTE_TEXT_1 \n \n\n> QUOTE_TEXT_2\n \nTEXT_1\nTEXT_2⟶⟶\nTEXT_3⟶\n> QUOTE_TEXT_3\n \nTEXT_4⟶⟶⟶',
    )
  })

  it('replace backslashes with REPLACEMENT_CHAR and escape brackets', () => {
    expect(escapeMarkdown('NAME \\')).toBe(`NAME ${ESCAPE_REPLACEMENT_CHAR}`)
    expect(escapeMarkdown('NAME [')).toBe('NAME \\[')
    expect(escapeMarkdown('NAME \\[')).toBe(
      `NAME ${ESCAPE_REPLACEMENT_CHAR}\\[`,
    )
    expect(escapeMarkdown('NAME \\[\\')).toBe(
      `NAME ${ESCAPE_REPLACEMENT_CHAR}\\[${ESCAPE_REPLACEMENT_CHAR}`,
    )
  })

  it('convert REPLACEMENT_CHAR to backslash and strip escapes', () => {
    expect(convertBackslashes(`NAME ${ESCAPE_REPLACEMENT_CHAR}`)).toBe(
      'NAME \\',
    )
    expect(
      convertBackslashes(
        `NAME ${ESCAPE_REPLACEMENT_CHAR}\\[${ESCAPE_REPLACEMENT_CHAR}`,
      ),
    ).toBe('NAME \\[\\')
  })
})
