import { useMemo } from 'react'

import { CHAT_BUBBLE_MAX_CHAR } from 'lib/constants'
import { processAppLink } from 'lib/linking'
import { containsNonCustomEmojiChars, processEmoji } from 'lib/messages'

const appendCharacterIfNeeded = (text: string): string => {
  return containsNonCustomEmojiChars(text) ? text : `${text} `
}

export const truncateText = (text: string): string => {
  return text.length > CHAT_BUBBLE_MAX_CHAR
    ? `${text.substring(0, CHAT_BUBBLE_MAX_CHAR)}...`
    : text
}

// isDisplay represents the new rendering format, ignoring computation on new display format.
export const useGetProcessedMarkdownText = (
  text: string,
  isDisplay: boolean = false,
) => {
  return useMemo(() => {
    if (!isDisplay) return {}
    // Validate input and handle empty/invalid cases
    if (typeof text !== 'string' || !text.trim()) {
      return { processedMessage: '', truncated: false, textWithLinks: '' }
    }

    const textWithLinks = [
      processEmoji,
      processAppLink,
      appendCharacterIfNeeded,
    ].reduce((result, fn) => fn(result), text)

    const truncated = textWithLinks.length > CHAT_BUBBLE_MAX_CHAR
    const processedMessage = truncateText(textWithLinks)

    // Return processed data
    return { processedMessage, truncated, textWithLinks }
  }, [isDisplay, text])
}
