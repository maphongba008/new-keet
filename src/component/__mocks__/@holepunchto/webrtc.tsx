import { Text, View } from 'react-native'

export const HolepunchWebRTCVideoView = (props: Object) => {
  return (
    <View {...props} testID="webrtc_video">
      <Text>HolepunchWebRTCVideoView</Text>
    </View>
  )
}

export const initWebRTC = jest.fn()
export const setInCall = jest.fn()
export const setCurrentCallMuted = jest.fn()
export const setSpeakerOn = jest.fn()
export const getAudioOutput = () => jest.fn()
