import { FC, memo, useCallback } from 'react'
import { StyleSheet, View } from 'react-native'
import isEqual from 'react-fast-compare'

import { ROOM_INFO_FILES_TAB_VALUE } from '@holepunchto/keet-store/store/room'

import { createThemedStylesheet } from 'component/theme'
import s, {
  UI_SIZE_2,
  UI_SIZE_4,
  UI_SIZE_12,
  UI_SIZE_44,
} from 'lib/commonStyles'

import { RoomFilesTabBarSection } from './RoomFilesTabBarSection'

interface RoomFilesTabBarProps {
  tabs: ROOM_INFO_FILES_TAB_VALUE[]
}

export const RoomFilesTabBar: FC<RoomFilesTabBarProps> = memo(({ tabs }) => {
  const styles = getStyles()
  const renderFile = useCallback((tab: ROOM_INFO_FILES_TAB_VALUE) => {
    return <RoomFilesTabBarSection tab={tab} key={tab} />
  }, [])

  return (
    <View style={styles.navContainer}>
      <View style={styles.tabsContainer}>{tabs.map(renderFile)}</View>
    </View>
  )
}, isEqual)

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    navContainer: {
      ...s.centeredLayout,
      marginRight: UI_SIZE_44,
    },
    tabsContainer: {
      ...s.row,
      borderColor: theme.color.grey_500,
      borderRadius: UI_SIZE_12,
      borderWidth: theme.border.width,
      paddingHorizontal: UI_SIZE_4 + UI_SIZE_2,
      paddingVertical: UI_SIZE_4,
    },
  })
  return styles
})
