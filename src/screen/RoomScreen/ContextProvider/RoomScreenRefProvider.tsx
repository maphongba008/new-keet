import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useRef,
} from 'react'
import { FlatList } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'

import {
  getChatMessageCount,
  setChatMessagesInView,
} from '@holepunchto/keet-store/store/chat'

import { INVIEW_ITEMS_COUNT } from 'lib/constants'
import { ChatEventType, FlatListContextType } from 'lib/types'

// Sharing of ref and callbacks. State sharing will trigger rerenders, so we limit on that
export type RoomScreenRefContextType = {
  flatListRef: FlatListContextType
  scrollToEndDirectly: () => void
}

const RoomScreenRefContext = createContext<RoomScreenRefContextType>(
  {} as RoomScreenRefContextType,
)

export const RoomScreenRefProvider: React.FC<{
  children: ReactNode
}> = ({ children }) => {
  const flatListRef = useRef<FlatList<ChatEventType>>(null)
  const count = useSelector(getChatMessageCount)
  const dispatch = useDispatch()
  const scrollToEndDirectly = useCallback(() => {
    const bottom = count - 1
    const top = Math.max(bottom - INVIEW_ITEMS_COUNT, 0)
    dispatch(setChatMessagesInView({ bottom, top }))
    flatListRef?.current?.scrollToOffset({ offset: 0, animated: true })
  }, [count, dispatch])

  const value = useMemo(
    () => ({
      flatListRef,
      scrollToEndDirectly,
    }),
    [scrollToEndDirectly],
  )

  return (
    <RoomScreenRefContext.Provider value={value}>
      {children}
    </RoomScreenRefContext.Provider>
  )
}

export const useRoomScreenRefContext = () => {
  return useContext(RoomScreenRefContext)
}
