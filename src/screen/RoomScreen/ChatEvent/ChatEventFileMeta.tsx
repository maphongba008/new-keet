import { memo } from 'react'
import { StyleSheet, Text, View } from 'react-native'

import SvgIcon from 'component/SvgIcon'
import { colors, createThemedStylesheet } from 'component/theme'
import s, { DIRECTION_CODE, UI_SIZE_8, UI_SIZE_24 } from 'lib/commonStyles'

interface Props {
  name: string
}

export const ChatEventFileMeta = memo(({ name }: Props) => {
  const styles = getStyles()
  return (
    <View style={styles.audioDescription}>
      <View style={styles.iconWrapper}>
        <SvgIcon
          name="chat_placeholder_audio"
          color={colors.white_snow}
          width={UI_SIZE_24}
          height={UI_SIZE_24}
        />
      </View>
      <View style={s.container}>
        <Text style={styles.audioName} numberOfLines={1} ellipsizeMode="middle">
          {name}
        </Text>
      </View>
    </View>
  )
})

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    audioDescription: {
      ...s.centerAlignedRow,
      gap: UI_SIZE_8,
      marginBottom: UI_SIZE_8,
    },
    audioMeta: {
      ...theme.text.body,
      color: theme.color.grey_200,
      fontSize: 13,
      writingDirection: DIRECTION_CODE,
    },
    audioName: {
      ...theme.text.bodySemiBold,
      fontSize: 16,
      writingDirection: DIRECTION_CODE,
    },
    iconWrapper: {
      ...s.centeredLayout,
      borderRadius: theme.border.radiusNormal,
    },
  })
  return styles
})
