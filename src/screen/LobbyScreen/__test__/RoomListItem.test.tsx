import { fireEvent, screen } from '@testing-library/react-native'

import { leaveRoomAsk } from '@holepunchto/keet-store/store/room'

import { toggleRoomPushNotificationAction } from 'sagas/pushNotificationsSaga'

import { renderWithProviders } from 'lib/testUtils'

import { RoomListItem } from '../RoomList.Item'

const normalRoom = {
  avatar: null,
  avatarUrl: null,
  avatarUrlCleared: false,
  isOtherProfile: false,
  unread: 0,
  priority: 1728981052130,
  bookmarked: false,
  indexing: true,
  incognito: null,
  hidden: false,
  roomId: 'room1',
  isCache: false,
  isLoaded: false,
  isDebugging: false,
  debugClicks: 10,
  title: 'Keet Room',
  description: '',
  roomType: '0',
  canCall: 'true',
  isCompatible: true,
  experimental: false,
  version: 2,
  latest: true,
  memberCount: 1,
}

const dmRoom = {
  avatar: null,
  avatarUrl: null,
  avatarUrlCleared: false,
  isOtherProfile: false,
  unread: 0,
  priority: 1728981052130,
  bookmarked: false,
  indexing: true,
  incognito: null,
  hidden: false,
  roomId: 'room2',
  isCache: false,
  isLoaded: false,
  isDebugging: false,
  debugClicks: 10,
  title: 'Keet Room',
  description: '',
  roomType: '2',
  canCall: 'true',
  isCompatible: true,
  experimental: false,
  version: 2,
  latest: true,
  memberCount: 1,
}

const mockDispatchFn = jest.fn()

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: jest.fn().mockImplementation(() => mockDispatchFn),
}))

describe('RoomItem', () => {
  it('render correctly', async () => {
    const element = (
      <RoomListItem
        roomId={normalRoom.roomId}
        onLongPress={jest.fn()}
        onPress={jest.fn()}
        addRoomFound={jest.fn()}
      />
    )
    renderWithProviders(element, {
      preloadedState: {
        room: {
          roomById: {
            [normalRoom.roomId]: normalRoom,
          },
        },
      },
    })
    expect(screen.toJSON()).toMatchSnapshot()
    // check swipe buttons
    expect(screen.getByText('Leave')).toBeTruthy()
    expect(screen.getByText('Mute')).toBeTruthy()
    // press on Mute
    fireEvent.press(screen.getByText('Mute'))
    expect(mockDispatchFn).toHaveBeenCalledWith(
      toggleRoomPushNotificationAction(normalRoom.roomId),
    )
    // press on Leave
    fireEvent.press(screen.getByText('Leave'))
    expect(mockDispatchFn).toHaveBeenCalledWith(leaveRoomAsk(normalRoom.roomId))
  })

  it('render correctly with dm room', async () => {
    const element = (
      <RoomListItem
        roomId={dmRoom.roomId}
        onLongPress={jest.fn()}
        onPress={jest.fn()}
        addRoomFound={jest.fn()}
      />
    )
    renderWithProviders(element, {
      preloadedState: {
        room: {
          roomById: {
            [dmRoom.roomId]: dmRoom,
          },
        },
      },
    })
    expect(screen.toJSON()).toMatchSnapshot()
    // expect no Delete button with DM room
    expect(screen.queryByText('Delete')).toBeFalsy()
  })
})
