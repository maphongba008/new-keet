// https://github.com/holepunchto/keet-editor/blob/main/src/editor.js#L51

import { unescape as htmlUnescape } from 'html-escaper'

import { MarkdownToken, MarkedTokenType, MdToken } from 'lib/markdownTypes'
import { replaceAndTrackEmojis, trackPearLink } from 'lib/md'

import { getDisplaysParentStyles } from './getDisplaysParentStyles'
import { getDisplaysStandaloneNodes } from './getDisplaysStandaloneNodes'

export const parseMarkdown = ({
  tokens,
  parentTypes,
  linkContent = '',
  linkContentRaw = '',
  result,
}: {
  tokens: MarkdownToken[]
  parentTypes: Set<MarkedTokenType>
  linkContent: string
  linkContentRaw: string
  result: {
    finalText: string
    display: MdToken[]
  }
}) => {
  tokens.forEach((token) => {
    const {
      type: _type,
      raw = '',
      text: _textWithoutMd = '',
      href = '',
      tokens: nestedTokens,
    } = token
    const textWithoutMd = htmlUnescape(_textWithoutMd)

    // Collect and pass tokens down to leaf node
    if (nestedTokens) {
      parseMarkdown({
        tokens: nestedTokens,
        parentTypes: new Set([...parentTypes, _type]),
        linkContent: href,
        linkContentRaw: raw,
        result,
      })
      return
    }

    const start = result.finalText.length
    const length = textWithoutMd.length
    let textToAppend = ''

    if (parentTypes.size > 0) {
      const { _textToAppend, _display } = getDisplaysParentStyles({
        parentTypes,
        start,
        length,
        linkContent,
        linkContentRaw,
        textWithoutMd,
      })
      textToAppend = _textToAppend
      result.display.push(..._display)
    } else {
      textToAppend = textWithoutMd
    }

    const { _textToAppend, _display } = getDisplaysStandaloneNodes({
      type: _type,
      textToAppend,
      start,
      length,
    })
    textToAppend = _textToAppend
    result.display.push(..._display)

    const { finalString: processedEmoji, found: _emojiArr } =
      replaceAndTrackEmojis(textToAppend, start)
    const { finalString: processedPearLink, found: _pearArr } = trackPearLink(
      processedEmoji,
      start,
    )
    result.finalText += processedPearLink
    result.display.push(..._emojiArr, ..._pearArr)
  })
}
