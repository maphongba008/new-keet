import { screen } from '@testing-library/react-native'

import { APPIUM_IDs } from 'lib/appium'
import { renderWithProviders } from 'lib/testUtils'

import { preloadedStateMyVideoDevice, roomId } from './preloadedState'
import CallMember from '../CallMember'

jest.mock('lib/hooks/useMember', () => ({
  useMember: jest.fn().mockImplementation((_, memberId) => ({
    member: {
      avatarUrl: memberId,
      displayName: memberId,
    },
  })),
}))

const props = {
  roomId,
  cameraStream: {
    swarmId: 'testSwarmId',
    memberId: 'member1',
    isVideoMuted: false,
    isAudioMuted: false,
    isStreamPlayable: true,
  },
}

const propsWithStream = {
  ...props,
  isSelf: true,
  cameraStream: {
    ...props.cameraStream,
    stream: {
      getVideoTracks: () => ['track1'],
    },
  },
}

describe('Test if CallMember component', () => {
  it('Check if avatar and member name renders correctly', () => {
    renderWithProviders(<CallMember {...props} />)
    const avatarComponent = screen.getByTestId(APPIUM_IDs.avatar_image)
    expect(avatarComponent).toBeTruthy()
    const textComponent = screen.getByText('member1')
    expect(textComponent).toBeTruthy()
  })

  it('Check if video view is shown if when video enabled', async () => {
    renderWithProviders(<CallMember {...propsWithStream} />)
    const webrtcVideoView = await screen.findByTestId('webrtc_video')
    expect(webrtcVideoView).toBeTruthy()
    expect(webrtcVideoView.props.trackId).toEqual('track1')
  })

  it('Check if webrtc video is mirrored', async () => {
    const initialState = { preloadedState: preloadedStateMyVideoDevice }
    renderWithProviders(<CallMember {...propsWithStream} />, initialState)
    const webrtcVideoView = await screen.findByTestId('webrtc_video')
    expect(webrtcVideoView.props.mirror).toBeTruthy()
  })
})
