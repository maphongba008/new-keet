import React from 'react'
import { StyleSheet, Text } from 'react-native'

import { createThemedStylesheet } from 'component/theme'
import { DIRECTION_CODE, UI_SIZE_12, UI_SIZE_16 } from 'lib/commonStyles'

import { useStrings } from 'i18n/strings'

export const DMRequestHeader = ({
  numOfRequests,
}: {
  numOfRequests: number
}) => {
  const styles = getStyles()
  const strings = useStrings()
  const title =
    numOfRequests === 1
      ? strings.chat.dm.oneRequests
      : strings.chat.dm.manyRequests
  return (
    <Text style={styles.text}>
      {title.replace('$1', String(numOfRequests))}
    </Text>
  )
}

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    text: {
      ...theme.text.body,
      color: theme.color.grey_300,
      fontSize: UI_SIZE_12,
      paddingHorizontal: UI_SIZE_16,
      writingDirection: DIRECTION_CODE,
    },
  })
  return styles
})
