import { createContext, useContext } from 'react'

import { ChatEventType } from 'lib/types'

export interface ChatEventContextOutput {
  messageId: ChatEventType['id']
}

export const ChatEventContext = createContext<ChatEventContextOutput>(
  {} as ChatEventContextOutput,
)

export const useChatEventContext = () => useContext(ChatEventContext)
