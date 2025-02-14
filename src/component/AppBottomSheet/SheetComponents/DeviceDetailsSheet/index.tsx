import React, { useCallback, useState } from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { useDispatch } from 'react-redux'
import { BottomSheetTextInput } from '@gorhom/bottom-sheet'

import {
  IDENTITY_DEVICE_TYPES,
  updateIdentityDeviceRequest,
} from '@holepunchto/keet-store/store/identity'

import { TextButton, TextButtonType } from 'component/Button'
import SvgIcon from 'component/SvgIcon'
import { colors, createThemedStylesheet } from 'component/theme'
import { SHOW_REMOVE_DEVICE } from 'lib/build.constants'
import s, { ICON_SIZE_20, UI_SIZE_12 } from 'lib/commonStyles'

import { useStrings } from 'i18n/strings'

export interface DeviceDetailsInterface {
  deviceId: string
  deviceType: string
  name?: string
  current?: boolean
}

const DeviceDetailsSheet = ({
  deviceId,
  deviceType,
  name,
  current,
}: DeviceDetailsInterface) => {
  const strings = useStrings()
  const styles = getStyles()
  const dispatch = useDispatch()

  const initialName = name || deviceId

  const [isEditing, setIsEditing] = useState(false)
  const [deviceName, setDeviceName] = useState(initialName)
  const [inputIsEmpty, setInputIsEmpty] = useState(false)

  // Mock handle for removing device
  const handleRemoveDevice = useCallback(() => {
    console.log('Remove Device')
  }, [])

  const handleSaveDeviceName = useCallback(() => {
    if (!deviceName.trim()) {
      setInputIsEmpty(true)
    } else {
      const trimmedDeviceName = deviceName.trim()
      setIsEditing(false)
      setInputIsEmpty(false)
      dispatch(
        updateIdentityDeviceRequest({
          name: trimmedDeviceName,
          deviceId: deviceId,
        }),
      )
    }
  }, [deviceName, dispatch, deviceId])

  const handleEditPress = useCallback(() => {
    if (isEditing) return
    setIsEditing(true)
  }, [isEditing])

  const handleClearInput = useCallback(() => {
    setDeviceName('')
    setInputIsEmpty(true)
  }, [])

  const handleChangeDeviceName = useCallback((text: string) => {
    if (text.length <= 50) {
      setDeviceName(text)
      setInputIsEmpty(!text.trim())
    }
  }, [])

  return (
    <>
      <Text style={styles.title}>{strings.myDevices.deviceDetails}</Text>
      {current && (
        <TouchableOpacity onPress={handleEditPress}>
          <View
            style={[
              styles.deviceWrapper,
              isEditing && styles.deviceWrapperEditing,
              inputIsEmpty && styles.deviceWrapperError,
            ]}
          >
            <SvgIcon
              color={colors.white_snow}
              name={
                deviceType === IDENTITY_DEVICE_TYPES.MOBILE
                  ? 'deviceMobile'
                  : 'deviceDesktop'
              }
              width={ICON_SIZE_20}
              height={ICON_SIZE_20}
            />
            <View style={styles.deviceInfo}>
              {isEditing ? (
                <BottomSheetTextInput
                  style={styles.deviceNameInput}
                  value={deviceName}
                  onChangeText={handleChangeDeviceName}
                  onSubmitEditing={handleSaveDeviceName}
                  placeholder={strings.myDevices.enterNewDeviceName}
                  autoFocus
                  maxLength={50}
                  returnKeyType="done"
                />
              ) : (
                <Text style={styles.deviceName} numberOfLines={1}>
                  {deviceName}
                </Text>
              )}
            </View>
            {isEditing ? (
              <TouchableOpacity onPress={handleClearInput}>
                <SvgIcon
                  name="xCircle"
                  width={ICON_SIZE_20}
                  height={ICON_SIZE_20}
                  color={colors.keet_grey_200}
                />
              </TouchableOpacity>
            ) : (
              <SvgIcon
                name="pencil"
                width={ICON_SIZE_20}
                height={ICON_SIZE_20}
                color={colors.keet_grey_200}
              />
            )}
          </View>
        </TouchableOpacity>
      )}
      {SHOW_REMOVE_DEVICE && (
        <>
          <Text style={styles.tip}>{strings.myDevices.thisDeviceShares}</Text>
          <TextButton
            text={strings.myDevices.removeDevice}
            onPress={handleRemoveDevice}
            type={TextButtonType.danger}
            disabled
          />
        </>
      )}
    </>
  )
}

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    deviceInfo: {
      flex: 1,
    },
    deviceName: {
      ...theme.text.title2,
      padding: UI_SIZE_12,
    },
    deviceNameInput: {
      ...theme.text.title2,
      padding: UI_SIZE_12,
    },
    deviceWrapper: {
      ...s.centerAlignedRow,
      backgroundColor: theme.background.bg_2,
      borderColor: theme.color.grey_300,
      borderRadius: theme.border.radiusLarge,
      borderWidth: 1,
      marginVertical: theme.spacing.standard,
      paddingHorizontal: UI_SIZE_12,
    },
    deviceWrapperEditing: {
      borderColor: theme.color.grey_300,
    },
    deviceWrapperError: {
      borderColor: theme.color.attention,
    },
    tip: {
      ...theme.text.subtitle,
      color: theme.color.grey_200,
      marginBottom: theme.spacing.standard,
    },
    title: {
      ...theme.text.title,
      marginBottom: theme.spacing.standard,
    },
  })
  return styles
})

export default DeviceDetailsSheet
