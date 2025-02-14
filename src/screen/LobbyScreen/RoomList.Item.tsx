import React, { memo, useCallback, useMemo, useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { shallowEqual, useSelector } from 'react-redux'
import isEqual from 'react-fast-compare'
import { useFocusEffect, useIsFocused } from '@react-navigation/native'
import _includes from 'lodash/includes'
import _noop from 'lodash/noop'
import _toLower from 'lodash/toLower'

import { isOngoingCallByRoomId } from '@holepunchto/keet-store/store/app'
import {
  getChatLastMessage,
  updateMessage,
} from '@holepunchto/keet-store/store/chat'
import { getPreferencesRoomNotifications } from '@holepunchto/keet-store/store/preferences'
import {
  getRoomConfigWithMyCapabilities,
  getRoomItemById,
  getRoomListSearchText,
} from '@holepunchto/keet-store/store/room'

import { LOBBY_AVATAR_SIZE } from 'component/Avatar'
import { ButtonBase } from 'component/Button'
import MessagePreviewComponent from 'component/MessagePreview'
import { RoomAvatarImage } from 'component/RoomAvatarImage'
import { RoomTitle } from 'component/RoomTitle'
import SvgIcon from 'component/SvgIcon'
import { colors, createThemedStylesheet, useTheme } from 'component/theme'
import s, {
  UI_SIZE_2,
  UI_SIZE_4,
  UI_SIZE_10,
  UI_SIZE_12,
  UI_SIZE_14,
  UI_SIZE_16,
  UI_SIZE_20,
  UI_SIZE_24,
  UI_SIZE_42,
} from 'lib/commonStyles'
import { CUSTOM_LINK_PROTOCOLS } from 'lib/constants'
import { timeToLastMessage } from 'lib/date'
import { useDeepEqualSelector } from 'lib/hooks/useDeepEqualSelector'
import { getMemberByRoomId } from 'lib/hooks/useMember'
import { useMinuteUpdate } from 'lib/hooks/useMinuteUpdate'
import { getRoomTypeFlags, useRoom } from 'lib/hooks/useRoom'
import { getStorageChatDraft } from 'lib/localStorage'
import { scaleWidthPixel } from 'lib/size'
import { useRoomUploads } from 'lib/uploads'

import { SwipeableRoomListItem } from './RoomList.Item.Swipeable'

interface MessagePreviewType {
  roomId: string
}

function useRoomTitle(roomId: string) {
  const { title = '' } = useSelector(
    getRoomItemById(roomId),
    (prev, next) => prev.title === next.title,
  )
  return title
}

function useIsUnreadMessage(roomId: string) {
  const { unread } = useSelector(
    (state) => getChatLastMessage(state, roomId),
    (prev, next) => {
      return prev.unread === next.unread
    },
  )
  return unread
}

// to be improved
// https://app.asana.com/0/1205266851628718/1206014756013145/f
function useLastMessage(roomId: string) {
  const { message, unread } = useDeepEqualSelector((state) =>
    getChatLastMessage(state, roomId),
  )

  if (!message) {
    return { id: { memberId: '' } }
  }

  return {
    message: message?.blocked
      ? updateMessage(
          { ...message },
          {
            blocked: message?.memberId,
            customLinkProtocols: CUSTOM_LINK_PROTOCOLS,
          },
        )
      : message,
    unread,
  }
}

const MessagePreview = memo(({ roomId }: MessagePreviewType) => {
  const isFocused = useIsFocused()
  const { isChannel, isDm } = getRoomTypeFlags(useRoom(roomId)?.roomType)
  const { message: lastMessage, unread } = useLastMessage(roomId)
  const memberId = useMemo(() => lastMessage?.memberId, [lastMessage])

  const member = useDeepEqualSelector(getMemberByRoomId(roomId, memberId))

  if (!lastMessage && !memberId) return null

  return (
    <MessagePreviewComponent
      message={lastMessage}
      member={member}
      isChannel={isChannel}
      isDm={isDm}
      unread={unread}
      isFocused={isFocused}
      roomId={roomId}
    />
  )
}, isEqual)

interface RoomListItemType {
  roomId: string
  onPress: (roomId: string) => void
  onLongPress: (roomId: string, canLeaveRoom: boolean) => void
  addRoomFound?: (roomId: string, isHidden: boolean) => void
}

export const EmptyRoomListItem = memo(() => {
  const styles = getStyles()

  return (
    <ButtonBase style={styles.listItem} onPress={_noop}>
      <View style={[styles.defaultPictureRound, styles.avatar]}>
        <SvgIcon name="newVersion" width={UI_SIZE_20} height={UI_SIZE_20} />
      </View>
      <View style={styles.listItemContainer}>
        <View style={styles.emptyListItemTitle} />
        <View style={styles.emptyPreview} />
      </View>
    </ButtonBase>
  )
}, isEqual)

const RoomListCallIcon = memo(({ roomId }: { roomId: string }) => {
  const isCallOngoing = useDeepEqualSelector((state) =>
    isOngoingCallByRoomId(state, roomId),
  )
  const { isCallEnabled } = useDeepEqualSelector(
    getRoomConfigWithMyCapabilities(roomId),
  )

  const styles = getStyles()

  if (isCallEnabled && isCallOngoing) {
    return (
      <SvgIcon
        name="phone"
        color={colors.white_snow}
        style={styles.callIndicator}
      />
    )
  }

  return null
}, isEqual)

const RoomListTimestamp = memo(({ roomId }: { roomId: string }) => {
  const styles = getStyles()
  const title = useRoomTitle(roomId)
  const { message: lastMessage } = useLastMessage(roomId)
  const update = useMinuteUpdate()

  const timestamp = useMemo(
    () =>
      title && lastMessage?.timestamp > 0
        ? timeToLastMessage(lastMessage?.timestamp ?? 0)
        : '',
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [title, lastMessage, update],
  )

  return (
    <Text numberOfLines={1} style={styles.timestamp}>
      {timestamp}
    </Text>
  )
}, isEqual)

export const RoomListItem = memo(
  ({ roomId, onPress, onLongPress }: RoomListItemType) => {
    const { experimental, title, roomType } = useSelector(
      getRoomItemById(roomId),
      shallowEqual,
    )
    const roomSearchText = useDeepEqualSelector(getRoomListSearchText)
    const isNotificationsOn: boolean = useDeepEqualSelector((state) =>
      getPreferencesRoomNotifications(state, roomId),
    )
    const unread = useIsUnreadMessage(roomId)
    const uploads = useRoomUploads(roomId)
    const [hasDraft, setHasDraft] = useState(false)

    const theme = useTheme()
    const styles = getStyles()

    const isHidden =
      Boolean(roomSearchText) &&
      !_includes(_toLower(title), _toLower(roomSearchText))
    const { isDm } = getRoomTypeFlags(roomType)

    useFocusEffect(
      useCallback(() => {
        const draft = getStorageChatDraft(roomId)
        setHasDraft(!!draft || !!uploads.length)
      }, [roomId, uploads]),
    )

    const handlePress = useCallback(() => {
      onPress(roomId)
    }, [onPress, roomId])

    const handleLongPress = useCallback(() => {
      onLongPress(roomId, !isDm)
    }, [onLongPress, roomId, isDm])

    if (!title) {
      return <EmptyRoomListItem />
    }

    if (isHidden) {
      return null
    }

    return (
      <SwipeableRoomListItem roomId={roomId}>
        <ButtonBase
          testID={title}
          style={styles.listItem}
          onPress={handlePress}
          onLongPress={handleLongPress}
        >
          <RoomAvatarImage
            roomId={roomId}
            size={scaleWidthPixel(LOBBY_AVATAR_SIZE)}
            style={styles.avatar}
          />
          <View style={styles.listItemContainer}>
            <View style={styles.listTitleContainer}>
              <View style={[s.centerAlignedRow, s.container]}>
                {experimental && (
                  <SvgIcon
                    name="pear_gray"
                    color={theme.color.blue_400}
                    width={UI_SIZE_14}
                    height={UI_SIZE_14}
                    style={styles.titleIcon}
                  />
                )}
                <RoomTitle
                  fontSize={TITLE_FONT_SIZE}
                  title={title}
                  style={styles.listItemTitle}
                />
                {!!unread && <View style={styles.unreadIcon} />}
              </View>
              <RoomListTimestamp roomId={roomId} />
              {hasDraft && (
                <SvgIcon
                  name="pencilFill"
                  color={styles.draft.color}
                  width={UI_SIZE_16}
                  height={UI_SIZE_16}
                  style={styles.draft}
                />
              )}
            </View>

            <View style={styles.previewContainer}>
              <View style={[s.container, styles.previewMessageContainer]}>
                <MessagePreview roomId={roomId} />
              </View>
              {!isNotificationsOn && (
                <SvgIcon
                  width={UI_SIZE_16}
                  height={UI_SIZE_16}
                  name="notificationOff"
                />
              )}
              <RoomListCallIcon roomId={roomId} />
            </View>
          </View>
        </ButtonBase>
      </SwipeableRoomListItem>
    )
  },
  isEqual,
)

const TITLE_FONT_SIZE = 15
const ITEM_HEIGHT = scaleWidthPixel(84)

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    avatar: {
      marginTop: UI_SIZE_4,
    },
    callIndicator: {
      marginLeft: UI_SIZE_4,
    },
    defaultPictureRound: {
      alignItems: 'center',
      backgroundColor: theme.color.grey_600,
      borderRadius: UI_SIZE_42 / 2,
      height: UI_SIZE_42,
      justifyContent: 'center',
      width: UI_SIZE_42,
    },
    draft: {
      color: theme.color.blue_200,
      marginStart: UI_SIZE_4,
    },
    emptyListItemTitle: {
      backgroundColor: theme.color.grey_600,
      height: UI_SIZE_20,
      marginRight: UI_SIZE_4,
      marginTop: UI_SIZE_4,
      width: '30%',
    },
    emptyPreview: {
      backgroundColor: theme.color.grey_600,
      height: UI_SIZE_24,
      marginTop: UI_SIZE_4,
      width: '60%',
    },
    listItem: {
      ...s.row,
      height: ITEM_HEIGHT,
      paddingHorizontal: theme.spacing.standard,
      ...s.centeredLayout,
    },
    listItemContainer: {
      flex: 1,
      marginLeft: UI_SIZE_16,
    },
    listItemTitle: {
      ...theme.text.title,
      flexShrink: 1,
      fontFamily: theme.text.bodySemiBold.fontFamily,
      fontSize: TITLE_FONT_SIZE,
      lineHeight: TITLE_FONT_SIZE + UI_SIZE_4, // some icons is larger than the text
      marginBottom: UI_SIZE_2,
      marginTop: UI_SIZE_4,
      maxWidth: '80%',
    },
    listTitleContainer: {
      alignItems: 'center',
      flexDirection: 'row',
    },
    previewContainer: {
      flexDirection: 'row',
      minHeight: UI_SIZE_20,
    },
    previewMessageContainer: {
      overflow: 'scroll',
    },
    timestamp: {
      ...theme.text.body,
      color: theme.color.grey_300,
      fontSize: UI_SIZE_12,
      marginLeft: UI_SIZE_4,
    },
    titleIcon: {
      marginRight: UI_SIZE_4,
    },
    unreadIcon: {
      backgroundColor: theme.color.blue_400,
      borderRadius: UI_SIZE_10 / 2,
      height: UI_SIZE_10,
      marginLeft: UI_SIZE_4,
      width: UI_SIZE_10,
    },
  })
  return styles
})
