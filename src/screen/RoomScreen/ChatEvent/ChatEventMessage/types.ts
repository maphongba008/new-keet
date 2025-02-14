import { ViewStyle } from 'react-native'

import { onLongPressType } from 'screen/RoomScreen/ChatEvents/hooks/useOnLongPressMessage'
import { ChatEventType, ReactionsType } from 'lib/types'

export enum EVENT_MESSAGE_TIMESTAMP_POSITION {
  HEADER,
  NEXT_TO_TEXT_MIDDLE,
  BOTTOM,
}

export interface ChatEventMessageProps {
  reactions: ReactionsType
  local: boolean
  onLongPress: (event: ChatEventType, opts: onLongPressType) => void
  messageEvent?: ChatEventType
  fromPinnedScreen?: boolean
  maxLinkPreviews?: number
}

export interface OnLongPressParams {
  isSkipToEmojiSheet?: boolean
  src?: string
  cleared?: boolean
  byteLength?: number
}

export interface MessageContentI {
  roomId: string
  isFile: any
  isMe: boolean
  messageId: string
  isShortText: boolean
  event: ChatEventType
  reported: boolean
  reportedByMe: boolean
  showOriginMessage: boolean
  onLongPressHandler: () => void
  onPressMessage: (url: string, isMine?: boolean) => void
  includeExtraSpacing?: boolean
}

export interface ChatEventMessageHeaderI {
  memberId: string
  roomId: string
  id: string
  edited: boolean
  event: ChatEventType
}

export interface TimeStampPositionI {
  isMe: boolean
  event: ChatEventType
  isVoiceNote: boolean
  isShortText: boolean
  reported: boolean
  isFromPinnedScreen: boolean
}

export interface ChatEventMessageReplyI {
  replyToId: string
}

export interface MessageMetadataI {
  id: string
  edited: boolean
  event: ChatEventType
  wrapperStyle?: ViewStyle | ViewStyle[]
  inline?: boolean
}
