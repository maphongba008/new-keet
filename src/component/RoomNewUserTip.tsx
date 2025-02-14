import React, { useCallback, useState } from 'react'
import {
  GestureResponderEvent,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import LinearGradient from 'react-native-linear-gradient'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import s, {
  ICON_SIZE_20,
  UI_SIZE_12,
  UI_SIZE_16,
  UI_SIZE_36,
  UI_SIZE_64,
} from 'lib/commonStyles'
import {
  getStorageShowsTip,
  setStorageShowsTipSeen,
  TIP_LONG_PRESS_KEY,
} from 'lib/localStorage'

import { useStrings } from 'i18n/strings'

import { CloseButton } from './CloseButton'
import SvgIcon from './SvgIcon'
import { colors, createThemedStylesheetWithHooks, gradient } from './theme'

const RoomNewUserTip = () => {
  const styles = getStyles()
  const strings = useStrings()
  const [visible, setVisible] = useState(getStorageShowsTip(TIP_LONG_PRESS_KEY))

  const onClose = useCallback(() => {
    setStorageShowsTipSeen(TIP_LONG_PRESS_KEY)
    setVisible(false)
  }, [])

  const onDismiss = useCallback(
    (event: GestureResponderEvent) =>
      event.target === event.currentTarget && onClose(),
    [onClose],
  )

  return (
    <Modal
      animationType="fade"
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <Pressable onPress={onDismiss} style={styles.backdrop}>
        <LinearGradient style={styles.wrapper} {...gradient.keet_gradient_grey}>
          <View style={s.centerAlignedRow}>
            <SvgIcon
              name="bulbGradient"
              width={UI_SIZE_36}
              height={UI_SIZE_36}
            />
            <Text style={styles.title}>{strings.common.didYouKnow}</Text>
            <CloseButton
              onPress={onClose}
              width={ICON_SIZE_20}
              height={ICON_SIZE_20}
            />
          </View>
          <Text style={styles.tip}>{strings.room.tipLongPress}</Text>
        </LinearGradient>
      </Pressable>
    </Modal>
  )
}

const getStyles = createThemedStylesheetWithHooks(
  (theme, { top }) => {
    const styles = StyleSheet.create({
      backdrop: {
        backgroundColor: colors.modal_backdrop,
        flex: 1,
      },
      tip: {
        ...theme.text.body,
        color: theme.color.grey_100,
        fontSize: 16,
        marginTop: UI_SIZE_16,
      },
      title: {
        ...s.container,
        ...theme.text.bodyBold,
        fontSize: 18,
        paddingHorizontal: UI_SIZE_12,
      },
      wrapper: {
        borderRadius: theme.border.radiusNormal,
        marginHorizontal: UI_SIZE_16,
        marginTop: top + UI_SIZE_64,
        padding: UI_SIZE_16,
      },
    })
    return styles
  },
  () => useSafeAreaInsets(),
)

export default RoomNewUserTip
