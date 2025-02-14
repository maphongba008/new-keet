import React, { memo, useCallback } from 'react'
import { StyleSheet, Text } from 'react-native'
import { useDispatch } from 'react-redux'

import { setAppCurrentRoomId } from '@holepunchto/keet-store/store/app'

import { CALL_ONGOING_DISMISS } from 'reducers/call'

import { closeBottomSheet } from 'component/AppBottomSheet/AppBottomSheet.Store'
import { TextButton, TextButtonType } from 'component/Button'
import { CallButton } from 'component/CallButton'
import { createThemedStylesheet } from 'component/theme'
import { APPIUM_IDs } from 'lib/appium'
import s, { DIRECTION_CODE, UI_SIZE_12, UI_SIZE_14 } from 'lib/commonStyles'
import { addLobbyCallData } from 'lib/localStorage'

import { useStrings } from 'i18n/strings'

export interface CallStartedInterface {
  roomId: string
  title: string
}

const CallStarted = ({ roomId, title }: CallStartedInterface) => {
  const dispatch = useDispatch()
  const styles = getStyles()
  const strings = useStrings()

  const handleJoin = useCallback(async () => {
    dispatch(setAppCurrentRoomId({ roomId }))
    addLobbyCallData({ [roomId]: { joined: true } })
    closeBottomSheet()
  }, [dispatch, roomId])

  const handleDismiss = useCallback(async () => {
    addLobbyCallData({ [roomId]: { dismissed: true } })
    closeBottomSheet()
    dispatch({ type: CALL_ONGOING_DISMISS })
  }, [dispatch, roomId])

  return (
    <>
      <Text style={styles.title}>{strings.lobby.roomActions.callStarted}</Text>
      <Text style={styles.desc}>
        {strings.lobby.roomActions.callDesc}
        <Text style={styles.roomTitle}>{title}</Text>
      </Text>
      <CallButton roomId={roomId} onPress={handleJoin} fromLobby />
      <TextButton
        text={strings.common.dismiss}
        hint={strings.common.dismiss}
        onPress={handleDismiss}
        type={TextButtonType.gray}
        testID={APPIUM_IDs.lobby_btn_create_room}
      />
      <Text style={styles.callPreference}>
        {strings.lobby.roomActions.callPreference}
      </Text>
    </>
  )
}

export default memo(CallStarted)

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    callPreference: {
      ...theme.text.placeholder,
      ...s.textAlignCenter,
      fontSize: UI_SIZE_12,
      marginTop: theme.spacing.large,
    },
    desc: {
      ...theme.text.body,
      fontSize: UI_SIZE_14,
      marginBottom: theme.spacing.large,
      writingDirection: DIRECTION_CODE,
    },
    roomTitle: {
      ...theme.text.bodyBold,
      fontSize: UI_SIZE_14,
      writingDirection: DIRECTION_CODE,
    },
    title: {
      ...theme.text.title,
      marginBottom: theme.spacing.normal,
      writingDirection: DIRECTION_CODE,
    },
  })
  return styles
})
