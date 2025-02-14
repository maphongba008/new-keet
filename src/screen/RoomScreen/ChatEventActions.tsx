import { Dispatch, UnknownAction } from '@reduxjs/toolkit'

import {
  askReplyingMessageCmd,
  clearEditingMessage,
  clearReplyingMessage,
  setEditingMessage,
} from '@holepunchto/keet-store/store/chat'

import { setStorageChatDraft } from 'lib/localStorage'
import { ChatEventType } from 'lib/types'

export const triggerEditMsgMode = (
  dispatch: Dispatch<UnknownAction>,
  roomId: string,
  messageId: ChatEventType['id'],
) => {
  dispatch(
    setEditingMessage({
      messageId,
    }),
  )
  setStorageChatDraft(roomId, '')
}

export const dismissEditMsgMode = (dispatch: Dispatch<UnknownAction>) => {
  dispatch(clearEditingMessage())
}

export const triggerReplyMsgMode = (
  dispatch: Dispatch<UnknownAction>,
  messageId: ChatEventType['id'],
) => {
  dispatch(
    askReplyingMessageCmd({
      messageId,
    }),
  )
}

export const dismissReplyMsgMode = (dispatch: Dispatch<UnknownAction>) => {
  dispatch(clearReplyingMessage())
}
