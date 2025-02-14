import React, { useCallback, useRef, useState } from 'react'
import { FlatList, StyleSheet, Text, TextInput, View } from 'react-native'
import { useDispatch } from 'react-redux'
import { SafeAreaView } from 'react-native-safe-area-context'

import { handleBatchJoinRoom } from 'sagas/roomsSaga'

import { ButtonBase, TextButton, TextButtonType } from 'component/Button'
import { NavBar } from 'component/NavBar'
import SvgIcon from 'component/SvgIcon'
import { colors, createThemedStylesheet, useTheme } from 'component/theme'
import { APPIUM_IDs } from 'lib/appium'
import s, {
  UI_SIZE_4,
  UI_SIZE_8,
  UI_SIZE_12,
  UI_SIZE_14,
  UI_SIZE_18,
  UI_SIZE_40,
} from 'lib/commonStyles'
import { SAFE_EDGES } from 'lib/constants'

import { useStrings } from 'i18n/strings'

import DiscoverSortOptions from './DiscoverSortOptions'
import DiscoveryList from './DiscoveryList'
import {
  CommunityRoomDetails,
  getDiscoveryRoomInvites,
  SHOW_SEARCH,
} from './helpers'
import keetCommunityRooms from './keet_community_rooms'

function DiscoverCommunities() {
  const styles = getStyles()
  const strings = useStrings()
  const theme = useTheme()
  const dispatch = useDispatch()
  const iconViewRef = useRef<View>(null)

  const [isVisible, setIsVisible] = useState(false)
  const [iconPosition, setIconPosition] = useState({ top: 0 })
  const [selectedSort, setSelectedSort] = useState<string>()
  const [selectedRoom, setSelectedRoom] = useState<string[]>([])

  const handleClick = useCallback(() => {
    iconViewRef?.current?.measure?.((fx, fy, width, height, px, py) => {
      setIconPosition({ top: py })
      setIsVisible(true)
    })
  }, [])

  const closeFilterModal = useCallback(() => {
    setIsVisible(false)
  }, [])

  const onSelect = useCallback((data: string) => {
    setSelectedSort(data)
  }, [])

  const keyExtractor = useCallback(
    (item: CommunityRoomDetails) => item.discoveryId,
    [],
  )

  const renderCommunityRooms = useCallback(
    ({ item }: any) => {
      return (
        <DiscoveryList
          title={item.title}
          discoveryId={item.discoveryId}
          avatar={item.avatarUrl}
          peersCount={item.peersCount}
          description={item.description}
          contactCount={item.contactCount}
          roomType={item?.roomType}
          selectedRoom={selectedRoom}
          setSelectedRoom={setSelectedRoom}
        />
      )
    },
    [selectedRoom],
  )

  const joinCommunity = useCallback(() => {
    const roomsToJoin = getDiscoveryRoomInvites(selectedRoom)
    dispatch(handleBatchJoinRoom(roomsToJoin))
  }, [dispatch, selectedRoom])

  return (
    <SafeAreaView style={s.container} edges={SAFE_EDGES}>
      <NavBar title={strings.discoverCommunities.title} centerTitle />
      <View style={styles.wrapper}>
        {SHOW_SEARCH && (
          <View style={[s.row, s.flex, s.flexSpaceBetween]}>
            <TextInput
              style={styles.textInput}
              placeholder={strings.discoverCommunities.search}
              placeholderTextColor={theme.text.placeholder.color}
            />
            <ButtonBase style={styles.sortBtn} onPress={handleClick}>
              <View
                ref={iconViewRef}
                style={[s.fullHeight, s.fullWidth, s.row, s.centeredLayout]}
              >
                <Text style={styles.btnText}>Sort by</Text>
                <SvgIcon
                  name="barsFilter"
                  color={colors.white_snow}
                  width={UI_SIZE_18}
                  height={UI_SIZE_18}
                  style={styles.barsFilter}
                />
              </View>
            </ButtonBase>
          </View>
        )}
        <FlatList
          data={Object.values(keetCommunityRooms)}
          keyExtractor={keyExtractor}
          contentContainerStyle={styles.listWrapper}
          renderItem={renderCommunityRooms}
        />
      </View>
      <TextButton
        text={
          selectedRoom.length > 0
            ? strings.discoverCommunities.joinRoomCount.replace(
                '$0',
                String(selectedRoom.length),
              )
            : strings.discoverCommunities.joinAll
        }
        hint={strings.discoverCommunities.joinAll}
        style={styles.btnJoin}
        type={TextButtonType.primary}
        testID={APPIUM_IDs.discover_community_join_room}
        onPress={joinCommunity}
      />
      <DiscoverSortOptions
        isVisible={isVisible}
        closeFilterModal={closeFilterModal}
        iconPosition={iconPosition}
        selectedSort={selectedSort!}
        onSelect={onSelect}
      />
    </SafeAreaView>
  )
}

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    barsFilter: {
      marginLeft: UI_SIZE_4,
    },
    btnJoin: {
      marginHorizontal: theme.spacing.standard,
    },
    btnText: {
      ...theme.text.body,
      fontSize: UI_SIZE_12,
    },
    listWrapper: {
      marginTop: UI_SIZE_12,
    },
    sortBtn: {
      backgroundColor: theme.color.grey_700,
      borderRadius: UI_SIZE_8,
      width: '25%',
      ...s.row,
    },
    textInput: {
      height: UI_SIZE_40,
      paddingLeft: theme.spacing.standard,
      ...theme.text.body,
      ...s.bidirectionalInput,
      backgroundColor: theme.color.grey_600,
      borderRadius: UI_SIZE_8,
      fontSize: UI_SIZE_14,
      width: '72%',
    },
    wrapper: {
      flex: 1,
      paddingHorizontal: theme.spacing.standard,
    },
  })
  return styles
})

export default DiscoverCommunities
