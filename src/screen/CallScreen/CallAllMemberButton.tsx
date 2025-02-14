import React, { memo } from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'

import SvgIcon from 'component/SvgIcon'
import { colors, createThemedStylesheet } from 'component/theme'
import s, { UI_SIZE_8, UI_SIZE_12, UI_SIZE_20 } from 'lib/commonStyles'

import { useStrings } from 'i18n/strings'

import { CallAllMemberButtonProps } from './type'

export const CallAllMemberButton = ({
  count,
  onPress,
  style,
}: CallAllMemberButtonProps) => {
  const strings = useStrings()
  const styles = getStyles()

  return (
    <TouchableOpacity style={[styles.container, style]} onPress={onPress}>
      <View style={s.centerAlignedRow}>
        <SvgIcon
          color={colors.blue_400}
          name="usersThree"
          width={UI_SIZE_20}
          height={UI_SIZE_20}
        />
        <Text style={styles.countText}>{count}</Text>
      </View>
      <Text style={styles.ctaText}>{strings.call.viewAllParticipants}</Text>
    </TouchableOpacity>
  )
}

export default memo(CallAllMemberButton)

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    container: {
      alignItems: 'center',
      backgroundColor: theme.background.bg_2,
      borderRadius: UI_SIZE_12,
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: UI_SIZE_8,
      paddingVertical: UI_SIZE_12,
    },
    countText: {
      ...theme.text.body,
      color: theme.color.blue_400,
      fontSize: 14,
      marginLeft: 8,
    },
    ctaText: {
      ...theme.text.body,
      color: theme.color.blue_400,
      fontSize: 14,
    },
  })
  return styles
})
