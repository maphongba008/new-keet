import { Linking, StyleSheet, Text, View } from 'react-native'
import { create } from 'zustand'
import _compact from 'lodash/compact'

import { getAvatarUrl } from '@holepunchto/keet-store/store/member'

import {
  closeBottomSheet,
  closeBottomSheetAsync,
  showBottomSheet,
} from 'component/AppBottomSheet/AppBottomSheet.Store'
import BottomSheetEnum from 'component/AppBottomSheet/SheetComponents/BottomSheetEnum'
import { type ListItemProps } from 'component/ListItem'
import SvgIcon from 'component/SvgIcon'
import { colors, createThemedStylesheet } from 'component/theme'
import { toggleDevConsole } from 'screen/DevConsole'
import { IS_EXPERIMENTAL_BUILD, IS_SENTRY_ENABLED } from 'lib/build.constants'
import s, { UI_SIZE_16, UI_SIZE_20 } from 'lib/commonStyles'
import { NEWS_URL, SUPPORT_URL } from 'lib/constants'
import { doVibrateSuccess } from 'lib/haptics'
import { pickAndSetAvatar } from 'lib/media'
import {
  navigate,
  SCREEN_DEBUGGING,
  SCREEN_ERROR_LOG,
  SCREEN_INVITE_SOMEONE,
  SCREEN_META,
  SCREEN_QA_HELPERS,
  SCREEN_SETTINGS,
} from 'lib/navigation'

import { getStrings } from 'i18n/strings'

export const ALPHA_NUMERIC_REGEXP = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]+$/

export const getAccountMenuItems = ({
  version = '',
  showDebugging = false,
  setShowDebugging = (() => {}) as any,
}): ListItemProps[] => {
  const { account: strings } = getStrings()
  const styles = getStyles()

  return _compact([
    {
      icon: (
        <SvgIcon
          name="settings"
          color={colors.white_snow}
          width={20}
          height={20}
        />
      ),
      name: 'settings',
      right: '',
      isFirst: true,
      isLast: true,
      onPress: () => navigate(SCREEN_SETTINGS),
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
      name: 'debugging',
      onPress: () => navigate(SCREEN_DEBUGGING),
      hide: !showDebugging,
    },
    {
      icon: (
        <SvgIcon name="wave" color={colors.white_snow} width={20} height={20} />
      ),
      name: 'inviteSomeone',
      right: '',
      isFirst: true,
      isLast: true,
      onPress: () => navigate(SCREEN_INVITE_SOMEONE),
    },
    {
      icon: <SvgIcon name="newspaper" color={colors.white_snow} />,
      name: 'news',
      isFirst: true,
      isLast: true,
      onPress: () => Linking.openURL(NEWS_URL),
      right: (
        <View style={[s.centerAlignedRow, styles.container]}>
          <SvgIcon
            name="megaphone"
            width={16}
            height={16}
            color={colors.text_grey}
          />
          <Text style={styles.community} numberOfLines={1} ellipsizeMode="tail">
            {strings.keetNews}
          </Text>
        </View>
      ),
      rightIcon: 'arrowUpRightFromSquare',
      disabled: IS_EXPERIMENTAL_BUILD,
    },
    {
      icon: (
        <SvgIcon
          name="chatCenteredDots"
          color={colors.white_snow}
          width={22}
          height={22}
        />
      ),
      name: 'feedback',
      right: '',
      isFirst: true,
      onPress: () =>
        showBottomSheet({
          bottomSheetType: BottomSheetEnum.FeedbackFormSheet,
        }),
    },
    {
      icon: (
        <SvgIcon
          name="question"
          color={colors.white_snow}
          width={20}
          height={20}
        />
      ),
      name: 'faq',
      isLast: true,
      right: (
        <View style={[s.centerAlignedRow, styles.container]}>
          <SvgIcon name="pear_gray" color={colors.text_grey} />
          <Text style={styles.community} numberOfLines={1} ellipsizeMode="tail">
            {strings.communityRoom}
          </Text>
        </View>
      ),
      onPress: () => Linking.openURL(SUPPORT_URL),
      rightIcon: 'arrowUpRightFromSquare',
      disabled: IS_EXPERIMENTAL_BUILD,
    },
    {
      icon: (
        <SvgIcon
          name="warningOctagon"
          color={colors.white_snow}
          width={20}
          height={20}
        />
      ),
      name: 'errorLog',
      right: '',
      isFirst: true,
      onPress: () => navigate(SCREEN_ERROR_LOG),
    },
    {
      icon: 'appWindow',
      name: 'software',
      right: (
        <View style={[s.centerAlignedRow, styles.container]}>
          <Text style={styles.community} numberOfLines={1} ellipsizeMode="tail">
            {version.split('_')[0]}
          </Text>
          {IS_EXPERIMENTAL_BUILD && (
            <SvgIcon
              name="pear_gray"
              color={colors.text_grey}
              width={UI_SIZE_16}
              height={UI_SIZE_16}
            />
          )}
        </View>
      ),
      onPress: () => navigate(SCREEN_META),
      onLongPress() {
        doVibrateSuccess()
        toggleDevConsole()
        setShowDebugging(!showDebugging)
      },
    },
    {
      icon: (
        <SvgIcon
          name="settings"
          color={colors.white_snow}
          width={20}
          height={20}
        />
      ),
      name: 'qaHelpers',
      right: '',
      onPress: () => navigate(SCREEN_QA_HELPERS),
      hide: !(IS_SENTRY_ENABLED || __DEV__),
    },
  ])
}

export const getEditAvatarMenuItems = ({
  updateUserProfile,
}: {
  updateUserProfile: any
}) => [
  {
    name: 'takePhoto',
    isFirst: true,
    right: (
      <SvgIcon
        name="camera"
        color={colors.text_grey}
        width={UI_SIZE_20}
        height={UI_SIZE_20}
      />
    ),
    rightIcon: '',
    onPress: async () => {
      // We need to close this first, so when there are no permissions, we can display the error sheet
      await closeBottomSheetAsync()
      pickAndSetAvatar({ fromCamera: true }, (base64) =>
        updateUserProfile({ avatarUrl: getAvatarUrl(base64) }),
      )
    },
  },
  {
    name: 'choosePhoto',
    isLast: true,
    right: (
      <SvgIcon
        name="image"
        color={colors.text_grey}
        width={UI_SIZE_20}
        height={UI_SIZE_20}
      />
    ),
    rightIcon: '',
    onPress: async () => {
      // We need to close this first, so when there are no permissions, we can display the error sheet
      await closeBottomSheetAsync()
      pickAndSetAvatar({ fromCamera: false }, (base64) =>
        updateUserProfile({ avatarUrl: getAvatarUrl(base64) }),
      )
    },
  },
  {
    name: 'deletePhoto',
    isFirst: true,
    disabled: true, // No remove photo for now - https://app.asana.com/0/0/1206928455191350/1206956338925765/f
    right: (
      <SvgIcon
        name="trash"
        color={colors.text_grey}
        width={UI_SIZE_20}
        height={UI_SIZE_20}
      />
    ),
    rightIcon: '',
    onPress: () => {
      updateUserProfile({
        avatarUrl: '',
      })
      closeBottomSheet()
    },
  },
]

// temp mock for account username, would remove later
export const useAccountStore = create((set) => ({
  username: '',
  setUsername: (username: string) => set(() => ({ username })),
}))

const getStyles = createThemedStylesheet((theme) =>
  StyleSheet.create({
    community: {
      ...theme.text.body,
      color: colors.text_grey,
      fontSize: 12,
      paddingHorizontal: theme.spacing.standard / 2,
    },
    container: {
      maxWidth: '80%',
    },
  }),
)
