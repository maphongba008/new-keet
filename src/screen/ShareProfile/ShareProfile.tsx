import React, { memo, useCallback } from 'react'
import { ScrollView, StyleSheet, Text, View } from 'react-native'
import { useSelector } from 'react-redux'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import {
  getUserProfile,
  getUserProfileColor,
} from '@holepunchto/keet-store/store/userProfile'

import { Avatar } from 'component/Avatar'
import { ButtonBase } from 'component/Button'
import { NavBar } from 'component/NavBar'
import { QRCode } from 'component/QRCode'
import { createThemedStylesheet } from 'component/theme'
import { useAccountStore } from 'screen/AccountScreen/Account.helper'
import s, {
  ICON_SIZE_28,
  UI_SIZE_4,
  UI_SIZE_12,
  UI_SIZE_14,
  UI_SIZE_16,
  UI_SIZE_24,
} from 'lib/commonStyles'
import { ROOM_URL_PREFIX } from 'lib/constants'
import { Profile } from 'lib/localStorage'
import { shareToDevice } from 'lib/share'
import { scaleWidthPixel } from 'lib/size'

import KeetLogoSVG from 'resources/keet-logo.svg'
import { useStrings } from 'i18n/strings'

const ShareProfile = () => {
  const styles = getStyles()
  const strings = useStrings()

  const profile: Profile = useSelector(getUserProfile)
  const color: string = useSelector(getUserProfileColor)

  const { bottom: paddingBottom } = useSafeAreaInsets()

  const { username }: any = useAccountStore()
  const displayName = (!profile?.needsName && profile?.name) || ''
  const externalUrl = `${ROOM_URL_PREFIX}user/profile/${username}`

  const shareQrCode = useCallback(() => {
    shareToDevice(externalUrl)
  }, [externalUrl])

  return (
    <>
      <NavBar title={strings.shareProfile.navTitle} />
      <ScrollView
        bounces={false}
        contentContainerStyle={[styles.scrollView, { paddingBottom }]}
        showsHorizontalScrollIndicator={false}
      >
        <View style={[s.container, s.centeredLayout]}>
          <View style={styles.qrCode}>
            <Avatar
              color={color}
              base64={profile.avatarUrl}
              name={profile?.name}
              style={[styles.avatar, s.alignSelfCenter]}
            />
            <Text style={styles.displayNamePlaceholder}>{displayName}</Text>
            <QRCode value={externalUrl} size={164} logoSVG={KeetLogoSVG} />
            <Text style={styles.usernamePlaceholder}>{`@${
              username || 'JohnDoe'
            }`}</Text>
          </View>
          <Text style={styles.text}>{strings.shareProfile.description}</Text>
        </View>
        <ButtonBase style={styles.shareButton} onPress={shareQrCode}>
          <Text style={styles.shareQr}>{strings.inviteSomeone.shareQr}</Text>
        </ButtonBase>
      </ScrollView>
    </>
  )
}

export default memo(ShareProfile)

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    avatar: {
      borderRadius: scaleWidthPixel(55 / 2),
      height: scaleWidthPixel(55),
      position: 'absolute',
      top: -scaleWidthPixel(40),
      width: scaleWidthPixel(55),
    },
    displayNamePlaceholder: {
      ...theme.text.bodySemiBold,
      color: theme.color.almost_black,
      fontSize: UI_SIZE_14,
      marginBottom: UI_SIZE_4,
    },
    qrCode: {
      backgroundColor: theme.color.grey_000,
      borderRadius: UI_SIZE_16,
      height: 290,
      marginBottom: UI_SIZE_24,
      width: 290,
      ...s.centeredLayout,
    },
    scrollView: {
      flexGrow: 1,
      justifyContent: 'center',
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
      color: theme.color.grey_200,
      fontSize: UI_SIZE_14,
      marginHorizontal: '5%',
      marginTop: -UI_SIZE_14,
    },
    usernamePlaceholder: {
      ...theme.text.body,
      color: theme.color.almost_black,
      fontSize: UI_SIZE_14,
      marginTop: UI_SIZE_4,
    },
  })
  return styles
})
