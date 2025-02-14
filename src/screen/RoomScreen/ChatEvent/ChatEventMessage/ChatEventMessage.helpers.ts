import _isEmpty from 'lodash/isEmpty'

import { DISPLAY_TYPES } from '@holepunchto/keet-core-api'

import { ChatEventType } from 'lib/types'

import { EVENT_MESSAGE_TIMESTAMP_POSITION, TimeStampPositionI } from './types'

export const getLinkPreviews = (event: ChatEventType) => {
  const { display } = event.chat || {}
  const httpLinks = display?.filter(
    (dp) => dp.preview && dp.type === DISPLAY_TYPES.HTTP_LINK,
  )
  const pearLinks = display?.filter(
    (dp) => dp.preview && dp.type === DISPLAY_TYPES.PEAR_LINK,
  )
  return { httpLinks, pearLinks }
}

export const hasLinkPreviews = (event: ChatEventType) => {
  const { httpLinks, pearLinks } = getLinkPreviews(event)
  return !_isEmpty(httpLinks) || !_isEmpty(pearLinks)
}

export const getTimeStampPosition = ({
  isMe,
  event,
  reported,
  isVoiceNote,
  isShortText,
  isFromPinnedScreen,
}: TimeStampPositionI) => {
  const { deleted, isHead } = event

  if (isHead && !isMe) {
    return EVENT_MESSAGE_TIMESTAMP_POSITION.HEADER
  }

  if (isShortText || (isMe && isVoiceNote) || deleted || reported) {
    return EVENT_MESSAGE_TIMESTAMP_POSITION.NEXT_TO_TEXT_MIDDLE
  }

  if ((isMe || (!isMe && !isHead)) && !isFromPinnedScreen) {
    return EVENT_MESSAGE_TIMESTAMP_POSITION.BOTTOM
  }

  return EVENT_MESSAGE_TIMESTAMP_POSITION.NEXT_TO_TEXT_MIDDLE
}
