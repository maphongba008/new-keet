import React, { useCallback, useEffect, useState } from 'react'
import { StyleSheet, Switch, Text, TextStyle, View } from 'react-native'

import { ButtonBase } from 'component/Button'
import { Loading } from 'component/Loading'
import SvgIcon, { SvgIconType } from 'component/SvgIcon'
import { colors, createThemedStylesheet } from 'component/theme'
import { appiumTestProps } from 'lib/appium'
import s, {
  UI_SIZE_2,
  UI_SIZE_4,
  UI_SIZE_12,
  UI_SIZE_16,
  UI_SIZE_20,
  UI_SIZE_44,
} from 'lib/commonStyles'

const RoomOptionSwitch = ({
  iconName,
  iconSize = UI_SIZE_20,
  iconColor = colors.white_snow,
  title,
  titleStyle,
  onPress,
  isLoading,
  hint,
  testID,
  noBorderRadius,
  bottomSeparator,
  contentBottomSeparator,
  switchOption,
}: {
  iconName: SvgIconType
  iconSize?: number
  iconColor?: string
  title: string
  titleStyle?: TextStyle
  onPress?: () => void
  isLoading?: boolean
  hint?: string
  testID?: string
  noBorderRadius?: boolean
  bottomSeparator?: boolean
  contentBottomSeparator?: boolean
  switchOption?: { value: boolean; onChange: (v: boolean) => void }
}) => {
  const styles = getStyles()
  const [_switchValue, _setSwitchValue] = useState(switchOption?.value || false)

  const _onSwitchValueChange = useCallback(
    (value: boolean) => {
      _setSwitchValue(value)
      switchOption?.onChange?.(value)
    },
    [switchOption],
  )

  useEffect(() => {
    if (switchOption?.value !== undefined) {
      _setSwitchValue(switchOption.value)
    }
  }, [switchOption?.value])

  const WrapperComponent = onPress ? ButtonBase : View

  return (
    <View
      style={[
        styles.widgetWrapper,
        !!noBorderRadius && styles.noBorderRadiusWrapper,
        !!bottomSeparator && styles.widgetSeparator,
      ]}
    >
      <WrapperComponent
        style={styles.buttonWrapper}
        onPress={onPress}
        hint={hint}
        {...appiumTestProps(testID)}
      >
        <View style={styles.iconWrapper}>
          {isLoading ? (
            <Loading style={styles.loading} />
          ) : (
            <SvgIcon
              name={iconName}
              width={iconSize}
              height={iconSize}
              color={iconColor}
            />
          )}
        </View>
        <View
          style={[
            styles.contentWrapper,
            s.flexSpaceBetween,
            contentBottomSeparator && styles.separator,
          ]}
        >
          <Text style={[styles.buttonText, titleStyle]}>{title}</Text>
          {!!switchOption && (
            <Switch
              trackColor={{ true: colors.blue_400 }}
              thumbColor={colors.white_snow}
              ios_backgroundColor="#3e3e3e"
              onValueChange={_onSwitchValueChange}
              value={_switchValue}
              style={styles.switchBtn}
            />
          )}
        </View>
      </WrapperComponent>
    </View>
  )
}

export default RoomOptionSwitch

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    buttonText: {
      ...theme.text.body,
    },
    buttonWrapper: {
      ...s.centerAlignedRow,
      paddingHorizontal: UI_SIZE_4,
      paddingVertical: UI_SIZE_2,
    },
    contentWrapper: {
      ...s.container,
      ...s.centerAlignedRow,
      height: UI_SIZE_44,
      marginLeft: UI_SIZE_12,
      paddingRight: UI_SIZE_20,
    },
    iconWrapper: {
      ...s.centeredLayout,
      height: UI_SIZE_44,
      width: UI_SIZE_44,
    },
    loading: {
      height: UI_SIZE_16,
      width: UI_SIZE_16,
    },
    noBorderRadiusWrapper: {
      borderRadius: 0,
    },
    separator: {
      borderBottomColor: theme.color.grey_500,
      borderBottomWidth: 1,
    },
    switchBtn: {
      transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }],
    },
    widgetSeparator: {
      marginBottom: UI_SIZE_16,
    },
    widgetWrapper: {
      backgroundColor: theme.color.grey_600,
      borderRadius: UI_SIZE_12,
    },
  })
  return styles
})
