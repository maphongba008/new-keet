import { useMemo } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { STATS_BAR_HEIGHT } from 'screen/RoomScreen/ChatEvent/FileStatsBar'

export const NAV_HEIGHT = 44

export const useMediaPreviewOffset = () => {
  const { top, bottom: bottomOffset } = useSafeAreaInsets()

  const topOffset = useMemo(() => top + NAV_HEIGHT + STATS_BAR_HEIGHT, [top])

  return {
    topOffset,
    bottomOffset,
    statsBarOffset: topOffset - STATS_BAR_HEIGHT,
    top,
  }
}
