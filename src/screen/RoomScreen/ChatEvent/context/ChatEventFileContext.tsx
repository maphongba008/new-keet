import { createContext, useContext } from 'react'

import { ChatEventFileRaw } from 'lib/types'

export interface ChatEventFileContextValue extends ChatEventFileRaw {
  id: string
}

export const ChatEventFileContext = createContext<ChatEventFileContextValue>(
  {} as ChatEventFileContextValue,
)

export const useChatEventFileContext = () => useContext(ChatEventFileContext)
