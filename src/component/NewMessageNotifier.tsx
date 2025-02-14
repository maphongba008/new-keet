import React, { memo } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import isEqual from 'react-fast-compare'
import { SafeAreaView } from 'react-native-safe-area-context'

import {
  DIRECTION_CODE,
  UI_SIZE_2,
  UI_SIZE_8,
  UI_SIZE_12,
  UI_SIZE_14,
  UI_SIZE_16,
  UI_SIZE_40,
} from 'lib/commonStyles'

import MessagePreview, { MessagePreviewProps } from './MessagePreview'
import { RoomAvatarImage } from './RoomAvatarImage'
import { colorWithAlpha, createThemedStylesheet } from './theme'

export interface NewMessageNotifierProps extends MessagePreviewProps {
  description?: string
}

const NewMessageNotifier = memo(
  ({
    description = '',
    unread = true,
    roomId = '',
    ...props
  }: NewMessageNotifierProps) => {
    const styles = getStyles()

    return (
      <SafeAreaView>
        <View style={styles.container}>
          <RoomAvatarImage roomId={roomId} size={UI_SIZE_40} />
          <View style={styles.rightContainer}>
            <Text style={styles.roomTitle} numberOfLines={1}>
              {description}
            </Text>
            <MessagePreview {...props} unread={unread} roomId={roomId} />
          </View>
        </View>
      </SafeAreaView>
    )
  },
  isEqual,
)

export default NewMessageNotifier

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    container: {
      alignItems: 'center',
      backgroundColor: theme.color.grey_600,
      borderColor: colorWithAlpha(theme.color.grey_500, 0.5),
      borderRadius: UI_SIZE_12,
      borderWidth: 1,
      flexDirection: 'row',
      marginHorizontal: UI_SIZE_16,
      paddingHorizontal: UI_SIZE_16,
      paddingVertical: UI_SIZE_8,
    },
    rightContainer: {
      marginLeft: UI_SIZE_8,
    },
    roomTitle: {
      ...theme.text.bodySemiBold,
      fontSize: UI_SIZE_14,
      marginBottom: UI_SIZE_2,
      marginRight: UI_SIZE_40,
      writingDirection: DIRECTION_CODE,
    },
  })
  return styles
})
