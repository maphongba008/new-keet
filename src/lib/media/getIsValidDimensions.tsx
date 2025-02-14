import { ImageSize } from 'react-native'

export const getIsValidDimensions = (dimensions?: Partial<ImageSize> | null) =>
  Boolean(dimensions?.height && dimensions?.width)
