import { useMemo } from 'react'
import { useSafeAreaFrame } from 'react-native-safe-area-context'

import { isIOS } from 'lib/platform'

import { useMediaPreviewOffset } from './useMediaPreviewOffset'

interface UseMediaPreviewSizesParams {
  x: number
  y: number
  width: number
  height: number
  aspectRatio: number
}
export const useMediaPreviewSizes = ({
  width: initWidth,
  height: initHeight,
  aspectRatio,
  x,
  y,
}: UseMediaPreviewSizesParams) => {
  const { height: WINDOW_HEIGHT, width: WINDOW_WIDTH } = useSafeAreaFrame()
  const { top, bottomOffset } = useMediaPreviewOffset()

  const maxHeight = useMemo(
    () => WINDOW_HEIGHT - (isIOS ? 0 : top + bottomOffset),
    [WINDOW_HEIGHT, bottomOffset, top],
  )
  const [height, width] = useMemo(() => {
    if (aspectRatio <= 1) {
      return [aspectRatio * WINDOW_WIDTH, WINDOW_WIDTH]
    }

    return [WINDOW_WIDTH * aspectRatio, WINDOW_WIDTH]
  }, [WINDOW_WIDTH, aspectRatio])

  const scaleX = useMemo(() => initWidth / width, [width, initWidth])
  const scaleY = useMemo(() => initHeight / height, [height, initHeight])
  const leftInset = useMemo(
    () => x - (width - initWidth) / 2,
    [width, initWidth, x],
  )
  const topInset = useMemo(() => {
    return y - (maxHeight - initHeight) / 2
  }, [initHeight, maxHeight, y])

  return {
    leftInset,
    topInset,
    scaleX,
    scaleY,
    height,
    width,
  }
}
