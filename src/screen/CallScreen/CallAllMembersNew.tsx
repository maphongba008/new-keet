import React, { memo, useCallback } from 'react'
import { FlatList, StyleSheet, View } from 'react-native'
import { useSelector } from 'react-redux'
import isEqual from 'react-fast-compare'

import {
  getCallRemoteMediaById,
  getCallSettingsState,
  getCallState,
} from '@holepunchto/keet-store/store/call'

import { MemberAvatar } from 'component/Avatar'
import { createThemedStylesheet } from 'component/theme'
import s, {
  UI_SIZE_2,
  UI_SIZE_8,
  UI_SIZE_12,
  UI_SIZE_16,
  UI_SIZE_42,
} from 'lib/commonStyles'
import { useDeepEqualSelector } from 'lib/hooks/useDeepEqualSelector'
import { useMember } from 'lib/hooks/useMember'

import { AnimatedMicroIcon } from './AnimatedMicroIcon'
import { getCallMembersData } from './Call.helpers'
import { CallMemberName } from './CallMemberName'
import { CallAllMembersNewProps, MemberProps } from './type'

const CallMemberNew = memo(
  ({ id, roomId, isSelf, unknownMember }: MemberProps) => {
    const { isAudioMuted } = useSelector(getCallSettingsState)
    const { presenceBySwarmId } = useDeepEqualSelector(getCallState)
    const memberMedia = useDeepEqualSelector(getCallRemoteMediaById(id))
    const { memberId } = presenceBySwarmId[id] || {}

    const { member } = useMember(roomId, memberId || id)

    const styles = getStyles()

    return (
      <View style={styles.memberContainer}>
        <View style={[s.container, s.centerAlignedRow]}>
          <MemberAvatar
            member={member}
            base64={member?.avatarUrl}
            style={styles.memberAvatar}
          />
          <CallMemberName
            member={member}
            unknownMember={unknownMember}
            isSelf={isSelf}
            showMyName
            isMemberTagList
            style={styles.memberName}
            textStyle={styles.memberNameText}
            roomId={roomId}
          />
        </View>
        <AnimatedMicroIcon
          isSpeaking={!!member.isSpeaking}
          isMuted={isSelf ? isAudioMuted : (memberMedia?.isAudioMuted ?? true)}
        />
      </View>
    )
  },
  isEqual,
)

const CallAllMembersNew = ({ roomId, style }: CallAllMembersNewProps) => {
  const callMemberData = useDeepEqualSelector(getCallMembersData)
  const { ids, memberId, unknownPresenceIds } = callMemberData

  const styles = getStyles()

  const renderMember = useCallback(
    ({ item: id }: { item: string }) => (
      <CallMemberNew
        key={id}
        id={id}
        roomId={roomId}
        unknownMember={unknownPresenceIds.includes(id)}
        isSelf={memberId === id}
      />
    ),
    [roomId, unknownPresenceIds, memberId],
  )

  const keyExtractor = useCallback((id: string) => id, [])

  return (
    <View style={[styles.container, style]}>
      <FlatList
        data={ids}
        renderItem={renderMember}
        keyExtractor={keyExtractor}
      />
    </View>
  )
}

export default memo(CallAllMembersNew, isEqual)

const getStyles = createThemedStylesheet(() => {
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      paddingTop: UI_SIZE_8,
    },
    memberAvatar: {
      borderRadius: UI_SIZE_42 / 2,
      height: UI_SIZE_42,
      width: UI_SIZE_42,
    },
    memberContainer: {
      alignItems: 'center',
      flexDirection: 'row',
      marginBottom: UI_SIZE_16,
      paddingHorizontal: UI_SIZE_16,
    },
    memberName: {
      alignItems: 'flex-start',
      flexDirection: 'column',
      marginHorizontal: UI_SIZE_12,
      marginTop: 0,
    },
    memberNameText: {
      marginBottom: UI_SIZE_2,
      marginHorizontal: 0,
    },
  })
  return styles
})
