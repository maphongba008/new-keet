// desktop equivalent https://github.com/holepunchto/keet-desktop/blob/main/src/components/room/room.js
import { useCallback, useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import {
  chatResetToLastMessage,
  getChatMessageCount,
  getChatMessageSeqLoaded,
  getChatMessageStartSeq,
  setChatMessagesInView,
} from '@holepunchto/keet-store/store/chat'
import { isSeqInView } from '@holepunchto/keet-store/store/chat/chat.model.js'

import {
  getIsLoadingLatestMsgSeq,
  setIsLoadingLatestMsgSeq,
} from 'reducers/application'

import { isIOS } from 'lib/platform'
import { InViewOffset } from 'lib/types'

import { useRoomScreenRefContext } from '../ContextProvider/RoomScreenRefProvider'

export const ESTIMATED_ITEM_TO_RENDER = 20
const scrollToBottomTimeout = isIOS ? 0 : 1000

const useScrollToLatestMsg = () => {
  const { scrollToEndDirectly } = useRoomScreenRefContext()
  const dispatch = useDispatch()
  const seqLoaded = useSelector(getChatMessageSeqLoaded)
  const count: number = useSelector(getChatMessageCount)
  const isLoadingLatestMsgSeqTimer = useRef<ReturnType<typeof setTimeout>>()
  const isLoadingLatestMsgSeq = useSelector(getIsLoadingLatestMsgSeq)
  const startSeq = useSelector(getChatMessageStartSeq)

  const scrollToEndMightQuery = useCallback(() => {
    // If latest msg is not loaded
    if (seqLoaded.bottom < count - 1) {
      setIsLoadingLatestMsgSeq(count - 1)

      const sequence: InViewOffset = {
        top: count - ESTIMATED_ITEM_TO_RENDER,
        bottom: count - 1,
      }

      if (isSeqInView(sequence, startSeq)) {
        dispatch(setChatMessagesInView(sequence))
      } else {
        dispatch(chatResetToLastMessage())
      }

      // prevent infinite loading
      clearTimeout(isLoadingLatestMsgSeqTimer.current)
      isLoadingLatestMsgSeqTimer.current = setTimeout(() => {
        dispatch(setIsLoadingLatestMsgSeq(0))
      }, 15000)
    } else {
      scrollToEndDirectly()
    }
  }, [count, dispatch, seqLoaded.bottom, scrollToEndDirectly, startSeq])

  useEffect(() => {
    if (!isLoadingLatestMsgSeq) return

    let timeout: NodeJS.Timeout
    if (
      seqLoaded.top <= isLoadingLatestMsgSeq &&
      isLoadingLatestMsgSeq <= seqLoaded.bottom
    ) {
      timeout = setTimeout(() => {
        scrollToEndDirectly()
        dispatch(setIsLoadingLatestMsgSeq(0))
        clearTimeout(isLoadingLatestMsgSeqTimer.current)
      }, scrollToBottomTimeout)
    }
    return () => clearTimeout(timeout)
  }, [
    count,
    isLoadingLatestMsgSeq,
    scrollToEndDirectly,
    isLoadingLatestMsgSeqTimer,
    seqLoaded,
    dispatch,
  ])

  useEffect(() => {
    return () => {
      clearTimeout(isLoadingLatestMsgSeqTimer.current)
    }
  }, [isLoadingLatestMsgSeq])

  return {
    scrollToEndMightQuery,
  }
}
export default useScrollToLatestMsg
