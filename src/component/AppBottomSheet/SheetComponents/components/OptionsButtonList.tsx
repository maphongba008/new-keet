import React, { memo, useCallback } from 'react'
import { StyleSheet } from 'react-native'
import isEqual from 'react-fast-compare'

import {
  OutlineButton,
  OutlineButtonIconProps,
  OutlineButtonProps,
} from 'component/Button'
import SvgIcon from 'component/SvgIcon'
import { colors, createThemedStylesheet } from 'component/theme'
import { UI_SIZE_16 } from 'lib/commonStyles'
import { wait } from 'lib/wait'

import { closeBottomSheet } from '../../AppBottomSheet.Store'

export type OptionSheetOption = Omit<OutlineButtonProps, 'PrimaryIcon'> & {
  closesSheet?: boolean // default to true
  onPress?: () => void
  icon?: string
  iconColor?: string // default to #FFF
  iconSize?: number // default to 16
  testID?: string
  disabled?: boolean
}

type OptionsButtonListProps = {
  options: OptionSheetOption[]
}

const renderOptionSheetIcon = (
  props: OutlineButtonIconProps,
  option: OptionSheetOption,
) => {
  const { icon, iconColor = colors.white_snow, iconSize = UI_SIZE_16 } = option
  if (!icon) return null
  return (
    <SvgIcon
      color={iconColor}
      name={icon as any}
      width={iconSize}
      height={iconSize}
      style={props.style}
    />
  )
}

const OptionButton = memo(
  ({ option, isLast }: { option: OptionSheetOption; isLast: boolean }) => {
    const styles = getStyles()
    const { closesSheet = true, iconColor, testID, disabled, ...rest } = option

    const onPress = useCallback(async () => {
      if (closesSheet) {
        closeBottomSheet()
        // If onPress make showBottomSheet call, should add timeout (500ms) for proper closing and reopen of BottomSheet
        await wait(500)
      }
      option.onPress?.()
    }, [closesSheet, option])

    const renderPrimaryIcon = useCallback(
      (p: OutlineButtonIconProps) => renderOptionSheetIcon(p, option),
      [option],
    )

    return (
      <OutlineButton
        {...rest}
        PrimaryIcon={renderPrimaryIcon}
        style={[styles.button, isLast && styles.noBorderBottom]}
        color={iconColor}
        disabled={disabled}
        onPress={onPress}
        testID={testID}
      />
    )
  },
  isEqual,
)

export const OptionsButtonList = memo(({ options }: OptionsButtonListProps) => {
  return (
    <>
      {options.map((option, i) => {
        return (
          <OptionButton
            option={option}
            isLast={i === options.length - 1}
            key={`option$${option.title}`}
          />
        )
      })}
    </>
  )
}, isEqual)

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    button: {
      backgroundColor: theme.background.bg_2,
      borderBottomColor: theme.color.grey_600,
      borderBottomWidth: theme.border.width,
      borderRadius: 0,
      borderWidth: 0,
    },
    noBorderBottom: {
      borderBottomWidth: 0,
    },
  })
  return styles
})
