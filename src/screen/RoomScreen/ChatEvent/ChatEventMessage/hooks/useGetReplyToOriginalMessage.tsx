import { useEffect, useMemo, useState } from 'react'

import { getChatReplyToMessageById } from '@holepunchto/keet-store/store/chat'

import { useDeepEqualSelector } from 'lib/hooks/useDeepEqualSelector'
import { useMember } from 'lib/hooks/useMember'
import { isDisplayFormat } from 'lib/messages'
import { ChatEventType } from 'lib/types'

export const useGetReplyToOriginalMessage = ({
  roomId,
  replyToId,
}: {
  roomId: string
  replyToId: string
}) => {
  const [replyMemberName, setReplyMemberName] = useState<string>()
  const [replyMessageText, setReplyMessageText] = useState<string>('')
  const [replyMessageEvent, setReplyMessageEvent] = useState<ChatEventType>()

  const replyMessage = useDeepEqualSelector((state) =>
    getChatReplyToMessageById(state, replyToId),
  )
  const { styledFragments: replyStyledFragments, format } =
    replyMessage?.chat || {}
  const replyMessageFile = replyMessage?.file

  const replyIsDisplay = useMemo(() => isDisplayFormat(format), [format])

  const { memberId = '' } = replyMessage || {}
  const { member } = useMember(roomId, memberId)

  useEffect(() => {
    if (!replyMessage) return

    const name = member?.displayName
    name && setReplyMemberName(name)

    const { chat: { text } = {} } = replyMessage
    if (text) {
      setReplyMessageText(text)
    }

    replyMessage && setReplyMessageEvent(replyMessage)
  }, [replyMessage, member])

  return {
    replyMemberName,
    replyMessageText,
    replyMessageFile,
    replyMessageEvent,
    replyStyledFragments,
    replyIsDisplay,
  }
}
