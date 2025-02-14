import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import {
  getChatLastSeenMessageSeq,
  getChatMessageInitialCache,
  getChatMessageUnreadCount,
} from '@holepunchto/keet-store/store/chat'

import { setSessionLastSeenSeq } from 'reducers/application'

import { useDeepEqualSelector } from 'lib/hooks/useDeepEqualSelector'

/**
 * A custom hook to display unread banners at last seen chat msg seq in a session,
 *  dispatch setSessionLastSeenSeq only once ever
 */

const useLastSeenBanner = () => {
  const initialCache = useSelector(getChatMessageInitialCache)
  const lastSeenSeq = useDeepEqualSelector(getChatLastSeenMessageSeq)
  const unreadCount = useDeepEqualSelector(getChatMessageUnreadCount)
  const dispatch = useDispatch()

  useEffect(() => {
    if (!initialCache) {
      dispatch(setSessionLastSeenSeq(unreadCount === 0 ? -1 : lastSeenSeq))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialCache])
}
export default useLastSeenBanner
