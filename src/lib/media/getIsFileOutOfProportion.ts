import { ChatEventFileRaw } from 'lib/types'

// can define non-standard size
const NON_STANDARD_ASPECT_RATIO = {
  LANDSCAPE: 2.5,
  PORTRAIT: 0.4,
}

export const getIsFileOutOfProportion = (
  dimensions: Partial<ChatEventFileRaw>['dimensions'],
) => {
  if (!dimensions) return false
  const { width, height } = dimensions
  const aspectRatio = height / width
  return (
    aspectRatio > NON_STANDARD_ASPECT_RATIO.LANDSCAPE ||
    aspectRatio < NON_STANDARD_ASPECT_RATIO.PORTRAIT
  )
}
