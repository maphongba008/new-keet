import { getChatMessageById } from '@holepunchto/keet-store/store/chat'

import { useDeepEqualSelector } from 'lib/hooks/useDeepEqualSelector'
import { ChatEventType } from 'lib/types'

export const useChatEvent = <
  PickedFromChatEvent extends unknown = ChatEventType,
>(
  messageId: string,
  selector?: (chatEvent: ChatEventType) => PickedFromChatEvent,
): PickedFromChatEvent => {
  const event = useDeepEqualSelector((state) => {
    const actualEvent = getChatMessageById(state, messageId) || {}

    if (selector) {
      return selector(actualEvent)
    }

    return actualEvent
  }) as PickedFromChatEvent

  return event
}
