import React, { memo, ReactNode } from 'react'
import {
  Pressable as NativePressable,
  StyleSheet,
  ViewStyle,
} from 'react-native'
import isEqual from 'react-fast-compare'
import { Pressable as GesturePressable } from 'react-native-gesture-handler'
import Animated from 'react-native-reanimated'

import { createThemedStylesheet } from 'component/theme'
import { UI_SIZE_4, UI_SIZE_8, UI_SIZE_14 } from 'lib/commonStyles'
import { isIOS } from 'lib/platform'

import { useAnchorChatMessage } from './hooks/useAnchorChatMessage'

/**
 * Pressable behaves differently across platforms, on iOS gesture pressable affects media preview
 * While on android, native pressable affects nested touch events
 */
const Pressable = isIOS ? NativePressable : GesturePressable

interface ChatEventContainerProps {
  children?: ReactNode
  fromLocal?: boolean
  centered?: boolean
  onLongPress?: () => void
  style?: ViewStyle
  shouldHighlight?: boolean
}

export const ChatEventContainer = memo(
  ({
    onLongPress,
    fromLocal,
    centered,
    style,
    children,
    shouldHighlight,
  }: ChatEventContainerProps) => {
    const styles = getStyles()

    const [anchorMessageAnimatedStyle] = useAnchorChatMessage({
      source: centered ? 'center' : fromLocal ? 'sent' : 'received',
      shouldHighlight,
    })

    return (
      <Pressable onLongPress={onLongPress} hitSlop={UI_SIZE_4}>
        <Animated.View
          style={[
            styles.container,
            fromLocal ? styles.sentContainer : styles.receivedContainer,
            centered && styles.centerAlignContainer,
            style,
            shouldHighlight && anchorMessageAnimatedStyle,
          ]}
        >
          {children}
        </Animated.View>
      </Pressable>
    )
  },
  isEqual,
)

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    centerAlignContainer: {
      backgroundColor: theme.background.bg_1,
    },
    container: {
      borderRadius: UI_SIZE_14,
      padding: UI_SIZE_8,
    },
    receivedContainer: {
      backgroundColor: theme.background.bg_2,
      borderTopLeftRadius: 0,
    },
    sentContainer: {
      backgroundColor: theme.color.blue_950,
      borderBottomRightRadius: 0,
    },
  })
  return styles
})
