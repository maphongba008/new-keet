import { screen, userEvent } from '@testing-library/react-native'

import { getCoreBackend } from '@holepunchto/keet-store/backend'
import { roomSlice } from '@holepunchto/keet-store/store/room'

import CallsToggle from 'screen/RoomScreen/RoomOptions/CallsToggle'
import { APPIUM_IDs } from 'lib/appium'
import { renderWithProviders } from 'lib/testUtils'

import { getStrings } from 'i18n/strings'

describe('Test callsToggle component', () => {
  const roomId = 'testId'
  it('Call toggle should have disabled if canCall is false', async () => {
    const strings = getStrings()
    const element = <CallsToggle roomId={roomId} />
    renderWithProviders(element)
    const blockedIcon = await screen.findByTestId('svg-icon-phoneSlash')
    expect(blockedIcon).toBeOnTheScreen()
    expect(screen.queryByRole('text')).toHaveTextContent(
      strings.room.callDisabled,
    )
  })

  it('Call toggle should be enabled if canCall is true', async () => {
    const strings = getStrings()
    const initialState = {
      preloadedState: {
        [roomSlice.name]: {
          ...roomSlice.getInitialState(),
          roomById: {
            [roomId]: {
              canCall: 'true',
            },
          },
        },
      },
    }
    const element = <CallsToggle roomId={roomId} />
    renderWithProviders(element, initialState)
    const subscribedIcon = await screen.findByTestId('svg-icon-phoneFilled')
    expect(subscribedIcon).toBeOnTheScreen()
    expect(screen.queryByRole('text')).toHaveTextContent(
      strings.room.callEnabled,
    )
  })

  it('Check if able to toggle the button', async () => {
    const initialState = {
      preloadedState: {
        [roomSlice.name]: {
          ...roomSlice.getInitialState(),
          roomById: {
            [roomId]: {
              canCall: 'true',
            },
          },
        },
      },
    }
    const element = <CallsToggle roomId={roomId} />
    renderWithProviders(element, initialState)
    const updateConfigSpy = jest.spyOn(getCoreBackend(), 'updateConfig')
    const user = userEvent.setup()
    const button = screen.getByTestId(APPIUM_IDs.options_btn_toggle_call)
    await user.press(button)
    expect(updateConfigSpy).toHaveBeenCalledWith('testId', 'canCall', 'false')
  })
})
