import { screen, userEvent, waitFor } from '@testing-library/react-native'

import { APPIUM_IDs } from 'lib/appium'
import { renderWithProviders } from 'lib/testUtils'

import { getStrings } from 'i18n/strings'

import * as Navigation from '../../../lib/navigation'
import CreateChannelDisclaimer from '../CreateChannelDisclaimer'

jest.mock('react-native-safe-area-context', () => ({
  ...jest.requireActual('react-native-safe-area-context'),
  useSafeAreaInsets: jest.fn().mockReturnValue({
    bottom: 0,
  }),
}))

describe('Test CreateChannelDisclaimer Component', () => {
  const strings = getStrings()
  it('CreateChannelDisclaimer component initial render', async () => {
    const element = <CreateChannelDisclaimer />
    renderWithProviders(element)

    const channelRoomSubTitle = await screen.findByText(
      strings.lobby.roomActions.channelAction.disclaimer.subtitle,
    )
    expect(channelRoomSubTitle).toBeOnTheScreen()

    const ruleListText = await screen.findByText(
      strings.lobby.roomActions.channelAction.disclaimer.ruleListTitle,
    )
    expect(ruleListText).toBeOnTheScreen()

    const createButton = await screen.findByTestId(
      APPIUM_IDs.broadcast_btn_create,
    )
    expect(createButton).toBeDisabled()

    expect(screen.toJSON()).toMatchSnapshot()
  })

  it('CreateChannelDisclaimer component to check button enabled after accepting the terms', async () => {
    const element = <CreateChannelDisclaimer />
    renderWithProviders(element)

    const channelRoomSubTitle = await screen.findByText(
      strings.lobby.roomActions.channelAction.disclaimer.subtitle,
    )
    expect(channelRoomSubTitle).toBeOnTheScreen()

    const ruleListText = await screen.findByText(
      strings.lobby.roomActions.channelAction.disclaimer.ruleListTitle,
    )
    expect(ruleListText).toBeOnTheScreen()

    const createButton = await screen.findByTestId(
      APPIUM_IDs.broadcast_btn_create,
    )
    expect(createButton).toBeDisabled()

    const checkBox = await screen.findByTestId(
      APPIUM_IDs.broadcast_accept_admin,
    )
    expect(checkBox).toBeOnTheScreen()

    await userEvent.press(checkBox)

    expect(createButton).toBeEnabled()

    expect(screen.toJSON()).toMatchSnapshot()
  })

  it('CreateChannelDisclaimer component testing navigation on create channel', async () => {
    const navSpy = jest.spyOn(Navigation, 'navReplace')
    const element = <CreateChannelDisclaimer />
    renderWithProviders(element)

    const channelRoomSubTitle = await screen.findByText(
      strings.lobby.roomActions.channelAction.disclaimer.subtitle,
    )
    expect(channelRoomSubTitle).toBeOnTheScreen()

    const ruleListText = await screen.findByText(
      strings.lobby.roomActions.channelAction.disclaimer.ruleListTitle,
    )
    expect(ruleListText).toBeOnTheScreen()

    const createButton = await screen.findByTestId(
      APPIUM_IDs.broadcast_btn_create,
    )
    expect(createButton).toBeDisabled()

    const checkBox = await screen.findByTestId(
      APPIUM_IDs.broadcast_accept_admin,
    )
    expect(checkBox).toBeOnTheScreen()

    await userEvent.press(checkBox)

    expect(createButton).toBeEnabled()

    await userEvent.press(createButton)

    await waitFor(() => {
      expect(navSpy).toHaveBeenCalled()
    })

    expect(screen.toJSON()).toMatchSnapshot()
  })
})
