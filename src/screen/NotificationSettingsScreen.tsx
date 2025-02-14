import React, { useCallback } from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import { SafeAreaView } from 'react-native-safe-area-context'

import { setAppNotificationsType } from '@holepunchto/keet-store/store/app'
import {
  getPreferencesNotificationsType,
  NOTIFICATIONS_TYPES,
} from '@holepunchto/keet-store/store/preferences'

import { NavBar } from 'component/NavBar'
import { createThemedStylesheet } from 'component/theme'
import s, { UI_SIZE_8, UI_SIZE_12, UI_SIZE_16 } from 'lib/commonStyles'
import { SAFE_EDGES } from 'lib/constants'

import { useStrings } from 'i18n/strings'

const Row = ({
  id,
  text,
  onPress,
  hasBorderTop,
  checked,
}: {
  id: string
  text: string
  checked: boolean
  hasBorderTop: boolean
  onPress: (id: string) => void
}) => {
  const styles = getStyles()

  const onPressButton = useCallback(() => onPress(id), [id, onPress])

  return (
    <TouchableOpacity
      onPress={onPressButton}
      style={[styles.rowContainer, hasBorderTop && styles.borderTop]}
    >
      <Text style={styles.rowText}>{text}</Text>
      <View style={s.container} />
      <View style={styles.checkBox}>
        {checked && <View style={styles.checkBoxChecked} />}
      </View>
    </TouchableOpacity>
  )
}

export const NotificationSettingsScreen = () => {
  const strings = useStrings()
  const styles = getStyles()
  const dispatch = useDispatch()
  const notificationsType = useSelector(getPreferencesNotificationsType)
  const notificationOptions = [
    {
      id: NOTIFICATIONS_TYPES.ALL,
      text: strings.notifications.allMessages,
    },
    {
      id: NOTIFICATIONS_TYPES.MENTIONS,
      text: strings.notifications.onlyWhenMentioned,
    },
    {
      id: NOTIFICATIONS_TYPES.NONE,
      text: strings.notifications.muteAll,
    },
  ]
  const setNotificationType = React.useCallback(
    (type: string) => {
      dispatch(setAppNotificationsType(type))
    },
    [dispatch],
  )
  return (
    <>
      <SafeAreaView style={s.container} edges={SAFE_EDGES}>
        <NavBar title={strings.account.notifications} />
        <View style={styles.container}>
          <Text style={styles.sectionTitle}>
            {strings.notifications.pushNotifications}
          </Text>
          <View style={styles.section}>
            {notificationOptions.map((option, index) => (
              <Row
                key={option.id}
                id={option.id}
                text={option.text}
                onPress={setNotificationType}
                hasBorderTop={index !== 0}
                checked={notificationsType === option.id}
              />
            ))}
          </View>
        </View>
      </SafeAreaView>
    </>
  )
}

export default NotificationSettingsScreen

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    borderTop: {
      borderTopColor: theme.color.grey_500,
      borderTopWidth: 1,
    },
    checkBox: {
      ...s.centeredLayout,
      borderColor: theme.color.blue_400,
      borderRadius: UI_SIZE_16 / 2,
      borderWidth: 1,
      height: UI_SIZE_16,
      width: UI_SIZE_16,
    },
    checkBoxChecked: {
      backgroundColor: theme.color.blue_400,
      borderRadius: UI_SIZE_8 / 2,
      height: UI_SIZE_8,
      width: UI_SIZE_8,
    },
    container: {
      paddingHorizontal: UI_SIZE_16,
    },
    rowContainer: {
      alignItems: 'center',
      flexDirection: 'row',
      paddingVertical: UI_SIZE_16,
    },
    rowText: {
      ...theme.text.body,
    },
    section: {
      backgroundColor: theme.background.bg_2,
      borderRadius: UI_SIZE_12,
      marginTop: UI_SIZE_8,
      paddingHorizontal: UI_SIZE_16,
      paddingVertical: UI_SIZE_8,
    },
    sectionTitle: {
      ...theme.text.body,
      color: theme.color.grey_300,
      marginTop: UI_SIZE_16,
    },
  })
  return styles
})
