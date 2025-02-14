import React, { useCallback } from 'react'
import { Modal, StyleSheet, Text, View } from 'react-native'
import * as Clipboard from 'expo-clipboard'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated'
import {
  useSafeAreaFrame,
  useSafeAreaInsets,
} from 'react-native-safe-area-context'
import { create } from 'zustand'
import { FlashList, type ListRenderItem } from '@shopify/flash-list'

import {
  AnimatedPressable,
  ButtonBaseProps,
  IconButton,
} from 'component/Button'
import { CloseButton } from 'component/CloseButton'
import SvgIcon from 'component/SvgIcon'
import {
  colors,
  colorWithAlpha,
  createThemedStylesheet,
  getTheme,
} from 'component/theme'
import commonStyles, { UI_SIZE_16, UI_SIZE_20 } from 'lib/commonStyles'
import { elapsedTime } from 'lib/date'
import {
  getStorageDevConsoleEnabled,
  setStorageDevConsoleEnabled,
} from 'lib/localStorage'
import { isIOS } from 'lib/platform'

type Log = [string, string]

interface DevConsoleState {
  visibleLogs: boolean
  enabled: boolean
  logs: Log[]
}

const useStore = create<DevConsoleState>((_set, _get) => ({
  visibleLogs: false,
  enabled: getStorageDevConsoleEnabled(),
  logs: [],
}))

let prevMs: number = 0

const renderItem: ListRenderItem<Log> = ({ item, extraData }) => {
  const [log, elapsed] = item
  const styles = extraData as ReturnType<typeof getStyles>

  return (
    <>
      <Text style={styles.text}>{log}</Text>
      {elapsed.length > 0 && <Text style={styles.elapsed}>{elapsed}</Text>}
    </>
  )
}

export const setUpDevConsole = async () => {
  __kc_logListener = (msg) => {
    console.log(`+++ ${msg}`)

    const { enabled, logs } = useStore.getState()
    if (!enabled) {
      return
    }

    const ms = Date.now()
    const timeInfo = prevMs !== 0 ? elapsedTime(ms, prevMs) : ''
    prevMs = ms
    useStore.setState({ logs: [[msg.slice(0, -1), timeInfo], ...logs] })
  }

  if (getStorageDevConsoleEnabled()) {
    useStore.setState({ enabled: true, visibleLogs: false })

    const originErrorLog = console.error
    // override the console.error to capture the error messages
    console.error = function (...args) {
      const { logs } = useStore.getState()

      const msg = `[console.error] ${args[0]}`
      const ms = Date.now()
      const timeInfo = prevMs !== 0 ? elapsedTime(ms, prevMs) : ''
      prevMs = ms
      useStore.setState({ logs: [[msg, timeInfo], ...logs] })

      originErrorLog.apply(this, args)
    }
  }
}

export const toggleDevConsole = async () => {
  const enabled = !useStore.getState().enabled

  setStorageDevConsoleEnabled(enabled)

  if (enabled) {
    prevMs = 0
    useStore.setState({ enabled: true, visibleLogs: false })
  } else {
    useStore.setState({ enabled: false, visibleLogs: false, logs: [] })
  }
}

// floating button

const BUTTON_AREA_SIZE = 80

const FloatingMenu = (props: Pick<ButtonBaseProps, 'onPress'>) => {
  const { top, left, bottom, right } = useSafeAreaInsets()
  const { width, height } = useSafeAreaFrame()
  const theme = getTheme()

  const x = useSharedValue(
    width - right - BUTTON_AREA_SIZE - getTheme().spacing.standard,
  )
  const y = useSharedValue(height - bottom - BUTTON_AREA_SIZE)

  const panGestureEvent = Gesture.Pan()
    .onChange((event) => {
      x.value += event.changeX
      y.value += event.changeY
    })
    .onEnd(() => {
      x.value = withSpring(
        Math.max(left, Math.min(x.value, width - BUTTON_AREA_SIZE)),
      )
      y.value = withSpring(
        Math.max(top, Math.min(y.value, height - BUTTON_AREA_SIZE)),
      )
    })

  const styles = getStyles()
  const panStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: x.value }, { translateY: y.value }],
    }
  }, [x, y])

  return (
    <GestureDetector gesture={panGestureEvent}>
      <AnimatedPressable
        style={[styles.menuRoot, panStyle]}
        onPress={props.onPress}
      >
        <SvgIcon
          name="console"
          width={UI_SIZE_20}
          height={UI_SIZE_20}
          color={theme.color.blue_400}
        />
      </AnimatedPressable>
    </GestureDetector>
  )
}

export const DevConsole = () => {
  const { logs, enabled, visibleLogs } = useStore()
  const { top } = useSafeAreaInsets()

  const styles = getStyles()

  const toggleVisibleLogs = useCallback(
    () => useStore.setState({ visibleLogs: !visibleLogs }),
    [visibleLogs],
  )

  const onPressCopy = useCallback(async () => {
    await Clipboard.setStringAsync(logs.toString())
  }, [logs])

  if (!enabled) {
    return null
  }

  return (
    <>
      <FloatingMenu onPress={toggleVisibleLogs} />
      <Modal statusBarTranslucent visible={visibleLogs}>
        <View style={styles.container}>
          <View style={{ height: top }} />
          <FlashList
            inverted
            data={logs}
            extraData={styles}
            renderItem={renderItem}
            estimatedItemSize={40}
          />
          <View style={[styles.buttonsContainer, commonStyles.row, { top }]}>
            <IconButton onPress={onPressCopy}>
              <SvgIcon
                name="copy"
                width={UI_SIZE_20}
                height={UI_SIZE_20}
                color={colors.keet_grey_200}
              />
            </IconButton>
            <CloseButton
              onPress={toggleVisibleLogs}
              style={styles.closeModal}
              width={UI_SIZE_20}
              height={UI_SIZE_20}
            />
          </View>
        </View>
      </Modal>
    </>
  )
}

const fontFamily = isIOS ? 'Menlo-Regular' : 'monospace'

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    buttonsContainer: {
      position: 'absolute',
      right: theme.spacing.standard,
    },
    closeModal: {
      backgroundColor: colorWithAlpha('#000000', 0.5),
    },
    container: {
      backgroundColor: theme.color.bg,
      flex: 1,
      paddingVertical: UI_SIZE_16,
    },
    elapsed: {
      color: theme.color.accent,
      fontFamily,
      fontSize: 12,
      marginHorizontal: theme.spacing.standard,
    },
    menuRoot: {
      backgroundColor: colorWithAlpha(theme.color.blue_400, 0.1),
      borderRadius: BUTTON_AREA_SIZE / 2,
      borderWidth: 1,
      height: BUTTON_AREA_SIZE,
      position: 'absolute',
      width: BUTTON_AREA_SIZE,
      ...commonStyles.centeredLayout,
    },
    text: {
      color: colors.white_snow,
      fontFamily,
      fontSize: 14,
      marginHorizontal: theme.spacing.standard,
      marginTop: theme.spacing.standard / 2,
    },
  })
  return styles
})
