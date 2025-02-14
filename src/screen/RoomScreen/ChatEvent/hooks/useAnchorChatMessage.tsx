import { useEffect, useMemo } from 'react'
import {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated'

import { useTheme } from 'component/theme'
import {
  RECEIVER_HIGHLIGHT_BG_COLOR,
  SENDER_HIGHLIGHT_BG_COLOR,
} from 'lib/commonStyles'
import { useAppStore } from 'lib/hooks'

const ANCHOR_ANIMATION_DURATION = 2000

const EMPTY_OBJ = Object.freeze({})

interface AnchorChatMessageI {
  shouldHighlight?: boolean
  source: 'sent' | 'received' | 'center'
}

export const useAnchorChatMessage = ({
  source,
  shouldHighlight,
}: AnchorChatMessageI) => {
  const theme = useTheme()
  const offset = useSharedValue(0)
  const { isAuthenticated } = useAppStore()

  const bgColorRange = useMemo(() => {
    return source === 'sent'
      ? [theme.color.blue_900, SENDER_HIGHLIGHT_BG_COLOR]
      : [theme.background.bg_2, RECEIVER_HIGHLIGHT_BG_COLOR]
  }, [source, theme])

  useEffect(() => {
    if (!shouldHighlight || !isAuthenticated) {
      return
    }

    offset.value = withTiming(1, EMPTY_OBJ, (isAnimationCompleted) => {
      if (isAnimationCompleted) {
        offset.value = withTiming(0, {
          duration: ANCHOR_ANIMATION_DURATION,
        })
      }
    })
  }, [offset, isAuthenticated, shouldHighlight])

  const anchorMessageAnimatedStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(offset.value, [0, 1], bgColorRange),
  }))

  return [anchorMessageAnimatedStyle]
}
