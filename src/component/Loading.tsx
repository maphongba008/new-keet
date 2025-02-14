import { FC, memo, useMemo } from 'react'
import { StyleSheet, ViewProps } from 'react-native'
import Rive from 'rive-react-native'
import isEqual from 'react-fast-compare'
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated'
import Svg, { Circle } from 'react-native-svg'

import { ICON_SIZE_64, ICON_SIZE_90 } from 'lib/commonStyles'
import { useDidMount } from 'lib/hooks'

import { useTheme } from './theme'

const AnimatedSvg = Animated.createAnimatedComponent(Svg)
const LOADER_DURATION = 800

type LoaderProps = Pick<ViewProps, 'style'>

export const Loading: FC<LoaderProps> = memo(({ style }) => {
  const animatedValue = useSharedValue(0)
  const theme = useTheme()

  useDidMount(() => {
    animatedValue.value = withRepeat(
      withTiming(1, { duration: LOADER_DURATION, easing: Easing.linear }),
      -1,
    )
  })

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${animatedValue.value * 360 - 90}deg` }],
  }))
  const containerStyles = useMemo(
    () => [animatedStyle, style || styles.defaultLoader],
    [animatedStyle, style],
  )

  return (
    <AnimatedSvg style={containerStyles} viewBox="0 0 100 100">
      <Circle
        cx="50%"
        cy="50%"
        r="45"
        fill="none"
        strokeWidth={'8%'}
        stroke={theme.progress.darkerColor}
      />
      <Circle
        cx="50%"
        cy="50%"
        r="45"
        fill="none"
        stroke={theme.progress.mainColor}
        strokeDasharray="270"
        strokeDashoffset="200"
        strokeWidth="8%"
        strokeLinecap="round"
      />
    </AnimatedSvg>
  )
}, isEqual)

export const KeetLoading = ({ style }: LoaderProps) => {
  return (
    <Rive
      style={[{ width: ICON_SIZE_90, height: ICON_SIZE_90 }, style] as any}
      resourceName="keet_jump"
    />
  )
}

const styles = StyleSheet.create({
  defaultLoader: {
    height: ICON_SIZE_64,
    width: ICON_SIZE_64,
  },
})
