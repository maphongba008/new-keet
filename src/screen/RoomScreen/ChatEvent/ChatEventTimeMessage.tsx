import React, { memo } from 'react'
import { StyleSheet, Text } from 'react-native'

import { createThemedStylesheet } from 'component/theme'
import { DIRECTION_CODE, UI_SIZE_8 } from 'lib/commonStyles'
import { timestampToDay } from 'lib/date'

export const ChatEventTimeMessage = memo(({ time }: { time: number }) => {
  const styles = getStyles()
  return <Text style={styles.timeText}>{timestampToDay(time)}</Text>
})

const getStyles = createThemedStylesheet((theme) =>
  StyleSheet.create({
    timeText: {
      ...theme.text.bodyBold,
      alignSelf: 'center',
      backgroundColor: theme.background.bg_1,
      color: theme.color.grey_500,
      fontSize: 14,
      marginTop: theme.spacing.standard / 2,
      padding: UI_SIZE_8,
      writingDirection: DIRECTION_CODE,
    },
  }),
)
