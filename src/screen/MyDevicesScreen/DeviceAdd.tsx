import React, { memo, useCallback, useEffect } from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import * as Clipboard from 'expo-clipboard'

import {
  cancelIdentityInvitationLink,
  createIdentityInvitationLink,
  getIdentityInvitationLink,
} from '@holepunchto/keet-store/store/identity'

import GestureContainer from 'component/GestureContainer'
import { KeetLoading } from 'component/Loading'
import { NavBar, ScreenSystemBars } from 'component/NavBar'
import { QRCode } from 'component/QRCode'
import SvgIcon from 'component/SvgIcon'
import {
  colors,
  createThemedStylesheet,
  hexToRgbOpacity,
  useTheme,
} from 'component/theme'
import s, {
  ADMIN_WARNING_CONTAINER,
  ICON_SIZE_16,
  TRANSPARENT,
  UI_SIZE_8,
  UI_SIZE_12,
  UI_SIZE_14,
  UI_SIZE_16,
  UI_SIZE_24,
  UI_SIZE_48,
} from 'lib/commonStyles'
import { showInfoNotifier } from 'lib/hud'

import { useStrings } from 'i18n/strings'

const DeviceAdd = memo(() => {
  const styles = getStyles()
  const strings = useStrings()
  const dispatch = useDispatch()
  const theme = useTheme()
  const invitationLink: string = useSelector(getIdentityInvitationLink)

  useEffect(() => {
    dispatch(createIdentityInvitationLink())
    return () => {
      dispatch(cancelIdentityInvitationLink())
    }
  }, [dispatch])

  const copyInvitationLink = useCallback(async () => {
    await Clipboard.setStringAsync(invitationLink)
    showInfoNotifier(strings.downloads.textCopied)
  }, [invitationLink, strings.downloads.textCopied])

  return (
    <GestureContainer>
      <ScreenSystemBars />
      <NavBar title={strings.myDevices.addDevice} />
      <View style={styles.root}>
        <Text style={[s.textAlignCenter, styles.text]}>
          {strings.myDevices.thisDeviceQr}
        </Text>
        {!invitationLink ? (
          <View style={s.centeredLayout}>
            <KeetLoading />
          </View>
        ) : (
          <>
            <View style={styles.qrWrapper}>
              <QRCode value={invitationLink || ''} />
            </View>
            <View style={[s.centerAlignedRow, s.justifyCenter]}>
              <Text style={styles.copyText}>
                {strings.myDevices.copyAccountLink}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.copyInvite}
              onPress={copyInvitationLink}
            >
              <Text
                style={[styles.invitationText, styles.text]}
                numberOfLines={1}
                ellipsizeMode="middle"
              >
                {invitationLink}
              </Text>
              <SvgIcon
                name="paste"
                width={ICON_SIZE_16}
                height={ICON_SIZE_16}
                color={theme.color.blue_400}
              />
            </TouchableOpacity>
            <View style={styles.adminWarningContainer}>
              <SvgIcon
                name="info"
                width={ICON_SIZE_16}
                height={ICON_SIZE_16}
                color={theme.color.el_salvador}
              />
              <Text style={styles.adminLabel}>
                {strings.myDevices.invitationAlert}
              </Text>
            </View>
          </>
        )}
      </View>
    </GestureContainer>
  )
})

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    actionBtn: {
      backgroundColor: TRANSPARENT,
      height: UI_SIZE_48,
      paddingVertical: 0,
    },
    adminLabel: {
      ...theme.text.subtitle,
      color: colors.white_snow,
      flexWrap: 'nowrap',
      flex: 1,
      textAlign: 'left',
    },
    adminWarningContainer: {
      backgroundColor: ADMIN_WARNING_CONTAINER,
      borderColor: theme.color.el_salvador,
      borderRadius: UI_SIZE_8,
      borderWidth: 1,
      display: 'flex',
      flexDirection: 'row',
      gap: UI_SIZE_8,
      marginTop: UI_SIZE_16,
      padding: UI_SIZE_8,
    },
    copyInvite: {
      ...s.row,
      ...s.centeredLayout,
      backgroundColor: theme.background.bg_2,
      borderRadius: UI_SIZE_8,
      marginTop: UI_SIZE_14,
      padding: UI_SIZE_14,
    },
    copyText: {
      ...theme.text.bodySemiBold,
      color: theme.color.grey_300,
    },
    invitationText: {
      ...theme.text.body,
      ...s.textAlignCenter,
      ...s.container,
      marginRight: UI_SIZE_8,
    },
    qrWrapper: {
      ...s.alignSelfCenter,
      backgroundColor: hexToRgbOpacity(colors.white_snow, 0.1),
      borderRadius: theme.border.radiusLarge,
      marginVertical: UI_SIZE_24,
      padding: UI_SIZE_12,
    },
    root: {
      padding: theme.spacing.standard,
    },
    separator: {
      ...s.container,
      backgroundColor: theme.color.grey_600,
      height: 1,
    },
    separatorText: {
      ...theme.text.body,
      marginHorizontal: UI_SIZE_24,
    },
    separatorView: {
      ...s.centerAlignedRow,
      marginVertical: UI_SIZE_24,
    },
    text: {
      ...theme.text.bodySemiBold,
      color: theme.color.grey_300,
    },
  })
  return styles
})

export default DeviceAdd
