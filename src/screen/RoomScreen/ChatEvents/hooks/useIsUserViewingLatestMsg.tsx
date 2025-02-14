import { useCallback, useEffect, useRef } from 'react'
import { NativeScrollEvent, NativeSyntheticEvent } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'

import {
  getChatMessageCount,
  getChatMessageInitialCache,
  getChatMessageSeqLoaded,
  getChatMessagesInView,
} from '@holepunchto/keet-store/store/chat'

import { getIsHistoryMode, setIsHistoryMode } from 'reducers/application'

/**
 * Hook to track isHistoryMode
 * - isHistoryMode true only when user is actively scrolling to view history.
 * - isHistoryMode false if the bottom of the list is showing the latest message.
 *
 * ## Use Case:
 * - When a new message arrives and appends to the bottom:
 *   1. If isHistoryMode, we show (1 New Message) anchor
 *   2. If !isHistoryMode, we append and auto scroll to received msg for user
 *
 * This behavior prevents disruptive auto-scrolling when the user is reading past messages.
 */
const useIsUserViewingLatestMsg = () => {
  const dispatch = useDispatch()
  const count = useSelector(getChatMessageCount)
  const seqLoaded = useSelector(getChatMessageSeqLoaded)
  const initialCache = useSelector(getChatMessageInitialCache)
  const isHistoryMode = useSelector(getIsHistoryMode)
  const inView = useSelector(getChatMessagesInView)

  const isUserActivelyScrolling = useRef(false)
  const onScrollBeginDrag = useCallback(() => {
    isUserActivelyScrolling.current = true
  }, [])
  const onScrollEndDrag = useCallback(() => {
    isUserActivelyScrolling.current = false
  }, [])

  const viewingLatestMsg = useCallback(
    (offset: number) => offset <= 50 && count - seqLoaded.bottom < 4,
    [count, seqLoaded.bottom],
  )

  /**
   * - If the user is actively scrolling **away from the latest message**, we update state to isHistoryMode true
   * - If they are close to the bottom or the list is programatically jump to the bottom, we set isHistoryMode false
   */
  const onScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (initialCache) return
      const offset = e.nativeEvent.contentOffset.y

      if (
        isUserActivelyScrolling.current &&
        !viewingLatestMsg(offset) &&
        !isHistoryMode
      ) {
        dispatch(setIsHistoryMode(true))
      } else if (viewingLatestMsg(offset) && isHistoryMode) {
        dispatch(setIsHistoryMode(false))
      }
    },
    [dispatch, initialCache, isHistoryMode, viewingLatestMsg],
  )

  // When we call chatResetToLastMessage, it repaint the message list, no scroll happened
  useEffect(() => {
    if (inView.bottom + 1 === count) {
      dispatch(setIsHistoryMode(false))
    }
  }, [count, dispatch, inView.bottom])

  return {
    onScrollBeginDrag,
    onScrollEndDrag,
    onScroll,
  }
}
export default useIsUserViewingLatestMsg
