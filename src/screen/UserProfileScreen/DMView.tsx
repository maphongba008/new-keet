import { useCallback } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'

import { CALL_STATUS, getCallStatus } from '@holepunchto/keet-store/store/call'
import {
  getDmRoomByMemberId,
  getIsDmSentToMember,
  switchRoomSubmit,
} from '@holepunchto/keet-store/store/room'

import { setJoinCallAtInitial } from 'reducers/application'

import { TextButton, TextButtonType } from 'component/Button'
import SvgIcon from 'component/SvgIcon'
import { colors, createThemedStylesheet, useTheme } from 'component/theme'
import { useOnSendDm } from 'screen/DMRequestsScreen/dm.hooks'
import { useIsDmWaitingForOther } from 'screen/RoomScreen/ChatInput/hooks/useIsDmWaitingForOther'
import { APPIUM_IDs, appiumTestProps } from 'lib/appium'
import s, { UI_SIZE_8, UI_SIZE_16, UI_SIZE_64 } from 'lib/commonStyles'
import { popToPage, SCREEN_ROOM } from 'lib/navigation'
import { MemberType } from 'lib/types'

import { useStrings } from 'i18n/strings'

export const DMView = ({ member }: { member: MemberType }) => {
  const strings = useStrings()
  const styles = getStyles()
  const theme = useTheme()
  const dispatch = useDispatch()
  const callStatus = useSelector(getCallStatus)
  const isDmSent = useSelector(getIsDmSentToMember(member.id))
  const dmRoomId = useSelector(getDmRoomByMemberId(member.id))
  const isDmDisabled = member.isAnonymous && !member.isLocal
  const isDmReceived = !!dmRoomId
  const isDmWaitingForOther = useIsDmWaitingForOther(dmRoomId)

  const mailIcon = useCallback(
    () => <SvgIcon name="mail" color={colors.white_snow} />,
    [],
  )
  const chatIcon = useCallback(
    () => <SvgIcon name="chats" color={colors.white_snow} />,
    [],
  )
  const callIcon = useCallback(
    () => <SvgIcon name="phone" color={colors.white_snow} />,
    [],
  )
  const onPressDMRequest = useOnSendDm(member)

  const onPressCall = useCallback(() => {
    dispatch(switchRoomSubmit({ roomId: dmRoomId }))
    dispatch(setJoinCallAtInitial(true))
    popToPage(SCREEN_ROOM)
  }, [dispatch, dmRoomId])

  const onPressChat = useCallback(() => {
    dispatch(switchRoomSubmit({ roomId: dmRoomId }))
    popToPage(SCREEN_ROOM)
  }, [dispatch, dmRoomId])

  if (isDmSent || isDmReceived) {
    return (
      <View style={s.row}>
        <TextButton
          {...appiumTestProps(APPIUM_IDs.user_profile_chat)}
          text={strings.chat.chat}
          type={TextButtonType.gray}
          icon={chatIcon}
          style={[styles.button, s.container]}
          onPress={onPressChat}
        />
        <TextButton
          {...appiumTestProps(APPIUM_IDs.user_profile_call)}
          disabled={callStatus === CALL_STATUS.JOINED || isDmWaitingForOther}
          text={strings.call.call}
          type={TextButtonType.gray}
          icon={callIcon}
          style={[styles.button, styles.callButton, s.container]}
          onPress={onPressCall}
        />
      </View>
    )
  }
  return (
    <>
      <TextButton
        {...appiumTestProps(APPIUM_IDs.user_profile_send_dm)}
        disabled={isDmDisabled}
        text={strings.chat.dm.dmRequest}
        type={TextButtonType.gray}
        icon={mailIcon}
        style={styles.button}
        onPress={onPressDMRequest}
      />
      {isDmDisabled && (
        <View style={[s.row, styles.noIdContainer]}>
          <SvgIcon
            name="info"
            width={UI_SIZE_16}
            height={UI_SIZE_16}
            color={theme.color.blue_200}
          />
          <Text style={styles.noIdText}>{strings.chat.dm.noId}</Text>
        </View>
      )}
    </>
  )
}

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    button: {
      backgroundColor: theme.color.grey_800,
      marginTop: UI_SIZE_64,
    },
    callButton: {
      marginLeft: UI_SIZE_16,
    },
    noIdContainer: {
      backgroundColor: theme.color.blue_950,
      borderRadius: theme.border.radiusNormal,
      marginTop: UI_SIZE_8,
      paddingHorizontal: UI_SIZE_8,
      paddingVertical: UI_SIZE_8,
    },
    noIdText: {
      color: colors.white_snow,
      flex: 1,
      marginLeft: UI_SIZE_8,
    },
  })
  return styles
})
