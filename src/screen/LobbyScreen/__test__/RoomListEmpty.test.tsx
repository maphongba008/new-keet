import { renderHook, screen } from '@testing-library/react-native'
import { Provider, useDispatch } from 'react-redux'

import { searchAllRooms } from '@holepunchto/keet-store/store/room'

import { getMockStore, renderWithProviders } from 'lib/testUtils'

import { RoomListEmpty } from '../RoomList.Empty'

describe('RoomListFilter', () => {
  test('render correctly with empty search text', async () => {
    const element = <RoomListEmpty />
    const result = renderWithProviders(element)
    expect(result.toJSON()).toMatchSnapshot()
  })

  test('render correctly with search text', async () => {
    const store = getMockStore()
    const {
      result: { current },
    } = renderHook(() => useDispatch(), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    })
    current(searchAllRooms('search text'))
    const element = <RoomListEmpty />
    const result = renderWithProviders(element)
    const noResultText = await screen.findByText('No rooms to join yet?')
    expect(result.toJSON()).toMatchSnapshot()
    expect(noResultText).toBeDefined()
  })
})
