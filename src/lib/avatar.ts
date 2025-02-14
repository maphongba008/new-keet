import { ViewStyle } from 'react-native'
import b4a from 'b4a'

import { DEFAULT_AVATAR_COLORS } from './commonStyles'

export const SEED_BITS = 32
export const EMOJI_REGEXP = /\p{Emoji}/u

export const name2seed = (name: string) => {
  if (name.length === SEED_BITS) {
    return name
  } else if (name.length > SEED_BITS) {
    return name.substring(0, SEED_BITS - 1)
  }
  return name.padEnd(SEED_BITS)
}

function randInt(min: number, max: number, seed?: string): number {
  const rand = seed
    ? b4a.readUInt32LE(b4a.from(seed, 'hex')) / (2 ** SEED_BITS - 1)
    : Math.random()
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(rand * (max - min)) + min
}

export const randomColor = (seed?: string) => {
  return DEFAULT_AVATAR_COLORS[randInt(0, DEFAULT_AVATAR_COLORS.length, seed)]
}

export function getScaledFontSize({
  width,
  height,
}: Pick<ViewStyle, 'width' | 'height'>): number {
  const baseWidth = 30
  const baseHeight = 30
  const baseFontSize = 12
  const maxFontThreshold = 40

  if (typeof height !== 'number' || typeof width !== 'number') {
    return baseFontSize
  }

  // Calculate scaling factor
  const scalingFactor = (width * height) / (baseWidth * baseHeight)

  // Scale font size
  const fontSize = baseFontSize * Math.sqrt(scalingFactor)
  const minThreshold = Math.max(fontSize, baseFontSize)

  return Math.min(minThreshold, maxFontThreshold)
}
