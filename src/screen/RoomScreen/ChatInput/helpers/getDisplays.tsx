// https://github.com/holepunchto/keet-editor/blob/main/src/editor.js#L51

import { marked } from 'marked'

import { MdToken } from 'lib/markdownTypes'
import { trimNewLines } from 'lib/md'

import { parseMarkdown } from './parseMarkdown'

// Markdown to keet format
export const getDisplays = (originalText: string) => {
  const result = {
    finalText: '',
    display: [] as MdToken[],
  }

  marked.setOptions({
    mangle: false,
  })
  // Disable heading and list tokenization
  marked.use({
    tokenizer: {
      // @ts-ignore
      heading: () => undefined,
      // @ts-ignore
      list: () => undefined,
      // Don't tokenize escapes, we're using raw strings
      // so escape tokenizer results duplicate strings and extra chars
      // @ts-ignore
      escape: () => undefined,
      // @ts-ignore
      blockquote: () => undefined,
    },
  })

  const tokens = marked.lexer(originalText)
  if (tokens.length) {
    parseMarkdown({
      tokens,
      parentTypes: new Set(),
      linkContent: '',
      linkContentRaw: '',
      result,
    })
  } else {
    result.finalText = originalText
  }
  // trim new lines instead of trim() because we could have empty space with display data now
  return { finalText: trimNewLines(result.finalText), display: result.display }
}
