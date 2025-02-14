import { FC, memo, useCallback, useMemo } from 'react'
import { Pressable, StyleSheet, Text } from 'react-native'
import { useDispatch } from 'react-redux'
import isEqual from 'react-fast-compare'

import {
  getRoomInfoFilesTab,
  ROOM_INFO_FILES_TAB,
  ROOM_INFO_FILES_TAB_VALUE,
  setRoomInfoFilesTab,
} from '@holepunchto/keet-store/store/room'

import { colorWithAlpha, createThemedStylesheet } from 'component/theme'
import {
  TRANSPARENT,
  UI_SIZE_2,
  UI_SIZE_4,
  UI_SIZE_8,
  UI_SIZE_64,
} from 'lib/commonStyles'
import { useDeepEqualSelector } from 'lib/hooks/useDeepEqualSelector'

import { useStrings } from 'i18n/strings'

interface RoomFilesTabBarSectionProps {
  tab: ROOM_INFO_FILES_TAB_VALUE
}

export const RoomFilesTabBarSection: FC<RoomFilesTabBarSectionProps> = memo(
  ({ tab }) => {
    const activeTab = useDeepEqualSelector(getRoomInfoFilesTab)
    const dispatch = useDispatch()

    const strings = useStrings()
    const styles = getStyles()

    const onPress = useCallback(() => {
      dispatch(setRoomInfoFilesTab(tab))
    }, [dispatch, tab])

    const title = useMemo(() => {
      if (tab === ROOM_INFO_FILES_TAB.MEDIA) return strings.chat.media
      if (tab === ROOM_INFO_FILES_TAB.AUDIO) return strings.chat.audio

      return strings.chat.files
    }, [strings.chat.audio, strings.chat.files, strings.chat.media, tab])

    return (
      <Pressable
        style={[
          styles.tabContainer,
          activeTab === tab && styles.tabContainerActive,
        ]}
        onPress={onPress}
        hitSlop={UI_SIZE_4}
      >
        <Text
          style={[styles.tabTitle, activeTab === tab && styles.tabTitleActive]}
        >
          {title}
        </Text>
      </Pressable>
    )
  },
  isEqual,
)

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    tabContainer: {
      borderColor: TRANSPARENT,
      borderRadius: UI_SIZE_8,
      borderWidth: theme.border.width,
      minWidth: UI_SIZE_64 - UI_SIZE_2,
      paddingHorizontal: UI_SIZE_8,
      paddingVertical: UI_SIZE_4,
    },
    tabContainerActive: {
      backgroundColor: theme.color.primary_blue_20,
      borderColor: colorWithAlpha(theme.color.blue_400, 0.1),
      borderWidth: theme.border.width,
    },
    tabTitle: {
      ...theme.text.body,
      color: theme.color.grey_200,
      textAlign: 'center',
    },
    tabTitleActive: {
      color: theme.text.codeBlock.color,
    },
  })
  return styles
})
