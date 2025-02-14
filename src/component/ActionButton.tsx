import React from 'react'
import { StyleSheet, Text, View } from 'react-native'

import { ButtonBase } from 'component/Button'
import SvgIcon, { SvgIconType } from 'component/SvgIcon'
import { colors, createThemedStylesheet } from 'component/theme'
import s, { UI_SIZE_8, UI_SIZE_12, UI_SIZE_18 } from 'lib/commonStyles'

interface ActionButtonI {
  label: string
  iconLeft?: SvgIconType | React.ReactNode
  iconRight?: SvgIconType | React.ReactNode
  onPressItem: () => void
}

function ActionButton(props: ActionButtonI) {
  const { label, iconLeft, iconRight, onPressItem, ...rest } = props
  const styles = getStyles()

  return (
    <>
      <ButtonBase style={styles.actionBtn} onPress={onPressItem} {...rest}>
        <View style={[s.row, s.alignItemsEnd]}>
          {typeof iconLeft === 'string' ? (
            <SvgIcon
              name={iconLeft as SvgIconType}
              width={UI_SIZE_18}
              height={UI_SIZE_18}
              color={colors.white_snow}
            />
          ) : (
            iconLeft
          )}
          <View style={[s.row, s.alignItemsCenter, styles.textWrapper]}>
            <Text style={styles.btnTypeLabel}>{label}</Text>
          </View>
        </View>
        {typeof iconRight === 'string' ? (
          <SvgIcon
            name={iconRight as SvgIconType}
            width={UI_SIZE_18}
            height={UI_SIZE_18}
            color={colors.white_snow}
          />
        ) : (
          iconRight
        )}
      </ButtonBase>
    </>
  )
}

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    actionBtn: {
      ...s.row,
      ...s.alignItemsCenter,
      ...s.flexSpaceBetween,
      backgroundColor: theme.color.grey_600,
      borderRadius: UI_SIZE_12,
      height: 52,
      marginTop: theme.spacing.normal,
      padding: theme.spacing.standard,
    },
    btnTypeLabel: {
      ...theme.text.body,
      fontSize: 15,
    },
    textWrapper: {
      marginLeft: UI_SIZE_8,
    },
  })
  return styles
})

export default ActionButton
