// https://github.com/holepunchto/keet-editor/blob/main/src/editor.js#L51

import { DISPLAY_TYPES } from '@holepunchto/keet-core-api'

import { MarkedTokenType, MdToken } from 'lib/markdownTypes'

/**
 * Processes standalone or leaf nodes in the Markdown structure:
 * - **Leaf nodes**: Final nodes that do not have children (e.g., 'text', 'codespan', 'escape').
 * - **Standalone nodes**: Independent nodes not involved in nesting (e.g., 'hr', 'br', 'space', 'def', 'code').
 *
 * Modifies the `display` array or modifies `textToAppend` based on the node type.
 */
export const getDisplaysStandaloneNodes = ({
  type,
  textToAppend,
  start,
  length,
}: {
  type: MarkedTokenType
  textToAppend: string
  start: number
  length: number
}) => {
  let _textToAppend = textToAppend
  let _display: MdToken[] = []
  switch (type) {
    case 'space':
      _textToAppend = `${_textToAppend}\n\n`
      break
    case 'codespan':
      _display.push({ type: DISPLAY_TYPES.CODE, start, length })
      break
    case 'code':
      _display.push({ type: DISPLAY_TYPES.CODE_BLOCK, start, length })
      _textToAppend = `${_textToAppend}\n`
      break
    case 'html':
      if (textToAppend === '<br>') {
        _textToAppend = `\n`
      }
      break
    default:
      break
  }
  return { _textToAppend, _display }
}
