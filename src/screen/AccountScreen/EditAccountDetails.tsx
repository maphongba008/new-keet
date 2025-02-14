import React, { useCallback, useState } from 'react'
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { useDispatch, useSelector } from 'react-redux'

import {
  getUserProfile,
  getUserProfileColor,
  setUserProfile,
} from '@holepunchto/keet-store/store/userProfile'

import { showBottomSheet } from 'component/AppBottomSheet/AppBottomSheet.Store'
import BottomSheetEnum from 'component/AppBottomSheet/SheetComponents/BottomSheetEnum'
import { Avatar } from 'component/Avatar'
import { ButtonBase } from 'component/Button'
import GestureContainer from 'component/GestureContainer'
import { ListItemProps } from 'component/ListItem'
import { NavBar, ScreenSystemBars } from 'component/NavBar'
import PageWrapper from 'component/PageWrapper'
import SvgIcon from 'component/SvgIcon'
import { colors, createThemedStylesheet } from 'component/theme'
import { SHOW_NEW_PROFILE_FEATURE } from 'lib/build.constants'
import s, {
  UI_SIZE_8,
  UI_SIZE_12,
  UI_SIZE_14,
  UI_SIZE_16,
} from 'lib/commonStyles'
import { PROFILE_NAME_CHAR_LIMIT } from 'lib/constants'
import { Profile } from 'lib/localStorage'
import { back } from 'lib/navigation'
import { scaleWidthPixel } from 'lib/size'
import { validateProfileName } from 'lib/validation'

import { useStrings } from 'i18n/strings'

import { getEditAvatarMenuItems, useAccountStore } from './Account.helper'
import SetUsername from './SetUsername'

function EditAccountDetails() {
  const dispatch = useDispatch()
  const profile: Profile = useSelector(getUserProfile)
  const color: string = useSelector(getUserProfileColor)

  const styles = getStyles()
  const strings = useStrings()

  const { username }: any = useAccountStore()
  const [inputError, setInputError] = useState(false)
  const [focused, setFocused] = useState(false)
  const [inputText, setInputText] = useState(
    (!profile?.needsName && profile?.name) || '',
  )

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

  const handleChangeText = useCallback(
    (text: string) => {
      setInputText(text)
      if (validateProfileName(text) === null) {
        setInputError(true)
      } else if (inputError) {
        setInputError(false)
      }
    },
    [inputError],
  )

  const toggleInputFocus = useCallback(() => {
    setFocused(!focused)
  }, [focused])

  const onCancel = useCallback(() => back(), [])

  const onSaveUserInfo = useCallback(() => {
    updateUserProfile({ name: inputText })
    back()
  }, [inputText, updateUserProfile])

  return (
    <GestureContainer>
      <ScreenSystemBars />
      <NavBar
        title={null}
        left={
          <ButtonBase onPress={onCancel}>
            <Text style={styles.cancelLbl}>{strings.common.cancel}</Text>
          </ButtonBase>
        }
        right={
          <ButtonBase disabled={!!inputError} onPress={onSaveUserInfo}>
            <Text style={styles.saveLbl}>{strings.account.save}</Text>
          </ButtonBase>
        }
      />
      <PageWrapper scrollEnabled={false} containerStyle={styles.contentWrapper}>
        <TouchableOpacity onPress={showAvatarOptionSheet}>
          <Avatar
            color={color}
            base64={profile.avatarUrl}
            name={profile?.name}
            style={[styles.avatar, s.alignSelfCenter]}
          />
        </TouchableOpacity>
        <ButtonBase onPress={showAvatarOptionSheet}>
          <Text style={styles.editAvatarLbl}>
            {strings.account.editProfilePic}
          </Text>
        </ButtonBase>
        <>
          <Text style={styles.inputPlaceholder}>{strings.account.name}</Text>
          <TextInput
            style={[
              styles.input,
              focused && styles.inputFocused,
              inputError && styles.inputError,
            ]}
            value={inputText}
            onFocus={toggleInputFocus}
            onBlur={toggleInputFocus}
            maxLength={PROFILE_NAME_CHAR_LIMIT}
            onChangeText={handleChangeText}
          />
        </>
        {SHOW_NEW_PROFILE_FEATURE && (
          <View style={styles.extraInputSpacing}>
            <Text style={styles.inputPlaceholder}>
              {strings.account.username}
            </Text>
            <TextInput
              style={[
                styles.input,
                styles.usernameInput,
                !username && styles.noUsernamePlaceholder,
              ]}
              value={username ?? `@${username}`}
              placeholder={strings.account.emptyUsername}
              placeholderTextColor={colors.keet_grey_200}
              editable={false}
            />
            {!username && <SetUsername />}
          </View>
        )}
      </PageWrapper>
    </GestureContainer>
  )
}

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    avatar: {
      borderRadius: scaleWidthPixel(50),
      height: scaleWidthPixel(100),
      width: scaleWidthPixel(100),
    },
    cancelLbl: {
      ...theme.text.bodySemiBold,
    },
    contentWrapper: {
      ...s.container,
      marginHorizontal: UI_SIZE_16,
      marginTop: UI_SIZE_12,
    },
    editAvatarLbl: {
      ...theme.text.body,
      ...s.alignSelfCenter,
      color: theme.color.blue_400,
      marginBottom: UI_SIZE_14,
      marginTop: UI_SIZE_8,
    },
    extraInputSpacing: {
      marginTop: theme.spacing.standard,
    },
    iconWrapper: {
      backgroundColor: theme.color.blue_600,
      borderRadius: UI_SIZE_16,
      marginEnd: UI_SIZE_8,
      padding: UI_SIZE_8,
    },
    input: {
      ...theme.text.body,
      backgroundColor: theme.background.bg_2,
      borderRadius: theme.border.radiusNormal,
      height: 48,
      paddingHorizontal: theme.spacing.standard,
    },
    inputError: {
      borderColor: theme.color.danger,
      borderWidth: 0.5,
    },
    inputFocused: {
      borderColor: theme.color.blue_400,
      borderWidth: 0.5,
    },
    inputPlaceholder: {
      ...theme.text.bodySemiBold,
      color: theme.color.grey_200,
      fontSize: 14,
      paddingBottom: UI_SIZE_8,
    },
    noUsernamePlaceholder: {
      ...theme.text.bodyItalic,
    },
    saveLbl: {
      ...theme.text.bodySemiBold,
      color: theme.color.blue_400,
    },
    usernameInput: {
      color: theme.color.grey_200,
    },
  })
  return styles
})

export default EditAccountDetails
