import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'

import {
  getChatMessageById,
  getReplyingMessage,
} from '@holepunchto/keet-store/store/chat'

import { isDisplayFormat } from 'lib/messages'

const MAX_REPLY_CHARACTERS_LIMIT = 137

export function useReplyMessageData() {
  const { messageId, memberName } = useSelector(getReplyingMessage)
  const message = useSelector((state) => getChatMessageById(state, messageId))

  const {
    text: messageText = '',
    format,
    styledFragments,
  } = message?.chat || {}

  const [replyMessageText, setReplyMessageText] = useState<string | null>(null)
  const [replyMessageMemberName, setReplyMessageMemberName] = useState('')

  const isDisplay = useMemo(() => isDisplayFormat(format), [format])

  const stripNestedReply = (text: string) => {
    return text.replace(/^>.*:\*{2}.*\n(?:>.*\n)*\n/gm, '')
  }

  // Callback to format the reply message text to trim.
  const formatReplyMessage = useCallback(
    (text: string) => {
      if (!text) return null

      let quotedText = text
        .split('\n')
        .filter((line) => line.length > 0)
        .slice(0, 4)
        .join('\n')

      if (quotedText.length > MAX_REPLY_CHARACTERS_LIMIT) {
        quotedText = quotedText
          ?.substring(0, MAX_REPLY_CHARACTERS_LIMIT)
          .concat('...')
      }

      return quotedText
    },

    // eslint-disable-next-line react-hooks/exhaustive-deps
    [messageText],
  )

  // useEffect to fetch chat message and member data
  useEffect(() => {
    setReplyMessageMemberName(memberName)
    const strippedReply = stripNestedReply(messageText)
    setReplyMessageText(formatReplyMessage(strippedReply))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messageText, memberName, messageId])

  return {
    replyMessageText,
    replyMessageFile: message?.file,
    replyMessageMemberName,
    replyMessageId: messageId,
    isDisplay,
    styledFragments,
  }
}
