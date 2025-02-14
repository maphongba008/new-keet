import React, { memo } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import isEqual from 'react-fast-compare'

import { colors, createThemedStylesheet } from 'component/theme'
import s, { DIRECTION_CODE, UI_SIZE_4 } from 'lib/commonStyles'
import { timestampToOutOfOrderTimestamp, timestampToTimeString } from 'lib/date'

import { useStrings } from 'i18n/strings'

interface ChatEventTimeProps {
  timestamp: number
  isOutOfOrder?: boolean
  withPadding?: boolean
  noOpacity?: boolean
  isEdited?: boolean
}

const EditedText = memo(() => {
  const styles = getStyles()
  const strings = useStrings()
  return <Text style={styles.editedText}>{strings.chat.edited}</Text>
}, isEqual)

const ChatEventTime = memo(
  ({
    timestamp,
    withPadding,
    noOpacity,
    isOutOfOrder,
    isEdited,
  }: ChatEventTimeProps) => {
    const styles = getStyles()

    return (
      <View style={s.row}>
        <Text
          allowFontScaling={false}
          style={[styles.timestamp, noOpacity && styles.timestampNoOpacity]}
        >
          {withPadding ? '  ' : ''}
        </Text>
        {isEdited && <EditedText />}
        <Text
          style={[styles.timestamp, noOpacity && styles.timestampNoOpacity]}
        >
          {isOutOfOrder
            ? timestampToOutOfOrderTimestamp(timestamp)
            : timestampToTimeString(timestamp)}
        </Text>
      </View>
    )
  },
  isEqual,
)

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    editedText: {
      ...theme.text.body,
      color: theme.color.grey_200,
      fontSize: 10,
      paddingRight: UI_SIZE_4,
      writingDirection: DIRECTION_CODE,
    },
    timestamp: {
      ...theme.text.body,
      color: theme.color.grey_200,
      fontSize: 13,
      writingDirection: DIRECTION_CODE,
    },
    timestampNoOpacity: {
      color: colors.white_snow,
    },
  })
  return styles
})

export default ChatEventTime
