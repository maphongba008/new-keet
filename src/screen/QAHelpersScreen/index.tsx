/* eslint-disable react/jsx-no-bind */
import React, { useCallback, useState } from 'react'
import {
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native'
import { useDispatch } from 'react-redux'

import { purgeAllCacheCmd } from '@holepunchto/keet-store/store/cache'
import {
  createRoomSubmit,
  getRoomListAllIds,
  ROOM_TYPE,
} from '@holepunchto/keet-store/store/room'

import { handleBatchJoinRoom } from 'sagas/roomsSaga'

import { TextButton } from 'component/Button'
import { BackButton, NavBar } from 'component/NavBar'
import { colors, useTheme } from 'component/theme'
import s, { UI_SIZE_4, UI_SIZE_8, UI_SIZE_12 } from 'lib/commonStyles'
import { ROOM_URL_PREFIX } from 'lib/constants'
import { showInfoNotifier } from 'lib/hud'
import { Keys, localStorage } from 'lib/localStorage'
import { useToggleRoomStatStore } from 'lib/localStorage/qaHelpersStorage'
import { safeRemoveItem, storage } from 'lib/localStorage/storageUtils'
import { DISCOVER_COMMUNITY, navigate, SCREEN_SVG_ICONS } from 'lib/navigation'
import { getState } from 'lib/store'

// Permanent invites to the QA rooms: Do not use QA 1 - 7 https://holepunchdev.slack.com/archives/C053YD2J0SK/p1718912922158379
const QA_BOT_ROOMS = [
  `${ROOM_URL_PREFIX}keet/yryat4smdxyzfbj61t55f6n1b3f3sxmbs3bt4drdde8fra46t1ffz16smfyafierix1oqd9e5wf53aif7wdxc1q3xh9xuzq3drw9de6bte`, // QA Room 9: (6 bots, 1 msg/min each for eternity)
  `${ROOM_URL_PREFIX}keet/yryoetfupg3zpzedjy4pbjznwx69rhq91uxnq5z6m5u9gyaiac4urx1xaf6r8rscktmpohwjtn16rafaon4jhpfpdfqj61zwbffcty6dna`, // QA Room 10: (6 bots, 1msg / 5 min each for eternity)
  `${ROOM_URL_PREFIX}keet/yrb74xikq1w3oouh7fhybc81dzfy1goizhahcfbaz6qydookcjjg9ouwxa3fzz7an8nio3qqnep5q7ni3uzffurr4j9i6mjexy43mdygf4psdmu8`, // QA Room 11: (6 reacting chaos bots, 1 message per 3 min each - With display formats, media, reactions, replyTo)
]

const MEDIA_AND_FILES_ROOMS = [
  `${ROOM_URL_PREFIX}keet/yrb93my5yhjddjo38cpwxcdw7c5foqdz57hmz7z5tiof5r7ccimxm3c7whdpq4wmgomwmq5u973ijqjs5zrhcg7nsnyp6mqrfateu71b9bzjdpd8`, // Classic Keet Room MKVII
  `${ROOM_URL_PREFIX}keet/yrbhm6naqotu4hwokyrwmhwk3aoi4e49t3gd3ipwm184nc99a4so7n43joncx3mn8qx9y3phnm81yrm4bhn3kguaujd7qsqnio8yzdk9i4k3dpd8`, // Media and Files Room MKII
  `${ROOM_URL_PREFIX}keet/yry1swgbipfe3ii36jw6kj8jx6amg1fra5ippaz5banbxrb1sfsbsiww5eqydqccwz6sxdr5414ro5xkuinu4pnyxqup9i57bwf1rhx9ra`, // Media and Files Room MKIII
]

const Toggle = ({
  title,
  description,
  value,
  onValueChange,
}: {
  title?: string
  description: string
  value: boolean
  onValueChange: (value: boolean) => void
}) => {
  const theme = useTheme()
  return (
    <>
      {title && (
        <Text style={[theme.text.title2, theme.text.greyText]}>{title}</Text>
      )}
      <View style={[s.row, s.flexSpaceBetween, s.alignItemsCenter]}>
        <Text style={theme.text.body}>{description}</Text>
        <Switch
          trackColor={{ true: colors.blue_400 }}
          thumbColor={colors.white_snow}
          ios_backgroundColor={colors.keet_grey_600}
          onValueChange={onValueChange}
          value={value}
        />
      </View>
    </>
  )
}

export const RoomStatToggle = () => {
  const isShowRoomStat = useToggleRoomStatStore((state) => state.isShowRoomStat)

  return (
    <Toggle
      title={'Chat'}
      description="Show Room Stat"
      value={isShowRoomStat}
      onValueChange={(value) =>
        useToggleRoomStatStore.getState().setIsShowRoomStat(value)
      }
    />
  )
}

const QAHelpersScreen = () => {
  const theme = useTheme()
  const dispatch = useDispatch()
  const [roomPrefix, setRoomPrefix] = useState('')
  const [roomValue, setRoomValue] = useState('')
  const [broadcastPrefix, setBroadcastPrefix] = useState('')
  const [broadcastValue, setBroadcastValue] = useState('')

  const handleClearLobbyCache = useCallback(() => {
    dispatch(purgeAllCacheCmd())
    showInfoNotifier('Cache cleared!')
  }, [dispatch])

  const handleChatsClearCache = useCallback(() => {
    const state = getState()
    const storageKeys = storage.getAllKeys()
    const roomIds = getRoomListAllIds(state) || []
    roomIds.forEach((roomId: string) => {
      const key = `chat_${roomId}`
      if (storageKeys.includes(key)) {
        safeRemoveItem(key)
      }
    })
    showInfoNotifier('Cleared!')
  }, [])

  const handleClearOnboardingStorage = useCallback(() => {
    localStorage.removeItem(Keys.NEEDS_ON_BOARDING)
    localStorage.removeItem(Keys.LAST_CONSENT_DATE_KEY)
    showInfoNotifier('Cleared!')
  }, [])

  const handleRoomsCreation = useCallback(() => {
    const roomsCount = Number(roomValue)
    const broadcastCount = Number(broadcastValue)

    if (roomsCount && !isNaN(roomsCount)) {
      for (let i = 1; i <= roomsCount; i++) {
        const title = roomPrefix || 'Room'
        dispatch(
          createRoomSubmit({
            title: `${title} ${i}`,
          }),
        )
      }
    }

    if (broadcastCount && !isNaN(broadcastCount)) {
      for (let i = 1; i <= broadcastCount; i++) {
        const title = broadcastPrefix || 'Broadcast Room'
        dispatch(
          createRoomSubmit({
            title: `${title} ${i}`,
            opts: {
              roomType: ROOM_TYPE.BROADCAST,
              canCall: 'false',
            },
          }),
        )
      }
    }

    showInfoNotifier('Rooms created!')
  }, [broadcastPrefix, broadcastValue, dispatch, roomPrefix, roomValue])

  const handleDiscoverCommunities = useCallback(() => {
    navigate(DISCOVER_COMMUNITY)
  }, [])

  const handleJoinMediaFileRoom = useCallback(() => {
    dispatch(handleBatchJoinRoom(MEDIA_AND_FILES_ROOMS))
  }, [dispatch])

  const handleJoinQABotRoom = useCallback(() => {
    dispatch(handleBatchJoinRoom(QA_BOT_ROOMS))
  }, [dispatch])

  const handleTriggerError = useCallback(() => {
    // eslint-disable-next-line no-eval
    eval('const a')
  }, [])

  const handleNavigateSvgIconsScreen = useCallback(() => {
    navigate(SCREEN_SVG_ICONS)
  }, [])

  return (
    <ScrollView>
      <NavBar left={<BackButton />} title="QA Helpers" />
      <View style={[styles.container, styles.gap]}>
        {/** Chat */}
        <RoomStatToggle />

        {/** Cache */}
        <Text style={[theme.text.title2, theme.text.greyText]}>Cache</Text>
        <TextButton text="Clear lobby cache" onPress={handleClearLobbyCache} />
        <TextButton text="Clear chats cache" onPress={handleChatsClearCache} />

        {/** Create Room */}
        <Text style={[theme.text.title2, theme.text.greyText]}>
          Create Rooms
        </Text>
        <View style={[s.row, s.flexSpaceBetween]}>
          <TextInput
            style={styles.textInput}
            placeholderTextColor={theme.color.grey_300}
            value={roomPrefix}
            onChangeText={setRoomPrefix}
            placeholder="Room prefix (optional)"
          />
          <TextInput
            style={styles.textInput}
            placeholderTextColor={theme.color.grey_300}
            value={roomValue}
            onChangeText={(text) => setRoomValue(text)}
            inputMode="numeric"
            placeholder="No of group chat rooms"
          />
        </View>
        <View style={[s.row, s.flexSpaceBetween]}>
          <TextInput
            style={styles.textInput}
            placeholderTextColor={theme.color.grey_300}
            value={broadcastPrefix}
            onChangeText={setBroadcastPrefix}
            placeholder="Broadcast prefix (optional)"
          />
          <TextInput
            style={styles.textInput}
            placeholderTextColor={theme.color.grey_300}
            value={broadcastValue}
            onChangeText={(text) => setBroadcastValue(text)}
            inputMode="numeric"
            placeholder="No of broadcast feed rooms"
          />
        </View>
        <TextButton
          text="Create rooms"
          onPress={handleRoomsCreation}
          disabled={!roomValue && !broadcastValue}
        />

        {/** Test Rooms */}
        <Text style={[theme.text.title2, theme.text.greyText]}>
          Join Test rooms
        </Text>
        <TextButton text="Join QA Bot rooms" onPress={handleJoinQABotRoom} />
        <TextButton
          text="Join Media & Files Rooms"
          onPress={handleJoinMediaFileRoom}
        />

        {/** Prod Rooms */}
        <Text style={[theme.text.title2, theme.text.greyText]}>
          Join Prod rooms (Only join if absolutely necessary)
        </Text>
        <TextButton
          text="Discover Communities"
          onPress={handleDiscoverCommunities}
        />

        {/** System */}
        <Text style={[theme.text.title2, theme.text.greyText]}>System</Text>
        <TextButton
          text="All svg icon"
          onPress={handleNavigateSvgIconsScreen}
        />
        <TextButton text="Trigger error log" onPress={handleTriggerError} />
        <TextButton
          text="Clear onboarding storage"
          onPress={handleClearOnboardingStorage}
        />
      </View>
    </ScrollView>
  )
}

export default QAHelpersScreen

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: UI_SIZE_8,
  },
  gap: {
    gap: UI_SIZE_12,
  },
  textInput: {
    backgroundColor: colors.keet_grey_700,
    borderRadius: UI_SIZE_4,
    color: colors.white_snow,
    padding: UI_SIZE_12,
    width: '48%',
  },
})
