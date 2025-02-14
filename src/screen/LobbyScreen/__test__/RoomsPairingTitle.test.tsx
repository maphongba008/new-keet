import { fireEvent, screen } from '@testing-library/react-native'

import { APPIUM_IDs } from 'lib/appium'
import { navigate } from 'lib/navigation'
import { renderWithProviders } from 'lib/testUtils'

import RoomsPairingTitle from '../RoomsPairing.Title'

jest.mock('lib/navigation', () => ({
  ...jest.requireActual('lib/navigation'),
  navigate: jest.fn(),
}))

describe('RoomPairingTitle', () => {
  it('render correctly', async () => {
    const element = <RoomsPairingTitle />
    renderWithProviders(element, {
      preloadedState: {
        room: {
          joint: {
            pairing: {
              all: [{ id: '1' }],
            },
          },
        },
      },
    })
    expect(screen.toJSON()).toMatchSnapshot()
    fireEvent.press(screen.getByTestId(APPIUM_IDs.lobby_joining_rooms))
    expect(navigate).toHaveBeenCalledWith('pairing-rooms')
  })
  it('render correctly with no rooms pairing', async () => {
    const element = <RoomsPairingTitle />
    renderWithProviders(element, {
      preloadedState: {
        room: {
          joint: {
            pairing: {
              all: [],
            },
          },
        },
      },
    })
    expect(screen.toJSON()).toMatchSnapshot()
  })
})
