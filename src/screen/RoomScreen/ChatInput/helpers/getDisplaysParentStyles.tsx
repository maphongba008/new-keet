// https://github.com/holepunchto/keet-editor/blob/main/src/editor.js#L51

import { DISPLAY_TYPES } from '@holepunchto/keet-core-api'

import { MarkedTokenType, MdToken } from 'lib/markdownTypes'
import { checkIsMention, convertBackslashes } from 'lib/md'

interface GetDisplaysParentStylesParams {
  parentTypes: Set<MarkedTokenType>
  start: number
  length: number
  linkContent: string
  linkContentRaw: string
  textWithoutMd: string
}

interface GetDisplaysParentStylesResult {
  _textToAppend: string
  _display: MdToken[]
}

export const getDisplaysParentStyles = ({
  parentTypes,
  start,
  length,
  linkContent,
  linkContentRaw,
  textWithoutMd,
}: GetDisplaysParentStylesParams): GetDisplaysParentStylesResult => {
  let _textToAppend = textWithoutMd
  let _display: MdToken[] = []
  parentTypes.forEach((_localType) => {
    switch (_localType) {
      case 'strong':
        _display.push({
          type: DISPLAY_TYPES.BOLD,
          start,
          length,
        })
        break
      case 'em':
        _display.push({
          type: DISPLAY_TYPES.ITALIC,
          start,
          length,
        })
        break
      case 'link': {
        const isMention = checkIsMention(linkContentRaw)
        if (linkContent.startsWith('mailto:')) {
          // We don't support embedding email as link
        } else if (isMention) {
          _display.push({
            type: DISPLAY_TYPES.MENTION,
            start,
            length,
            memberId: isMention.id,
          })
          _textToAppend = `@${convertBackslashes(isMention.label)}`
        } else {
          _display.push({
            type: DISPLAY_TYPES.HTTP_LINK,
            start,
            length,
            content: linkContent,
          })
        }
        break
      }
      case 'del':
        _display.push({
          type: DISPLAY_TYPES.STRIKE_THROUGH,
          start,
          length,
        })
        break
      case 'paragraph':
        break
      case 'list':
        break
      case 'list_item':
        break
      default:
        break
    }
  })
  return { _textToAppend, _display }
}
