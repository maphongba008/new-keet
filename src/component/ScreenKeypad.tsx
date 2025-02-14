/* eslint-disable react/jsx-no-bind */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
} from 'react-native'

import SvgIcon from 'component/SvgIcon'
import { createThemedStylesheet } from 'component/theme'
import s, {
  UI_SIZE_2,
  UI_SIZE_4,
  UI_SIZE_12,
  UI_SIZE_18,
  UI_SIZE_24,
  UI_SIZE_32,
} from 'lib/commonStyles'
import {
  calculateFontSize,
  formatAmount,
  isFirstDigit,
  validateInput,
} from 'lib/wallet'

const buttons = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['.', '0', '#'],
]

const DEFAULT_INPUT_VALUE = '0'
const KEYPAD_DELETE_INTERVAL = 300

interface ScreenKeypadI {
  label?: string
  onChangeValue: (value: any) => void
}

function ScreenKeypad({ label, onChangeValue }: ScreenKeypadI) {
  const styles = getStyles()
  const [screenInputValue, setScreenInputValue] = useState(DEFAULT_INPUT_VALUE)

  let deleteInterval = useRef<any>(null)

  useEffect(() => {
    return () => clearInterval(deleteInterval.current)
  }, [deleteInterval])

  useEffect(() => {
    if (screenInputValue) {
      onChangeValue(screenInputValue)
    }
  }, [screenInputValue, onChangeValue])

  const dynamicFontScaling: TextStyle = useMemo(
    () => ({
      fontSize: calculateFontSize(screenInputValue),
    }),
    [screenInputValue],
  )

  const handlePress = useCallback(
    (currentValue: string) => {
      if (isFirstDigit(screenInputValue, Number(currentValue))) {
        setScreenInputValue(currentValue)
        return
      }
      if (validateInput(currentValue, screenInputValue)) {
        setScreenInputValue((prevState: string) =>
          prevState ? prevState + currentValue : currentValue,
        )
        return
      }
    },
    [screenInputValue],
  )

  const handleDeleteItem = useCallback(() => {
    setScreenInputValue((prevState: string) => {
      if (!Number(prevState) || prevState.length === 1) {
        return DEFAULT_INPUT_VALUE
      }
      return prevState.slice(0, -1)
    })
  }, [])

  const onLongPressDelete = useCallback(() => {
    deleteInterval.current = setInterval(() => {
      handleDeleteItem()
    }, KEYPAD_DELETE_INTERVAL)
  }, [handleDeleteItem])

  const onLongPressOutDelete = useCallback(() => {
    clearInterval(deleteInterval.current)
  }, [])

  const renderKeypad = useCallback(
    (itemValue: string) => {
      if (itemValue === '.') {
        return (
          <TouchableOpacity
            style={styles.button}
            onPress={() => handlePress(itemValue)}
          >
            <View style={styles.dot} />
          </TouchableOpacity>
        )
      }
      if (itemValue === '#') {
        return (
          <TouchableOpacity
            style={styles.button}
            onPress={handleDeleteItem}
            onLongPress={onLongPressDelete}
            onPressOut={onLongPressOutDelete}
          >
            <SvgIcon name="arrowBack" width={UI_SIZE_32} height={UI_SIZE_32} />
          </TouchableOpacity>
        )
      }
      return (
        <TouchableOpacity
          style={styles.button}
          onPress={() => handlePress(itemValue)}
        >
          <Text style={styles.buttonText}>{itemValue}</Text>
        </TouchableOpacity>
      )
    },
    [
      handleDeleteItem,
      handlePress,
      onLongPressDelete,
      onLongPressOutDelete,
      styles.button,
      styles.buttonText,
      styles.dot,
    ],
  )

  return (
    <View style={[s.fullWidth, s.centeredLayout, s.container]}>
      <View style={styles.inputContent}>
        <Text style={styles.inputEstimate}>Est. $0</Text>
        <View style={s.row}>
          <Text style={[styles.inputValue, dynamicFontScaling]}>{label}</Text>
          <Text
            style={[
              styles.inputValue,
              dynamicFontScaling,
              !!screenInputValue && styles.extraSpace,
            ]}
          >
            {formatAmount(screenInputValue)}
          </Text>
        </View>
      </View>
      <View style={styles.keypadWrapper}>
        {buttons.map((row, rowIndex) => (
          <View key={`row-${rowIndex}`} style={styles.row}>
            {row.map((item, itemIndex) => (
              <React.Fragment key={`item-${rowIndex}-${itemIndex}`}>
                {renderKeypad(item)}
              </React.Fragment>
            ))}
          </View>
        ))}
      </View>
    </View>
  )
}

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    button: {
      ...s.centeredLayout,
      height: 72,
      width: 100,
    },
    buttonText: {
      ...theme.text.bodySemiBold,
      fontSize: UI_SIZE_18,
    },
    dot: {
      backgroundColor: theme.color.grey_000,
      borderRadius: UI_SIZE_2,
      height: UI_SIZE_4,
      width: UI_SIZE_4,
    },
    extraSpace: {
      marginLeft: UI_SIZE_12,
    },
    inputContent: {
      height: 80,
    },
    inputEstimate: {
      ...theme.text.body,
      ...s.textAlignCenter,
    },
    inputValue: {
      ...theme.text.bodySemiBold,
      color: theme.color.grey_100,
      fontSize: 38,
    },
    keypadWrapper: {
      backgroundColor: theme.color.grey_800,
      borderRadius: UI_SIZE_32,
      ...s.fullWidth,
      ...s.centeredLayout,
      marginTop: UI_SIZE_18,
      paddingHorizontal: UI_SIZE_24,
      paddingVertical: UI_SIZE_12,
    },
    row: {
      ...s.centerAlignedRow,
    },
  })
  return styles
})

export default ScreenKeypad
