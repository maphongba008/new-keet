import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import {
  getEditingMessageId,
  sendChatMessageSubmit,
  updateChatMessageSubmit,
} from '@holepunchto/keet-store/store/chat'

import { dismissEditMsgMode } from 'screen/RoomScreen/ChatEventActions'
import { useRoomScreenRefContext } from 'screen/RoomScreen/ContextProvider/RoomScreenRefProvider'
import { processChatInputString } from 'lib/md'
import { LinkPreviewObjectType } from 'lib/uploads'

import { getDisplays } from '../helpers'

type onSendTextType = (
  text: string,
  files: string[] | undefined,
  previewLinks: LinkPreviewObjectType,
  replyMessageId?: string,
) => void

const useOnSendText = () => {
  const dispatch = useDispatch()
  const editingMessageId = useSelector(getEditingMessageId)
  const { scrollToEndDirectly } = useRoomScreenRefContext()

  const onSendText: onSendTextType = useCallback(
    (
      text: string,
      files: string[] | undefined,
      previewLinks: LinkPreviewObjectType = {},
      replyMessageId?: string,
    ) => {
      if (!text.trim().length && !files?.length) {
        return
      }

      const sanitizedText = processChatInputString(text)

      const { finalText, display } = getDisplays(sanitizedText)

      if (editingMessageId) {
        dispatch(
          updateChatMessageSubmit({
            messageId: editingMessageId,
            text: finalText,
            display,
            linkPreviews: previewLinks,
          }),
        )
        dismissEditMsgMode(dispatch)
      } else {
        dispatch(
          sendChatMessageSubmit({
            text: finalText,
            files,
            display,
            linkPreviews: previewLinks,
            replyTo: replyMessageId,
          }),
        )
        scrollToEndDirectly()
      }
    },
    [dispatch, editingMessageId, scrollToEndDirectly],
  )
  return { onSendText }
}

export default useOnSendText
