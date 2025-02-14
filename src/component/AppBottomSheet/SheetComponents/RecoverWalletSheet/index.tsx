import React, { memo, useCallback } from 'react'
import { StyleSheet, Text, View } from 'react-native'

import { closeBottomSheet } from 'component/AppBottomSheet/AppBottomSheet.Store'
import { UI_SIZE_14 } from 'lib/commonStyles'
import {
  navigate,
  SCREEN_WALLET_CREATE,
  SCREEN_WALLET_IMPORT,
} from 'lib/navigation'

import { useStrings } from 'i18n/strings'

import { TextButton, TextButtonType } from '../../../Button'
import { createThemedStylesheet } from '../../../theme'

const RecoverWalletSheet: React.FC<{}> = () => {
  const styles = getStyles()
  const strings = useStrings()

  const createWallet = useCallback(() => {
    navigate(SCREEN_WALLET_CREATE)
    closeBottomSheet()
  }, [])

  const importWallet = useCallback(() => {
    navigate(SCREEN_WALLET_IMPORT)
    closeBottomSheet()
  }, [])

  return (
    <>
      <Text style={styles.onboardTitle}>
        {strings.wallet.recoverOption.chooseOptionTitle}
      </Text>
      <Text style={styles.onboardMeta}>
        {strings.wallet.recoverOption.chooseOptionDesc}
      </Text>

      <TextButton
        text={strings.wallet.recoverOption.createNew}
        type={TextButtonType.outline}
        onPress={createWallet}
      />

      <View style={styles.textNotFirst}>
        <TextButton
          text={strings.wallet.recoverOption.import}
          type={TextButtonType.outline}
          onPress={importWallet}
        />
      </View>
    </>
  )
}

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    onboardMeta: {
      ...theme.text.body,
      fontSize: UI_SIZE_14,
      marginBottom: theme.spacing.large,
    },
    onboardTitle: {
      ...theme.text.title,
      marginBottom: theme.spacing.normal,
    },
    textNotFirst: {
      marginTop: theme.spacing.standard,
    },
  })
  return styles
})

export default memo(RecoverWalletSheet)
