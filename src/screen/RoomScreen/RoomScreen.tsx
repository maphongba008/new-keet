// desktop equivalent https://github.com/holepunchto/keet-desktop/blob/main/src/components/room/room.js
import React, { memo, useCallback, useEffect } from 'react'
import { StyleSheet, View } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import Animated from 'react-native-reanimated'

import { getAppCurrentRoomId } from '@holepunchto/keet-store/store/app'
import { getMyMemberMuted } from '@holepunchto/keet-store/store/member'

import {
  getJoinCallAtInitial,
  setJoinCallAtInitial,
} from 'reducers/application'

import { TextButton, TextButtonType } from 'component/Button'
import { CallButton } from 'component/CallButton'
import GestureContainer from 'component/GestureContainer'
import { NavBar } from 'component/NavBar'
import RoomNewUserTip from 'component/RoomNewUserTip'
import UnindexedRoomWarning from 'component/UnindexedRoomWarning'
import s, { UI_SIZE_8 } from 'lib/commonStyles'
import withInteractiveKeyboard, {
  InteractiveKeyboardI,
} from 'lib/hoc/withInteractiveKeyboard'
import { usePrevious } from 'lib/hooks'
import { useDeepEqualSelector } from 'lib/hooks/useDeepEqualSelector'
import useKeyboardDismissOnBlur from 'lib/hooks/useKeyboardDismissOnBlur'
import {
  getIsPinMessageEnabled,
  getRoomTypeFlags,
  useCanModerate,
  useConfig,
} from 'lib/hooks/useRoom'
import { useToggleRoomStatStore } from 'lib/localStorage/qaHelpersStorage'
import {
  navigate,
  navReplace,
  SCREEN_ROOM,
  SCREEN_ROOM_OPTIONS,
} from 'lib/navigation'

import { useStrings } from 'i18n/strings'

import ChatEvents from './ChatEvents'
import { ChatInput } from './ChatInput'
import { DmDisabledChatInput } from './ChatInput/DmDisabledChatInput'
import { useIsDmWaitingForOther } from './ChatInput/hooks/useIsDmWaitingForOther'
import useRoomScreenCleanup from './hooks/useRoomScreenCleanup'
import { PinnedMessageHeader } from './Pinned/PinnedMessageHeader'
import { RoomInvitation } from './RoomInvitation'
import RoomScreenTitle from './RoomScreenTitle'
import RoomStats from './RoomStats'

interface RoomScreenI extends InteractiveKeyboardI {
  joinCall: boolean
}

const RoomScreen = ({ joinCall, contentStyle }: RoomScreenI) => {
  const strings = useStrings()
  const dispatch = useDispatch()

  const roomId = useSelector(getAppCurrentRoomId)
  const prevRoomId = usePrevious(roomId)
  const isMemberMuted = useSelector((state) => getMyMemberMuted(state, roomId))
  const joinCallAtInitial = useSelector(getJoinCallAtInitial)

  const { title, roomType, canPost, experimental } = useConfig(roomId)

  const isPinMessageEnabled = useDeepEqualSelector(
    getIsPinMessageEnabled(roomId),
  )

  const isDmDisabled = useIsDmWaitingForOther(roomId)
  const { isChannel, isDm } = getRoomTypeFlags(roomType)
  const canModerate = useCanModerate(roomId)
  const isCallVisible = (!isChannel || canModerate) && !isDmDisabled
  const showInviteOpt = !isDm

  useRoomScreenCleanup()
  useKeyboardDismissOnBlur()

  const isShowRoomStat = useToggleRoomStatStore((state) => state.isShowRoomStat)

  const onPressTitle = useCallback(() => {
    navigate(SCREEN_ROOM_OPTIONS, {
      data: roomId,
    })
  }, [roomId])

  // If user in RoomA clicks on RoomB's url invite, switch to RoomB
  useEffect(() => {
    if ((!!prevRoomId && prevRoomId !== roomId) || joinCallAtInitial) {
      navReplace(SCREEN_ROOM, { joinCall: joinCallAtInitial })
      if (joinCallAtInitial) {
        dispatch(setJoinCallAtInitial(false))
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId, joinCallAtInitial, dispatch])

  return (
    <GestureContainer>
      <NavBar
        showTapToCallButton
        title={
          <RoomScreenTitle
            hideMembers={isDm}
            title={title}
            experimental={experimental}
          />
        }
        onClickTitle={onPressTitle}
        right={
          <>
            <UnindexedRoomWarning />
            {showInviteOpt && <RoomInvitation />}
            {isCallVisible && (
              <CallButton roomId={roomId} joinCall={joinCall} />
            )}
          </>
        }
        style={styles.navbarStyle}
      />
      {isShowRoomStat && <RoomStats />}
      <RoomNewUserTip />
      {isPinMessageEnabled && (
        <PinnedMessageHeader roomId={roomId} roomType={roomType} />
      )}
      <Animated.View style={[s.container, contentStyle]}>
        <View style={s.container}>
          <ChatEvents />
        </View>

        {!canPost || isMemberMuted ? (
          <TextButton
            text={strings.room.messageDisabled}
            type={TextButtonType.disabled}
            style={styles.messageDisabled}
          />
        ) : isDmDisabled ? (
          <DmDisabledChatInput />
        ) : (
          <ChatInput />
        )}
      </Animated.View>
    </GestureContainer>
  )
}

export default withInteractiveKeyboard(memo(RoomScreen))

const styles = StyleSheet.create({
  messageDisabled: {
    marginHorizontal: UI_SIZE_8,
  },
  navbarStyle: {
    paddingBottom: UI_SIZE_8,
  },
})
