import React, { memo } from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { TextButton, TextButtonType } from 'component/Button'
import { QRCode } from 'component/QRCode'
import SvgIcon from 'component/SvgIcon'
import { colors, createThemedStylesheet } from 'component/theme'
import { APPIUM_IDs, appiumTestProps } from 'lib/appium'
import s, {
  UI_SIZE_4,
  UI_SIZE_8,
  UI_SIZE_12,
  UI_SIZE_16,
  UI_SIZE_24,
} from 'lib/commonStyles'
import { back } from 'lib/navigation'

import { useStrings } from 'i18n/strings'

const PaymentInvoice = ({ invoice }: { invoice: string }) => {
  const styles = getStyles()
  const strings = useStrings()

  return (
    <SafeAreaView style={s.container}>
      <Text style={styles.title}>{strings.wallet.receive.paymentInvoice}</Text>
      <View style={styles.wrapper}>
        <View style={styles.contentWrapper}>
          <Text style={styles.addressLabel}>
            {strings.wallet.receive.paymentInvoiceDesc}
          </Text>
          <Text style={styles.address}>{invoice}</Text>
        </View>
        <View style={styles.contentWrapper}>
          <Text style={styles.qrLabel}>{strings.wallet.receive.scanQR}</Text>
          <View style={styles.qrWrapper}>
            <QRCode value={invoice} />
          </View>
        </View>
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={s.centerAlignedRow}
            {...appiumTestProps(APPIUM_IDs.wallet_receive_copy_invoice_btn)}
          >
            <SvgIcon
              name="copy"
              width={18}
              height={18}
              color={colors.blue_400}
            />
            <Text style={styles.actionText}>
              {strings.wallet.receive.copyAddress}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={s.centerAlignedRow}
            {...appiumTestProps(APPIUM_IDs.wallet_receive_share_invoice_btn)}
          >
            <SvgIcon
              name="share"
              width={18}
              height={18}
              color={colors.blue_400}
            />
            <Text style={styles.actionText}>
              {strings.wallet.receive.shareAddress}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={s.container} />
      <TextButton
        text={strings.common.done}
        onPress={back}
        type={TextButtonType.primary}
      />
    </SafeAreaView>
  )
}

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    actionRow: {
      ...s.fullWidth,
      ...s.centerAlignedRow,
      ...s.flexSpaceBetween,
    },
    actionText: {
      color: theme.color.blue_400,
      fontSize: 15,
      marginLeft: UI_SIZE_4,
    },
    address: {
      ...theme.text.body,
      fontSize: 15,
      opacity: 0.8,
    },
    addressLabel: {
      ...theme.text.bodySemiBold,
      fontSize: 14,
    },
    contentWrapper: {
      ...s.alignItemsStart,
      gap: UI_SIZE_8,
    },
    qrLabel: {
      ...theme.text.bodySemiBold,
      ...s.alignSelfCenter,
      fontSize: 14,
    },
    qrWrapper: {
      ...s.alignSelfCenter,
      padding: UI_SIZE_12,
    },
    title: {
      ...theme.text.bodySemiBold,
      ...s.textAlignCenter,
      fontSize: 24,
      marginVertical: UI_SIZE_24,
    },
    wrapper: {
      ...s.alignItemsCenter,
      backgroundColor: theme.color.grey_700,
      borderRadius: UI_SIZE_16,
      gap: UI_SIZE_24,
      padding: UI_SIZE_16,
    },
  })
  return styles
})

export default memo(PaymentInvoice)
