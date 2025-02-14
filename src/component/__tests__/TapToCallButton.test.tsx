import { screen, userEvent } from '@testing-library/react-native'

import { appSlice } from '@holepunchto/keet-store/store/app'
import {
  INITIAL_STATE as CALL_INITIAL_STATE,
  CALL_STATE_KEY,
} from '@holepunchto/keet-store/store/call'

import TapToCallButton from 'component/TapToCallButton'
import { APPIUM_IDs } from 'lib/appium'
import { renderWithProviders } from 'lib/testUtils'

import { getStrings } from 'i18n/strings'

import * as Navigation from '../../lib/navigation'

jest.mock('@react-navigation/native', () => {
  const navigationCore = jest.requireActual('@react-navigation/native')
  return {
    ...navigationCore,
    useIsFocused: () => true,
    useFocusEffect: () => jest.fn(),
  }
})

describe('TapToCallButton tests', () => {
  const roomId = 'testRoomId'
  const initialState = {
    preloadedState: {
      [appSlice.name]: {
        ...appSlice.getInitialState(),
        currentCallRoomId: roomId,
      },
      [CALL_STATE_KEY]: {
        ...CALL_INITIAL_STATE,
        status: 'JOINED',
      },
    },
  }

  it('Button should not be shown if call not joined or not focused', () => {
    const element = <TapToCallButton />
    renderWithProviders(element)
    expect(screen.toJSON()).toBe(null)
  })

  it('Button should be shown if call joined', async () => {
    const strings = getStrings()
    const element = <TapToCallButton />
    renderWithProviders(element, initialState)
    const button = screen.getByTestId(APPIUM_IDs.lobby_tap_to_call)
    expect(button).toHaveTextContent(strings.call.tapToCall)
    // TODO: fix the workaround
    // expect(button).toHaveAnimatedStyle({ transform: [{ scale: 1 }] })
    // jest.advanceTimersByTime(800)
    // expect(button).toHaveAnimatedStyle({ transform: [{ scale: 0.97 }] })
    // jest.advanceTimersByTime(800)
    // expect(button).toHaveAnimatedStyle({ transform: [{ scale: 1 }] })
  })

  it('Should navigate to call screen on press', async () => {
    const navigationSpy = jest.spyOn(Navigation, 'navigate')
    jest.spyOn(Navigation.navigationRef, 'isReady').mockReturnValue(true)
    const element = <TapToCallButton />
    renderWithProviders(element, initialState)
    const button = screen.getByTestId(APPIUM_IDs.lobby_tap_to_call)
    const user = userEvent.setup()
    await user.press(button)
    expect(navigationSpy).toHaveBeenCalledWith(
      Navigation.SCREEN_ROOM_CALL,
      expect.objectContaining({
        roomId,
      }),
    )
  })
})
