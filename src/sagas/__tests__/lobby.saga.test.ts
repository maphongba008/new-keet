import { waitFor } from '@testing-library/react-native'

import {
  roomListInViewIdsChangeEvt,
  setAllRooms,
  setRoomConfig,
} from '@holepunchto/keet-store/store/room'

import { getLobbyUpdating } from 'reducers/application'
import lobbySaga from 'sagas/lobby.saga'

import { getDispatch, getState } from 'lib/store'
import { getMockStoreWithMiddleware } from 'lib/testUtils'

describe('Lobby saga test', () => {
  const { sagaMiddleware } = getMockStoreWithMiddleware()
  const dispatch = getDispatch()
  const rooms = ['room1', 'room2']

  beforeAll(() => {
    jest.useFakeTimers()
  })

  afterAll(() => {
    jest.useRealTimers()
  })

  it('Check updating... is removed if no rooms or search text', () => {
    sagaMiddleware.run(lobbySaga)
    dispatch(setAllRooms([]))
    const isUpdating = getLobbyUpdating(getState())
    expect(isUpdating).toBeFalsy()
  })

  it('Check if updating... is removed when received data from all rooms', () => {
    sagaMiddleware.run(lobbySaga)
    dispatch(setAllRooms(rooms))
    dispatch(roomListInViewIdsChangeEvt(rooms))

    rooms.forEach((roomId) => {
      dispatch(setRoomConfig({ roomId }))
    })

    const isUpdating = getLobbyUpdating(getState())
    expect(isUpdating).toBeFalsy()
  })

  it('Check if updating... is removed when received timedout', async () => {
    sagaMiddleware.run(lobbySaga)
    dispatch(setAllRooms(rooms))
    dispatch(roomListInViewIdsChangeEvt(rooms))

    await waitFor(() => {
      jest.advanceTimersByTime(7000)
    })

    const isUpdating = getLobbyUpdating(getState())
    expect(isUpdating).toBeFalsy()
  })
})
