import React, { memo, useCallback } from 'react'
import {
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { ButtonBase } from 'component/Button'
import { CloseButton } from 'component/CloseButton'
import MaskGradient from 'component/MaskGradient'
import { NavBar } from 'component/NavBar'
import { createThemedStylesheet, gradient } from 'component/theme'
import s, {
  ICON_SIZE_28,
  UI_SIZE_12,
  UI_SIZE_14,
  UI_SIZE_16,
  UI_SIZE_18,
  UI_SIZE_24,
} from 'lib/commonStyles'
import { KEET_URL } from 'lib/constants'
import { shareToDevice } from 'lib/share'

import { useStrings } from 'i18n/strings'

import { INVITE_QR_CODE } from './InviteQrCode'

const InviteScreen = () => {
  const styles = getStyles()
  const strings = useStrings()
  const { bottom: paddingBottom } = useSafeAreaInsets()

  const shareQrCode = useCallback(() => {
    const url = `data:image/png;base64,${INVITE_QR_CODE}`
    shareToDevice(url)
  }, [])

  const onPress = useCallback(() => {
    Linking.openURL(KEET_URL)
  }, [])
  return (
    <>
      <NavBar left={null} title="" right={<CloseButton />} />
      <ScrollView
        contentContainerStyle={[styles.scrollView, { paddingBottom }]}
      >
        <View style={s.centeredLayout}>
          <MaskGradient
            linearGradientProps={gradient.keet_gradient_brightBlue}
            MaskElement={
              <Text style={[styles.text, styles.keetApp]}>
                {strings.inviteSomeone.keetApp}
              </Text>
            }
          />

          <Text style={[styles.text, styles.description]}>
            {strings.inviteSomeone.description}
          </Text>
          <Image
            style={styles.qrCode}
            source={{ uri: `data:image/png;base64,${INVITE_QR_CODE}` }}
          />
          <Text style={[styles.text, styles.download]}>
            {strings.inviteSomeone.download}
          </Text>
          <TouchableOpacity onPress={onPress} style={styles.downloadBtn}>
            <Text style={styles.keetIo}>{strings.inviteSomeone.keetIo}</Text>
          </TouchableOpacity>
          <Text style={styles.or}>{strings.inviteSomeone.or}</Text>
          <Text style={[styles.text, styles.scanQr]}>
            {strings.inviteSomeone.scanQr}
          </Text>
        </View>
        <ButtonBase style={styles.shareButton} onPress={shareQrCode}>
          <Text style={styles.shareQr}>{strings.inviteSomeone.shareQr}</Text>
        </ButtonBase>
      </ScrollView>
    </>
  )
}

export default memo(InviteScreen)

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    description: {
      color: theme.color.grey_300,
      fontSize: UI_SIZE_12,
      marginBottom: ICON_SIZE_28,
    },
    download: {
      ...theme.text.bodyBold,
      fontSize: UI_SIZE_18,
      fontWeight: '500',
    },
    downloadBtn: {
      marginBottom: 20,
    },
    keetApp: {
      ...theme.text.bodyBold,
      fontSize: UI_SIZE_24,
      marginBottom: 10,
    },
    keetIo: {
      color: theme.color.blue_400,
    },
    or: {
      color: theme.color.grey_200,
      fontSize: UI_SIZE_14,
    },
    qrCode: {
      height: 270,
      marginBottom: UI_SIZE_24,
      width: 270,
    },
    scanQr: {
      fontSize: UI_SIZE_18,
    },
    scrollView: {
      flexGrow: 1,
      justifyContent: 'space-between',
      paddingHorizontal: UI_SIZE_16,
    },
    shareButton: {
      ...s.centeredLayout,
      ...s.fullWidth,
      backgroundColor: theme.color.blue_400,
      borderRadius: UI_SIZE_12,
      height: 50,
      marginVertical: ICON_SIZE_28,
    },
    shareQr: {
      ...theme.text.bodyBold,
      color: theme.color.bg,
      fontSize: UI_SIZE_16,
    },
    text: {
      ...theme.text.body,
      ...s.textAlignCenter,
      marginHorizontal: '7%',
    },
  })
  return styles
})
