// desktop equivalent https://github.com/holepunchto/keet-desktop/blob/main/src/components/call/call.js
import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { View } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import isEqual from 'react-fast-compare'
import { SafeAreaView } from 'react-native-safe-area-context'
import _get from 'lodash/get'

import {
  callVideoQualityUpdate,
  getCallPeerVideoCount,
  getCallSettingsState,
  getMyVideoQuality,
} from '@holepunchto/keet-store/store/call'
import { getRoomItemById } from '@holepunchto/keet-store/store/room'

import { BackButton, NavBar } from 'component/NavBar'
import s from 'lib/commonStyles'
import { MOBILE_CALL_VIDEO_LIMIT_MEMBERS, SAFE_EDGES } from 'lib/constants'
import { useDeepEqualSelector } from 'lib/hooks/useDeepEqualSelector'
import { useCallSharedScreenStream } from 'lib/hooks/useStream'
import { showInfoNotifier } from 'lib/hud'
import { useScreenOrientation } from 'lib/screenOrientation'

import { useStrings } from 'i18n/strings'

import { onToggleMicrophone } from './Call.helpers'
import CallAllMembersNew from './CallAllMembersNew'
import { CallControls, SwapCameraButton } from './CallControls'
import CallFirstFourMember from './CallFirstFourMember'
import CallSharedScreen from './CallSharedScreen'
import { CallProps, CallRouteProp, RoomConfig } from './type'

export const CallScreen = memo(({ route }: CallRouteProp) => {
  const dispatch = useDispatch()
  const { roomId, shouldToggleMicrophoneAtInit = true }: CallProps = _get(
    route,
    'params',
    {},
  )
  const { title }: RoomConfig = useDeepEqualSelector(getRoomItemById(roomId))

  const { isVideoMuted } = useSelector(getCallSettingsState)
  const callPeerVideoCount = useSelector(getCallPeerVideoCount)
  const myVideoQuality = useSelector(getMyVideoQuality)
  const callSharedScreenStream = useCallSharedScreenStream()

  const isVideoLimitReached = useRef(false)

  const [showAllMember, setShowAllMember] = useState(false)
  const { isPortraitUpOrientation } = useScreenOrientation()

  const strings = useStrings()

  // Enable high quality for 1v1 video call. For multiple streams it will crash. So change quality to standard and high based on video stream count.
  useEffect(() => {
    if (isVideoMuted) return
    if (callPeerVideoCount > 1 && myVideoQuality === 2) {
      dispatch(callVideoQualityUpdate(1))
    }
    if (callPeerVideoCount < 2 && myVideoQuality === 1) {
      dispatch(callVideoQualityUpdate(2))
    }
  }, [callPeerVideoCount, dispatch, isVideoMuted, myVideoQuality])

  // Join call with mic turned on
  useEffect(() => {
    if (!shouldToggleMicrophoneAtInit) return

    onToggleMicrophone()
  }, [shouldToggleMicrophoneAtInit])

  useEffect(() => {
    if (
      callPeerVideoCount + (isVideoMuted ? 0 : 1) >=
        MOBILE_CALL_VIDEO_LIMIT_MEMBERS &&
      !isVideoLimitReached.current
    ) {
      showInfoNotifier(strings.call.participantsLimitInfoDisabled, {
        duration: 6000,
      })
      isVideoLimitReached.current = true
    }
  }, [
    callPeerVideoCount,
    isVideoMuted,
    strings.call.participantsLimitInfoDisabled,
  ])

  const navBarTitle = useMemo(() => {
    if (showAllMember) return strings.call.callParticipants

    if (title) return title

    return `${strings.common.loading}...`
  }, [
    showAllMember,
    strings.call.callParticipants,
    strings.common.loading,
    title,
  ])

  const hideAllMembers = useCallback(() => setShowAllMember(false), [])

  const navBarBackButton = useMemo(() => {
    if (showAllMember) {
      return <BackButton overrideOnPress={hideAllMembers} />
    }

    return <BackButton />
  }, [hideAllMembers, showAllMember])

  const navRight = useMemo(() => {
    if (!isVideoMuted) {
      return <SwapCameraButton />
    }

    return null
  }, [isVideoMuted])

  return (
    <>
      <SafeAreaView style={s.container} edges={SAFE_EDGES}>
        <NavBar
          left={navBarBackButton}
          title={navBarTitle}
          middle={null}
          right={navRight}
        />
        <View style={[s.container, !isPortraitUpOrientation && s.row]}>
          {!!callSharedScreenStream && !showAllMember && (
            <CallSharedScreen
              roomId={roomId}
              streamTrackId={callSharedScreenStream.trackId}
              streamMemberId={callSharedScreenStream.memberId}
            />
          )}
          {!callSharedScreenStream && !showAllMember && (
            <CallFirstFourMember
              roomId={roomId}
              onShowAllMemberPress={setShowAllMember}
            />
          )}
          {!!showAllMember && <CallAllMembersNew roomId={roomId} />}
          <CallControls
            isPortraitUpOrientation={isPortraitUpOrientation}
            showSpeakerIcon
          />
        </View>
      </SafeAreaView>
    </>
  )
}, isEqual)
