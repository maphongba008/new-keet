import React, { useCallback } from 'react'
import { StyleSheet, Text, View } from 'react-native'

import { closeBottomSheet } from 'component/AppBottomSheet/AppBottomSheet.Store'
import { TextButton, TextButtonType } from 'component/Button'
import { CloseButton } from 'component/CloseButton'
import SvgIcon from 'component/SvgIcon'
import { colors, createThemedStylesheet } from 'component/theme'
import s, {
  DIRECTION_CODE,
  UI_SIZE_4,
  UI_SIZE_8,
  UI_SIZE_16,
  UI_SIZE_20,
  UI_SIZE_24,
} from 'lib/commonStyles'
import { useWalletStore } from 'lib/wallet'

import { useStrings } from 'i18n/strings'

const WalletDelete = () => {
  const styles = getStyles()
  const {
    wallet: { delete: strings },
  } = useStrings()
  const { resetWallet }: any = useWalletStore()

  const onDelete = useCallback(() => {
    resetWallet()
    closeBottomSheet()
  }, [resetWallet])

  return (
    <>
      <View style={s.centerAlignedRow}>
        <Text style={styles.title}>{strings.title}</Text>
        <CloseButton
          onPress={closeBottomSheet}
          width={UI_SIZE_20}
          height={UI_SIZE_20}
        />
      </View>
      <View style={styles.contentWrapper}>
        <Text style={styles.info}>{strings.info}</Text>
        <View style={styles.notice}>
          <SvgIcon
            name="info"
            width={UI_SIZE_16}
            height={UI_SIZE_16}
            color={colors.blue_200}
            style={styles.infoIcon}
          />
          <Text style={styles.noticeText}>{strings.notice}</Text>
        </View>
      </View>
      <View style={styles.buttonWrapper}>
        <TextButton
          text={strings.delete}
          type={TextButtonType.danger}
          style={styles.button}
          onPress={onDelete}
        />
        <TextButton
          text={strings.cancel}
          style={styles.button}
          type={TextButtonType.primaryOutline}
          onPress={closeBottomSheet}
        />
      </View>
    </>
  )
}

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    button: {
      borderWidth: 0,
      height: 46,
      paddingVertical: 0,
    },
    buttonWrapper: {
      gap: UI_SIZE_8,
      marginTop: UI_SIZE_24,
    },
    contentWrapper: {
      gap: UI_SIZE_8,
    },
    info: {
      ...theme.text.body,
      color: theme.color.grey_100,
      fontSize: 15,
    },
    infoIcon: {
      marginTop: UI_SIZE_4,
    },
    notice: {
      ...s.row,
      backgroundColor: theme.color.blue_950,
      borderRadius: UI_SIZE_8,
      padding: UI_SIZE_8,
    },
    noticeText: {
      ...s.container,
      ...theme.text.body,
      fontSize: 14,
      marginLeft: UI_SIZE_8,
    },
    title: {
      ...s.container,
      ...theme.text.title,
      writingDirection: DIRECTION_CODE,
    },
  })
  return styles
})

export default WalletDelete
