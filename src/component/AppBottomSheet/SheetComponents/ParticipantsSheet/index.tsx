import React, { memo, useCallback } from 'react'
import { ScrollView, StyleSheet, Text, View } from 'react-native'

import { closeBottomSheet } from 'component/AppBottomSheet/AppBottomSheet.Store'
import { MemberAvatar } from 'component/Avatar'
import { ButtonBase } from 'component/Button'
import MemberTag from 'component/MemberTag'
import { colors, createThemedStylesheet } from 'component/theme'
import s, {
  DIRECTION_CODE,
  height,
  LAYOUT_MARK,
  UI_SIZE_4,
  UI_SIZE_16,
  UI_SIZE_20,
  UI_SIZE_48,
} from 'lib/commonStyles'
import { useMember } from 'lib/hooks/useMember'
import { navigate, SCREEN_USER_PROFILE } from 'lib/navigation'
import { MemberType } from 'lib/types'

import { useStrings } from 'i18n/strings'

export interface ParticipantsSheetProps {
  memberIds: string[]
  roomId: string
}

const Item = ({
  memberId,
  roomId,
  isEnd,
}: {
  memberId: string
  roomId: string
  isEnd: boolean
}) => {
  const { member }: { member: MemberType } = useMember(roomId, memberId)
  const styles = getStyles()
  const strings = useStrings()
  const onPressMember = useCallback(() => {
    closeBottomSheet()
    navigate(SCREEN_USER_PROFILE, {
      memberId,
      roomId,
    })
  }, [memberId, roomId])
  return (
    <ButtonBase key={member.id} style={styles.row} onPress={onPressMember}>
      <MemberAvatar member={member} style={styles.avatar} />
      <View style={[styles.textWrapper, isEnd && styles.noBorder]}>
        <Text
          style={
            member.displayName ? styles.name : [styles.name, styles.grayText]
          }
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {LAYOUT_MARK}
          {member.displayName || strings.room.pairingRoom}
        </Text>
        <View style={styles.memberRoleContainer}>
          <MemberTag member={member} isList />
        </View>
      </View>
    </ButtonBase>
  )
}

const ParticipantsSheet = ({ memberIds, roomId }: ParticipantsSheetProps) => {
  const styles = getStyles()

  return (
    <ScrollView
      style={styles.membersContainer}
      showsVerticalScrollIndicator={false}
    >
      {memberIds.map((memberId, index) => {
        const isEnd = index === memberIds.length - 1
        return (
          <Item
            key={memberId}
            memberId={memberId}
            roomId={roomId}
            isEnd={isEnd}
          />
        )
      })}
    </ScrollView>
  )
}

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    avatar: {
      marginLeft: UI_SIZE_16,
    },
    grayText: {
      color: colors.keet_grey_200,
    },
    memberRoleContainer: {
      ...s.centerAlignedRow,
      gap: UI_SIZE_4,
    },
    membersContainer: {
      maxHeight: height * 0.5,
    },
    name: {
      ...theme.text.body,
      ...s.container,
      flexWrap: 'wrap',
      paddingRight: UI_SIZE_16,
      writingDirection: DIRECTION_CODE,
    },
    noBorder: {
      borderBottomWidth: 0,
    },
    row: {
      ...s.centerAlignedRow,
      height: UI_SIZE_48,
    },
    textWrapper: {
      ...s.container,
      ...s.centerAlignedRow,
      borderBottomColor: theme.color.grey_600,
      borderBottomWidth: 1,
      height: UI_SIZE_48,
      marginLeft: UI_SIZE_20,
      paddingRight: UI_SIZE_16,
    },
  })
  return styles
})

export default memo(ParticipantsSheet)
