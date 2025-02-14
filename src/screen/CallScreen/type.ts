import { StyleProp, TextStyle, ViewProps, ViewStyle } from 'react-native'

import { CameraStreamType } from 'lib/hooks/useStream'
import { MemberType } from 'lib/types'

export type CallRouteProp = {
  route: { params: any }
}

export type CallMemberDataType = {
  ids: string[]
  count: number
  memberId: string
  unknownPresenceIds: string[]
  callVideoCount: number
}
export interface CallProps {
  roomId: string
  shouldToggleMicrophoneAtInit?: boolean
}

export type iOSAudioRoute = {
  name: string
  selected?: boolean
  type: string
}

export type CallControlProps = {
  showSpeakerIcon?: boolean
  isPortraitUpOrientation?: boolean
}

export type RoomConfig = { title: string }

export type MemberProps = {
  id: string
  roomId: string
  isSelf: boolean
  unknownMember?: boolean
}

export type CallAllMembersNewProps = {
  roomId: string
  style?: ViewStyle
}

export type CallFirstFourMemberProps = {
  roomId: string
  onShowAllMemberPress?: (value: boolean) => void
}

export type RenderCallMemberProps = {
  isSelf?: boolean
  small?: boolean
  memberNameLeftAlign?: boolean
  memberNameCenterAlign?: boolean
  border?: boolean
  viewWidth?: number
  cameraStream: CameraStreamType
}

export type CallSharedScreenProps = {
  roomId: string
  streamTrackId: string
  streamMemberId: string
}

export type CallMemberNameProps = {
  unknownMember?: boolean
  isMuted?: boolean
  member: MemberType
  isSelf?: boolean
  showMyName?: boolean
  leftAlign?: boolean
  centerAlign?: boolean
  style?: ViewStyle
  textStyle?: TextStyle
  small?: boolean
  viewWidth?: number
  isMemberTagList?: boolean
  roomId: string
}

export type CallMemberProps = {
  roomId: string
  isSelf?: boolean
  unknownMember?: boolean
  style?: ViewProps['style']
  small?: boolean
  disableVideoCall?: boolean
  memberNameLeftAlign?: boolean
  memberNameCenterAlign?: boolean
  border?: boolean
  viewWidth?: number
  cameraStream: CameraStreamType
}

export type CallAllMemberButtonProps = {
  count: number
  onPress: () => void
  style?: ViewProps['style']
}

export type AnimatedMicroIconProps = {
  isSpeaking: boolean
  volume?: number // from 0 to 1, hardcoded to 1 for now until we have volume control
  isMuted: boolean
  style?: StyleProp<ViewStyle>
}
