import React, { memo, useCallback } from 'react'
import { Linking, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { getUIAppUpdate } from 'reducers/application'

import { TextButton, TextButtonType } from 'component/Button'
import s, { UI_SIZE_12, UI_SIZE_18, UI_SIZE_40 } from 'lib/commonStyles'
import { useDeepEqualSelector } from 'lib/hooks/useDeepEqualSelector'

import { useStrings } from 'i18n/strings'

import { colorWithAlpha, createThemedStylesheet } from './theme'

const UpdateVersion = () => {
  const styles = getStyles()
  const strings = useStrings()
  const { isUpdate, reason, url } = useDeepEqualSelector(getUIAppUpdate)

  const handleUpdate = useCallback(() => {
    if (url) {
      Linking.openURL(url)
    }
  }, [url])

  if (!isUpdate) return null
  return (
    <View style={styles.backdrop}>
      <SafeAreaView>
        <View style={styles.container}>
          <Text style={styles.bannerTitle}>{strings.version.bannerTitle}</Text>
          <View style={styles.bannerTitleContainer}>
            <Text style={styles.bannerText}>{reason}</Text>
            <View style={s.container} />
          </View>
          <TextButton
            style={styles.button}
            onPress={handleUpdate}
            text={strings.version.update}
            type={TextButtonType.primaryOutline}
          />
        </View>
      </SafeAreaView>
    </View>
  )
}

export default memo(UpdateVersion)

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    backdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: colorWithAlpha(theme.background.bg_2, 0.7),
      paddingTop: 45,
    },
    bannerText: {
      ...theme.text.body,
      fontSize: UI_SIZE_12,
    },
    bannerTitle: {
      ...theme.text.title,
      fontSize: 13,
      paddingBottom: UI_SIZE_18,
    },
    bannerTitleContainer: {
      alignItems: 'center',
      flexDirection: 'row',
    },
    button: {
      ...s.fullWidth,
      borderRadius: theme.border.radiusLarge,
      height: UI_SIZE_40,
      marginTop: UI_SIZE_12,
      paddingVertical: 0,
    },
    container: {
      backgroundColor: theme.background.bg_2,
      borderRadius: theme.border.radiusLarge,
      margin: UI_SIZE_12,
      padding: UI_SIZE_12,
    },
  })

  return styles
})
