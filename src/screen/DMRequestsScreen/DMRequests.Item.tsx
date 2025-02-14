import { memo } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import isEqual from 'react-fast-compare'

import { DMItem } from '@holepunchto/keet-store/store/room'

import { MemberAvatar } from 'component/Avatar'
import { ButtonBase } from 'component/Button'
import { createThemedStylesheet } from 'component/theme'
import {
  DIRECTION_CODE,
  UI_SIZE_4,
  UI_SIZE_8,
  UI_SIZE_10,
  UI_SIZE_12,
  UI_SIZE_14,
  UI_SIZE_16,
  UI_SIZE_42,
} from 'lib/commonStyles'
import { timeToLastMessage } from 'lib/date'
import { useMember } from 'lib/hooks/useMember'
import { MemberType } from 'lib/types'

import { useOnPressOnDmRequest } from './dm.hooks'

export interface DMConfigProp {
  member: MemberType
  roomId: string
  roomTitle: string
}

export const DMRequestItem = memo(({ item }: { item: DMItem }) => {
  const { member } = useMember(item.roomId, item.senderId)
  const { message, timestamp, seen } = item
  const displayName = member.displayName || ''
  const styles = getStyles()
  const time = timeToLastMessage(timestamp)
  return (
    <ButtonBase style={styles.container} onPress={useOnPressOnDmRequest(item)}>
      <View style={styles.avatar}>
        <MemberAvatar member={member} />
      </View>
      <View style={styles.contentView}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{displayName}</Text>
          {!seen && <View style={styles.unreadIndicator} />}
        </View>
        <Text style={styles.message}>{message}</Text>
      </View>
      <Text style={styles.timestamp}>{time}</Text>
    </ButtonBase>
  )
}, isEqual)

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    avatar: {
      alignItems: 'center',
      alignSelf: 'center',
      backgroundColor: theme.color.grey_600,
      borderRadius: UI_SIZE_42 / 2,
      height: UI_SIZE_42,
      justifyContent: 'center',
      width: UI_SIZE_42,
    },
    container: {
      flexDirection: 'row',
      marginTop: UI_SIZE_16,
      paddingHorizontal: UI_SIZE_16,
      paddingVertical: UI_SIZE_4,
    },
    contentView: {
      flex: 1,
      marginHorizontal: UI_SIZE_8,
    },
    message: {
      ...theme.text.body,
      fontSize: UI_SIZE_12,
      writingDirection: DIRECTION_CODE,
    },
    timestamp: {
      ...theme.text.body,
      color: theme.color.grey_300,
      fontSize: UI_SIZE_12,
      writingDirection: DIRECTION_CODE,
    },
    title: {
      ...theme.text.bodyBold,
      flexShrink: 1,
      fontSize: UI_SIZE_14,
      writingDirection: DIRECTION_CODE,
    },
    titleContainer: {
      alignItems: 'center',
      flexDirection: 'row',
    },
    unreadIndicator: {
      backgroundColor: theme.color.blue_400,
      borderRadius: UI_SIZE_10 / 2,
      height: UI_SIZE_10,
      marginHorizontal: UI_SIZE_4,
      marginLeft: UI_SIZE_4,
      width: UI_SIZE_10,
    },
  })

  return styles
})
