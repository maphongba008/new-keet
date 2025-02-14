import React, { memo, useMemo } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { useSelector } from 'react-redux'

import { getCallAutoEndCountdown } from '@holepunchto/keet-store/store/call'

import { closeBottomSheet } from 'component/AppBottomSheet/AppBottomSheet.Store'
import { TextButton, TextButtonType } from 'component/Button'
import { CloseButton } from 'component/CloseButton'
import { createThemedStylesheet } from 'component/theme'
import s, { DIRECTION_CODE, UI_SIZE_16, UI_SIZE_20 } from 'lib/commonStyles'

import { getStrings } from 'i18n/strings'

export default memo(() => {
  const strings = getStrings()
  const styles = getStyles()

  const autoEndCountdown = useSelector(getCallAutoEndCountdown)
  const minutes = useMemo(
    () =>
      Math.round((isFinite(autoEndCountdown) ? autoEndCountdown : 0) / 60000),
    [autoEndCountdown],
  )

  return (
    <>
      <View style={s.centerAlignedRow}>
        <Text style={styles.titleText}>{strings.call.areYouThere}</Text>
        <CloseButton
          onPress={closeBottomSheet}
          width={UI_SIZE_20}
          height={UI_SIZE_20}
        />
      </View>
      <Text style={styles.descriptionText}>
        {strings.call.callNoActivityNotice.replace('$0', String(minutes))}
      </Text>
      <TextButton
        text={strings.call.noActivityAction}
        onPress={closeBottomSheet}
        type={TextButtonType.primaryOutline}
        style={styles.confirmButton}
      />
    </>
  )
})

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    confirmButton: {
      marginTop: UI_SIZE_16,
    },
    descriptionText: {
      ...theme.text.body,
      marginBottom: theme.spacing.standard,
      writingDirection: DIRECTION_CODE,
    },
    titleText: {
      ...s.container,
      ...theme.text.bodyBold,
      marginBottom: theme.spacing.standard,
      writingDirection: DIRECTION_CODE,
    },
  })
  return styles
})
