import React, { memo, useCallback, useMemo } from 'react'
import { Dimensions, FlatList, StyleSheet, Text, View } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import { ScrollView } from 'react-native-gesture-handler'
import _ceil from 'lodash/ceil'
import _clamp from 'lodash/clamp'
import _isNaN from 'lodash/isNaN'
import _round from 'lodash/round'
import _size from 'lodash/size'
import _throttle from 'lodash/throttle'

import {
  getMemberListSearch,
  onScrollEnd,
  setItemsInView,
} from '@holepunchto/keet-store/store/member-list'
import { getRoomMemberCount } from '@holepunchto/keet-store/store/room'

import { APPIUM_IDs, appiumTestProps } from 'lib/appium'
import s, {
  DIRECTION_CODE,
  height,
  ICON_SIZE_16,
  LAYOUT_MARK,
  UI_SIZE_4,
  UI_SIZE_12,
  UI_SIZE_16,
  UI_SIZE_20,
  UI_SIZE_48,
} from 'lib/commonStyles'
import {
  BACK_DEBOUNCE_DELAY,
  VIEWABLE_ITEM_DEBOUNCE_OPTIONS,
} from 'lib/constants'
import { useMember } from 'lib/hooks/useMember'
import { useMemberListSubscription } from 'lib/hooks/useMemberListSubscription'
import {
  getRoomTypeFlags,
  normalizeMeInDmRoom,
  useRoom,
} from 'lib/hooks/useRoom'
import {
  navigate,
  SCREEN_MANAGE_MEMBER,
  SCREEN_ROOM_MEMBERS,
  SCREEN_USER_PROFILE,
} from 'lib/navigation'

import { getStrings, useStrings } from 'i18n/strings'

import { MemberAvatar } from './Avatar'
import { ButtonBase } from './Button'
import { Loading } from './Loading'
import MemberTag from './MemberTag'
import SvgIcon from './SvgIcon'
import { colors, createThemedStylesheet, getTheme } from './theme'

const screen = Dimensions.get('screen')
const memberListItemSize = UI_SIZE_48
const memberListPageSize = _ceil(screen.height / memberListItemSize)
const numPages = 2
const LIMIT = memberListPageSize * numPages

const COMPACT_ITEM_LENGTH = 5
const INITIAL_NUM_TO_RENDER = _round(height / UI_SIZE_48)
const OFFSET = 3

interface ExtraData {
  lastIndex: Number
  styles: ReturnType<typeof getStyles>
  roomId: string
  showArrow: boolean
  currentScreen?: string
}

interface RenderItem {
  memberId: string
  index?: number
  extraData?: Object
  isDm: boolean
  shouldGoToProfilePage?: boolean
}

interface FooterComponentProps {
  count?: number
  roomId?: string
}

const getItemLayout = (_: any, index: number) => ({
  length: UI_SIZE_48,
  offset: UI_SIZE_48 * index,
  index,
})

const renderScrollComponent = (props: any) => <ScrollView {...props} />

const Wrapper: React.FC<{ children?: React.ReactNode }> = ({
  children,
}: {
  children?: any
}) => <>{children}</>

const RoomParticipantItem: React.FC<RenderItem> = memo(
  ({ memberId, index, extraData, isDm, shouldGoToProfilePage }: RenderItem) => {
    const { styles, lastIndex, roomId, showArrow } = extraData as ExtraData
    const { member } = useMember(roomId, memberId)
    const strings = useStrings()
    const isEnd: boolean = index === lastIndex
    const isMe = member.isLocal
    const onPressProfile = useCallback(() => {
      if (shouldGoToProfilePage) {
        navigate(SCREEN_MANAGE_MEMBER, {
          memberId,
          roomId,
        })
      } else {
        navigate(SCREEN_USER_PROFILE, {
          memberId,
          roomId,
        })
      }
    }, [memberId, roomId, shouldGoToProfilePage])

    if (!member) {
      return (
        <ButtonBase style={styles.row} onPress={onPressProfile}>
          <MemberAvatar member={member} style={styles.avatar} />
          <View style={[styles.textWrapper, isEnd && styles.noBorder]}>
            <View style={styles.memberPlaceholder} />
          </View>
        </ButtonBase>
      )
    }

    return (
      <ButtonBase
        style={styles.row}
        onPress={onPressProfile}
        {...appiumTestProps(`${APPIUM_IDs.participant_item}${index}`)}
      >
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
          {(!isDm || isMe) && (
            <View style={styles.memberRoleContainer}>
              <MemberTag
                member={normalizeMeInDmRoom(member as any, isDm)}
                isList
              />
            </View>
          )}
        </View>
        {showArrow && (
          <SvgIcon
            name="chevronRight"
            color={colors.white_snow}
            width={UI_SIZE_20}
            height={UI_SIZE_20}
          />
        )}
      </ButtonBase>
    )
  },
)

interface FooterComponentProps {
  count?: number
  roomId?: string
}

const FooterComponent: React.FC<FooterComponentProps> = memo(
  ({ count = 0, roomId = '' }: FooterComponentProps) => {
    const styles = getStyles()
    const strings = useStrings()

    const onPress = useCallback(() => {
      if (!roomId) return
      navigate(SCREEN_ROOM_MEMBERS, {
        data: roomId,
      })
    }, [roomId])

    return (
      <ButtonBase
        onPress={onPress}
        style={s.centerAlignedRow}
        {...appiumTestProps(APPIUM_IDs.participant_btn_all)}
      >
        <View style={styles.iconWrapper}>
          <SvgIcon
            color={colors.white_snow}
            name="usersThree"
            width={ICON_SIZE_16}
            height={ICON_SIZE_16}
          />
        </View>
        <View style={styles.contentWrapper}>
          <Text style={styles.name}>
            {strings.room.seeAllMembers.replace('$1', String(count))}
          </Text>
          <SvgIcon
            color={colors.keet_grey_200}
            name="chevronRight"
            width={ICON_SIZE_16}
            height={ICON_SIZE_16}
          />
        </View>
      </ButtonBase>
    )
  },
)

const EmptyComponent: React.FC<{}> = memo(() => {
  const styles = getStyles()
  const strings = useStrings()
  return (
    <View style={[s.container, s.centeredLayout, styles.emptyList]}>
      <SvgIcon width={220} height={116} name="astronaut" />
      <Text style={styles.name}>{strings.lobby.noResult}</Text>
    </View>
  )
})

export const RoomParticipants = ({
  compact = false,
  roomId,
  moderators = false,
  memberId,
  isFromModView,
}: {
  compact?: boolean
  roomId: string
  moderators?: boolean
  memberId?: string
  isFromModView?: boolean
}) => {
  const dispatch = useDispatch()
  const { memberIds, isLoading, isError } = useMemberListSubscription({
    limit: compact ? COMPACT_ITEM_LENGTH : LIMIT,
    subscribeToPeers: !moderators,
  })
  const searchText = useSelector(getMemberListSearch)
  const { isDm } = getRoomTypeFlags(useRoom(roomId)?.roomType)
  const styles = getStyles()
  const participants: number = useSelector(getRoomMemberCount(roomId)) || 0

  const memberDataSize = _size(memberIds)

  const lastIndex: number = compact
    ? Math.min(COMPACT_ITEM_LENGTH, participants) - 1
    : participants - 1

  const extraData: ExtraData = useMemo(
    () => ({
      styles,
      lastIndex,
      roomId,
      showArrow: !(compact || moderators),
      memberId,
    }),
    [compact, lastIndex, memberId, moderators, roomId, styles],
  )

  const renderItem = useCallback(
    ({ item, index }: any) => {
      return (
        <RoomParticipantItem
          key={`${index}`}
          memberId={item}
          index={index}
          extraData={extraData}
          isDm={isDm}
          shouldGoToProfilePage={isFromModView}
        />
      )
    },
    [extraData, isDm, isFromModView],
  )

  const handleViewableItemsChanged = useCallback(
    ({ viewableItems }: any) => {
      const upperBound = viewableItems[_size(viewableItems) - 1]?.index
      const firstItem = _clamp(viewableItems[0]?.index - 1, 0, upperBound)
      const top = firstItem > OFFSET ? firstItem - OFFSET : firstItem
      const bottom = upperBound + OFFSET
      if (_isNaN(top) || _isNaN(bottom)) return

      dispatch(setItemsInView({ top, bottom }))
    },
    [dispatch],
  )

  const handleOnEndReached = useCallback(() => {
    dispatch(onScrollEnd())
  }, [dispatch])

  const keyExtractor = useCallback(
    (item: string, index: number) => `${item}${index}`,
    [],
  )

  if (isLoading && !memberDataSize) {
    return (
      <View style={s.centeredLayout}>
        <Loading />
      </View>
    )
  }

  if (isError) {
    const strings = getStrings()
    const theme = getTheme()
    return (
      <View style={[s.centeredLayout, styles.row]}>
        <Text style={theme.text.body}>{strings.room.peersLoadError}</Text>
      </View>
    )
  }

  if (!memberDataSize) return <EmptyComponent />

  if (compact) {
    return (
      <View>
        {memberIds.map((item, index) => renderItem({ item, index }))}
        {participants > COMPACT_ITEM_LENGTH && (
          <FooterComponent roomId={roomId} count={participants} />
        )}
      </View>
    )
  }

  const triggerOnEndReached =
    !compact && memberDataSize < participants && !searchText

  return (
    <View style={compact ? {} : styles.widgetWrapper}>
      {participants != null && (
        <Wrapper>
          <FlatList
            decelerationRate={0.85}
            showsVerticalScrollIndicator={false}
            keyExtractor={keyExtractor}
            data={memberIds}
            extraData={extraData}
            ListFooterComponent={
              (moderators ? false : memberDataSize !== participants) &&
              !searchText ? (
                <View style={s.centeredLayout}>
                  <Loading style={styles.memberLoading} />
                </View>
              ) : null
            }
            renderItem={renderItem}
            initialNumToRender={INITIAL_NUM_TO_RENDER}
            maxToRenderPerBatch={INITIAL_NUM_TO_RENDER}
            keyboardDismissMode="on-drag"
            contentInsetAdjustmentBehavior="always"
            renderScrollComponent={renderScrollComponent}
            removeClippedSubviews={true}
            onEndReachedThreshold={0.5}
            onEndReached={triggerOnEndReached ? handleOnEndReached : undefined}
            getItemLayout={getItemLayout}
            onViewableItemsChanged={_throttle(
              handleViewableItemsChanged,
              BACK_DEBOUNCE_DELAY,
              VIEWABLE_ITEM_DEBOUNCE_OPTIONS,
            )}
            viewabilityConfig={{
              viewAreaCoveragePercentThreshold: 50,
              waitForInteraction: true,
              minimumViewTime: 500,
            }}
          />
        </Wrapper>
      )}
    </View>
  )
}

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    avatar: {
      marginLeft: UI_SIZE_16,
    },
    contentWrapper: {
      ...s.container,
      ...s.centerAlignedRow,
      borderTopColor: theme.color.grey_500,
      borderTopWidth: 1,
      height: UI_SIZE_48,
      marginLeft: UI_SIZE_16,
      paddingRight: UI_SIZE_20,
    },
    emptyList: {
      paddingTop: UI_SIZE_16,
    },
    grayText: {
      color: colors.keet_grey_200,
    },
    iconWrapper: {
      ...s.centeredLayout,
      height: UI_SIZE_48,
      paddingLeft: UI_SIZE_12,
      width: UI_SIZE_48,
    },
    memberLoading: {
      height: UI_SIZE_48,
      width: UI_SIZE_48,
    },
    memberPlaceholder: {
      backgroundColor: theme.color.grey_500,
      height: 20,
      width: '100%',
    },
    memberRoleContainer: {
      ...s.centerAlignedRow,
      gap: UI_SIZE_4,
    },
    name: {
      ...theme.text.body,
      flexWrap: 'wrap',
      paddingRight: UI_SIZE_16,
      writingDirection: DIRECTION_CODE,
    },
    noBorder: {
      borderBottomWidth: 0,
    },
    row: {
      ...s.centerAlignedRow,
      ...s.flexSpaceBetween,
      height: UI_SIZE_48,
    },
    textWrapper: {
      ...s.container,
      ...s.centerAlignedRow,
      height: UI_SIZE_48,
      marginLeft: UI_SIZE_20,
      paddingRight: UI_SIZE_16,
    },
    widgetWrapper: {
      flex: 1,
      marginHorizontal: 10,
      minHeight: UI_SIZE_48,
      paddingBottom: UI_SIZE_16,
    },
  })
  return styles
})
