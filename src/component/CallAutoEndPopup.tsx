import React, { memo, useCallback, useEffect, useMemo } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import { Notifier } from 'react-native-notifier'
import { SafeAreaView } from 'react-native-safe-area-context'

import {
  getAppCurrentCallRoomId,
  getAppCurrentRoomId,
} from '@holepunchto/keet-store/store/app'
import {
  getCallAutoEndCountdown,
  getCallShowAutoEndPopup,
  getCallStatus,
  isCallJoinedMode,
  resetCallAutoEndTimer,
} from '@holepunchto/keet-store/store/call'
import { switchRoomSubmit } from '@holepunchto/keet-store/store/room'

import {
  closeBottomSheet,
  showBottomSheet,
} from 'component/AppBottomSheet/AppBottomSheet.Store'
import BottomSheetEnum from 'component/AppBottomSheet/SheetComponents/BottomSheetEnum'
import s, {
  ICON_SIZE_16,
  UI_SIZE_4,
  UI_SIZE_8,
  UI_SIZE_12,
  UI_SIZE_16,
} from 'lib/commonStyles'
import { useConfig } from 'lib/hooks/useRoom'
import { showInfoNotifier } from 'lib/hud'
import { getCurrentRoute, navigate, SCREEN_ROOM_CALL } from 'lib/navigation'

import { useStrings } from 'i18n/strings'

import { CloseButton } from './CloseButton'
import { RoomAvatarImage } from './RoomAvatarImage'
import SvgIcon from './SvgIcon'
import { colors, createThemedStylesheet } from './theme'

function useCallPanelOpened() {
  const callStatus = useSelector(getCallStatus)
  const isCallJoined = isCallJoinedMode(callStatus)
  const callRoomId = useSelector(getAppCurrentCallRoomId)
  const roomId = useSelector(getAppCurrentRoomId)
  const route = getCurrentRoute()
  return isCallJoined && callRoomId === roomId && route === 'call'
}

function useCountdown() {
  const autoEndCountdown = useSelector(getCallAutoEndCountdown)
  return useMemo(
    () =>
      Math.round((isFinite(autoEndCountdown) ? autoEndCountdown : 0) / 60000),
    [autoEndCountdown],
  )
}

const CallAutoEndPopup = memo(() => {
  const dispatch = useDispatch()
  const callOpened = useCallPanelOpened()
  const showAutoEndPopup = useSelector(getCallShowAutoEndPopup)
  const callRoomId = useSelector(getAppCurrentCallRoomId)
  const { title } = useConfig(callRoomId)

  const onClickNotification = useCallback(() => {
    dispatch(switchRoomSubmit({ roomId: callRoomId }))
    navigate(SCREEN_ROOM_CALL, {
      roomId: callRoomId,
      shouldToggleMicrophoneAtInit: false,
    })
    dispatch(resetCallAutoEndTimer())
  }, [callRoomId, dispatch])

  const onClose = useCallback(() => {
    dispatch(resetCallAutoEndTimer())
  }, [dispatch])

  const showCallAutoEndBottomSheet = showAutoEndPopup && callOpened
  const showCallAutoEndNotification = showAutoEndPopup && !callOpened

  useEffect(() => {
    if (showCallAutoEndBottomSheet) {
      showBottomSheet({
        bottomSheetType: BottomSheetEnum.CallAutoEndPopup,
        bottomSheetOnDismissCallback: onClose,
      })
      return () => closeBottomSheet()
    }
  }, [onClose, showCallAutoEndBottomSheet])

  useEffect(() => {
    if (showCallAutoEndNotification) {
      showInfoNotifier(
        { title: title },
        {
          duration: 0,
          Component: CallAutoEndNotice,
          componentProps: {
            roomId: callRoomId,
          },
          onPress: onClickNotification,
          onHidden: onClose,
        },
      )
      return () => {
        Notifier.hideNotification()
      }
    }
  }, [
    callRoomId,
    onClickNotification,
    onClose,
    showCallAutoEndNotification,
    title,
  ])

  return null
})

interface CallAutoEndNoticeI {
  title: string
  roomId: string
}
const CallAutoEndNotice = ({ title, roomId }: CallAutoEndNoticeI) => {
  const styles = getStyles()
  const strings = useStrings()

  const minutes = useCountdown()

  return (
    <SafeAreaView>
      <View style={styles.container}>
        <RoomAvatarImage roomId={roomId} />
        <View style={styles.content}>
          <View style={s.centerAlignedRow}>
            <Text style={styles.title}>{title}</Text>
            <CloseButton />
          </View>
          <Text style={styles.description}>
            <SvgIcon
              name="phoneFilled"
              color={colors.white_snow}
              width={ICON_SIZE_16}
              height={ICON_SIZE_16}
              style={styles.icon}
            />
            {strings.call.callNoActivityNotice.replace('$0', String(minutes))}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  )
}

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    container: {
      ...s.row,
      backgroundColor: theme.color.bg3,
      borderRadius: UI_SIZE_16,
      margin: UI_SIZE_12,
      padding: UI_SIZE_16,
    },
    content: {
      ...s.container,
      paddingLeft: UI_SIZE_8,
    },
    description: {
      ...theme.text.body,
      fontSize: 16,
    },
    icon: {
      marginRight: UI_SIZE_4,
    },
    title: {
      ...s.container,
      ...theme.text.bodySemiBold,
      fontSize: 16,
      marginBottom: UI_SIZE_4,
    },
  })
  return styles
})

export default CallAutoEndPopup
