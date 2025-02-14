import React, { useCallback, useEffect, useState } from 'react'
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import {
  getUserProfile,
  getUserProfileColor,
  setUserProfile,
} from '@holepunchto/keet-store/store/userProfile'

import { showBottomSheet } from 'component/AppBottomSheet/AppBottomSheet.Store'
import BottomSheetEnum from 'component/AppBottomSheet/SheetComponents/BottomSheetEnum'
import { Avatar } from 'component/Avatar'
import { ButtonBase } from 'component/Button'
import ListItem, { type ListItemProps } from 'component/ListItem'
import NetworkStatus from 'component/NetworkStatusMessage'
import SvgIcon from 'component/SvgIcon'
import TapToCallButton from 'component/TapToCallButton'
import { colors, createThemedStylesheet, useTheme } from 'component/theme'
import { KEET_META } from 'screen/MetaScreen'
import { APPIUM_IDs } from 'lib/appium'
import { SHOW_NEW_PROFILE_FEATURE } from 'lib/build.constants'
import s, {
  UI_SIZE_4,
  UI_SIZE_6,
  UI_SIZE_8,
  UI_SIZE_12,
  UI_SIZE_16,
  UI_SIZE_20,
  UI_SIZE_24,
} from 'lib/commonStyles'
import { openKeetTerms } from 'lib/linking'
import { getStorageDevConsoleEnabled, Profile } from 'lib/localStorage'
import {
  navigate,
  SCREEN_ACCOUNT_EDIT_DETAILS,
  SCREEN_SHARE_PROFILE,
} from 'lib/navigation'
import { scaleWidthPixel } from 'lib/size'

import { useStrings } from 'i18n/strings'

import {
  getAccountMenuItems,
  getEditAvatarMenuItems,
  useAccountStore,
} from './Account.helper'
import StatusBar from './StatusBar'

export const AccountScreen = () => {
  const { top: marginTop } = useSafeAreaInsets()
  const styles = getStyles()
  const strings = useStrings()
  const theme = useTheme()
  const dispatch = useDispatch()
  const [showDebugging, setShowDebugging] = useState(
    getStorageDevConsoleEnabled(),
  )

  const { username }: any = useAccountStore()
  const profile: Profile = useSelector(getUserProfile)
  const color: string = useSelector(getUserProfileColor)

  const [inputText, setInputText] = useState(
    (!profile?.needsName && profile?.name) || '',
  )

  const renderMenuItems = useCallback(
    (value: ListItemProps) => (
      <ListItem key={value.name} listType="grouped" {...value} />
    ),
    [],
  )

  useEffect(() => {
    if (!profile || profile?.needsName) {
      return
    }
    setInputText(profile.name)
  }, [profile])

  const onPresent = useCallback(() => {
    showBottomSheet({
      bottomSheetType: BottomSheetEnum.NetworkBottomSheet,
    })
  }, [])

  const menuItems = getAccountMenuItems({
    version: KEET_META,
    showDebugging,
    setShowDebugging,
  })

  const onPressEdit = useCallback(() => {
    navigate(SCREEN_ACCOUNT_EDIT_DETAILS)
  }, [])

  const onPressQRCode = useCallback(() => {
    navigate(SCREEN_SHARE_PROFILE)
  }, [])

  const updateUserProfile = useCallback(
    (newProfile: {}) => dispatch(setUserProfile(newProfile)),
    [dispatch],
  )

  const sheetHeaderIcon = useCallback(() => {
    return (
      <View style={styles.iconWrapper}>
        <SvgIcon
          name="keetOutline"
          width={UI_SIZE_16}
          height={UI_SIZE_16}
          color={colors.white_snow}
        />
      </View>
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const showAvatarOptionSheet = useCallback(() => {
    const options: ListItemProps[] = getEditAvatarMenuItems({
      updateUserProfile,
    })
    showBottomSheet({
      bottomSheetType: BottomSheetEnum.ListOptionsSheet,
      options,
      title: strings.account.editProfilePic,
      closeButton: true,
      icon: sheetHeaderIcon(),
    })
  }, [sheetHeaderIcon, updateUserProfile, strings])

  return (
    <View style={[s.container, { marginTop }]}>
      <TapToCallButton />
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardDismissMode="on-drag"
      >
        <View style={styles.innerWrapper}>
          <View style={s.container}>
            {SHOW_NEW_PROFILE_FEATURE && (
              <ButtonBase onPress={onPressQRCode}>
                <SvgIcon
                  name="qrcode"
                  width={UI_SIZE_20}
                  height={UI_SIZE_20}
                  color={theme.color.blue_400}
                />
              </ButtonBase>
            )}
          </View>
          <View style={styles.infoContainer}>
            <TouchableOpacity onPress={showAvatarOptionSheet}>
              <Avatar
                color={color}
                base64={profile.avatarUrl}
                name={profile?.name}
                style={styles.avatar}
              />
            </TouchableOpacity>
            <Text style={styles.displayName}>{inputText}</Text>
            {SHOW_NEW_PROFILE_FEATURE && (
              <>
                {username ? (
                  <Text style={styles.username}>{`@${username}`}</Text>
                ) : (
                  <Text style={styles.emptyLbl}>
                    {strings.account.emptyUsername}
                  </Text>
                )}
              </>
            )}
          </View>
          <View style={[s.container, s.alignItemsEnd]}>
            <ButtonBase onPress={onPressEdit}>
              <Text style={styles.editLbl}>{strings.account.edit}</Text>
            </ButtonBase>
          </View>
        </View>

        {SHOW_NEW_PROFILE_FEATURE && <StatusBar />}
        <NetworkStatus showRightIcon onPress={onPresent} />

        <View style={styles.menuContainer}>
          {menuItems.filter((item) => !item.hide).map(renderMenuItems)}
        </View>

        <ButtonBase
          onPress={openKeetTerms}
          style={[s.container, styles.footerCenter]}
          testID={APPIUM_IDs.profile_tos}
        >
          <Text style={[s.textAlignCenter, styles.terms]}>
            {strings.menu.termsOfService}
          </Text>
        </ButtonBase>
      </ScrollView>
    </View>
  )
}

export default AccountScreen

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    avatar: {
      borderRadius: scaleWidthPixel(50),
      height: scaleWidthPixel(100),
      width: scaleWidthPixel(100),
    },
    container: {
      paddingHorizontal: UI_SIZE_6,
    },
    displayName: {
      paddingTop: UI_SIZE_16,
      ...theme.text.bodySemiBold,
      lineHeight: UI_SIZE_24,
    },
    editLbl: {
      ...theme.text.bodySemiBold,
      color: theme.color.blue_400,
    },
    emptyLbl: {
      ...theme.text.bodyItalic,
      color: theme.color.grey_200,
    },
    footerCenter: {
      paddingVertical: theme.spacing.standard,
    },
    iconWrapper: {
      backgroundColor: theme.color.blue_600,
      borderRadius: UI_SIZE_16,
      marginEnd: UI_SIZE_8,
      padding: UI_SIZE_8,
    },
    infoContainer: {
      ...s.container,
      ...s.alignItemsCenter,
      flex: 3,
    },
    innerWrapper: {
      backgroundColor: theme.color.grey_800,
      borderRadius: UI_SIZE_16,
      height: 200,
      ...s.row,
      ...s.flexSpaceBetween,
      margin: UI_SIZE_4,
      padding: UI_SIZE_16,
    },
    menuContainer: {
      borderRadius: theme.border.radiusLarge,
      overflow: 'hidden',
    },
    terms: {
      color: colors.keet_grey_200,
      fontSize: UI_SIZE_12,
    },
    username: {
      ...theme.text.body,
      color: theme.color.grey_200,
      lineHeight: UI_SIZE_24,
    },
  })
  return styles
})
