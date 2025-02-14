import React, { useCallback, useRef, useState } from 'react'
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native'
import { useDispatch } from 'react-redux'
import PagerView from 'react-native-pager-view'
import Animated, {
  interpolate,
  useAnimatedProps,
  useAnimatedStyle,
  useEvent,
  useHandler,
  useSharedValue,
} from 'react-native-reanimated'
import Svg, { Rect } from 'react-native-svg'

import { closeAppModal } from 'reducers/application'

import { ButtonBase, TextButton, TextButtonType } from 'component/Button'
import SvgIcon from 'component/SvgIcon'
import { createThemedStylesheet } from 'component/theme'
import { APPIUM_IDs, appiumTestProps } from 'lib/appium'
import s, {
  ICON_SIZE_72,
  UI_SIZE_4,
  UI_SIZE_8,
  UI_SIZE_12,
  UI_SIZE_16,
  UI_SIZE_32,
  UI_SIZE_44,
  UI_SIZE_64,
} from 'lib/commonStyles'
import {
  setStorageNeedsOnBoardingDone,
  setStorageShowWalkthroughTooltip,
} from 'lib/localStorage'
import { setStorageShowCallTooltip } from 'lib/localStorage/storageRoomTooltip'
import { setIsOnboarding } from 'lib/storage'

import { useStrings } from 'i18n/strings'

const AnimatedPagerView = Animated.createAnimatedComponent(PagerView)
const AnimatedRect = Animated.createAnimatedComponent(Rect)

// https://github.com/callstack/react-native-pager-view/blob/master/example/src/ReanimatedOnPageScrollExample.tsx

const usePagerScrollHandler = (handlers: any, dependencies?: any) => {
  const { context, doDependenciesDiffer } = useHandler(handlers, dependencies)
  const subscribeForEvents = ['onPageScroll']

  return useEvent<any>(
    (event) => {
      'worklet'
      const { onPageScroll } = handlers
      if (onPageScroll && event.eventName.endsWith('onPageScroll')) {
        onPageScroll(event, context)
      }
    },
    subscribeForEvents,
    doDependenciesDiffer,
  )
}

const BASE_SIZE = UI_SIZE_8
const EXTRA_SIZE = BASE_SIZE * 2
const HALF_OPACITY = 0.5
const BULLET1_X = UI_SIZE_8
const BULLET_GAP = UI_SIZE_12

const OnBoardingScreen = () => {
  const dispatch = useDispatch()
  const styles = getStyles()
  const { on_boarding: strings, common: commonStrings } = useStrings()

  const onEnd = useCallback(() => {
    setStorageNeedsOnBoardingDone()
    setIsOnboarding(false)
    setStorageShowWalkthroughTooltip()
    setStorageShowCallTooltip()
    dispatch(closeAppModal())
  }, [dispatch])

  const pagerRef = useRef<PagerView>(null)
  const [page, setPage] = useState(0)

  const bullet1_width = useSharedValue(BASE_SIZE + EXTRA_SIZE)
  const bullet1_opacity = useSharedValue(1)

  const bullet2_x = useSharedValue(
    BULLET1_X + BASE_SIZE + EXTRA_SIZE + BULLET_GAP,
  )
  const bullet2_width = useSharedValue(BASE_SIZE)
  const bullet2_opacity = useSharedValue(HALF_OPACITY)

  const bullet3_x = useSharedValue(bullet2_x.value + BASE_SIZE + BULLET_GAP)
  const bullet3_width = useSharedValue(BASE_SIZE)
  const bullet3_opacity = useSharedValue(HALF_OPACITY)

  const skip_opacity = useSharedValue(1)
  const next_opacity = useSharedValue(1)
  const finish_opacity = useSharedValue(0)

  const bullet1_props = useAnimatedProps(() => ({
    width: bullet1_width.value,
    opacity: bullet1_opacity.value,
  }))
  const bullet2_props = useAnimatedProps(() => ({
    x: bullet2_x.value,
    width: bullet2_width.value,
    opacity: bullet2_opacity.value,
  }))
  const bullet3_props = useAnimatedProps(() => ({
    x: bullet3_x.value,
    width: bullet3_width.value,
    opacity: bullet3_opacity.value,
  }))

  const skip_style = useAnimatedStyle(() => ({
    opacity: skip_opacity.value,
  }))

  const next_style = useAnimatedStyle(() => ({
    opacity: next_opacity.value,
  }))
  const finish_style = useAnimatedStyle(() => ({
    opacity: finish_opacity.value,
  }))

  const { width } = useWindowDimensions()

  const offsetX = useSharedValue(0)

  const image1AnimatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(offsetX.value, [0, width, width * 2], [1, 0, 0]),
  }))
  const image2AnimatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(offsetX.value, [0, width, width * 2], [0, 1, 0]),
  }))
  const image3AnimatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(offsetX.value, [0, width, width * 2], [0, 0, 1]),
  }))

  const handler = usePagerScrollHandler({
    onPageScroll: (e: any) => {
      'worklet'
      const area = 1 - e.offset
      const extra = area * EXTRA_SIZE
      const offset = (e.position + e.offset) * width
      offsetX.value = offset

      if (e.position === 0) {
        bullet1_opacity.value = HALF_OPACITY + area * HALF_OPACITY
        bullet1_width.value = BASE_SIZE + extra

        bullet2_x.value = BULLET1_X + bullet1_width.value + BULLET_GAP
        bullet2_opacity.value = HALF_OPACITY + HALF_OPACITY * e.offset
        bullet2_width.value = BASE_SIZE + EXTRA_SIZE * e.offset
      } else if (e.position === 1) {
        bullet1_opacity.value = HALF_OPACITY
        bullet1_width.value = BASE_SIZE

        bullet2_opacity.value = HALF_OPACITY + area * HALF_OPACITY
        bullet2_width.value = BASE_SIZE + EXTRA_SIZE * area

        bullet3_x.value = bullet2_x.value + bullet2_width.value + BULLET_GAP
        bullet3_opacity.value = HALF_OPACITY + HALF_OPACITY * e.offset
        bullet3_width.value = BASE_SIZE + EXTRA_SIZE * e.offset

        skip_opacity.value = area

        next_opacity.value = area
        finish_opacity.value = 1 - area
      }
    },
  })

  const onPageSelected = useCallback(({ nativeEvent: { position } }: any) => {
    setPage(position)
  }, [])

  const onNext = useCallback(() => {
    pagerRef.current?.setPage(page + 1)
  }, [page])

  return (
    <View style={s.container}>
      <View style={s.centeredLayout}>
        <Svg width={80} height={ICON_SIZE_72} fill="none">
          <AnimatedRect
            animatedProps={bullet1_props}
            x={BULLET1_X}
            y={UI_SIZE_32}
            height={UI_SIZE_8}
            rx={UI_SIZE_4}
            fill="#fff"
          />
          <AnimatedRect
            animatedProps={bullet2_props}
            x={UI_SIZE_44}
            y={UI_SIZE_32}
            width={UI_SIZE_8}
            height={UI_SIZE_8}
            rx={UI_SIZE_4}
            fill="#fff"
            opacity={HALF_OPACITY}
          />
          <AnimatedRect
            animatedProps={bullet3_props}
            x={UI_SIZE_64}
            y={UI_SIZE_32}
            width={UI_SIZE_8}
            height={UI_SIZE_8}
            rx={UI_SIZE_4}
            fill="#fff"
            opacity={HALF_OPACITY}
          />
        </Svg>
        <Animated.View
          style={[styles.skipButton, skip_style]}
          pointerEvents={page < 2 ? 'auto' : 'none'}
        >
          <ButtonBase
            onPress={onEnd}
            {...appiumTestProps(APPIUM_IDs.onboarding_btn_skip)}
          >
            <Text style={styles.skipText}>{strings.skip}</Text>
          </ButtonBase>
        </Animated.View>
      </View>
      <View style={s.container}>
        <Animated.View style={[styles.imageContainer, image3AnimatedStyle]}>
          <View style={s.container}>
            <SvgIcon name="onboarding_03" />
          </View>
          <View style={styles.infomarionContainer} />
        </Animated.View>
        <Animated.View style={[styles.imageContainer, image2AnimatedStyle]}>
          <View style={s.container}>
            <SvgIcon name="onboarding_02" />
          </View>
          <View style={styles.infomarionContainer} />
        </Animated.View>
        <Animated.View style={[styles.imageContainer, image1AnimatedStyle]}>
          <View style={s.container}>
            <SvgIcon name="onboarding_01" />
          </View>
          <View style={styles.infomarionContainer} />
        </Animated.View>

        <AnimatedPagerView
          ref={pagerRef}
          style={styles.pager}
          onPageScroll={handler}
          onPageSelected={onPageSelected}
          useNext={false}
        >
          <View key="one" style={s.container}>
            <View style={s.container} />
            <View style={styles.infomarionContainer}>
              <Text style={styles.title}>{strings.step1Title}</Text>
              <Text style={styles.hint}>{strings.step1Hint}</Text>
            </View>
          </View>
          <View key="two" style={s.container}>
            <View style={s.container} />
            <View style={styles.infomarionContainer}>
              <Text style={styles.title}>{strings.step2Title}</Text>
              <Text style={styles.hint}>{strings.step2Hint}</Text>
            </View>
          </View>
          <View key="three" style={s.container}>
            <View style={s.container} />
            <View style={styles.infomarionContainer}>
              <Text style={styles.title}>{strings.step3Title}</Text>
              <Text style={styles.hint}>{strings.step3Hint}</Text>
            </View>
          </View>
        </AnimatedPagerView>
      </View>
      <Animated.View
        style={[styles.bottomButton, next_style]}
        pointerEvents={page < 2 ? 'auto' : 'none'}
      >
        <TextButton
          text={commonStrings.continue}
          type={TextButtonType.primary}
          onPress={onNext}
          {...appiumTestProps(APPIUM_IDs.onboarding_btn_next)}
        />
      </Animated.View>
      <Animated.View
        style={[styles.bottomButton, styles.bottomButtonAbsolute, finish_style]}
        pointerEvents={page === 2 ? 'auto' : 'none'}
      >
        <TextButton
          text={strings.getStarted}
          type={TextButtonType.primary}
          onPress={onEnd}
          {...appiumTestProps(APPIUM_IDs.onboarding_btn_finish)}
        />
      </Animated.View>
    </View>
  )
}

export default OnBoardingScreen

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    bottomButton: {
      marginBottom: UI_SIZE_16,
      marginHorizontal: UI_SIZE_16,
      marginTop: UI_SIZE_32,
    },
    bottomButtonAbsolute: {
      ...s.absoluteFill,
      top: undefined,
    },
    hint: {
      ...theme.text.body,
      ...s.textAlignCenter,
      color: theme.color.grey_200,
      marginTop: theme.spacing.normal,
    },
    imageContainer: {
      ...s.absoluteFill,
      zIndex: 1,
    },
    infomarionContainer: {
      flex: 0.6,
      paddingHorizontal: UI_SIZE_16,
    },
    pager: {
      ...s.absoluteFill,
      zIndex: 2,
    },
    skipButton: {
      ...s.absolute,
      borderColor: theme.color.blue_900,
      borderRadius: UI_SIZE_8,
      borderWidth: theme.border.width,
      paddingHorizontal: UI_SIZE_16,
      paddingVertical: UI_SIZE_8,
      right: UI_SIZE_16,
    },
    skipText: {
      ...theme.text.bodySemiBold,
      color: theme.color.blue_400,
    },
    title: {
      ...theme.text.title,
      ...s.textAlignCenter,
      fontSize: 26,
    },
  })
  return styles
})
