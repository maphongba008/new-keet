import React from 'react'
import { screen, userEvent } from '@testing-library/react-native'

import { APPIUM_IDs } from 'lib/appium'
import { renderWithProviders } from 'lib/testUtils'

import CallSharedScreen from '../CallSharedScreen'

jest.mock('react-native-reanimated', () => ({
  ...jest.requireActual('react-native-reanimated/mock'),
}))

describe('CallSharedScreen component tests', () => {
  it('renders null with empty stream', () => {
    const element = (
      <CallSharedScreen roomId="" streamTrackId="" streamMemberId="" />
    )
    renderWithProviders(element)
    expect(screen.toJSON()).toMatchSnapshot()
  })

  it('renders with valid stream', () => {
    const element = (
      <CallSharedScreen roomId="" streamTrackId="trackId" streamMemberId="" />
    )
    renderWithProviders(element)
    expect(screen.toJSON()).toMatchSnapshot()
  })

  it('renders with valid stream and expand button press', async () => {
    const element = (
      <CallSharedScreen roomId="" streamTrackId="trackId" streamMemberId="" />
    )
    renderWithProviders(element)
    const expandButton = await screen.findByTestId(
      APPIUM_IDs.call_shared_screen_expand_button,
    )
    expect(expandButton).toBeOnTheScreen()
    const user = userEvent.setup()
    await user.press(expandButton)
    expect(screen.toJSON()).toMatchSnapshot()
  })
})
