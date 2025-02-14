import { Dimensions, PixelRatio } from 'react-native'

import { AVATAR_SIZE } from 'component/Avatar'
import { UI_SIZE_8, UI_SIZE_14, UI_SIZE_16, UI_SIZE_32 } from 'lib/commonStyles'

export const LARGE_SCREEN_THRESHOLD = 700
const { width: windowWidth, height: windowHeight } = Dimensions.get('window')
const BASE_WIDTH = 414 // Base dimensions using iPhone 11 Pro Max as reference

export const getMessageCellAvailableWidth = () => {
  const { width, height } = Dimensions.get('window')

  // padding horizontal + avatar + extra space
  return (
    Math.min(width, height) -
    2 * UI_SIZE_16 -
    (AVATAR_SIZE + UI_SIZE_8) -
    UI_SIZE_32
  )
}

export const getDefaultThumbSize = () => {
  const width = getMessageCellAvailableWidth()
  const height = (width * 3) / 4
  return { width, height }
}

export const checkIfTinyPreview = (height: number) => height <= 100
export const checkIfSmallPreview = (height: number) =>
  height <= 140 && !checkIfTinyPreview(height) // For FilePlaceholder, we hide the file icon if the size is too short

export const calculateImgPreviewDimension = ({
  width = 360,
  height = 360,
}: {
  width: number
  height: number
}) => {
  const minHeight = 44
  const minWidth = 44
  // Should not hit this https://github.com/holepunchto/keet-mobile/pull/1071
  if (width === 0 || height === 0) {
    width = minWidth
    height = minHeight
  }

  /**
   * For images that is too extreme (too narrow / too wide), we show a better looking ratio (3:4)
   *  _                                   _______
   * | |                                 |       |
   * | |                                 |       |
   * | |                                 |       |
   * | |                                 |       |
   * | |                                 |       |
   *  ‾                                   ‾‾‾‾‾‾‾
   *  ^ we don't show this, show this instead ^
   *
   *  ____________________
   * |                    |
   *  ‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾
   * ^ Not this, show this ↓
   *  ____________________
   * |                    |
   * |                    |
   * |                    |
   *  ‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾
   */

  let aspectRatio = width / height

  // Portrait max height is (windowHeight / 3)
  const maxHeight = PixelRatio.roundToNearestPixel(windowHeight / 2.5)
  // Landscape max width is chat box available width. 16 + AVATAR_SIZE + 8 + 14 is horizontal padding
  const maxWidth = PixelRatio.roundToNearestPixel(
    windowWidth - 2 * (UI_SIZE_16 + AVATAR_SIZE + UI_SIZE_8 + UI_SIZE_14),
  )

  if (height < minHeight) {
    height = minHeight
    width = PixelRatio.roundToNearestPixel(aspectRatio * height)
  } else if (height > maxHeight) {
    height = maxHeight
    width = PixelRatio.roundToNearestPixel(aspectRatio * height)
  }

  if (width < minWidth) {
    width = minWidth
    height = PixelRatio.roundToNearestPixel(width / aspectRatio)
  } else if (width > maxWidth) {
    width = maxWidth
    height = PixelRatio.roundToNearestPixel(width / aspectRatio)
  }

  return { width, height }
}

const DEFAULT_DECIMALS = 2
export function readableFileSize(
  byteLength?: number,
  decimals = DEFAULT_DECIMALS as number,
) {
  const DEFAULT_SIZE = 0
  const UNIT = 1024
  const SIZES = ['Bytes', 'KB', 'MB', 'GB'] // can add more sizes TB, PB
  if (!byteLength) {
    return `${DEFAULT_SIZE} KB`
  }

  const i = Math.floor(Math.log(byteLength) / Math.log(UNIT))
  return (
    parseFloat((byteLength / Math.pow(UNIT, i)).toFixed(decimals)) +
    ' ' +
    SIZES[i]
  )
}

export function scaleWidthPixel(size: number) {
  return Math.min((size * windowWidth) / BASE_WIDTH, size)
}
