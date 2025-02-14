import React, { memo, useCallback } from 'react'
import { ScrollView, StyleSheet, Text, View } from 'react-native'
import { Switch } from 'react-native-gesture-handler'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { BackButton, NavBar } from 'component/NavBar'
import { colors, createThemedStylesheet } from 'component/theme'
import s, {
  UI_SIZE_8,
  UI_SIZE_12,
  UI_SIZE_16,
  UI_SIZE_20,
  UI_SIZE_24,
  UI_SIZE_48,
} from 'lib/commonStyles'
import { useSoundStore } from 'lib/sound'

import { useStrings } from 'i18n/strings'

const SecurityScreen = () => {
  const styles = getStyles()
  const strings = useStrings()
  const { bottom: paddingBottom } = useSafeAreaInsets()
  const isInAppNotificationSoundEnabled = useSoundStore(
    (state) => state.isInAppNotificationSoundEnabled,
  )

  const toggleSwitch = useCallback((bool: boolean) => {
    useSoundStore.getState().setInAppNotificationSound(bool)
  }, [])

  return (
    <>
      <NavBar
        left={<BackButton />}
        title={null}
        middle={
          <Text style={styles.navTitle}>
            {strings.account.notificationsSounds}
          </Text>
        }
      />
      <ScrollView
        contentContainerStyle={[styles.scrollView, { paddingBottom }]}
      >
        <View>
          <Text style={[styles.text, styles.title]}>
            {strings.notifications.inAppSound}
          </Text>
          <View style={styles.container}>
            <Text style={styles.text}>
              {strings.notifications.sendReceiveMsg}
            </Text>
            <Switch
              trackColor={{ true: colors.blue_400 }}
              thumbColor={colors.white_snow}
              ios_backgroundColor={colors.keet_grey_600}
              onValueChange={toggleSwitch}
              value={isInAppNotificationSoundEnabled}
            />
          </View>
        </View>
      </ScrollView>
    </>
  )
}

export default memo(SecurityScreen)

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    container: {
      ...s.centeredLayout,
      ...s.row,
      ...s.flexSpaceBetween,
      backgroundColor: theme.background.bg_2,
      borderRadius: UI_SIZE_12,
      height: UI_SIZE_48,
      paddingHorizontal: UI_SIZE_16,
    },
    navTitle: {
      color: colors.white_snow,
      marginRight: UI_SIZE_20,
      textAlign: 'center',
    },
    scrollView: {
      flexGrow: 1,
      paddingHorizontal: UI_SIZE_24,
    },
    text: {
      ...theme.text.body,
    },
    title: {
      color: theme.color.grey_300,
      fontSize: UI_SIZE_16,
      marginVertical: UI_SIZE_8,
    },
  })
  return styles
})
