import React, { memo, useCallback } from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'

import { IDENTITY_DEVICE_TYPES } from '@holepunchto/keet-store/store/identity'

import { colors, createThemedStylesheet } from 'component/theme'
import { SHOW_RENAME_DEVICE } from 'lib/build.constants'
import s, {
  ICON_SIZE_20,
  UI_SIZE_8,
  UI_SIZE_12,
  UI_SIZE_14,
  UI_SIZE_16,
} from 'lib/commonStyles'

import { useStrings } from 'i18n/strings'

import { showBottomSheet } from './AppBottomSheet/AppBottomSheet.Store'
import BottomSheetEnum from './AppBottomSheet/SheetComponents/BottomSheetEnum'
import SvgIcon from './SvgIcon'

// tmp solution until default name set to be unique
// https://github.com/holepunchto/keet-desktop/blob/57a448f6f2ef611dba5eeaea0effb6abbe1ec6ea/src/components/device.jsx#L25
const getRenderName = ({
  name,
  deviceId,
}: {
  name: string
  deviceId: string
}) => (!name || name === 'Unknown Device' ? deviceId : name)

const Device = ({ device, title, hideTitle, style }: any) => {
  const strings = useStrings()
  const styles = getStyles()
  const { current, deviceId, type } = device || {}

  const initialName = getRenderName({ name: device?.name, deviceId })

  const handlePress = useCallback(() => {
    showBottomSheet({
      bottomSheetType: BottomSheetEnum.DeviceDetailsBottomSheet,
      deviceId,
      deviceType: type,
      name: initialName,
      current,
    })
  }, [current, deviceId, initialName, type])

  const canOpenDeviceDetail = SHOW_RENAME_DEVICE && current

  return (
    <>
      {!!device && !hideTitle && (
        <Text style={styles.title}>
          {!title
            ? current
              ? strings.myDevices.thisDevice
              : strings.myDevices.linkedDevice
            : title}
        </Text>
      )}
      <TouchableOpacity
        key={deviceId}
        disabled={!canOpenDeviceDetail}
        onPress={handlePress}
      >
        <View style={[styles.deviceWrapper, style]}>
          <SvgIcon
            color={colors.white_snow}
            name={
              type === IDENTITY_DEVICE_TYPES.MOBILE
                ? 'deviceMobile'
                : 'deviceDesktop'
            }
            width={ICON_SIZE_20}
            height={ICON_SIZE_20}
          />
          <View style={s.container}>
            <Text style={styles.deviceName} numberOfLines={1}>
              {initialName || strings.myDevices.unknownDevice}
            </Text>
          </View>
          {canOpenDeviceDetail && (
            <SvgIcon
              name="chevronRight"
              width={ICON_SIZE_20}
              height={ICON_SIZE_20}
              color={colors.white_snow}
            />
          )}
        </View>
      </TouchableOpacity>
    </>
  )
}

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    deviceName: {
      ...theme.text.bodySemiBold,
    },
    deviceWrapper: {
      ...s.centerAlignedRow,
      backgroundColor: theme.background.bg_2,
      borderRadius: UI_SIZE_16,
      gap: UI_SIZE_12,
      padding: UI_SIZE_16,
    },
    title: {
      ...theme.text.bodyBold,
      color: theme.color.grey_200,
      fontSize: UI_SIZE_14,
      marginBottom: UI_SIZE_8,
      marginTop: UI_SIZE_16,
    },
  })
  return styles
})

export default memo(Device)
