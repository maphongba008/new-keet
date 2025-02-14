import React, { memo } from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { useSelector } from 'react-redux'
import _capitalize from 'lodash/capitalize'
import _isFunction from 'lodash/isFunction'

import {
  getNetworkStatus,
  NETWORK_STATUS,
} from '@holepunchto/keet-store/store/network'

import { APPIUM_IDs, appiumTestProps } from 'lib/appium'
import s, {
  DIRECTION_CODE,
  DIRECTION_REVERSE,
  NETWORK_WARNING,
  UI_SIZE_4,
  UI_SIZE_12,
  UI_SIZE_14,
  UI_SIZE_16,
  UI_SIZE_20,
} from 'lib/commonStyles'

import { useStrings } from 'i18n/strings'

import SvgIcon from './SvgIcon'
import { colors, createThemedStylesheet } from './theme'

interface NetworkStatusMessageProps {
  showRightIcon?: boolean
  onPress?: () => void
}

const NetworkStatusMessage = ({
  showRightIcon = false,
  onPress,
}: NetworkStatusMessageProps) => {
  const strings = useStrings()
  const styles = getStyles()

  const networkStatus = useSelector(getNetworkStatus)

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={!_isFunction(onPress)}
      style={[
        styles.networkStatus,
        networkStatus === NETWORK_STATUS.ONLINE
          ? styles.networkStatusOnline
          : networkStatus === NETWORK_STATUS.TRICKY
            ? styles.networkStatusTricky
            : styles.networkStatusOffline,
      ]}
      {...appiumTestProps(APPIUM_IDs.profile_network_status)}
    >
      <View style={styles.statusView}>
        <Text style={styles.networkStatusText}>
          {networkStatus === NETWORK_STATUS.ONLINE
            ? strings.networkStatus.ok
            : networkStatus === NETWORK_STATUS.TRICKY
              ? strings.networkStatus.bad
              : strings.networkStatus.offline}
        </Text>
        {showRightIcon && (
          <View style={styles.rightIcon}>
            <SvgIcon
              color={colors.keet_grey_200}
              name={`chevron${_capitalize(DIRECTION_REVERSE)}`}
              width={UI_SIZE_14}
              height={UI_SIZE_14}
            />
          </View>
        )}
      </View>
    </TouchableOpacity>
  )
}

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    networkStatus: {
      ...s.overflowHidden,
      borderBottomLeftRadius: UI_SIZE_4,
      borderBottomRightRadius: UI_SIZE_16,
      borderTopLeftRadius: UI_SIZE_4,
      borderTopRightRadius: UI_SIZE_16,
      marginBottom: theme.spacing.standard,
      marginHorizontal: UI_SIZE_4,
      marginTop: UI_SIZE_20,
      paddingLeft: theme.spacing.normal,
    },
    networkStatusOffline: {
      backgroundColor: theme.color.danger,
    },
    networkStatusOnline: {
      backgroundColor: theme.color.green_300,
    },
    networkStatusText: {
      ...theme.text.body,
      ...s.container,
      writingDirection: DIRECTION_CODE,
    },
    networkStatusTricky: {
      backgroundColor: NETWORK_WARNING,
    },
    rightIcon: {
      ...s.centeredLayout,
      marginLeft: UI_SIZE_14,
    },
    statusView: {
      ...s.row,
      ...s.flexSpaceBetween,
      backgroundColor: theme.modal.bg,
      borderBottomRightRadius: UI_SIZE_12,
      borderTopRightRadius: UI_SIZE_12,
      padding: theme.spacing.standard,
    },
  })
  return styles
})

export default memo(NetworkStatusMessage)
