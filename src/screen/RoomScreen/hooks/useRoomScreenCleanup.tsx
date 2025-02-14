import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useFocusEffect } from '@react-navigation/native'

import { getAppCurrentRoomId } from '@holepunchto/keet-store/store/app'

import { clearRoomPushNotificationAction } from 'sagas/pushNotificationsSaga'

import { useDataAsyncClearCache } from 'lib/hooks'

const useRoomScreenCleanup = () => {
  const roomId: string = useSelector(getAppCurrentRoomId)
  const dispatch = useDispatch()
  useDataAsyncClearCache()

  useFocusEffect(
    useCallback(() => {
      dispatch(clearRoomPushNotificationAction(roomId))
    }, [dispatch, roomId]),
  )
}
export default useRoomScreenCleanup
