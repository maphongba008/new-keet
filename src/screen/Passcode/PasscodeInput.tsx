import React, { useCallback, useEffect, useState } from 'react'
import {
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
} from 'react-native'
import * as LocalAuthentication from 'expo-local-authentication'

import SvgIcon from 'component/SvgIcon'
import { colors, createThemedStylesheet } from 'component/theme'
import { APPIUM_IDs, appiumTestProps } from 'lib/appium'
import {
  TRANSPARENT,
  UI_SIZE_4,
  UI_SIZE_8,
  UI_SIZE_12,
  UI_SIZE_14,
  UI_SIZE_18,
  UI_SIZE_20,
  UI_SIZE_44,
} from 'lib/commonStyles'
import { useAppStore } from 'lib/hooks'

import { useStrings } from 'i18n/strings'

import { MessageType, usePasscodeStore } from './usePasscodeStore'

const rows = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
]

export const BIOMETRICS_SUCCESS = 'BIOMETRICS_SUCCESS'

interface PasscodeInputProps {
  title: string
  description?: string
  titleStyleProp?: TextStyle
  onComplete: (passcode: string) => void
  showBiometrics?: boolean
}

export const PasscodeInput: React.FC<PasscodeInputProps> = ({
  title,
  description,
  titleStyleProp,
  onComplete,
  showBiometrics = true,
}) => {
  const styles = getStyles()
  const strings = useStrings()
  const { messageType, resetMessage } = usePasscodeStore()

  const [passcode, setPasscode] = useState('')

  const handlePress = useCallback(
    async (num: string) => {
      if (passcode.length === 0) {
        resetMessage()
      }
      if (passcode.length < 4) {
        const newPasscode = passcode + num
        setPasscode(newPasscode)
        if (newPasscode.length === 4) {
          onComplete(newPasscode)
        }
      }
    },
    [passcode, resetMessage, onComplete],
  )

  const biometricsAuthenticate = useCallback(async () => {
    const hasHardware = await LocalAuthentication.hasHardwareAsync()
    if (hasHardware) {
      const isEnrolled = await LocalAuthentication.isEnrolledAsync()
      if (isEnrolled) {
        const result = await LocalAuthentication.authenticateAsync({
          promptMessage: strings.passcode.authenticate,
          cancelLabel: strings.passcode.cancel,
          fallbackLabel: strings.passcode.usePasscode,
          disableDeviceFallback: false,
        })
        if (result.success) {
          useAppStore.setState({
            isAuthenticated: true,
          })
          onComplete(BIOMETRICS_SUCCESS)
        } else {
          console.error('Authentication failed. Try again.')
        }
      } else {
        console.warn(
          'No biometrics setup. Please set up your device biometrics.',
        )
      }
    } else {
      console.warn('No biometrics hardware available.')
    }
  }, [onComplete, strings.passcode])

  const onPressZero = useCallback(() => handlePress('0'), [handlePress])

  const deleteLastDigit = useCallback(() => {
    setPasscode((prev) => prev.slice(0, -1))
  }, [])

  const renderDots = () => {
    const dots = []
    for (let i = 0; i < 4; i++) {
      dots.push(
        <View
          key={i}
          style={[styles.dot, passcode.length > i ? styles.filledDot : null]}
        />,
      )
    }
    return dots
  }

  const renderButton = useCallback(
    (num: string) => (
      <TouchableOpacity
        key={num}
        style={styles.button}
        // eslint-disable-next-line react/jsx-no-bind
        onPress={() => handlePress(num)}
      >
        <Text style={styles.buttonText}>{num}</Text>
      </TouchableOpacity>
    ),
    [handlePress, styles.button, styles.buttonText],
  )

  useEffect(() => {
    if (messageType === MessageType.Error) {
      setPasscode('')
    }
  }, [messageType])

  return (
    <View style={styles.container}>
      <Text style={[styles.title, titleStyleProp]}>{title}</Text>
      {description && <Text style={styles.description}>{description}</Text>}
      <View style={styles.dotsContainer}>{renderDots()}</View>
      <View>
        {rows.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.row}>
            {row.map((num) => renderButton(num))}
          </View>
        ))}
      </View>

      <View style={styles.row}>
        {showBiometrics ? (
          <TouchableOpacity
            style={styles.iconWrapper}
            onPress={biometricsAuthenticate}
          >
            <SvgIcon
              name="fingerprint"
              width={UI_SIZE_44}
              height={UI_SIZE_44}
            />
          </TouchableOpacity>
        ) : (
          <View style={styles.spacer} />
        )}
        <TouchableOpacity style={styles.button} onPress={onPressZero}>
          <Text style={styles.buttonText}>0</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.iconWrapper}
          onPress={deleteLastDigit}
          {...appiumTestProps(APPIUM_IDs.passcode_btn_delete)}
        >
          <SvgIcon name="deleteIcon" width={UI_SIZE_44} height={UI_SIZE_44} />
        </TouchableOpacity>
      </View>
    </View>
  )
}

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    button: {
      alignItems: 'center',
      backgroundColor: theme.color.grey_600,
      borderRadius: 35,
      height: 76,
      justifyContent: 'center',
      marginHorizontal: UI_SIZE_14,
      width: 76,
    },
    buttonText: {
      color: colors.white_snow,
      fontSize: 30,
    },
    container: {
      alignItems: 'center',
      marginTop: UI_SIZE_20,
      paddingHorizontal: UI_SIZE_20,
    },
    description: {
      color: theme.color.grey_300,
      fontSize: UI_SIZE_14,
      marginBottom: UI_SIZE_20,
      textAlign: 'center',
    },
    dot: {
      backgroundColor: TRANSPARENT,
      borderColor: colors.white_snow,
      borderRadius: 6,
      borderWidth: 1,
      height: UI_SIZE_12,
      margin: UI_SIZE_4,
      width: UI_SIZE_12,
    },
    dotsContainer: {
      flexDirection: 'row',
      marginBottom: 40,
      marginTop: UI_SIZE_20,
    },
    filledDot: {
      backgroundColor: theme.memberTypes.mine,
      borderWidth: 0,
    },
    iconWrapper: {
      alignItems: 'center',
      height: 76,
      justifyContent: 'center',
      marginHorizontal: UI_SIZE_14,
      width: 76,
    },
    row: {
      flexDirection: 'row',
      marginBottom: 20,
    },
    spacer: {
      height: 76,
      marginHorizontal: UI_SIZE_14,
      width: 76,
    },
    title: {
      ...theme.text.body,
      color: colors.white_snow,
      fontSize: UI_SIZE_18,
      marginBottom: UI_SIZE_8,
      paddingHorizontal: UI_SIZE_14,
      textAlign: 'center',
    },
  })

  return styles
})
