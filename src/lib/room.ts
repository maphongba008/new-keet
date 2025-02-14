import { setAppCurrentRoomId } from '@holepunchto/keet-store/store/app'

import { getIsStoreReady } from 'reducers/application'

import { getCurrentRoute, SCREEN_HOME } from './navigation'
import { getDispatch, getState } from './store'

export const resetRoomID = () => {
  const dispatch = getDispatch()
  const isStoreReady = getIsStoreReady(getState())
  const currentRoute = getCurrentRoute()
  if (currentRoute !== SCREEN_HOME) return
  // Will replace with action from store later
  isStoreReady && dispatch(setAppCurrentRoomId({ roomId: '' }))
}
