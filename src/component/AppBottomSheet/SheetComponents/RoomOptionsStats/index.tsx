import React, { useCallback, useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { BottomSheetTextInput } from '@gorhom/bottom-sheet'

import { getCoreBackend } from '@holepunchto/keet-store/backend'

import { TextButton, TextButtonType } from 'component/Button'
import { createThemedStylesheet, useTheme } from 'component/theme'
import { RoomStatToggle } from 'screen/QAHelpersScreen'
import { UI_SIZE_2, UI_SIZE_8, UI_SIZE_12 } from 'lib/commonStyles'
import { ROOM_DEBUG_MENU_PASSWORD } from 'lib/constants'
import { useConfig, useMembership } from 'lib/hooks/useRoom'

import { useStrings } from 'i18n/strings'

export interface RoomOptionsStatsI {
  roomId: string
}
const RoomOptionsStats = ({ roomId }: RoomOptionsStatsI) => {
  const strings = useStrings()
  const styles = getStyles()
  const theme = useTheme()

  const [password, setPassword] = useState('')
  const [inputFocused, setInputFocused] = useState<boolean>(false)

  const { title, version } = useConfig(roomId)
  const { canModerate } = useMembership(roomId)

  const onPressUpgradeRoom = useCallback(() => {
    getCoreBackend().upgradeRoom(roomId)
  }, [roomId])

  const onInputFocus = useCallback(() => setInputFocused(true), [])
  const onInputBlur = useCallback(() => setInputFocused(false), [])

  if (password !== ROOM_DEBUG_MENU_PASSWORD) {
    return (
      <>
        <Text style={styles.inputLabel}>{strings.experimental.password}</Text>
        <BottomSheetTextInput
          returnKeyType="done"
          style={[styles.input, inputFocused && styles.inputFocused]}
          multiline
          placeholderTextColor={theme.text.placeholder.color}
          placeholder={strings.experimental.passwordPlaceholder}
          onChangeText={setPassword}
          defaultValue={password}
          onFocus={onInputFocus}
          onBlur={onInputBlur}
        />
      </>
    )
  }
  return (
    <>
      <Text style={styles.title}>{title}</Text>
      <RoomStatToggle />
      <View style={styles.abiWrapper}>
        <Text style={styles.abiText}>
          {strings.experimental.roomAbi}
          {version}
        </Text>
      </View>

      <TextButton
        text={strings.experimental.upgradeRoom}
        onPress={onPressUpgradeRoom}
        type={TextButtonType.primaryOutline}
        disabled={!canModerate}
      />
    </>
  )
}

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    abiText: {
      ...theme.text.body,
      fontSize: 13,
    },
    abiWrapper: {
      alignItems: 'center',
      backgroundColor: theme.color.grey_600,
      borderRadius: theme.border.radiusLarge,
      marginBottom: UI_SIZE_12,
      marginTop: UI_SIZE_12,
      padding: UI_SIZE_12,
    },
    input: {
      ...theme.text.body,
      backgroundColor: theme.color.grey_600,
      borderColor: theme.border.color,
      borderRadius: theme.border.radiusLarge,
      borderWidth: theme.border.width,
      height: 42,
      marginBottom: theme.spacing.standard,
      paddingHorizontal: theme.spacing.standard,
      paddingVertical: theme.spacing.normal + UI_SIZE_2,
    },
    inputFocused: {
      borderColor: theme.color.blue_400,
    },
    inputLabel: {
      ...theme.text.bodyBold,
      color: theme.color.danger,
      fontSize: 14,
      paddingBottom: UI_SIZE_8,
    },
    title: {
      ...theme.text.title,
      marginBottom: theme.spacing.standard,
    },
  })
  return styles
})

export default RoomOptionsStats
