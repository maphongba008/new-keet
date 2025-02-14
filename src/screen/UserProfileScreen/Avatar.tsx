import React from 'react'
import { StyleSheet, Text, View } from 'react-native'

import { MemberAvatar } from 'component/Avatar'
import MemberTag from 'component/MemberTag'
import { createThemedStylesheet } from 'component/theme'
import s, {
  DIRECTION_CODE,
  UI_SIZE_8,
  UI_SIZE_16,
  UI_SIZE_20,
} from 'lib/commonStyles'
import {
  getRoomTypeFlags,
  normalizeMeInDmRoom,
  useRoom,
} from 'lib/hooks/useRoom'
import { MemberType } from 'lib/types'

export const Avatar = ({
  member,
  roomId,
}: {
  member: MemberType
  roomId: string
}) => {
  const { displayName, isLocal } = member
  const styles = getStyles()
  const isMe = isLocal
  const { isDm } = getRoomTypeFlags(useRoom(roomId)?.roomType)

  return (
    <View style={s.centeredLayout}>
      <MemberAvatar member={member} small={false} style={styles.avatar} />
      <View style={[s.centerAlignedRow, styles.nameWrapper]}>
        <Text style={styles.name}>{displayName}</Text>
        {(!isDm || isMe) && (
          <MemberTag
            member={normalizeMeInDmRoom(member, isDm)}
            isList={isMe}
            containerStyleProps={styles.tag}
          />
        )}
      </View>
    </View>
  )
}

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    avatar: {
      borderRadius: 45,
      height: 90,
      marginTop: UI_SIZE_16,
      width: 90,
    },
    name: {
      ...theme.text.bodyBold,
      direction: DIRECTION_CODE,
      fontSize: UI_SIZE_20,
    },
    nameWrapper: {
      marginTop: UI_SIZE_16,
    },
    tag: {
      marginLeft: UI_SIZE_8,
    },
  })
  return styles
})
