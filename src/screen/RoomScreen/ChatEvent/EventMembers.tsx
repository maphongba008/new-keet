import React, { memo, useCallback, useMemo } from 'react'
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native'
import { shallowEqual, useSelector } from 'react-redux'
import isEqual from 'react-fast-compare'

import { getRoomItemById } from '@holepunchto/keet-store/store/room'
import { getDmMemberByRoomId } from '@holepunchto/keet-store/store/room/dm'

import { showBottomSheet } from 'component/AppBottomSheet/AppBottomSheet.Store'
import BottomSheetEnum from 'component/AppBottomSheet/SheetComponents/BottomSheetEnum'
import { AVATAR_SIZE, MemberAvatar } from 'component/Avatar'
import { ButtonBase } from 'component/Button'
import { createThemedStylesheet } from 'component/theme'
import s, {
  DIRECTION_CODE,
  UI_SIZE_8,
  UI_SIZE_14,
  UI_SIZE_24,
} from 'lib/commonStyles'
import { useAppNavigation } from 'lib/hooks/useAppNavigation'
import { getMemberBlocked, getMemberName, useMember } from 'lib/hooks/useMember'
import { getRoomTypeFlags, useRoom } from 'lib/hooks/useRoom'
import { SCREEN_USER_PROFILE } from 'lib/navigation'
import { MemberType } from 'lib/types'

import { useStrings } from 'i18n/strings'

import { useMembers } from './hooks/useMembers'

const MAX_ITEMS = 2

const MembersAvatar = memo(
  ({
    members,
    count,
    onPress,
  }: {
    members: MemberType[]
    count: number
    onPress: () => void
  }) => {
    const styles = getStyles()
    const width = useMemo(
      () => BOX_SIZE + (Math.min(count, MAX_ITEMS) - 1) * AVATAR_SPACING,
      [count],
    )

    const renderMemberAvatar = useCallback(
      (member: MemberType, index: number) => (
        <View
          style={[styles.avatarContainer, { left: AVATAR_SPACING * index }]}
          key={member.id}
        >
          <MemberAvatar member={member} />
        </View>
      ),
      [styles.avatarContainer],
    )

    return (
      <ButtonBase onPress={onPress} style={{ width, height: BOX_SIZE }}>
        {members.slice(0, MAX_ITEMS).map(renderMemberAvatar)}
        {/* TODO: show +N if needed */}
        {/* {count > 2 && (
        <View style={[styles.avatarContainer, { left: AVATAR_SPACING * 2 }]}>
          <View style={styles.plusContainer}>
            <Text style={styles.plusText}>{`+${count - 2}`}</Text>
          </View>
        </View>
      )} */}
      </ButtonBase>
    )
  },
  isEqual,
)

type EventMemberType = {
  count: number
  members: Array<MemberType>
  load: () => void
  showMembersSheet: () => void
  children: any
}

const EventMemberContainer = ({
  count,
  members,
  load,
  showMembersSheet,
  children,
}: EventMemberType) => {
  const styles = getStyles()

  return (
    <View style={[s.row, styles.container, styles.eventMembers]}>
      {load()}
      <MembersAvatar
        onPress={showMembersSheet}
        members={members}
        count={count}
      />
      {children}
    </View>
  )
}

type EventMembersProps = {
  roomId: string
  memberIds: string[]
  text: string
  isMe: boolean
  style?: StyleProp<ViewStyle>
}

export const EventMembers = memo(
  ({ roomId, memberIds = [], text, isMe }: EventMembersProps) => {
    const styles = getStyles()
    const count = memberIds.length
    const { members, load } = useMembers(roomId, memberIds)
    const strings = useStrings()
    const navigation = useAppNavigation()

    const dmMemberId = useSelector(getDmMemberByRoomId(roomId))
    const { isDm } = getRoomTypeFlags(useRoom(roomId)?.roomType)
    const { member: dmMember } = useMember(roomId, dmMemberId)

    // use room title as member display name for room DMs
    // since we don't have receiver member data before they accept DM request
    const { title: dmMemberFromTitle } =
      useSelector(getRoomItemById(roomId), shallowEqual) || {}

    const message = React.useMemo(() => {
      if (count === 1) {
        return strings.chat.eventGroupOne
      }
      if (count === 2) {
        return strings.chat.eventGroupTwo
      }
      if (count === 3) {
        return strings.chat.eventGroupThree
      }
      return strings.chat.eventGroupMany
    }, [count, strings])

    const eventMember = message
      .replace(
        '($0)',
        getMemberBlocked(members[0])
          ? strings.chat.blockedUserName
          : getMemberName(members[0]),
      )
      .replace(
        '($1)',
        getMemberBlocked(members[1])
          ? strings.chat.blockedUserName
          : getMemberName(members[1]),
      )
      .replace('($2)', String(count - MAX_ITEMS))

    const showMembersSheet = React.useCallback(() => {
      if (memberIds.length === 1) {
        if (members[0]) {
          navigation.navigate(SCREEN_USER_PROFILE, {
            memberId: memberIds[0],
            roomId,
          })
        }
        return
      }
      showBottomSheet({
        bottomSheetType: BottomSheetEnum.ParticipantsSheet,
        memberIds,
        roomId,
      })
    }, [memberIds, members, navigation, roomId])

    if (isDm) {
      return (
        <EventMemberContainer
          count={count}
          members={members}
          load={load}
          showMembersSheet={showMembersSheet}
        >
          {isMe ? (
            <Text style={styles.text}>
              <Text style={styles.textBold}>{strings.chat.you}</Text>
              <Text>{strings.chat.dm.startedChatWith}</Text>
              <Text style={styles.textBold} onPress={showMembersSheet}>
                {getMemberName(dmMember) || dmMemberFromTitle}
              </Text>
              <Text>.</Text>
            </Text>
          ) : (
            <Text style={styles.text}>
              <Text style={styles.textBold} onPress={showMembersSheet}>
                {getMemberName(dmMember)}
              </Text>
              <Text>{`${
                strings.chat.dm.startedChatWith
              } ${strings.chat.you?.toLowerCase()}`}</Text>
              <Text>.</Text>
            </Text>
          )}
        </EventMemberContainer>
      )
    }

    return (
      <EventMemberContainer
        count={count}
        members={members}
        load={load}
        showMembersSheet={showMembersSheet}
      >
        <Text style={styles.text}>
          <Text style={styles.textBold} onPress={showMembersSheet}>
            {eventMember}
          </Text>
          <Text>{text}</Text>
        </Text>
      </EventMemberContainer>
    )
  },
  isEqual,
)

const BORDER_WIDTH = 2
const BOX_SIZE = AVATAR_SIZE + BORDER_WIDTH * 2
const AVATAR_SPACING = UI_SIZE_24

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    avatarContainer: {
      alignItems: 'center',
      backgroundColor: theme.color.grey_600,
      borderRadius: BOX_SIZE / 2,
      height: BOX_SIZE,
      justifyContent: 'center',
      position: 'absolute',
      width: BOX_SIZE,
    },
    container: {},
    eventMembers: {
      alignItems: 'center',
      flexShrink: 1,
    },
    text: {
      ...theme.text.body,
      flexShrink: 1,
      fontSize: UI_SIZE_14,
      marginLeft: UI_SIZE_8,
      writingDirection: DIRECTION_CODE,
    },
    textBold: {
      ...theme.text.bodyBold,
      fontSize: UI_SIZE_14,
      writingDirection: DIRECTION_CODE,
    },
    // plusContainer: {
    //   width: AVATAR_SIZE,
    //   height: AVATAR_SIZE,
    //   backgroundColor: theme.color.accentDark,
    //   alignItems: 'center',
    //   justifyContent: 'center',
    //   borderRadius: AVATAR_SIZE / 2,
    // },
    // plusText: {
    //   ...theme.text.body,
    //   fontSize: UI_SIZE_14,
    // },
  })
  return styles
})
