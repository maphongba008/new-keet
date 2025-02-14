import React, { useCallback, useEffect } from 'react'
import { Linking, ScrollView, StyleSheet } from 'react-native'
import { useDispatch } from 'react-redux'
import { SafeAreaView } from 'react-native-safe-area-context'
import _compact from 'lodash/compact'
import _upperCase from 'lodash/upperCase'

import { fetchSecretPhraseCmd } from '@holepunchto/keet-store/store/identity'

import { showBottomSheet } from 'component/AppBottomSheet/AppBottomSheet.Store'
import BottomSheetEnum from 'component/AppBottomSheet/SheetComponents/BottomSheetEnum'
import ListItem, { type ListItemProps } from 'component/ListItem'
import { NavBar } from 'component/NavBar'
import SvgIcon from 'component/SvgIcon'
import { colors, createThemedStylesheet } from 'component/theme'
import {
  SHOW_CLEAN_DEVICE_SCREEN,
  SHOW_PUSH_NOTIFICATION_OPTION,
} from 'lib/build.constants'
import s, { UI_SIZE_16 } from 'lib/commonStyles'
import { SAFE_EDGES } from 'lib/constants'
import {
  navigate,
  SCREEN_LANGUAGE,
  SCREEN_MY_DEVICES,
  SCREEN_NOTIFICATION_SETTINGS,
  SCREEN_NOTIFICATION_SOUND,
  SCREEN_SECURITY,
} from 'lib/navigation'

import { useLocale, useStrings } from 'i18n/strings'

const getSettingsMenuItems = ({
  locale = '',
}: {
  locale: string
}): ListItemProps[] => {
  return _compact([
    {
      icon: (
        <SvgIcon
          name="language"
          color={colors.white_snow}
          width={22}
          height={22}
        />
      ),
      name: 'language',
      right: _upperCase(locale),
      onPress: () => {
        navigate(SCREEN_LANGUAGE)
      },
      isFirst: true,
    },
    SHOW_PUSH_NOTIFICATION_OPTION && {
      icon: (
        <SvgIcon name="bell" color={colors.white_snow} width={20} height={20} />
      ),
      name: 'notifications',
      onPress: () => navigate(SCREEN_NOTIFICATION_SETTINGS),
    },
    {
      icon: (
        <SvgIcon name="bell" color={colors.white_snow} width={20} height={20} />
      ),
      name: 'notificationsSounds',
      right: '',
      onPress: () => {
        navigate(SCREEN_NOTIFICATION_SOUND)
      },
    },
    {
      icon: (
        <SvgIcon
          name="shield"
          color={colors.white_snow}
          width={20}
          height={20}
        />
      ),
      name: 'security',
      right: '',
      onPress: () => {
        navigate(SCREEN_SECURITY)
      },
    },
    {
      icon: (
        <SvgIcon name="lock" color={colors.white_snow} width={20} height={20} />
      ),
      name: 'permissions',
      right: '',
      onPress: () => {
        Linking.openSettings()
      },

      rightIcon: 'arrow-up-right-from-square',
    },
    SHOW_CLEAN_DEVICE_SCREEN && {
      icon: (
        <SvgIcon
          name="clear"
          color={colors.white_snow}
          width={22}
          height={22}
        />
      ),
      name: 'cleanDevice',
      right: '',
      onPress: () =>
        showBottomSheet({
          bottomSheetType: BottomSheetEnum.CleanDeviceBottomSheet,
        }),
      isLast: true,
    },
    {
      icon: (
        <SvgIcon
          name="devices"
          color={colors.white_snow}
          width={20}
          height={20}
        />
      ),
      name: 'myDevices',
      right: '',
      onPress: () => {
        navigate(SCREEN_MY_DEVICES)
      },
      isFirst: true,
      isLast: true,
      separateSection: true,
    },
  ])
}

export const SettingsScreen = () => {
  const { account: strings } = useStrings()
  const locale = useLocale()
  const styles = getStyles()
  const dispatch = useDispatch()

  const menuItems = getSettingsMenuItems({
    locale,
  })

  const renderMenuItems = useCallback(
    (value: ListItemProps) => <ListItem key={value.name} {...value} />,
    [],
  )

  useEffect(() => {
    dispatch(fetchSecretPhraseCmd())
  }, [dispatch])

  return (
    <SafeAreaView style={s.container} edges={SAFE_EDGES}>
      <NavBar title={strings.settings} />
      <ScrollView style={[s.container, styles.scrollContainer]}>
        {menuItems.map(renderMenuItems)}
      </ScrollView>
    </SafeAreaView>
  )
}

const getStyles = createThemedStylesheet(() => {
  const styles = StyleSheet.create({
    scrollContainer: {
      paddingHorizontal: UI_SIZE_16,
    },
  })

  return styles
})

export default SettingsScreen
