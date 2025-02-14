import React, { useCallback, useRef } from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'

import { ROOM_TYPE_FILTER } from '@holepunchto/keet-store/store/room'

import SvgIcon from 'component/SvgIcon'
import {
  colors,
  colorWithAlpha,
  createThemedStylesheet,
  useTheme,
} from 'component/theme'
import { APPIUM_IDs, appiumTestProps } from 'lib/appium'
import { SHOW_ROOM_FILTER } from 'lib/build.constants'
import s, { UI_SIZE_18 } from 'lib/commonStyles'

import { RoomListSectionType } from './types'

export const RoomListSection = ({
  title,
  roomTypes,
  showModal,
  showFilterModal,
}: RoomListSectionType) => {
  const styles = getStyles()
  const theme = useTheme()
  const iconViewRef = useRef<View>(null)

  const handleClick = useCallback(() => {
    iconViewRef?.current?.measure?.((fx, fy, width, height, px, py) => {
      const iconPosition = { top: py }
      showFilterModal({ iconPosition })
    })
  }, [showFilterModal])

  return (
    <View style={[s.container, SHOW_ROOM_FILTER && styles.wrapper]}>
      {SHOW_ROOM_FILTER && (
        <View
          style={[s.container, s.row, s.flexSpaceBetween, s.alignItemsCenter]}
        >
          <Text
            {...appiumTestProps(APPIUM_IDs.lobby_selected_filter)}
            style={styles.sectionTitle}
          >
            {title}
          </Text>
          <TouchableOpacity
            {...appiumTestProps(APPIUM_IDs.lobby_filter)}
            ref={iconViewRef}
            onPress={handleClick}
            style={[styles.buttonBase, showModal && styles.buttonActive]}
          >
            <SvgIcon
              name="barsFilter"
              color={
                showModal || !roomTypes.includes(ROOM_TYPE_FILTER.ALL)
                  ? theme.color.blue_400
                  : colors.white_snow
              }
              width={UI_SIZE_18}
              height={UI_SIZE_18}
            />
          </TouchableOpacity>
        </View>
      )}
    </View>
  )
}

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    buttonActive: {
      backgroundColor: theme.color.grey_600,
    },
    buttonBase: {
      borderRadius: theme.border.radiusNormal,
      padding: theme.spacing.standard * 0.5,
      paddingVertical: 9,
    },
    sectionTitle: {
      ...theme.text.title2,
      backgroundColor: theme.background.bg_1,
      color: colorWithAlpha(theme.text.title2.color as string, 0.4),
    },
    wrapper: {
      paddingBottom: theme.spacing.standard * 0.25,
      paddingHorizontal: theme.spacing.standard * 0.75,
      paddingTop: theme.spacing.standard,
    },
  })
  return styles
})
