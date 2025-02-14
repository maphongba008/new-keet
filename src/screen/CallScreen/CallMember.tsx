import React, { memo, useEffect, useMemo, useState } from 'react'
import { StyleSheet, useWindowDimensions, View } from 'react-native'
import { useSelector } from 'react-redux'
import isEqual from 'react-fast-compare'
import Reanimated from 'react-native-reanimated'
import _size from 'lodash/size'

import {
  getMyVideoAllowed,
  getMyVideoQuality,
} from '@holepunchto/keet-store/store/call'
import { getVideoDevice } from '@holepunchto/keet-store/store/media'
import { HolepunchWebRTCVideoView } from '@holepunchto/webrtc'

import { FACE_CAM_DEVICE_STATIC_ID } from 'sagas/callSaga'

import { MemberAvatar } from 'component/Avatar'
import { createThemedStylesheet } from 'component/theme'
import s, {
  ICON_SIZE_112,
  UI_SIZE_8,
  UI_SIZE_12,
  UI_SIZE_16,
  UI_SIZE_32,
  UI_SIZE_48,
} from 'lib/commonStyles'
import { BACK_DEBOUNCE_DELAY } from 'lib/constants'
import { useMember } from 'lib/hooks/useMember'

import { AnimatedMicroIcon } from './AnimatedMicroIcon'
import { CallMemberName, CallMemberNameWithIcon } from './CallMemberName'
import { CallMemberProps } from './type'

const CallMember = ({
  roomId,
  isSelf,
  unknownMember,
  style,
  small,
  disableVideoCall,
  memberNameLeftAlign,
  memberNameCenterAlign,
  border,
  viewWidth,
  cameraStream,
}: CallMemberProps) => {
  const { swarmId, memberId, isVideoMuted, isAudioMuted, stream } = cameraStream
  const styles = getStyles()
  const { width: windowWidth } = useWindowDimensions()
  const myVideoQuality = useSelector(getMyVideoQuality)
  const myVideoDevice = useSelector(getVideoDevice)
  const myVideoAllowed = useSelector(getMyVideoAllowed)

  const [streamViewKey, setStreamViewKey] = useState('')
  const { member } = useMember(roomId, memberId || swarmId)

  const isVideoCallEnabled = useMemo(
    () => !disableVideoCall,
    [disableVideoCall],
  )

  const _viewWidth = viewWidth || windowWidth - UI_SIZE_16 * 2

  const toPlayStream =
    isVideoCallEnabled && !isVideoMuted && _size(stream?.getVideoTracks?.()) > 0

  useEffect(() => {
    if (isSelf) {
      const timeout = setTimeout(
        () =>
          setStreamViewKey(
            `${isVideoMuted}${myVideoDevice?.deviceStaticId}${myVideoQuality}${myVideoAllowed}`,
          ),
        BACK_DEBOUNCE_DELAY,
      )
      return () => clearTimeout(timeout)
    }

    const isUnplayableDesktopStream = !isSelf && !cameraStream.isStreamPlayable
    if (isUnplayableDesktopStream) {
      const reloadTimeout = setTimeout(() => {
        setStreamViewKey(`reload-${Date.now()}-${stream?.id}`)
      }, 1000)

      return () => clearTimeout(reloadTimeout)
    }
  }, [
    isSelf,
    cameraStream.isStreamPlayable,
    stream?.id,
    isVideoMuted,
    myVideoDevice?.deviceStaticId,
    myVideoQuality,
    myVideoAllowed,
  ])

  const mirror = useMemo(() => {
    if (isSelf && myVideoDevice?.deviceStaticId === FACE_CAM_DEVICE_STATIC_ID) {
      return true
    }

    if (isSelf && myVideoDevice?.deviceStaticId !== FACE_CAM_DEVICE_STATIC_ID) {
      return false
    }

    return false
  }, [isSelf, myVideoDevice?.deviceStaticId])

  return (
    <Reanimated.View
      style={[styles.member, border && styles.memberWithBorder, style]}
    >
      <View style={[s.container, s.centeredLayout]}>
        {toPlayStream ? (
          <View style={[styles.videoStream, { width: _viewWidth }]}>
            <HolepunchWebRTCVideoView
              key={streamViewKey}
              cover
              trackId={String(stream?.getVideoTracks?.()?.[0])}
              mirror={mirror}
              style={styles.videoStream}
            />
          </View>
        ) : (
          <MemberAvatar
            member={member}
            base64={member?.avatarUrl}
            small={small}
            style={small ? styles.smallAvatar : styles.avatar}
          />
        )}
        {!toPlayStream ? (
          <CallMemberName
            member={member}
            unknownMember={unknownMember}
            isSelf={isSelf}
            centerAlign={memberNameCenterAlign}
            small={small}
            viewWidth={_viewWidth}
            roomId={roomId}
          />
        ) : (
          <CallMemberNameWithIcon
            member={member}
            unknownMember={unknownMember}
            isMuted={isAudioMuted}
            isSelf={isSelf}
            leftAlign={memberNameLeftAlign}
            centerAlign={memberNameCenterAlign}
            small={small}
            viewWidth={_viewWidth}
            roomId={roomId}
          />
        )}
      </View>
      <View
        style={[
          s.centerAlignedRow,
          styles.iconWrapper,
          small && styles.smallIconWrapper,
        ]}
      >
        <AnimatedMicroIcon
          isSpeaking={!!member.isSpeaking}
          isMuted={isAudioMuted}
        />
      </View>
    </Reanimated.View>
  )
}

export default memo(CallMember, isEqual)

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    avatar: {
      borderRadius: UI_SIZE_12,
      height: ICON_SIZE_112,
      width: ICON_SIZE_112,
    },
    iconWrapper: {
      position: 'absolute',
      right: UI_SIZE_12,
      top: UI_SIZE_8,
    },
    member: {
      backgroundColor: theme.color.grey_600,
      borderRadius: UI_SIZE_32,
      flexGrow: 1,
      flex: 1,
      marginBottom: UI_SIZE_16,
      marginHorizontal: UI_SIZE_8,
    },
    memberWithBorder: {
      borderColor: theme.border.color,
      borderWidth: theme.border.width,
    },
    smallAvatar: {
      borderRadius: UI_SIZE_8,
      height: UI_SIZE_48,
      width: UI_SIZE_48,
    },
    smallIconWrapper: {
      right: UI_SIZE_8,
    },
    videoStream: {
      ...s.container,
      borderRadius: UI_SIZE_32,
      overflow: 'hidden',
    },
  })
  return styles
})
