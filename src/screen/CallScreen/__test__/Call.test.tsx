import { screen } from '@testing-library/react-native'
import { useDispatch } from 'react-redux'

import { callVideoQualityUpdate } from '@holepunchto/keet-store/store/call'

import * as constants from 'lib/constants'
import { showInfoNotifier } from 'lib/hud'
import { renderWithProviders } from 'lib/testUtils'

import { getStrings } from 'i18n/strings'

import {
  preloadedStateVideoLimit,
  preloadedStateWithCall,
  preloadedStateWithTwoVideo,
  roomTitle,
  route,
} from './preloadedState'
import { CallScreen } from '../Call'

jest.mock('lib/hud', () => ({
  ...jest.requireActual('lib/hud'),
  showInfoNotifier: jest.fn(),
}))

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: jest.fn(),
}))

describe('Call component tests', () => {
  const mockDispatch = jest.fn()
  ;(useDispatch as unknown as jest.Mock).mockReturnValue(mockDispatch)

  it('Test if call screen rendered correctly', async () => {
    const initialState = { preloadedState: preloadedStateWithCall }
    const element = <CallScreen route={route} />
    renderWithProviders(element, initialState)
    const title = await screen.findByText(roomTitle)
    expect(title).toBeTruthy()
  })

  it('Check if info toast shows if reached maximum participants limit', async () => {
    jest.replaceProperty(constants, 'MOBILE_CALL_VIDEO_LIMIT_MEMBERS', 2)
    const initialState = { preloadedState: preloadedStateVideoLimit }
    const element = <CallScreen route={route} />
    renderWithProviders(element, initialState)
    const strings = getStrings()
    expect(showInfoNotifier).toHaveBeenCalledWith(
      strings.call.participantsLimitInfoDisabled,
      { duration: 6000 },
    )
  })

  it('Check if Video camera swap button is shown if video is tured on', async () => {
    const initialState = { preloadedState: preloadedStateVideoLimit }
    const element = <CallScreen route={route} />
    renderWithProviders(element, initialState)
    const swapIcon = screen.getAllByTestId('svg-icon-cameraRotate')
    expect(swapIcon).toBeTruthy()
  })

  it('Update video quality to high for 1v1 call', async () => {
    const initialState = { preloadedState: preloadedStateVideoLimit }
    const element = <CallScreen route={route} />
    renderWithProviders(element, initialState)
    expect(mockDispatch).toHaveBeenCalledWith(callVideoQualityUpdate(2))
  })

  it('Update video quality to low for more than 2 video streams', async () => {
    const initialState = { preloadedState: preloadedStateWithTwoVideo }
    const element = <CallScreen route={route} />
    renderWithProviders(element, initialState)
    expect(mockDispatch).toHaveBeenCalledWith(callVideoQualityUpdate(1))
  })

  it('Check if all members button is shown', async () => {
    const strings = getStrings()
    const initialState = { preloadedState: preloadedStateWithTwoVideo }
    jest.replaceProperty(constants, 'MOBILE_CALL_VIDEO_LIMIT_MEMBERS', 2)
    const element = <CallScreen route={route} />
    renderWithProviders(element, initialState)
    const viewAllButton = await screen.findByText(
      strings.call.viewAllParticipants,
    )
    expect(viewAllButton).toBeTruthy()
  })
})
