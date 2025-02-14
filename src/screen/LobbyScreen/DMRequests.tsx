import React, { useCallback } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { useSelector } from 'react-redux'
import { useNavigation } from '@react-navigation/native'

import { getDmRequests } from '@holepunchto/keet-store/store/room'

import { ButtonBase } from 'component/Button'
import SvgIcon from 'component/SvgIcon'
import { createThemedStylesheet, useTheme } from 'component/theme'
import { APPIUM_IDs, appiumTestProps } from 'lib/appium'
import s, {
  DIRECTION_CODE,
  UI_SIZE_2,
  UI_SIZE_8,
  UI_SIZE_14,
  UI_SIZE_16,
} from 'lib/commonStyles'
import { SCREEN_DM_REQUESTS } from 'lib/navigation'

import { useStrings } from 'i18n/strings'

const DMRequests = () => {
  const styles = getStyles()
  const strings = useStrings()
  const theme = useTheme()
  const dmRequests = useSelector(getDmRequests)
  const navigation = useNavigation<any>()
  const navigateToDmRequests = useCallback(() => {
    navigation.navigate(SCREEN_DM_REQUESTS)
  }, [navigation])
  return (
    <ButtonBase
      {...appiumTestProps(APPIUM_IDs.lobby_dm)}
      style={styles.container}
      onPress={navigateToDmRequests}
    >
      <SvgIcon name="chats" />
      <Text style={styles.text}>{strings.chat.dm.dmRequests}</Text>
      <View style={styles.count}>
        <Text style={styles.countText}>{dmRequests.length}</Text>
      </View>
      <SvgIcon name="chevronRight" color={theme.color.grey_200} />
    </ButtonBase>
  )
}

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    container: {
      ...s.centerAlignedRow,
      borderBottomWidth: 1,
      borderColor: theme.color.grey_600,
      paddingHorizontal: UI_SIZE_16,
      paddingVertical: UI_SIZE_8,
    },
    count: {
      backgroundColor: theme.color.red_600,
      borderRadius: UI_SIZE_16,
      paddingHorizontal: UI_SIZE_8,
      paddingVertical: UI_SIZE_2,
    },
    countText: {
      ...theme.text.body,
      color: theme.color.blue_400,
      fontSize: UI_SIZE_14,
      writingDirection: DIRECTION_CODE,
    },
    text: {
      ...theme.text.body,
      flex: 1,
      fontSize: UI_SIZE_14,
      marginLeft: UI_SIZE_8,
      writingDirection: DIRECTION_CODE,
    },
  })
  return styles
})

export default DMRequests
