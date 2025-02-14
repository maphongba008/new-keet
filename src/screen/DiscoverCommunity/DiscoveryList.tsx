/* eslint-disable react/jsx-no-bind */
import React, { useCallback, useMemo } from 'react'
import {
  Image,
  ImageSourcePropType,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'

import { showBottomSheet } from 'component/AppBottomSheet/AppBottomSheet.Store'
import BottomSheetEnum from 'component/AppBottomSheet/SheetComponents/BottomSheetEnum'
import { ButtonBase } from 'component/Button'
import LabeledCheckbox from 'component/Checkbox'
import { colors, createThemedStylesheet } from 'component/theme'
import { APPIUM_IDs } from 'lib/appium'
import s, {
  UI_SIZE_4,
  UI_SIZE_12,
  UI_SIZE_16,
  UI_SIZE_20,
  UI_SIZE_24,
  UI_SIZE_48,
} from 'lib/commonStyles'
import { getRoomTypeFlags } from 'lib/hooks/useRoom'

import { useStrings } from 'i18n/strings'

import { SHOW_SEARCH } from './helpers'

interface DiscoveryListType {
  title: string
  discoveryId: string
  avatar: ImageSourcePropType
  peersCount: number
  contactCount: number
  description: string
  roomType?: string
  selectedRoom: string[]
  setSelectedRoom: Function
}

function DiscoveryList({
  title,
  discoveryId,
  avatar,
  peersCount,
  description,
  contactCount,
  selectedRoom,
  roomType,
  setSelectedRoom,
}: DiscoveryListType) {
  const styles = getStyles()
  const strings = useStrings()
  const { isChannel } = getRoomTypeFlags(roomType)

  const borderStyle = useMemo(
    () => ({
      borderRadius: isChannel ? UI_SIZE_12 : UI_SIZE_24,
    }),
    [isChannel],
  )

  const handlePress = useCallback(
    (id: string) => {
      if (!selectedRoom) {
        return [id]
      }
      if (selectedRoom.indexOf(id) >= 0) {
        setSelectedRoom(selectedRoom.filter((e) => e !== id))
        return
      }
      setSelectedRoom((prev: string[]) => [...prev, id])
    },
    [selectedRoom, setSelectedRoom],
  )

  const showCommunityContacts = useCallback(() => {
    showBottomSheet({
      bottomSheetType: BottomSheetEnum.CommunityContacts,
    })
  }, [])

  return (
    <ButtonBase
      testID={APPIUM_IDs.discover_community_select_room}
      style={[styles.listItem, SHOW_SEARCH && styles.textRow]}
      onPress={() => handlePress(discoveryId)}
    >
      <Image source={avatar} style={[styles.avatar, borderStyle]} />
      <View style={styles.listItemContainer}>
        <Text
          style={styles.listItemTitle}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {title}
        </Text>
        <View style={styles.previewContainer}>
          <Text
            numberOfLines={2}
            ellipsizeMode="tail"
            style={styles.description}
          >
            {description}
          </Text>
          {SHOW_SEARCH && (
            <View style={s.row}>
              {contactCount && (
                <TouchableOpacity onPress={showCommunityContacts}>
                  <Text style={styles.contactCount}>
                    {strings.discoverCommunities.contactCount.replace(
                      '$0',
                      String(contactCount),
                    )}
                  </Text>
                </TouchableOpacity>
              )}
              {peersCount && (
                <Text style={styles.peersCount}>
                  {strings.discoverCommunities.peersCount.replace(
                    '$0',
                    String(peersCount),
                  )}
                </Text>
              )}
            </View>
          )}
        </View>
      </View>
      <LabeledCheckbox
        value={selectedRoom.indexOf(discoveryId) >= 0}
        onChange={() => handlePress(discoveryId)}
      />
    </ButtonBase>
  )
}

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    avatar: {
      borderRadius: UI_SIZE_24,
      height: UI_SIZE_48,
      marginTop: UI_SIZE_4,
      width: UI_SIZE_48,
    },
    contactCount: {
      ...theme.text.body,
      color: theme.color.indigo_400,
      fontSize: UI_SIZE_12,
    },
    description: {
      ...theme.text.body,
      fontSize: UI_SIZE_12,
      width: '94%',
    },
    listItem: {
      ...s.row,
      height: 64,
      marginBottom: UI_SIZE_4,
    },
    listItemContainer: {
      flex: 1,
      marginLeft: UI_SIZE_16,
      ...s.justifyCenter,
    },
    listItemTitle: {
      ...theme.text.title,
      flexShrink: 1,
      fontFamily: theme.text.bodySemiBold.fontFamily,
      fontSize: 14,
      lineHeight: 15 + UI_SIZE_4,
      marginTop: UI_SIZE_4,
    },
    peersCount: {
      ...theme.text.body,
      color: colors.text_grey,
      fontSize: UI_SIZE_12,
      marginLeft: UI_SIZE_4,
    },
    previewContainer: {
      flex: 1,
      minHeight: UI_SIZE_20,
      ...s.row,
      ...s.wrapFlex,
    },
    textRow: {
      marginBottom: UI_SIZE_12,
    },
  })
  return styles
})

export default DiscoveryList
