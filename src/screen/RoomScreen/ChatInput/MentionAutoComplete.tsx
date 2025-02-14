import { memo, useCallback, useMemo } from 'react'
import { ListRenderItem, Pressable, StyleSheet, Text, View } from 'react-native'
import { shallowEqual, useSelector } from 'react-redux'
import isEqual from 'react-fast-compare'
import { FlatList } from 'react-native-gesture-handler'

import { getAppCurrentRoomId } from '@holepunchto/keet-store/store/app'
import {
  getMemberBlockedById,
  getMembersBlockedByRoomId,
} from '@holepunchto/keet-store/store/member'

import { getChatBarHeight } from 'reducers/application'

import { MemberAvatar } from 'component/Avatar'
import MemberTag from 'component/MemberTag'
import { createThemedStylesheet } from 'component/theme'
import s, { UI_SIZE_4, UI_SIZE_8 } from 'lib/commonStyles'
import { normalize } from 'lib/hooks/useMember'
import { getRoomTypeFlags, useRoom } from 'lib/hooks/useRoom'
import { SearchProfile } from 'lib/types'

const MENTION_ITEM_HEIGHT = 30
const MentionItem = ({
  item,
  onSelectMentionProfile,
  roomId,
}: {
  item: SearchProfile
  onSelectMentionProfile: (name: string) => void
  roomId: string
}) => {
  const styles = getStyles()
  const blocked = useSelector(
    (state) => getMemberBlockedById(state, roomId, item.memberId),
    shallowEqual,
  )
  const { isDm } = getRoomTypeFlags(useRoom(roomId)?.roomType)
  const member = normalize({ member: item, blocked })
  const textStyles: any = isDm ? {} : member?.theme
  const selectMentionProfile = useCallback(() => {
    onSelectMentionProfile(item.displayName)
  }, [item.displayName, onSelectMentionProfile])

  if (member.blocked) {
    return null
  }

  return (
    <Pressable
      testID={item.memberId}
      accessibilityLabel={item.memberId}
      style={[styles.autocompleteListItem, s.centerAlignedRow]}
      onPress={selectMentionProfile}
      pointerEvents="box-only"
    >
      <MemberAvatar member={member} />
      <Text style={[styles.autocompleteListItemText, textStyles]}>
        {item.displayName}
      </Text>
      {!isDm && (
        <MemberTag member={member} isList containerStyleProps={styles.tag} />
      )}
    </Pressable>
  )
}

const MentionItemSeparator = () => {
  const styles = getStyles()

  return <View style={styles.autocompleteSeparator} />
}

const MentionsAutocomplete = ({
  profiles,
  onSelectMentionProfile,
}: {
  profiles: SearchProfile[]
  onSelectMentionProfile: (name: string) => void
}) => {
  const roomId: string = useSelector(getAppCurrentRoomId)
  const styles = getStyles()
  const blockedMembers = useSelector(getMembersBlockedByRoomId(roomId))
  const filteredProfiles = useMemo(
    () => profiles.filter((profile) => !blockedMembers[profile.memberId]),
    [blockedMembers, profiles],
  )
  const chatBarHeight = useSelector(getChatBarHeight)

  const renderItem: ListRenderItem<SearchProfile> = useCallback(
    ({ item }) => {
      return <MentionItem {...{ roomId, item, onSelectMentionProfile }} />
    },
    [onSelectMentionProfile, roomId],
  )
  const getItemLayout = useCallback(
    (_: unknown, index: number) => ({
      length: MENTION_ITEM_HEIGHT,
      offset: MENTION_ITEM_HEIGHT * index,
      index,
    }),
    [],
  )

  if (!filteredProfiles.length) return null

  return (
    <View
      style={[styles.autocompleteRoot, { bottom: chatBarHeight + UI_SIZE_4 }]}
    >
      <FlatList
        data={filteredProfiles}
        contentContainerStyle={styles.flatlist}
        renderItem={renderItem}
        ItemSeparatorComponent={MentionItemSeparator}
        getItemLayout={getItemLayout}
        keyboardShouldPersistTaps="always"
        nestedScrollEnabled
      />
    </View>
  )
}

const getStyles = createThemedStylesheet((theme) => {
  const padding = theme.spacing.standard / 2
  const styles = StyleSheet.create({
    autocompleteListItem: {
      height: MENTION_ITEM_HEIGHT,
    },
    autocompleteListItemText: {
      ...theme.text.body,
      paddingLeft: padding,
    },
    autocompleteRoot: {
      backgroundColor: theme.color.grey_700,
      borderColor: theme.color.bg4,
      borderRadius: theme.border.radiusNormal * 2,
      borderWidth: 1,
      left: padding,
      maxHeight: 200,
      overflow: 'hidden',
      position: 'absolute',
      width: '100%',
    },
    autocompleteSeparator: {
      marginTop: UI_SIZE_4,
    },
    flatlist: {
      padding: UI_SIZE_8,
    },
    tag: {
      marginLeft: UI_SIZE_4,
    },
  })
  return styles
})

export default memo(MentionsAutocomplete, isEqual)
