import React, { memo } from 'react'
import { StyleSheet, Text, View, ViewStyle } from 'react-native'
import _capitalize from 'lodash/capitalize'

import { ButtonBase, IconButton } from 'component/Button'
import { colors, createThemedStylesheet } from 'component/theme'
import { APPIUM_IDs, appiumTestProps } from 'lib/appium'
import s, {
  DIRECTION_REVERSE,
  ICON_SIZE_16,
  UI_SIZE_4,
  UI_SIZE_8,
  UI_SIZE_12,
  UI_SIZE_14,
  UI_SIZE_16,
  UI_SIZE_44,
  UI_SIZE_48,
} from 'lib/commonStyles'

import { useStrings } from 'i18n/strings'

import SvgIcon, { SvgIconType } from './SvgIcon'

export interface ListItemProps {
  icon?: SvgIconType | React.ReactNode
  name: string
  plainText?: boolean
  right?: string | React.ReactNode
  onPress: () => void
  onLongPress?: () => void
  borderSeparation?: boolean
  rightIcon?: string
  active?: boolean
  hide?: boolean
  disabled?: boolean
  isFirst?: boolean
  isLast?: boolean
  separateSection?: boolean
  listType?: 'bordered' | 'grouped'
  containerStyle?: ViewStyle
}

const ListItem = ({
  icon,
  name = '',
  listType = 'bordered',
  plainText = false,
  right = '',
  onPress = () => {},
  onLongPress = undefined,
  borderSeparation = false,
  rightIcon = `chevron${_capitalize(DIRECTION_REVERSE)}`,
  active = false,
  hide = false,
  disabled = false,
  isFirst = false,
  isLast = false,
  separateSection = false,
  containerStyle,
}: ListItemProps) => {
  const strings = useStrings()
  const styles = getStyles()

  const groupedList = listType === 'grouped'

  if (hide) {
    return null
  }

  return (
    <View
      style={[
        styles.container,
        groupedList && styles.groupContainer,
        active && styles.active,
        isFirst && styles.first,
        isLast &&
          (groupedList ? [styles.last, styles.lastGrouped] : styles.last),
        separateSection && styles.separateSection,
        isLast && styles.noBottomSeparator,
        containerStyle,
      ]}
    >
      <ButtonBase
        onPress={onPress}
        onLongPress={onLongPress}
        delayLongPress={onLongPress !== undefined ? 2000 : undefined}
        style={[styles.button, s.row, s.justifyStart]}
        {...appiumTestProps(`${APPIUM_IDs.list_item}${name}`)}
        disabled={disabled}
      >
        {icon && (
          <IconButton style={[styles.button, s.centeredLayout, styles.icon]}>
            {typeof icon === 'string' ? (
              <SvgIcon
                color={colors.white_snow}
                name={icon as SvgIconType}
                width={ICON_SIZE_16}
                height={ICON_SIZE_16}
              />
            ) : (
              icon
            )}
          </IconButton>
        )}
        <View
          style={[
            s.container,
            s.flexGrow,
            s.row,
            s.flexSpaceBetween,
            s.alignItemsCenter,
            borderSeparation && styles.borderSeparation,
            !icon && styles.noicon,
          ]}
        >
          <Text
            style={[styles.name, active && styles.activeName]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {plainText
              ? name
              : strings?.account?.[name as keyof typeof strings.account]}
          </Text>
          <View
            style={[
              s.row,
              styles.right,
              s.alignItemsCenter,
              s.justifyEnd,
              s.container,
            ]}
          >
            {right &&
              (typeof right === 'string' ? (
                <Text
                  style={styles.rightText}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {right}
                </Text>
              ) : (
                right
              ))}
            {rightIcon && (
              <SvgIcon
                color={colors.keet_grey_200}
                name={rightIcon as SvgIconType}
                width={UI_SIZE_14}
                height={UI_SIZE_14}
                style={styles.rightIcon}
              />
            )}
          </View>
        </View>
      </ButtonBase>
    </View>
  )
}

export default memo(ListItem)

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    active: {
      backgroundColor: theme.color.blue_400,
    },
    activeName: {
      ...theme.text.bodyBold,
      color: theme.color.bg,
    },
    borderSeparation: {
      borderBottomColor: theme.color.bg4,
      borderBottomWidth: 1,
    },
    button: {
      height: UI_SIZE_48,
    },
    container: {
      backgroundColor: theme.modal.bg,
    },
    first: {
      borderTopLeftRadius: theme.border.radiusLarge,
      borderTopRightRadius: theme.border.radiusLarge,
    },
    groupContainer: {
      borderBottomWidth: 0,
    },
    icon: {
      height: UI_SIZE_48,
      marginRight: UI_SIZE_4,
      width: UI_SIZE_44,
    },
    last: {
      borderBottomLeftRadius: theme.border.radiusLarge,
      borderBottomRightRadius: theme.border.radiusLarge,
    },
    lastGrouped: {
      marginBottom: UI_SIZE_16,
    },
    name: {
      ...theme.text.body,
    },
    noBottomSeparator: {
      borderBottomWidth: 0,
    },
    noicon: {
      marginLeft: UI_SIZE_12,
    },
    right: {
      paddingHorizontal: UI_SIZE_12,
    },
    rightIcon: {
      marginStart: UI_SIZE_12,
    },
    rightText: {
      color: colors.keet_grey_200,
      paddingHorizontal: UI_SIZE_8,
    },
    separateSection: {
      marginTop: 24,
    },
  })
  return styles
})
