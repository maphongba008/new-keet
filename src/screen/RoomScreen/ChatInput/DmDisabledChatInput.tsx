import React from 'react'
import { StyleSheet, Text, View } from 'react-native'

import { createThemedStylesheet } from 'component/theme'
import { DIRECTION_CODE, UI_SIZE_8, UI_SIZE_16 } from 'lib/commonStyles'

import { useStrings } from 'i18n/strings'

export const DmDisabledChatInput = () => {
  const styles = getStyles()
  const strings = useStrings()
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{strings.chat.dm.chat_request_sent}</Text>
      <Text style={styles.description}>
        {strings.chat.dm.chat_request_sent_description}
      </Text>
    </View>
  )
}

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    container: {
      backgroundColor: theme.color.grey_500,
      borderRadius: theme.border.radiusLarge,
      marginHorizontal: UI_SIZE_8,
      marginTop: UI_SIZE_16,
      paddingHorizontal: UI_SIZE_16,
      paddingVertical: UI_SIZE_8,
    },
    description: {
      direction: DIRECTION_CODE,
      textAlign: 'center',
      ...theme.text.body,
      color: theme.color.grey_100,
      fontSize: UI_SIZE_16,
      marginTop: UI_SIZE_8,
    },
    title: {
      textAlign: 'center',
      ...theme.text.bodyBold,
      direction: DIRECTION_CODE,
      fontSize: UI_SIZE_16,
    },
  })
  return styles
})
