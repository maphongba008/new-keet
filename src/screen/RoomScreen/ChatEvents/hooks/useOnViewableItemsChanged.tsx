import { useCallback, useEffect, useRef } from 'react'
import { ViewToken } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'

import {
  getChatLastSeenMessageSeq,
  getChatMessageCount,
  getChatMessageSeqLoaded,
  getChatMessagesInView,
  setChatMessageLastSeen,
  setChatMessagesInView,
} from '@holepunchto/keet-store/store/chat'

import { INVIEW_ITEMS_COUNT } from 'lib/constants'
import { InViewOffset } from 'lib/types'

const isTopRendered = (inView: InViewOffset) =>
  inView.top === 0 && inView.bottom < INVIEW_ITEMS_COUNT

const isTopLoaded = (seqLoaded: InViewOffset) =>
  seqLoaded.bottom > 0 && seqLoaded.bottom < INVIEW_ITEMS_COUNT

export function useInViewFallback() {
  /*
   * pretends items are rendered and emits "inView",
   * considering "loaded" messages as "rendered"
   * should work for top-render scenarios only:
   *  - e.g. fresh created room with e.g. 1,7,12 messages - INVIEW_ITEMS_COUNT is the limit
   *  - once we have more items, FlatList will emit
   */
  const seqLoaded = useSelector(getChatMessageSeqLoaded)
  const inView = useSelector(getChatMessagesInView)
  const dispatch = useDispatch()
  useEffect(() => {
    if (
      seqLoaded.top === 0 &&
      seqLoaded.bottom === 0 &&
      inView.top < 0 &&
      inView.bottom < 0
    ) {
      // in-view is empty, single item is rendered - e.g. newly created room has a single "joined" event
      dispatch(setChatMessagesInView({ top: 0, bottom: 0 }))
    } else if (
      isTopRendered(inView) &&
      isTopLoaded(seqLoaded) &&
      inView.bottom < seqLoaded.bottom
    ) {
      // top item is in-view, which indicates no scroll would happen
      dispatch(setChatMessagesInView({ top: 0, bottom: seqLoaded.bottom }))
    }
  }, [inView, seqLoaded, dispatch])
}

export function useLastSeenUpdate() {
  const { bottom } = useSelector(getChatMessagesInView)
  const lastSeenSeq = useSelector(getChatLastSeenMessageSeq)
  const count = useSelector(getChatMessageCount)
  const dispatch = useDispatch()

  useEffect(() => {
    const shouldUpdateLastSeen = bottom > lastSeenSeq && bottom < count
    if (shouldUpdateLastSeen) dispatch(setChatMessageLastSeen(bottom))
  }, [bottom, lastSeenSeq, count, dispatch])
}

const useOnViewableItemsChanged = () => {
  const dispatch = useDispatch()
  const inViewMemo = useRef({ topId: '', btmId: '' })
  /*
   * the problem here is that FlatList emits no updates in case all items are in view currently
   * e.g. the room is just created, with few messages
   */
  useInViewFallback()

  useLastSeenUpdate()

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (!viewableItems?.length) {
        // TODO: no items in view, yet?... or prob nothing is really rendered
        return
      }
      const topId = viewableItems[viewableItems.length - 1]?.item
      const btmId = viewableItems[0]?.item ?? ''
      if (!topId && !btmId) {
        return
      }
      if (
        inViewMemo.current.topId !== topId ||
        inViewMemo.current.btmId !== btmId
      ) {
        inViewMemo.current = { topId, btmId }
        dispatch(setChatMessagesInView({ topId, bottomId: btmId }))
      }
    },
    [dispatch],
  )

  return onViewableItemsChanged
}

export default useOnViewableItemsChanged
