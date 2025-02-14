import { fireEvent, renderHook, screen } from '@testing-library/react-native'
import { useNavigation } from '@react-navigation/native'

import { APPIUM_IDs } from 'lib/appium'
import { SCREEN_DM_REQUESTS } from 'lib/navigation'
import { renderWithProviders } from 'lib/testUtils'

import DMRequests from '../DMRequests'

jest.mock('lib/hooks/useIsFeatureSupported', () => ({
  useIsDmSupported: () => {
    return true
  },
}))

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: jest.fn().mockReturnValue({
    navigate: jest.fn(),
  }),
}))
describe('DMRequests', () => {
  test('render correctly', async () => {
    const {
      result: { current },
    } = renderHook(() => useNavigation())
    const element = <DMRequests />
    renderWithProviders(element, {
      preloadedState: {
        room: {
          dm: {
            received: {
              requests: [
                {
                  seq: 0,
                  type: 0,
                  seen: false,
                  roomId: 'roomId',
                  senderId: 'senderId',
                  invitation: 'invitation',
                  message: 'message',
                  timestamp: 1,
                },
                {
                  seq: 1,
                  type: 0,
                  seen: false,
                  roomId: 'roomId1',
                  senderId: 'senderId1',
                  invitation: 'invitation1',
                  message: 'message',
                  timestamp: 2,
                },
              ],
            },
          },
        },
      },
    })
    expect(screen.toJSON()).toMatchSnapshot()
    // test navigate to DM Screen
    const btn = await screen.findByTestId(APPIUM_IDs.lobby_dm)
    fireEvent.press(btn)
    expect(current.navigate).toHaveBeenCalledWith(SCREEN_DM_REQUESTS)
  })
})
