import React, { memo, useCallback } from 'react'
import { ScrollView, StyleSheet, Text, View } from 'react-native'
import _get from 'lodash/get'

import { ButtonBase } from 'component/Button'
import { NavBar } from 'component/NavBar'
import { RoomParticipants } from 'component/RoomParticipants'
import SvgIcon from 'component/SvgIcon'
import { colors, createThemedStylesheet } from 'component/theme'
import s, {
  UI_SIZE_2,
  UI_SIZE_4,
  UI_SIZE_12,
  UI_SIZE_16,
  UI_SIZE_20,
  UI_SIZE_44,
} from 'lib/commonStyles'
import WithRoomIdRendered from 'lib/hoc/withRoomIdRendered'
import { navigate, SCREEN_ROOM_MEMBERS } from 'lib/navigation'

import { useStrings } from 'i18n/strings'

const AdminsAndModsScreen = WithRoomIdRendered(({ roomId, route }: any) => {
  const styles = getStyles()
  const strings = useStrings()
  const { memberId } = _get(route, 'params', {})

  const navigateToMembers = useCallback(() => {
    navigate(SCREEN_ROOM_MEMBERS, { roomId, isFromModView: true })
  }, [roomId])

  return (
    <View style={s.container}>
      <NavBar
        title={strings.room.adminDashboard.adminsAndMods}
        middle={null}
        right={null}
      />
      <View style={s.container}>
        <ScrollView
          keyboardDismissMode="on-drag"
          contentInsetAdjustmentBehavior="always"
          contentContainerStyle={styles.scrollview}
        >
          <View style={styles.widgetWrapper}>
            <ButtonBase
              hint="member-permissions"
              onPress={navigateToMembers}
              style={styles.buttonWrapper}
            >
              <View style={styles.iconWrapper}>
                <SvgIcon
                  name="filtersHorizontal"
                  color={colors.white_snow}
                  width={UI_SIZE_20}
                  height={UI_SIZE_20}
                />
              </View>

              <View style={styles.contentWrapper}>
                <Text style={styles.buttonText}>
                  {strings.room.adminDashboard.memberPermissions}
                </Text>
              </View>

              <View style={styles.iconWrapper}>
                <SvgIcon
                  name="chevronRight"
                  color={colors.white_snow}
                  width={UI_SIZE_20}
                  height={UI_SIZE_20}
                />
              </View>
            </ButtonBase>
          </View>
          <RoomParticipants
            roomId={roomId}
            moderators
            isFromModView
            memberId={memberId}
          />
        </ScrollView>
      </View>
    </View>
  )
})

export default memo(AdminsAndModsScreen)

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    buttonText: {
      ...theme.text.body,
    },
    buttonWrapper: {
      ...s.centerAlignedRow,
      paddingHorizontal: UI_SIZE_4,
      paddingVertical: UI_SIZE_2,
    },
    contentWrapper: {
      ...s.container,
      ...s.centerAlignedRow,
      height: UI_SIZE_44,
      marginLeft: UI_SIZE_12,
      paddingRight: UI_SIZE_20,
    },
    iconWrapper: {
      ...s.centeredLayout,
      height: UI_SIZE_44,
      width: UI_SIZE_44,
    },
    scrollview: {
      gap: UI_SIZE_16,
      paddingHorizontal: UI_SIZE_16,
    },
    widgetWrapper: {
      backgroundColor: theme.color.grey_600,
      borderRadius: UI_SIZE_12,
    },
  })
  return styles
})
