import React, { useCallback } from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import * as Clipboard from 'expo-clipboard'

import SvgIcon from 'component/SvgIcon'
import { colors, createThemedStylesheet, useTheme } from 'component/theme'
import s, {
  DIRECTION_CODE,
  ICON_SIZE_20,
  UI_SIZE_4,
  UI_SIZE_8,
  UI_SIZE_14,
  UI_SIZE_16,
} from 'lib/commonStyles'
import { showInfoNotifier } from 'lib/hud'
import { MemberType } from 'lib/types'

import { useStrings } from 'i18n/strings'

export const UsernameView = ({ member: { name } }: { member: MemberType }) => {
  const username = `@${name}`
  const styles = getStyles()
  const strings = useStrings()
  const theme = useTheme()
  const onPressCopy = useCallback(async () => {
    await Clipboard.setStringAsync(username)
    showInfoNotifier(strings.downloads.textCopied)
  }, [username, strings.downloads.textCopied])
  return (
    <View style={styles.row}>
      <SvgIcon name="user" color={colors.white_snow} />
      <View style={styles.usernameContainer}>
        <Text style={styles.userNameKey}>
          {strings.chat.userProfile.userName}
        </Text>
        <Text style={styles.userName}>{username}</Text>
      </View>
      <TouchableOpacity
        activeOpacity={0.5}
        onPress={onPressCopy}
        hitSlop={{
          top: 20,
          left: 20,
          right: 20,
          bottom: 20,
        }}
      >
        <SvgIcon
          name="copy"
          width={ICON_SIZE_20}
          height={ICON_SIZE_20}
          color={theme.color.grey_200}
        />
      </TouchableOpacity>
    </View>
  )
}

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    row: {
      ...s.centerAlignedRow,
      backgroundColor: theme.color.grey_800,
      borderRadius: theme.border.radiusNormal,
      marginTop: UI_SIZE_16,
      paddingHorizontal: UI_SIZE_16,
      paddingVertical: UI_SIZE_8,
    },
    userName: {
      ...theme.text.body,
      color: theme.color.blue_400,
      direction: DIRECTION_CODE,
      fontSize: UI_SIZE_14,
      marginTop: UI_SIZE_4,
    },
    userNameKey: {
      ...theme.text.bodyBold,
      color: theme.color.grey_200,
      direction: DIRECTION_CODE,
      fontSize: UI_SIZE_14,
    },
    usernameContainer: {
      flex: 1,
      marginLeft: UI_SIZE_16,
    },
  })
  return styles
})
