import React, { useCallback, useReducer } from 'react'
import { Dimensions, Platform, StyleSheet, Text, View } from 'react-native'
import { useSelector } from 'react-redux'
import * as Clipboard from 'expo-clipboard'

import {
  getIdentityProfile,
  getIsIdentityAnonymous,
} from '@holepunchto/keet-store/store/identity'
import {
  getNetworkIp,
  getNetworkPeerCount,
  getNetworkPort,
} from '@holepunchto/keet-store/store/network'
import { getProfileSoftwareVersion } from '@holepunchto/keet-store/store/userProfile'

import { ButtonBase, TextButton, TextButtonType } from 'component/Button'
import { createThemedStylesheet } from 'component/theme'
import { APPIUM_IDs } from 'lib/appium'
import s, { DIRECTION_CODE, UI_SIZE_14, UI_SIZE_16 } from 'lib/commonStyles'
import { useNetworkInfo } from 'lib/hooks/useNetworkInfo'
import { showInfoNotifier } from 'lib/hud'
import { shareText } from 'lib/share'

import { useStrings } from 'i18n/strings'

import TapToSeeComponent from './TapToSeeComponent'

export const NetworkBottomSheet = () => {
  const styles = getStyles()
  const strings = useStrings()
  const profileSoftwareVersion = useSelector(getProfileSoftwareVersion)
  const networkIp = useSelector(getNetworkIp)
  const networkPeerCount = useSelector(getNetworkPeerCount)
  const networkPort = useSelector(getNetworkPort)
  const isIdentityAnonymous = useSelector(getIsIdentityAnonymous)
  const identityProfile = useSelector(getIdentityProfile)

  const [showIP, toggleShowIP] = useReducer((show) => !show, false)
  const [showPublicKey, toggleShowPublicKey] = useReducer(
    (show) => !show,
    false,
  )

  const networkDhtVersion = profileSoftwareVersion.dependencies?.dhtVersion

  const { carrier } = useNetworkInfo()

  const getNetworkInfoString = useCallback(() => {
    const { width, height } = Dimensions.get('window')

    const data = Object.entries({
      OS: `${Platform.OS} ${Platform.Version}`,
      [strings.networkStatus.layout]: `${width} x ${height}`,
      [strings.networkStatus.carrier]: carrier,
      [strings.networkStatus.dht]: networkDhtVersion,
      [strings.networkStatus.ip]: networkIp,
      [strings.networkStatus.peerCount]: networkPeerCount,
      [strings.networkStatus.port]:
        networkPort || strings.networkStatus.randomizedPort,
    })

    if (!isIdentityAnonymous && identityProfile.memberId) {
      data.push([strings.networkStatus.publicKey, identityProfile.memberId])
    }

    return data.map(([key, value]) => `${key}: ${value}`).join('\n')
  }, [
    carrier,
    networkDhtVersion,
    networkIp,
    networkPeerCount,
    networkPort,
    isIdentityAnonymous,
    identityProfile.memberId,
    strings,
  ])

  const onPressShareInfo = useCallback(() => {
    shareText(getNetworkInfoString())
  }, [getNetworkInfoString])

  const onPressCopyInfo = useCallback(async () => {
    await Clipboard.setStringAsync(getNetworkInfoString())
    showInfoNotifier(strings.downloads.textCopied)
  }, [getNetworkInfoString, strings.downloads.textCopied])

  return (
    <>
      <View style={styles.networkRow}>
        <View style={styles.networkColumn}>
          <Text style={styles.networkRowTitle}>
            {strings.networkStatus.carrier}
          </Text>
          <Text style={styles.networkRowBody}>{carrier}</Text>
        </View>
      </View>
      <View style={styles.networkRow}>
        <View style={styles.networkColumn}>
          <Text style={styles.networkRowTitle}>
            {strings.networkStatus.dht}
          </Text>
          <Text style={styles.networkRowBody}>{networkDhtVersion}</Text>
        </View>
      </View>
      <View style={styles.networkRow}>
        <View style={styles.networkColumn}>
          <Text style={styles.networkRowTitle}>{strings.networkStatus.ip}</Text>
          <ButtonBase onPress={toggleShowIP}>
            {showIP ? (
              <Text style={styles.networkRowBody}>{networkIp}</Text>
            ) : (
              <TapToSeeComponent />
            )}
          </ButtonBase>
        </View>
        <View style={styles.networkColumn}>
          <Text style={styles.networkRowTitle}>
            {strings.networkStatus.peerCount}
          </Text>
          <Text style={styles.networkRowBody}>{networkPeerCount}</Text>
        </View>
      </View>
      <View style={styles.networkRow}>
        <View style={styles.networkColumn}>
          <Text style={styles.networkRowTitle}>
            {strings.networkStatus.port}
          </Text>
          <Text style={styles.networkRowBody}>
            {networkPort || strings.networkStatus.randomizedPort}
          </Text>
        </View>
      </View>
      {!isIdentityAnonymous && !!identityProfile.memberId && (
        <View style={styles.networkRow}>
          <View>
            <Text style={styles.networkRowTitle}>
              {strings.networkStatus.publicKey}
            </Text>
            <ButtonBase onPress={toggleShowPublicKey}>
              {showPublicKey ? (
                <Text style={styles.networkRowBody}>
                  {identityProfile.memberId}
                </Text>
              ) : (
                <TapToSeeComponent />
              )}
            </ButtonBase>
          </View>
        </View>
      )}
      <TextButton
        text={strings.networkStatus.shareInfo}
        hint={strings.networkStatus.shareInfo}
        onPress={onPressShareInfo}
        type={TextButtonType.primaryOutline}
        testID={APPIUM_IDs.account_btn_share_network_info}
      />
      <TextButton
        text={strings.networkStatus.copyInfo}
        hint={strings.networkStatus.copyInfo}
        onPress={onPressCopyInfo}
        style={styles.copyButton}
        type={TextButtonType.gray}
        testID={APPIUM_IDs.account_btn_copy_network_info}
      />
    </>
  )
}

export default NetworkBottomSheet

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    copyButton: {
      marginTop: UI_SIZE_16,
    },
    networkColumn: { width: 150 },
    networkRow: {
      ...s.row,
      marginBottom: theme.spacing.standard,
    },
    networkRowBody: {
      ...theme.text.body,
      alignSelf: 'flex-start',
      fontSize: UI_SIZE_14,
      writingDirection: DIRECTION_CODE,
    },
    networkRowTitle: {
      ...theme.text.title2,
      fontSize: UI_SIZE_14,
      opacity: 0.4,
      writingDirection: DIRECTION_CODE,
    },
  })
  return styles
})
