import { useKeyboardHandler } from 'react-native-keyboard-controller'
import { useSharedValue } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { UI_SIZE_8 } from 'lib/commonStyles'

// Setback: due to the nature of how interactive keyboard works (scroll + height),
// it's qite tricky to handle both, might have to consider a more native way to solve this edge-case

export const useKeyboardAnimation = () => {
  const progress = useSharedValue(0)
  const height = useSharedValue(0)
  const duration = useSharedValue(0)
  const inset = useSharedValue(0)

  const { bottom: safeAreaBottomPadding } = useSafeAreaInsets()
  const bottomOffset = safeAreaBottomPadding - UI_SIZE_8

  useKeyboardHandler({
    onStart: (e) => {
      'worklet'

      progress.value = e.progress
      height.value = progress.value === 0 ? 0 : e.height - bottomOffset
      duration.value = e.duration
      inset.value = e.height - bottomOffset
    },
    onInteractive: (e) => {
      'worklet'

      progress.value = e.progress
      height.value = e.height > bottomOffset ? e.height - bottomOffset : 0
      duration.value = e.duration
    },
    onMove: (e) => {
      'worklet'
      duration.value = e.duration
    },
    onEnd: (e) => {
      'worklet'

      height.value = progress.value === 0 ? 0 : e.height - bottomOffset
      progress.value = e.progress
      duration.value = e.duration
    },
  })

  return { height, duration }
}
