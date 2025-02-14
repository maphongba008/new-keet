import _truncate from 'lodash/truncate'

import { emojify, getEmojiData } from '@holepunchto/emojis'
import { CHAT_MESSAGE_FORMAT } from '@holepunchto/keet-store/store/chat'

import { EmojiData } from 'component/AppBottomSheet/SheetComponents/ChatEventOptionsSheet/components/EmojiSheet'

// The longest possible generated name is 35 characters (Magnificent African Forest Elephant)
// but that exceed some phone screen the width
const PROFILE_NAME_MAX_LENGTH = 25

export function getTruncatedName(fullName: string): string {
  return _truncate(fullName, { length: PROFILE_NAME_MAX_LENGTH })
}

export enum ChatAttachmentKind {
  IMAGE,
  VIDEO,
  DOC,
  AUDIO,
}

export type ChatAttachment = {
  uri: string
  key: string
  kind: ChatAttachmentKind
  fetchingThumb?: boolean
  onClear?: () => void
  onThumbFetched?: () => void
} & (
  | {
      kind: ChatAttachmentKind.IMAGE
      gif?: boolean
    }
  | {
      kind: ChatAttachmentKind.VIDEO
      gif?: boolean
    }
  | {
      kind: ChatAttachmentKind.DOC
      name: string
      type: string
    }
  | {
      kind: ChatAttachmentKind.AUDIO
      name?: string
      type: string
    }
)

export const isSingleEmoji = (text: string) => {
  const sanitized = text.trim()
  let data = getEmojiData(sanitized)
  // Test if emoji https://stackoverflow.com/a/64007175
  if (/\p{Extended_Pictographic}/u.test(sanitized) && data) return data
  // Test if custom emoji
  const splitted = text.trim().split(':')
  if (
    splitted?.[1] &&
    splitted?.[0] === '' &&
    splitted?.[2] === '' &&
    splitted.length <= 3
  ) {
    data = getEmojiData(splitted[1])
    if (data) return data
  }
}

export const processEmoji = (markdown: string) => {
  const format = (emoji: string, string: string, emojiData: EmojiData) => {
    if (emojiData.url) {
      return `[](:${string}:)`
    }
    const { alt } = emojiData
    return alt || emoji
  }
  const replacer = (match: string) => emojify(match, format)
  return markdown.replace(/(:.*:)/g, replacer)
}

export const containsNonCustomEmojiChars = (text: string) => {
  const pattern = /\[\]\(:[^:)]+:\)/g
  const cleanedText = text.replace(pattern, '')
  return cleanedText.length > 0
}

export const isDisplayFormat = (format: string | undefined) => {
  return format === CHAT_MESSAGE_FORMAT.DISPLAY
}
