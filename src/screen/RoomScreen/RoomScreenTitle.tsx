import React, { memo } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { useSelector } from 'react-redux'
import isEqual from 'react-fast-compare'
import { useTheme } from '@react-navigation/native'

import { getAppCurrentRoomId } from '@holepunchto/keet-store/store/app'
import { getNetworkOnline } from '@holepunchto/keet-store/store/network'
import { getRoomMemberCount } from '@holepunchto/keet-store/store/room'

import { RoomAvatarImage } from 'component/RoomAvatarImage'
import { RoomTitle as RoomTitleComponent } from 'component/RoomTitle'
import SvgIcon from 'component/SvgIcon'
import { colors, createThemedStylesheet } from 'component/theme'
import s, {
  UI_SIZE_2,
  UI_SIZE_4,
  UI_SIZE_8,
  UI_SIZE_10,
  UI_SIZE_12,
  UI_SIZE_14,
  UI_SIZE_42,
} from 'lib/commonStyles'

import { useStrings } from 'i18n/strings'

const RoomScreenTitle = memo(
  ({
    title,
    experimental,
    hideMembers,
  }: {
    title: string
    experimental?: boolean
    hideMembers?: boolean
  }) => {
    const theme = useTheme()
    const styles = getStyles()
    const strings = useStrings()

    const roomId = useSelector(getAppCurrentRoomId)
    const isNetworkOnline = useSelector(getNetworkOnline)

    const count: number = useSelector(getRoomMemberCount(roomId)) || 0

    return (
      <View style={[s.container, s.centerAlignedRow]}>
        <RoomAvatarImage
          roomId={roomId}
          size={UI_SIZE_42}
          style={styles.avatar}
        />
        <View style={s.container}>
          <View style={s.centerAlignedRow}>
            {experimental && (
              <SvgIcon
                name="pear_gray"
                color={theme.colors.primary}
                width={UI_SIZE_14}
                height={UI_SIZE_14}
                style={styles.titleIcon}
              />
            )}
            <RoomTitleComponent
              fontSize={16}
              title={title}
              style={styles.title}
            />
          </View>
          {isNetworkOnline && !hideMembers && (
            <View style={s.centerAlignedRow}>
              <SvgIcon
                name="usersThree"
                color={colors.keet_grey_300}
                width={UI_SIZE_12}
                height={UI_SIZE_12}
              />
              <Text style={styles.subTitle}>
                {`${
                  count > 1
                    ? `${count} ${strings.call.peers}`
                    : `${count} ${strings.call.peer}`
                }`}
              </Text>
            </View>
          )}
          {!isNetworkOnline && (
            <View style={s.centerAlignedRow}>
              <SvgIcon
                name="circleExclamation"
                width={UI_SIZE_10}
                height={UI_SIZE_10}
                color={colors.red_400}
                style={styles.iconContainer}
              />
              <Text style={styles.subTitle}>
                {strings.networkStatus.offlineShort}
              </Text>
            </View>
          )}
        </View>
      </View>
    )
  },
  isEqual,
)

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    avatar: {
      marginRight: UI_SIZE_8,
    },
    iconContainer: {
      marginTop: 3,
    },
    subTitle: {
      ...theme.text.body,
      color: theme.color.grey_100,
      fontSize: 10,
      marginLeft: UI_SIZE_2,
    },
    title: {
      ...theme.text.title2,
    },
    titleIcon: {
      marginRight: UI_SIZE_4,
    },
  })
  return styles
})

export default RoomScreenTitle
