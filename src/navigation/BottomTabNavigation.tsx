/* eslint-disable react/no-unstable-nested-components */
import React, { lazy, useCallback } from 'react'
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  type ViewProps,
} from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import {
  BottomTabBarButtonProps,
  BottomTabNavigationOptions,
  createBottomTabNavigator,
} from '@react-navigation/bottom-tabs'

import { getNetworkOnline } from '@holepunchto/keet-store/store/network'

import {
  closeWalkthroughTooltip,
  getLobbyUpdating,
  getWalkthroughStep,
  getWalkthroughTooltip,
  setWalkthroughStep,
} from 'reducers/application'

import MaskGradient from 'component/MaskGradient'
import SvgIcon from 'component/SvgIcon'
import { colors, createThemedStylesheet, gradient } from 'component/theme'
import { Tooltip } from 'component/Tooltip'
import { APPIUM_IDs, appiumTestProps } from 'lib/appium'
import { GRADIENT_TAB_BAR_ICON, SHOW_WALLET } from 'lib/build.constants'
import {
  UI_SIZE_2,
  UI_SIZE_4,
  UI_SIZE_8,
  UI_SIZE_12,
  UI_SIZE_14,
  UI_SIZE_32,
} from 'lib/commonStyles'
import { withSuspense } from 'lib/hoc/withSuspense'
import { setStorageWalkthroughTooltipShownDone } from 'lib/localStorage'
import { SCREEN_HOME, SCREEN_PROFILE, SCREEN_WALLET } from 'lib/navigation'

import { useStrings } from 'i18n/strings'

const Tab = createBottomTabNavigator()

const HomeScreen = withSuspense(lazy(() => import('screen/HomeScreen')))
const AccountScreen = withSuspense(
  lazy(() => import('screen/AccountScreen/AccountScreen')),
)
const WalletScreen = SHOW_WALLET
  ? withSuspense(lazy(() => import('screen/WalletScreen/WalletScreen')))
  : () => null

interface TabBarProps {
  focused: boolean
}

interface TabOptionsProps extends BottomTabNavigationOptions {
  labelKey: string
  iconName: string
  showBadge?: boolean
  testProps?: Partial<ViewProps>
}

function BottomTabNavigator() {
  const strings = useStrings()
  const styles = getTabbedViewStyles()
  const isNetworkOnline = useSelector(getNetworkOnline)
  const isLobbyUpdating = useSelector(getLobbyUpdating)
  const { bottom } = useSafeAreaInsets()

  const getTabOptions = useCallback(
    ({
      labelKey,
      iconName,
      showBadge = false,
      testProps,
    }: TabOptionsProps) => ({
      tabBarIcon: (props: TabBarProps) => {
        const { focused } = props
        return focused && GRADIENT_TAB_BAR_ICON ? (
          <MaskGradient
            linearGradientProps={gradient.keet_gradient_brightBlue}
            MaskElement={
              <SvgIcon
                name={iconName as any}
                width={22}
                height={22}
                color={colors.white_snow}
              />
            }
          />
        ) : (
          <SvgIcon
            name={iconName as any}
            width={22}
            height={22}
            color={colors.white_snow}
          />
        )
      },

      tabBarLabel: (props: TabBarProps) => {
        const { focused } = props
        return focused && GRADIENT_TAB_BAR_ICON ? (
          <MaskGradient
            linearGradientProps={gradient.keet_gradient_brightBlue}
            MaskElement={<Text style={styles.btmTab}>{labelKey}</Text>}
          />
        ) : (
          <Text style={styles.btmTab}>{labelKey}</Text>
        )
      },
      tabBarButtonTestID: testProps?.testID,
      tabBarAccessibilityLabel: testProps?.accessibilityLabel,
      ...(showBadge &&
        !isNetworkOnline &&
        !isLobbyUpdating && {
          tabBarBadge: ' ',
          tabBarBadgeStyle: styles.indicator,
        }),
    }),
    [isNetworkOnline, isLobbyUpdating, styles.indicator, styles.btmTab],
  )

  return (
    <Tab.Navigator
      screenOptions={{
        animation: 'shift',
        headerShown: false,
        tabBarPosition: 'bottom',
        tabBarStyle: {
          borderTopWidth: 0,
          paddingBottom: bottom - UI_SIZE_2,
          marginTop: UI_SIZE_12,
        },
        tabBarLabelPosition: 'below-icon',
      }}
    >
      <Tab.Screen
        name={SCREEN_HOME}
        component={HomeScreen}
        options={getTabOptions({
          labelKey: strings.home.tabs.rooms,
          iconName: 'home',
          testProps: appiumTestProps(APPIUM_IDs.lobby_btn_rooms),
        })}
      />
      {SHOW_WALLET && (
        <Tab.Screen
          name={SCREEN_WALLET}
          component={WalletScreen}
          options={getTabOptions({
            labelKey: strings.home.tabs.wallet,
            iconName: 'wallet',
            testProps: appiumTestProps(APPIUM_IDs.lobby_btn_rooms),
          })}
        />
      )}
      <Tab.Screen
        name={SCREEN_PROFILE}
        component={AccountScreen}
        options={{
          tabBarButton: (props) => {
            return <Profile {...props} />
          },
          ...getTabOptions({
            labelKey: strings.home.tabs.profile,
            iconName: 'circleUser',
            showBadge: true,
            testProps: appiumTestProps(APPIUM_IDs.lobby_btn_profile),
          }),
        }}
      />
    </Tab.Navigator>
  )
}

const Profile = (props: BottomTabBarButtonProps) => {
  const ref = React.useRef(null)
  const strings = useStrings()
  const dispatch = useDispatch()
  const shouldShowTooltip = useSelector(getWalkthroughTooltip)
  const currentStep = useSelector(getWalkthroughStep)

  const onTooltipClose = useCallback(async () => {
    // Update local storage to mark the tooltip as shown
    setStorageWalkthroughTooltipShownDone()
    dispatch(closeWalkthroughTooltip())
  }, [dispatch])

  const onPressNext = useCallback(async () => {
    dispatch(setWalkthroughStep(2))
  }, [dispatch])

  return (
    <Tooltip
      step={1}
      componentRef={ref}
      placement="bottom"
      title={strings.home.tabs.profile}
      description={strings.room.walkthroughTooltip.welcomeToKeet}
      content={
        <SvgIcon name="profileTooltip" width={UI_SIZE_32} height={UI_SIZE_32} />
      }
      toShow={shouldShowTooltip && currentStep === 1}
      onClose={onTooltipClose}
      onPressNext={onPressNext}
      totalSteps={2}
      testProps={appiumTestProps(APPIUM_IDs.tooltip_btn_profile)}
    >
      {/* @ts-ignore */}
      <TouchableOpacity ref={ref} {...props} />
    </Tooltip>
  )
}

export const getTabbedViewStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    btmTab: {
      ...theme.text.btmTab,
      paddingBottom: UI_SIZE_4,
      paddingTop: -UI_SIZE_12,
    },
    indicator: {
      backgroundColor: theme.color.danger,
      borderRadius: UI_SIZE_8,
      maxHeight: UI_SIZE_14,
      maxWidth: UI_SIZE_14,
      minHeight: UI_SIZE_14,
      minWidth: UI_SIZE_14,
      top: -UI_SIZE_2,
    },
  })
  return styles
})

export default BottomTabNavigator
