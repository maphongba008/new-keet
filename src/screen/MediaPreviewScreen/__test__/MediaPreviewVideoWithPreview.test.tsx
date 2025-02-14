import { MutableRefObject } from 'react'
import { screen, userEvent, waitFor } from '@testing-library/react-native'
import { useVideoPlayer } from 'expo-video'

import { APPIUM_IDs } from 'lib/appium'
import { parseURLToGetKey } from 'lib/media'
import { renderWithProviders } from 'lib/testUtils'

import { MediaPreviewVideoControls } from '../MediaPreviewVideo'
import { MediaPreviewVideoWithPreview } from '../MediaPreviewVideoWithPreview'

jest.mock('expo-video', () => {
  const React = require('react')
  return {
    VideoPlayer: jest.fn(),
    useVideoPlayer: jest.fn().mockReturnValue({
      muted: false,
      loop: false,
      play: jest.fn(),
      addListener: jest.fn().mockReturnValue({
        remove: jest.fn(),
      }),
    }),
    VideoView: React.forwardRef(() => <div />),
  }
})

type MakeSutProps = {
  showControls: boolean
}

describe('MediaPreviewVideoWithPreview', () => {
  function makeSut(props?: Partial<MakeSutProps>) {
    const user = userEvent.setup()
    const mockedUri = '/path/to/video.mp4'
    const videoKey = parseURLToGetKey(mockedUri)
    const videoRefs: MutableRefObject<
      Record<string, MediaPreviewVideoControls>
    > = {
      current: {},
    }

    const element = (
      <MediaPreviewVideoWithPreview
        uri={mockedUri}
        videoRefs={videoRefs}
        showControls={props?.showControls ?? true}
        onLoadEnd={jest.fn()}
      />
    )

    renderWithProviders(element)
    return { videoRefs, element, videoKey, user }
  }

  it('should display video components and register listeners correctly', () => {
    makeSut()

    const videoElement = screen.getByTestId(APPIUM_IDs.media_preview_video_view)
    expect(videoElement).toBeOnTheScreen()
  })

  it('should add listeners for video player correctly', async () => {
    const mockedListener = jest.fn().mockReturnValue({ remove: jest.fn() })

    ;(useVideoPlayer as unknown as jest.Mock).mockReturnValue({
      muted: false,
      loop: false,
      play: jest.fn(),
      addListener: mockedListener,
    })

    const { user } = makeSut()

    const playControl = screen.getByTestId(
      APPIUM_IDs.media_preview_btn_custom_play,
    )

    await user.press(playControl)

    expect(mockedListener).toHaveBeenCalledWith(
      'statusChange',
      expect.anything(),
    )
    expect(mockedListener).toHaveBeenCalledWith('playToEnd', expect.anything())
  })

  it('should show loading indicator when video is pressed to play', async () => {
    const { user } = makeSut()

    const playControl = screen.getByTestId(
      APPIUM_IDs.media_preview_btn_custom_play,
    )

    await user.press(playControl)

    await waitFor(() => {
      const loadingIndicator = screen.getByTestId(
        APPIUM_IDs.media_preview_loading,
      )

      expect(loadingIndicator).toBeOnTheScreen()
    })
  })
})
