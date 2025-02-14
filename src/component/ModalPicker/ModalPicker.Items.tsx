import React, { useMemo } from 'react'
import { Image, StyleSheet, Text } from 'react-native'

import { ButtonBase } from 'component/Button'
import SvgIcon from 'component/SvgIcon'
import { colors, createThemedStylesheet } from 'component/theme'
import s, {
  UI_SIZE_8,
  UI_SIZE_14,
  UI_SIZE_20,
  UI_SIZE_32,
} from 'lib/commonStyles'

interface PickerItemsI {
  item: any
  onSelectOption: (item: any) => void
}

function PickerItems({ item, onSelectOption }: PickerItemsI) {
  const styles = getStyles()
  const showDefaultAvatar = useMemo(
    () => Object.keys(item).indexOf('avatarUrl') > -1 && !item.avatarUrl,
    [item],
  )

  return (
    <ButtonBase
      style={styles.container}
      // eslint-disable-next-line react/jsx-no-bind
      onPress={() => onSelectOption(item)}
    >
      {item.icon && (
        <SvgIcon
          name={item.icon}
          style={styles.extraSpacing}
          width={UI_SIZE_20}
          height={UI_SIZE_20}
        />
      )}
      {item.avatarUrl && (
        <Image
          source={{ uri: item.avatarUrl }}
          style={[styles.avatar, styles.extraSpacing]}
        />
      )}
      {showDefaultAvatar && (
        <SvgIcon
          name="userAvatar"
          style={styles.extraSpacing}
          width={UI_SIZE_32}
          height={UI_SIZE_32}
        />
      )}
      <Text
        style={[
          styles.text,
          (item.icon || item.avatarUrl) && styles.extraSpacing,
        ]}
      >
        {item.label}
      </Text>
    </ButtonBase>
  )
}

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    avatar: {
      borderRadius: 25,
      height: UI_SIZE_32,
      width: UI_SIZE_32,
    },
    container: {
      ...s.row,
      ...s.alignItemsCenter,
      backgroundColor: theme.color.grey_800,
      elevation: 6,
      height: 50,
      marginBottom: 1,
      paddingHorizontal: UI_SIZE_14,
      shadowColor: colors.black,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 1,
    },

    extraSpacing: {
      marginRight: UI_SIZE_8,
    },
    text: {
      ...theme.text.body,
      fontSize: 15,
    },
  })
  return styles
})

export default PickerItems
