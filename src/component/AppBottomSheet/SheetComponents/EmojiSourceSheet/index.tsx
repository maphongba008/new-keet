import React, { memo, useCallback, useMemo, useState } from 'react'
import {
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
} from 'react-native'
import { shallowEqual, useSelector } from 'react-redux'
import isEqual from 'react-fast-compare'
import {
  NavigationState,
  SceneRendererProps,
  TabBar,
  TabBarItemProps,
  TabView,
} from 'react-native-tab-view'
import { FlashList } from '@shopify/flash-list'

import { getEmojiData } from '@holepunchto/emojis'
import { getAppCurrentRoomId } from '@holepunchto/keet-store/store/app'

import { closeBottomSheet } from 'component/AppBottomSheet/AppBottomSheet.Store'
import { MemberAvatar } from 'component/Avatar'
import { ButtonBase } from 'component/Button'
import { EmojiRive } from 'component/EmojiRive'
import MemberTag from 'component/MemberTag'
import { colors, createThemedStylesheet } from 'component/theme'
import s, {
  TRANSPARENT,
  UI_SIZE_2,
  UI_SIZE_4,
  UI_SIZE_8,
  UI_SIZE_12,
  UI_SIZE_48,
} from 'lib/commonStyles'
import { useMember } from 'lib/hooks/useMember'
import { getRoomTypeFlags, useRoom } from 'lib/hooks/useRoom'
import { navigate, SCREEN_USER_PROFILE } from 'lib/navigation'
import { ReactionsType } from 'lib/types'

import { getStrings, useStrings } from 'i18n/strings'

import { EmojiData } from '../ChatEventOptionsSheet/components/EmojiSheet'

export interface EmojiSourceSheetInterface {
  reactions: ReactionsType
  selectedReaction: string
}

// Cloned from RoomParticipant.tsx, but modified
const RoomParticipantItem = memo(
  ({
    memberId,
    roomId,
    showParticipant,
  }: {
    memberId: string
    roomId: string
    showParticipant: ({ memberId }: { memberId: string }) => void
  }) => {
    const styles = getStyles()
    const { member } = useMember(roomId, memberId)
    const strings = useStrings()

    const { isDm } = getRoomTypeFlags(useRoom(roomId)?.roomType)

    const onPressProfile = useCallback(() => {
      showParticipant({ memberId })
    }, [memberId, showParticipant])

    const textStyles: TextStyle | undefined = isDm ? {} : member?.theme

    return (
      <ButtonBase style={styles.row} onPress={onPressProfile}>
        <MemberAvatar member={member} />
        <View style={styles.textWrapper}>
          <Text
            style={
              member.displayName
                ? [styles.name, textStyles]
                : [styles.name, styles.grayText]
            }
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {member.displayName || strings.room.pairingRoom}
          </Text>
          {!isDm && (
            <View style={styles.extraMargin}>
              <MemberTag member={member} />
            </View>
          )}
        </View>
      </ButtonBase>
    )
  },
)

const TabBarItem = memo(
  ({
    reactions,
    route,
    setIndex,
  }: {
    reactions: ReactionsType
    route: {
      key: string
      title: string
      count: number
      latest: string[]
      text: string
      emoji: EmojiData
    }
    setIndex: React.Dispatch<React.SetStateAction<number>>
  }) => {
    const styles = getStyles()
    const onPress = useCallback(() => {
      const index = reactions.reactions.findIndex(
        (obj) => obj.text === route.text,
      )
      if (index >= 0) setIndex(index)
    }, [reactions.reactions, route.text, setIndex])

    return (
      <TouchableOpacity onPress={onPress} style={styles.tabBarTabItemContainer}>
        {route.emoji.urlRiv ? (
          <View style={styles.riv}>
            <EmojiRive
              shortCode={route.emoji.shortCodes[0]}
              isDisableTouch
              style={styles.riv}
            />
          </View>
        ) : (
          <Text style={styles.emojiStyle}>{route.emoji.emoji}</Text>
        )}
        <Text style={styles.countStyle}>{route.count}</Text>
      </TouchableOpacity>
    )
  },
  isEqual,
)

const TabBarComponent = memo(
  ({
    props,
    reactions,
    setIndex,
  }: {
    props: SceneRendererProps & {
      navigationState: NavigationState<{
        key: string
        title: string
        count: number
        latest: string[]
        text: string
        emoji: EmojiData
      }>
    }
    reactions: ReactionsType
    setIndex: React.Dispatch<React.SetStateAction<number>>
  }) => {
    const styles = getStyles()

    const renderTabBarItem = useCallback(
      ({
        route,
      }: TabBarItemProps<{
        key: string
        title: string
        count: number
        latest: string[]
        text: string
        emoji: EmojiData
      }> & { key: string }) => {
        return (
          <TabBarItem reactions={reactions} route={route} setIndex={setIndex} />
        )
      },
      [reactions, setIndex],
    )

    return (
      <TabBar
        {...props}
        indicatorStyle={styles.tabBarIndicator}
        style={styles.tabBarStyle}
        tabStyle={styles.tabBarTabStyle}
        scrollEnabled
        renderTabBarItem={renderTabBarItem}
      />
    )
  },
  isEqual,
)

const EmojiSourceSheet = ({
  reactions,
  selectedReaction,
}: EmojiSourceSheetInterface) => {
  const styles = getStyles()
  const strings = getStrings()
  const roomId: string = useSelector(getAppCurrentRoomId, shallowEqual) ?? ''
  const scenes = useMemo(
    () =>
      reactions.reactions.map((obj) => {
        const emoji = getEmojiData(obj.text)
        return {
          ...obj,
          key: obj.text,
          title: `${emoji?.emoji} ${obj.count}`,
          emoji,
        }
      }),
    [reactions.reactions],
  )
  const [index, setIndex] = useState(() => {
    const _index = reactions.reactions.findIndex(
      (obj) => obj.text === selectedReaction,
    )
    return _index === -1 ? 0 : _index
  })

  const showParticipant = useCallback(
    ({ memberId }: { memberId: string }) => {
      closeBottomSheet()
      navigate(SCREEN_USER_PROFILE, {
        memberId,
        roomId,
      })
    },
    [roomId],
  )

  const renderMember = useCallback(
    ({ item }: any) => (
      <RoomParticipantItem
        memberId={item}
        roomId={roomId}
        showParticipant={showParticipant}
      />
    ),
    [roomId, showParticipant],
  )
  const keyExtractor = useCallback(
    (memberId: string, _index: number) => `${memberId}$${_index}`,
    [],
  )
  const renderScene = useCallback(
    (
      props: SceneRendererProps & {
        route: {
          key: string
          title: string
          count: number
          latest: string[]
          text: string
        }
      },
    ) => {
      const { latest, count } = props.route
      return (
        <FlashList
          estimatedItemSize={48}
          data={props.route.latest}
          renderItem={renderMember}
          keyExtractor={keyExtractor}
          ListFooterComponent={
            count > 3 ? (
              <Text
                style={styles.andOther}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {strings.room.emojiAndXOther?.replace(
                  '$1',
                  `${count - latest.length}`,
                )}
              </Text>
            ) : null
          }
        />
      )
    },
    [keyExtractor, renderMember, strings, styles],
  )

  const renderTabBar = useCallback(
    (
      props: SceneRendererProps & {
        navigationState: NavigationState<{
          key: string
          title: string
          count: number
          latest: string[]
          text: string
          emoji: EmojiData
        }>
      },
    ) => {
      return (
        <TabBarComponent
          props={props}
          reactions={reactions}
          setIndex={setIndex}
        />
      )
    },
    [reactions],
  )

  return (
    <View style={styles.container}>
      <TabView
        navigationState={{ index, routes: scenes }}
        renderTabBar={renderTabBar}
        renderScene={renderScene}
        onIndexChange={setIndex}
        lazy
        lazyPreloadDistance={1}
      />
    </View>
  )
}

export default memo(EmojiSourceSheet)

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    andOther: {
      ...theme.text.body,
      ...s.container,
      marginHorizontal: UI_SIZE_8,
      marginTop: UI_SIZE_12,
      textAlign: 'left',
    },
    container: { height: 270 },
    countStyle: {
      color: colors.white_snow,
      fontSize: 15,
      marginLeft: UI_SIZE_4,
    },
    emojiStyle: { fontSize: 20 },
    extraMargin: {
      marginTop: UI_SIZE_4 + UI_SIZE_2,
    },
    grayText: {
      color: colors.keet_grey_200,
    },
    name: {
      ...theme.text.body,
      ...s.container,
    },
    riv: {
      height: 25,
      width: 25,
    },
    row: {
      ...s.centerAlignedRow,
      height: UI_SIZE_48,
      marginHorizontal: theme.spacing.normal,
    },
    tabBarIndicator: {
      backgroundColor: colors.white_snow,
    },
    tabBarStyle: {
      backgroundColor: TRANSPARENT,
      marginBottom: 15,
    },
    tabBarTabItemContainer: {
      alignItems: 'center',
      flexDirection: 'row',
      height: 60,
      justifyContent: 'center',
      width: 70,
    },
    tabBarTabStyle: {
      width: 70,
    },
    textWrapper: {
      ...s.container,
      ...s.centerAlignedRow,
      borderBottomColor: theme.color.grey_600,
      borderBottomWidth: 1,
      height: UI_SIZE_48,
      marginLeft: UI_SIZE_8,
    },
  })
  return styles
})
