import React, { memo, useCallback, useMemo } from 'react'
import {
  Keyboard,
  StatusBar as RNStatusBar,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from 'react-native'
import isEqual from 'react-fast-compare'
import { TouchableOpacity } from 'react-native-gesture-handler'
import Animated from 'react-native-reanimated'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import _capitalize from 'lodash/capitalize'
import _debounce from 'lodash/debounce'

import { APPIUM_IDs, appiumTestProps } from 'lib/appium'
import s, {
  DIRECTION,
  UI_SIZE_4,
  UI_SIZE_6,
  UI_SIZE_8,
  UI_SIZE_12,
  UI_SIZE_20,
} from 'lib/commonStyles'
import { BACK_DEBOUNCE_DELAY, BACK_DEBOUNCE_OPTIONS } from 'lib/constants'
import { useNetworkInfo } from 'lib/hooks/useNetworkInfo'
import { back } from 'lib/navigation'

import { useStrings } from 'i18n/strings'

import { IconButton } from './Button'
import { Loading } from './Loading'
import SvgIcon from './SvgIcon'
import TapToCallButton from './TapToCallButton'
import { colors, createThemedStylesheet, useTheme } from './theme'

interface NavBarProps {
  title: JSX.Element | string | null
  centerTitle?: boolean
  topTitle?: string | null
  onClickTitle?: () => void
  titleEllipsizeMode?: 'clip' | 'head' | 'middle' | 'tail'
  left?: JSX.Element | JSX.Element[] | null
  leftStyle?: ViewStyle | ViewStyle[]
  middle?: JSX.Element | JSX.Element[] | null
  right?: JSX.Element | JSX.Element[] | null
  rightStyle?: ViewStyle | ViewStyle[]
  showOfflineBar?: boolean
  showTapToCallButton?: boolean
  style?: ViewStyle | ViewStyle[]
}

export const NavBar = memo(
  ({
    title = '',
    centerTitle,
    onClickTitle,
    titleEllipsizeMode = 'tail',
    left = <BackButton />,
    leftStyle = {},
    middle = null,
    right = null,
    rightStyle = {},
    showOfflineBar = false,
    showTapToCallButton = false,
    topTitle = null,
    style,
  }: NavBarProps) => {
    const styles = getStyles()

    return (
      <SafeAreaView style={[styles.container, style]} edges={['top']}>
        {showOfflineBar && <NavBarOffline />}
        {showTapToCallButton && <TapToCallButton />}
        {topTitle && <NavTopTitle title={topTitle} />}
        <View style={styles.titleBar}>
          <View style={[s.rowStartCenter, leftStyle]}>{left}</View>
          <View style={s.container}>
            {middle}
            {title && (
              <TouchableOpacity
                disabled={typeof onClickTitle !== 'function'}
                onPress={onClickTitle}
                style={[
                  styles.titleTouchable,
                  centerTitle && styles.titleCenter,
                ]}
              >
                {typeof title === 'string' ? (
                  <Text
                    numberOfLines={1}
                    ellipsizeMode={titleEllipsizeMode}
                    style={styles.titleStr}
                  >
                    {title}
                  </Text>
                ) : (
                  title
                )}
              </TouchableOpacity>
            )}
          </View>
          <View style={[s.row, s.alignItemsCenter, s.justifyEnd, rightStyle]}>
            {right}
          </View>
        </View>
      </SafeAreaView>
    )
  },
  isEqual,
)

export const BackButton = memo(
  ({
    onPress: _onPress,
    overrideOnPress,
  }: {
    onPress?: () => void
    overrideOnPress?: () => void
  }) => {
    const styles = getStyles()
    const strings = useStrings()

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const onPress = useCallback(
      _debounce(
        () => {
          if (overrideOnPress) {
            overrideOnPress()
            return
          }

          Keyboard.dismiss()
          back()
          if (_onPress) {
            _onPress()
          }
        },
        BACK_DEBOUNCE_DELAY,
        BACK_DEBOUNCE_OPTIONS,
      ),
      [overrideOnPress],
    )

    return (
      <IconButton
        hint={strings.common.back}
        onPress={onPress}
        style={styles.iconBtn}
        {...appiumTestProps(APPIUM_IDs.back_button)}
      >
        <SvgIcon
          name={`arrow${_capitalize(DIRECTION)}`}
          width={UI_SIZE_20}
          height={UI_SIZE_20}
          color={colors.white_snow}
        />
      </IconButton>
    )
  },
)

export const OnlyBackNavBar = ({ overrideOnPress, animatedStyle }: any) => {
  const { top } = useSafeAreaInsets()

  const style = useMemo<ViewStyle>(() => {
    return {
      position: 'absolute',
      top: top,
      left: 12,
    }
  }, [top])

  return (
    <Animated.View style={[style, animatedStyle]}>
      <BackButton overrideOnPress={overrideOnPress} />
    </Animated.View>
  )
}

export const ScreenSystemBars = ({
  statusBarHidden = false,
}: {
  statusBarHidden?: boolean
}) => {
  // RNStatusBar is needed for restore color on pop views
  // also the backTitle has a value to preserver pop navigation:
  // https://github.com/grahammendick/navigation/pull/677
  return (
    <>
      <RNStatusBar
        backgroundColor="transparent"
        barStyle="light-content"
        hidden={statusBarHidden}
        translucent
      />
    </>
  )
}

export const NavTopTitle = ({ title = '' }: { title: string }) => {
  const styles = getStyles()
  return (
    <View style={[s.row, styles.navTopTitle]}>
      <Text numberOfLines={1} ellipsizeMode="tail" style={styles.title}>
        {title}
      </Text>
    </View>
  )
}

export const NavBarOffline = () => {
  const strings = useStrings()
  const theme = useTheme()
  const styles = getStyles()
  // for faster detection, use netinfo instead of getNetworkOnline state
  const { carrier } = useNetworkInfo()
  const isNetworkOffline = carrier === strings.networkStatus.offline
  return isNetworkOffline ? (
    <View style={[styles.titleBar, s.justifyCenter, s.row]}>
      <SvgIcon
        name="circleExclamation"
        width={UI_SIZE_20}
        height={UI_SIZE_20}
        color={colors.red_400}
        style={styles.iconContainer}
      />
      <Text style={[theme.text.body, theme.text.title2]}>
        {strings.networkStatus.offlineShort}
      </Text>
    </View>
  ) : null
}

export const NavBarLoading = () => {
  const strings = useStrings()
  const theme = useTheme()
  const styles = getStyles()

  return (
    <View style={[s.justifyCenter, s.row]}>
      <Loading style={styles.updating} />
      <Text style={[theme.text.body, theme.text.subtitle]}>
        {strings.lobby.updating}
      </Text>
    </View>
  )
}

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    container: { backgroundColor: theme.background.bg_1, zIndex: 10 },
    // secondary
    iconBtn: {
      ...s.justifyCenter,
      ...s.alignItemsStart,
      height: theme.bars.navigationBarHeight,
      width: theme.bars.navigationBarHeight,
    },
    iconContainer: {
      marginRight: UI_SIZE_4,
      marginTop: 3,
    },
    navTopTitle: {
      paddingBottom: UI_SIZE_12,
      paddingHorizontal: UI_SIZE_12,
      ...s.alignItemsCenter,
    },
    title: {
      ...theme.text.body,
    },
    // primary
    titleBar: {
      height: theme.bars.navigationBarHeight,
      width: '100%',
      ...s.row,
      ...s.flexSpaceBetween,
      ...s.alignItemsCenter,
      paddingHorizontal: UI_SIZE_12,
    },
    // secondary
    titleCenter: {
      ...s.justifyCenter,
      // To align title center, we flex the whole middle space, and need to have the same margin on the left and right.
      // Currently titleCenter only available in LongTextPreviewScreen which doesnt have any right icons, so we only apply left back button width
      marginRight: theme.bars.navigationBarHeight - UI_SIZE_8,
    },
    titleStr: {
      ...theme.text.title2,
      marginRight: UI_SIZE_4,
      textAlignVertical: 'center',
      verticalAlign: 'middle',
    },
    titleTouchable: {
      ...s.row,
      ...s.alignItemsCenter,
      ...s.fullHeight,
      paddingRight: UI_SIZE_8,
    },
    updating: {
      marginRight: UI_SIZE_6,
      maxHeight: UI_SIZE_20,
      maxWidth: UI_SIZE_20,
    },
  })
  return styles
})
