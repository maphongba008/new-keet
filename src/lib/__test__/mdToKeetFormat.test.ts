import React from 'react'

import { initEmojis } from '@holepunchto/emojis'

import { getDisplays } from 'screen/RoomScreen/ChatInput/helpers/getDisplays'
import { processChatInputString } from 'lib/md'

/**
 * 1. Fastest way to verify is using the text, keet desktop paste and send
 * Make sure both desktop and mobile renders correctly.
 *
 * To get the payload, mobile place this chunk of code on any active screen (RoomList.tsx)

    const markdown = '~~Strikethrough with **bold** inside~~'
    console.log(
      'getDisplays',
      JSON.stringify(getDisplays(processChatInputString(markdown)), null, 2),
    )
 */

/**
 * 1. Basic single token
 * - Able to parse single token
 * - Able to parse single token with other mixed content
 * - Able to handle unclosed syntax
 */

describe('Markdown to keet format tests', () => {
  beforeEach(() => {
    jest.spyOn(React, 'useMemo').mockImplementation((f) => f())

    initEmojis({ emojisPath: '/resources/emojis/' })
  })

  describe('Test bold', () => {
    test.each([
      {
        name: 'Single bold text wrapped with double asterisks',
        input: '**bold space**',
        expected: {
          finalText: 'bold space',
          display: [
            {
              type: 4,
              start: 0,
              length: 10,
            },
          ],
        },
      },
      {
        name: 'Unclosed bold text with double asterisks',
        input: '**bold space',
        expected: {
          finalText: '**bold space',
          display: [],
        },
      },
      {
        name: 'Single bold text wrapped with double underscores',
        input: '__bold space__',
        expected: {
          finalText: 'bold space',
          display: [
            {
              type: 4,
              start: 0,
              length: 10,
            },
          ],
        },
      },
      {
        name: 'Plain text followed by bold text',
        input: 'text **bold space**',
        expected: {
          finalText: 'text bold space',
          display: [
            {
              type: 4,
              start: 5,
              length: 10,
            },
          ],
        },
      },
      {
        name: 'Bold text followed by plain text',
        input: '**bold space** text',
        expected: {
          finalText: 'bold space text',
          display: [
            {
              type: 4,
              start: 0,
              length: 10,
            },
          ],
        },
      },
    ])('$name', ({ input, expected }) => {
      const result = getDisplays(processChatInputString(input))
      expect(result).toEqual(expected)
    })
  })

  describe('Test italic', () => {
    test.each([
      {
        name: 'Single italic text wrapped with asterisks',
        input: '*italic space*',
        expected: {
          finalText: 'italic space',
          display: [
            {
              type: 5,
              start: 0,
              length: 12,
            },
          ],
        },
      },
      {
        name: 'Underscore without closing underscore',
        input: '_italic space',
        expected: {
          finalText: '_italic space',
          display: [],
        },
      },
      {
        name: 'Single italic text wrapped with underscores',
        input: '_italic space_',
        expected: {
          finalText: 'italic space',
          display: [
            {
              type: 5,
              start: 0,
              length: 12,
            },
          ],
        },
      },
      {
        name: 'Plain text followed by italic text',
        input: 'text _italic space_',
        expected: {
          finalText: 'text italic space',
          display: [
            {
              type: 5,
              start: 5,
              length: 12,
            },
          ],
        },
      },
      {
        name: 'Italic text followed by plain text',
        input: '*italic space* text',
        expected: {
          finalText: 'italic space text',
          display: [
            {
              type: 5,
              start: 0,
              length: 12,
            },
          ],
        },
      },
    ])('$name test', ({ input, expected }) => {
      const result = getDisplays(processChatInputString(input))
      expect(result).toEqual(expected)
    })
  })

  describe('Test underscore', () => {
    test.each([
      {
        name: 'Single strikethrough text wrapped with double tildes',
        input: '~~strike through~~',
        expected: {
          finalText: 'strike through',
          display: [
            {
              type: 9,
              start: 0,
              length: 14,
            },
          ],
        },
      },
      {
        name: 'Unclosed strikethrough text with double tildes',
        input: '~~strike through',
        expected: {
          finalText: '~~strike through',
          display: [],
        },
      },
      {
        name: 'Plain text followed by strikethrough text',
        input: 'text ~~strike through~~',
        expected: {
          finalText: 'text strike through',
          display: [
            {
              type: 9,
              start: 5,
              length: 14,
            },
          ],
        },
      },
      {
        name: 'Strikethrough text followed by plain text',
        input: '~~strike through~~ text',
        expected: {
          finalText: 'strike through text',
          display: [
            {
              type: 9,
              start: 0,
              length: 14,
            },
          ],
        },
      },
      {
        name: 'Multiple strikethrough text segments',
        input: '~~strike one~~ and ~~strike two~~',
        expected: {
          finalText: 'strike one and strike two',
          display: [
            {
              type: 9,
              start: 0,
              length: 10,
            },
            {
              type: 9,
              start: 15,
              length: 10,
            },
          ],
        },
      },
    ])('$name', ({ input, expected }) => {
      const result = getDisplays(processChatInputString(input))
      expect(result).toEqual(expected)
    })
  })

  describe('Test commonly nested structure (bold, italic, strikethrough', () =>
    test.each([
      {
        name: 'Bold inside italic',
        input: '_Italic with **bold** inside_',
        expected: {
          finalText: 'Italic with bold inside',
          display: [
            {
              type: 5,
              start: 0,
              length: 12,
            },
            {
              type: 5,
              start: 12,
              length: 4,
            },
            {
              type: 4,
              start: 12,
              length: 4,
            },
            {
              type: 5,
              start: 16,
              length: 7,
            },
          ],
        },
      },
      {
        name: 'Italic inside bold',
        input: '**Bold with _italic_ inside**',
        expected: {
          finalText: 'Bold with italic inside',
          display: [
            {
              type: 4,
              start: 0,
              length: 10,
            },
            {
              type: 4,
              start: 10,
              length: 6,
            },
            {
              type: 5,
              start: 10,
              length: 6,
            },
            {
              type: 4,
              start: 16,
              length: 7,
            },
          ],
        },
      },
      {
        name: 'Bold inside strikethrough',
        input: '~~Strikethrough with **bold** inside~~',
        expected: {
          finalText: 'Strikethrough with bold inside',
          display: [
            {
              type: 9,
              start: 0,
              length: 19,
            },
            {
              type: 9,
              start: 19,
              length: 4,
            },
            {
              type: 4,
              start: 19,
              length: 4,
            },
            {
              type: 9,
              start: 23,
              length: 7,
            },
          ],
        },
      },
      {
        name: 'Italic inside strikethrough',
        input: '~~Strikethrough with _italic_ inside~~',
        expected: {
          finalText: 'Strikethrough with italic inside',
          display: [
            {
              type: 9,
              start: 0,
              length: 19,
            },
            {
              type: 9,
              start: 19,
              length: 6,
            },
            {
              type: 5,
              start: 19,
              length: 6,
            },
            {
              type: 9,
              start: 25,
              length: 7,
            },
          ],
        },
      },
      {
        name: 'Nested bold, italic, and strikethrough',
        input: '~~**Bold and _italic_ together**~~',
        expected: {
          finalText: 'Bold and italic together',
          display: [
            {
              type: 9,
              start: 0,
              length: 9,
            },
            {
              type: 4,
              start: 0,
              length: 9,
            },
            {
              type: 9,
              start: 9,
              length: 6,
            },
            {
              type: 4,
              start: 9,
              length: 6,
            },
            {
              type: 5,
              start: 9,
              length: 6,
            },
            {
              type: 9,
              start: 15,
              length: 9,
            },
            {
              type: 4,
              start: 15,
              length: 9,
            },
          ],
        },
      },
      {
        name: 'Nested elements with spaces',
        input: '_Italic with **bold _nested italic_ inside**_',
        expected: {
          finalText: 'Italic with bold nested italic inside',
          display: [
            {
              type: 5,
              start: 0,
              length: 12,
            },
            {
              type: 5,
              start: 12,
              length: 5,
            },
            {
              type: 4,
              start: 12,
              length: 5,
            },
            {
              type: 5,
              start: 17,
              length: 13,
            },
            {
              type: 4,
              start: 17,
              length: 13,
            },
            {
              type: 5,
              start: 30,
              length: 7,
            },
            {
              type: 4,
              start: 30,
              length: 7,
            },
          ],
        },
      },
      {
        name: 'Overlapping bold and strikethrough',
        input: '**Bold ~~strikethrough~~ text**',
        expected: {
          finalText: 'Bold strikethrough text',
          display: [
            {
              type: 4,
              start: 0,
              length: 5,
            },
            {
              type: 4,
              start: 5,
              length: 13,
            },
            {
              type: 9,
              start: 5,
              length: 13,
            },
            {
              type: 4,
              start: 18,
              length: 5,
            },
          ],
        },
      },
    ])('$name', ({ input, expected }) => {
      const result = getDisplays(processChatInputString(input))
      expect(result).toEqual(expected)
    }))

  describe('Test inline codespan', () => {
    test.each([
      {
        name: 'Single codespan enclosed in backticks',
        input: '`inline code`',
        expected: {
          finalText: 'inline code',
          display: [
            {
              type: 6,
              start: 0,
              length: 11,
            },
          ],
        },
      },
      {
        name: 'Unclosed codespan with single backtick',
        input: '`inline code',
        expected: {
          finalText: '`inline code',
          display: [],
        },
      },
      {
        name: 'Codespan with leading and trailing spaces is trimmed',
        input: '` inline code `',
        expected: {
          finalText: 'inline code',
          display: [
            {
              type: 6,
              start: 0,
              length: 11,
            },
          ],
        },
      },
      {
        name: 'Nested codespan within bold text',
        input: '**bold `inline code` text**',
        expected: {
          finalText: 'bold inline code text',
          display: [
            {
              type: 4,
              start: 0,
              length: 5,
            },
            {
              type: 4,
              start: 5,
              length: 11,
            },
            {
              type: 6,
              start: 5,
              length: 11,
            },
            {
              type: 4,
              start: 16,
              length: 5,
            },
          ],
        },
      },
      {
        name: 'Adjacent codespan elements',
        input: '`inline1``inline2`',
        expected: {
          finalText: 'inline1``inline2',
          display: [
            {
              type: 6,
              start: 0,
              length: 16,
            },
          ],
        },
      },
      {
        name: 'Backticks in codespan content',
        input: '``inline `nested` code``',
        expected: {
          finalText: 'inline `nested` code',
          display: [
            {
              type: 6,
              start: 0,
              length: 20,
            },
          ],
        },
      },
      {
        name: 'Codespan adjacent to plain text',
        input: 'plain `inline code` text',
        expected: {
          finalText: 'plain inline code text',
          display: [
            {
              type: 6,
              start: 6,
              length: 11,
            },
          ],
        },
      },
    ])('$name', ({ input, expected }) => {
      const result = getDisplays(processChatInputString(input))
      expect(result).toEqual(expected)
    })
  })

  describe('Test codeblock', () => {
    test.each([
      {
        name: 'Leading space is stripped',
        input: '    code\n    block',
        expected: {
          finalText: 'code\nblock',
          display: [],
        },
      },
      {
        name: 'Newlines inside codeblock are untouched',
        input: '```\nCode\nBlock\n```\n\n\nAnother\n\nLine',
        expected: {
          finalText: 'Code\nBlock\n\n\nAnother\n\nLine',
          display: [
            {
              type: 8,
              start: 0,
              length: 10,
            },
          ],
        },
      },
      {
        name: 'Lang tag is treated as part of codeblock contents',
        input: '```Code\nBlock\n```',
        expected: {
          finalText: 'Code\nBlock',
          display: [
            {
              type: 8,
              start: 0,
              length: 10,
            },
          ],
        },
      },
    ])('$name', ({ input, expected }) => {
      const result = getDisplays(processChatInputString(input))
      expect(result).toEqual(expected)
    })
  })

  describe('Test found bugs asana', () => {
    test.each([
      {
        name: 'Unescape character',
        input: `haha i'm sending`,
        expected: {
          finalText: "haha i'm sending",
          display: [],
        },
      },
      {
        name: 'Link with www marked will auto generate https:// but we ignore',
        input: `www.google.com`,
        expected: {
          finalText: 'www.google.com',
          display: [
            {
              type: 2,
              start: 0,
              length: 14,
              content: 'http://www.google.com',
            },
          ],
        },
      },
      {
        name: 'Heading is not parsed',
        input: `### heading`,
        expected: {
          finalText: '### heading',
          display: [],
        },
      },
      {
        name: 'Invalid markdown syntax that produces 0 token still send',
        input: `[Reference]: https://example.com`,
        expected: {
          finalText: '[Reference]: https://example.com',
          display: [],
        },
      },
      {
        name: 'Nested link text should be ignored',
        input: `[**bold** link](https://example.com)`,
        expected: {
          finalText: 'bold link',
          display: [
            {
              type: 2,
              start: 0,
              length: 9,
              content: 'https://example.com',
            },
          ],
        },
      },
      {
        name: 'Single emoji position starts from 0 and not -1',
        input: '👍',
        expected: {
          finalText: '👍️',
          display: [
            {
              type: 7,
              start: 0,
              length: 3,
              content: '+1',
            },
          ],
        },
      },
      {
        name: 'Emoji with multiline incorrect positoning (Previously if \n\n - multi paragraph each paragraph starts from 0. Now it starts from previous paragraph)',
        input: `Qwe :bitcoin::bitcoin:

Asd:bitcoin::bitcoin:

Zxc :bitcoin::bitcoin:`,
        expected: {
          finalText:
            'Qwe bitcoinbitcoin\n\nAsdbitcoinbitcoin\n\nZxc bitcoinbitcoin',
          display: [
            {
              type: 7,
              start: 4,
              length: 7,
              content: 'bitcoin',
            },
            {
              type: 7,
              start: 11,
              length: 7,
              content: 'bitcoin',
            },
            {
              type: 7,
              start: 23,
              length: 7,
              content: 'bitcoin',
            },
            {
              type: 7,
              start: 30,
              length: 7,
              content: 'bitcoin',
            },
            {
              type: 7,
              start: 43,
              length: 7,
              content: 'bitcoin',
            },
            {
              type: 7,
              start: 50,
              length: 7,
              content: 'bitcoin',
            },
          ],
        },
      },
      {
        name: 'Allow raw emoji in link text (Previously unemojify caused long mention length)',
        input: `Hi [@Nick 😎 Android](mention://user/94dqka6etwq4xhsazq84dqfzap3ue9r7poq89aapcarg6a6wsaky) How`,
        expected: {
          finalText: 'Hi @Nick 😎 Android How',
          display: [
            {
              type: 1,
              start: 3,
              length: 16,
              memberId: '94dqka6etwq4xhsazq84dqfzap3ue9r7poq89aapcarg6a6wsaky',
            },
          ],
        },
      },
      {
        name: 'Link with uri text will link to correct url',
        input: `[www.google.com](https://www.bbc.co.uk)`,
        expected: {
          finalText: 'www.google.com',
          display: [
            {
              type: 2,
              start: 0,
              length: 14,
              content: 'https://www.bbc.co.uk',
            },
          ],
        },
      },
      {
        name: 'Email will not be mangled and ignore email parsing',
        input: `asd@asd.com`,
        expected: {
          finalText: 'asd@asd.com',
          display: [],
        },
      },
      {
        name: 'All new line input by user will be preserved and not being treated as paragraph ending',
        input: `Qwe *aaa*\n1. qwe\n2. qwe`,
        expected: {
          finalText: 'Qwe aaa\n1. qwe\n2. qwe',
          display: [{ length: 3, start: 4, type: 5 }],
        },
      },
    ])('$name', ({ input, expected }) => {
      const result = getDisplays(processChatInputString(input))
      expect(result).toEqual(expected)
    })
  })
})
