import { fireEvent, screen } from '@testing-library/react-native'
import { View } from 'react-native'

import { SHOW_ROOM_FILTER } from 'lib/build.constants'
import { renderWithProviders } from 'lib/testUtils'

import { RoomListFilter } from '../RoomList.Filter'

;(SHOW_ROOM_FILTER ? describe : describe.skip)('RoomListFilter', () => {
  test('render correctly', async () => {
    jest
      .mocked(View.prototype.measure)
      .mockImplementation((callback) => callback(0, 0, 0, 0, 0, 0))
    const element = <RoomListFilter />
    renderWithProviders(element, {
      preloadedState: {
        room: {
          list: {
            actualRoomIds: ['room1'],
            allRoomIds: ['room1'],
            roomTypesFilter: [0],
          },
        },
      },
    })
    expect(screen.toJSON()).toMatchSnapshot()
    // open filter
    fireEvent.press(screen.getByTestId('lobby_filter'))
    // click on group chats
    fireEvent.press(screen.getByTestId('Group Chats'))
    // check if selected value was changed
    expect(screen.getByTestId('lobby_selected_filter')).toHaveTextContent(
      'Group Chats',
    )
    expect(screen.toJSON()).toMatchSnapshot()
  })
})
