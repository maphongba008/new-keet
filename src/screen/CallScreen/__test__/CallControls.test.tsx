import { screen, userEvent, waitFor } from '@testing-library/react-native'

import {
  callAudioStreamToggle,
  setMyAudioMuted,
  setMyVideoMuted,
} from '@holepunchto/keet-store/store/call'
import * as webrtc from '@holepunchto/webrtc'

import { toggleVideoCallAction } from 'sagas/callSaga'

import { APPIUM_IDs } from 'lib/appium'
import * as callLib from 'lib/call'
import { store } from 'lib/store'
import { renderWithProviders } from 'lib/testUtils'

import { getStrings } from 'i18n/strings'

import {
  preloadedStateWithAudioMuted,
  preloadedStateWithCall,
} from './preloadedState'
import { CallControls } from '../CallControls'

describe('Test call controls component', () => {
  beforeAll(() => {
    jest.useFakeTimers()
  })

  afterAll(() => {
    jest.useRealTimers()
  })

  it('Test Video button functionality', async () => {
    const initialState = { preloadedState: preloadedStateWithCall }
    renderWithProviders(<CallControls />, initialState)
    const dispatchSpy = jest.spyOn(store, 'dispatch')
    const videoButton = screen.getByTestId(APPIUM_IDs.room_call_video)
    const user = userEvent.setup()
    await user.press(videoButton)
    expect(dispatchSpy).toHaveBeenCalledWith(toggleVideoCallAction())
  })

  it('Test if mic is also toggled if video is turned on', async () => {
    const initialState = { preloadedState: preloadedStateWithAudioMuted }
    const { store: storeFromRender } = renderWithProviders(
      <CallControls />,
      initialState,
    )
    await waitFor(() => {
      jest.advanceTimersByTime(1200)
    })
    storeFromRender.dispatch(setMyVideoMuted(true))
    const dispatchSpy = jest.spyOn(store, 'dispatch')
    const videoButton = screen.getByTestId(APPIUM_IDs.room_call_video)
    const user1 = userEvent.setup()
    await user1.press(videoButton)
    expect(dispatchSpy).toHaveBeenCalledWith(callAudioStreamToggle())
    expect(webrtc.setCurrentCallMuted).toHaveBeenCalledWith(false)
  })

  it('Test if mic toggled properly', async () => {
    const initialState = { preloadedState: preloadedStateWithCall }
    const { store: storeFromRender } = renderWithProviders(
      <CallControls />,
      initialState,
    )
    await waitFor(() => {
      jest.advanceTimersByTime(1200)
    })
    const dispatchSpy = jest.spyOn(store, 'dispatch')
    const micButton = screen.getByTestId(APPIUM_IDs.room_call_mute)
    const user = userEvent.setup()
    storeFromRender.dispatch(setMyAudioMuted(false))
    await user.press(micButton)
    expect(dispatchSpy).toHaveBeenCalledWith(callAudioStreamToggle())
    expect(webrtc.setCurrentCallMuted).toHaveBeenCalledWith(true)
  })

  describe('Test Speaker control', () => {
    it('should handle default audio output (speaker and earpiece)', async () => {
      const strings = getStrings()
      const initialState = { preloadedState: preloadedStateWithCall }
      renderWithProviders(<CallControls showSpeakerIcon={true} />, initialState)

      // Mock default audio output
      jest.spyOn(webrtc, 'getAudioOutput').mockResolvedValue({
        type: 'default',
        name: 'default',
      })

      await waitFor(() => {
        jest.advanceTimersByTime(1200)
      })

      const speakerButton = screen.getByTestId(APPIUM_IDs.room_call_speaker)
      const user = userEvent.setup()

      await user.press(speakerButton)

      // Wait for tooltip to appear
      await waitFor(() => {
        expect(webrtc.setSpeakerOn).toHaveBeenCalledWith(true)
      })
      expect(screen.getByText(strings.call.speakerControlSpeaker)).toBeVisible()
    })

    it('should handle bluetooth device', async () => {
      const strings = getStrings()
      const initialState = { preloadedState: preloadedStateWithCall }
      renderWithProviders(<CallControls showSpeakerIcon={true} />, initialState)

      // Mock bluetooth device
      jest.spyOn(webrtc, 'getAudioOutput').mockResolvedValue({
        type: 'bluetooth',
        name: 'bluetooth',
      })

      await waitFor(() => {
        jest.advanceTimersByTime(1200)
      })

      const speakerButton = screen.getByTestId(APPIUM_IDs.room_call_speaker)
      const user = userEvent.setup()

      // First press
      await user.press(speakerButton)

      // Wait for tooltip to appear and verify speaker option
      await waitFor(() => {
        expect(
          screen.getByText(strings.call.speakerControlSpeaker),
        ).toBeVisible()
      })

      // Second press - should show bluetooth
      await user.press(speakerButton)
      await waitFor(() => {
        expect(webrtc.setSpeakerOn).toHaveBeenCalledWith(true)
      })

      // Third press - back to initial state
      await user.press(speakerButton)
      await waitFor(() => {
        expect(webrtc.setSpeakerOn).toHaveBeenCalledWith(false)
      })
    })
  })

  it('Test Hang up control', async () => {
    const initialState = { preloadedState: preloadedStateWithCall }
    renderWithProviders(<CallControls />, initialState)
    await waitFor(() => {
      jest.advanceTimersByTime(1200)
    })
    const dismissSpy = jest.spyOn(callLib, 'dismissCall')
    const hangUpButton = screen.getByTestId(APPIUM_IDs.room_call_end)
    const user = userEvent.setup()
    await user.press(hangUpButton)
    expect(dismissSpy).toHaveBeenCalled()
  })
})
