import { useEffect } from 'react'
import { useSelector } from 'react-redux'

import { getChatMessageSeqLoaded } from '@holepunchto/keet-store/store/chat'
import { noMessagesLoaded } from '@holepunchto/keet-store/store/chat/chat.model.js'

import { getIsHistoryMode } from 'reducers/application'

import { useRoomScreenRefContext } from 'screen/RoomScreen/ContextProvider/RoomScreenRefProvider'
import { usePrevious } from 'lib/hooks'

export const LIST_RENDER_COMPLETION_DELAY = 0 // approx time for list & list item to finish render

// Auto scroll to bottom when receive new message. Only when user is reading latest message
const useAutoScrollOnNewMessage = () => {
  const isHistoryMode = useSelector(getIsHistoryMode)
  const { scrollToEndDirectly } = useRoomScreenRefContext()

  const seqLoaded = useSelector(getChatMessageSeqLoaded)
  const prevSeqLoaded = usePrevious(seqLoaded)
  useEffect(() => {
    const shouldScrollToLatest =
      !isHistoryMode &&
      !noMessagesLoaded(seqLoaded) &&
      prevSeqLoaded?.bottom !== seqLoaded.bottom

    if (!shouldScrollToLatest) return

    const listTimer = setTimeout(() => {
      scrollToEndDirectly()
    }, LIST_RENDER_COMPLETION_DELAY)

    return () => clearTimeout(listTimer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seqLoaded])
}

export default useAutoScrollOnNewMessage
