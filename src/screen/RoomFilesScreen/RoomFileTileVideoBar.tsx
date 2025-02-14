import { FC } from 'react'
import { StyleSheet, Text, View } from 'react-native'

import SvgIcon from 'component/SvgIcon'
import { createThemedStylesheet, useTheme } from 'component/theme'
import { UI_SIZE_4, UI_SIZE_8, UI_SIZE_12 } from 'lib/commonStyles'

import { parseVideoDuration } from './utils'

interface RoomFileTileVideoBarProps {
  videoDuration?: number
}

export const RoomFileTileVideoBar: FC<RoomFileTileVideoBarProps> = ({
  videoDuration,
}) => {
  const styles = getStyles()
  const theme = useTheme()

  return (
    <View style={styles.videoBar}>
      <SvgIcon
        name="video"
        color={theme.text.body.color}
        width={UI_SIZE_12}
        height={UI_SIZE_12}
      />
      <Text style={styles.videoTime}>
        {typeof videoDuration === 'number'
          ? parseVideoDuration(videoDuration)
          : ''}
      </Text>
    </View>
  )
}

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    videoBar: {
      ...StyleSheet.absoluteFillObject,
      alignItems: 'flex-end',
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: UI_SIZE_8,
      paddingVertical: UI_SIZE_4,
    },
    videoTime: {
      ...theme.text.body,
      fontSize: UI_SIZE_8,
    },
  })
  return styles
})
