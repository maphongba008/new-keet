import { fireEvent, screen } from '@testing-library/react-native'

import { searchAllRooms } from '@holepunchto/keet-store/store/room'

import { APPIUM_IDs } from 'lib/appium'
import { renderWithProviders } from 'lib/testUtils'

import { RoomSearch } from '../RoomSearch'

const mockDispatchFn = jest.fn()

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: jest.fn().mockImplementation(() => mockDispatchFn),
}))

describe('RoomSearch', () => {
  test('render correctly', async () => {
    const element = <RoomSearch />
    renderWithProviders(element, {
      preloadedState: {},
    })
    expect(screen.toJSON()).toMatchSnapshot()
    fireEvent.changeText(
      screen.getByTestId(APPIUM_IDs.lobby_input_search),
      'search text',
    )
    expect(mockDispatchFn).toHaveBeenCalledWith(searchAllRooms('search text'))
  })
})
