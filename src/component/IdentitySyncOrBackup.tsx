import React, { memo, useCallback } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { ButtonBase } from 'component/Button'
import SvgIcon from 'component/SvgIcon'
import { colors, createThemedStylesheetWithHooks } from 'component/theme'
import { APPIUM_IDs, appiumTestProps } from 'lib/appium'
import s, {
  ICON_SIZE_20,
  TRANSPARENT,
  UI_SIZE_2,
  UI_SIZE_8,
  UI_SIZE_14,
  UI_SIZE_16,
  UI_SIZE_24,
  UI_SIZE_32,
  width,
} from 'lib/commonStyles'
import {
  navigate,
  SCREEN_IDENTITY_BACKUP_AGREEMENT,
  SCREEN_IDENTITY_SYNC,
  SCREEN_RECOVER_ACCOUNT_AGREEMENT,
} from 'lib/navigation'

import { useStrings } from 'i18n/strings'

import GestureContainer from './GestureContainer'
import { NavBar } from './NavBar'

interface IdentitySyncOrBackupProps {
  fromOnboarding?: boolean
}
const IdentitySyncOrBackup = memo(
  ({ fromOnboarding }: IdentitySyncOrBackupProps) => {
    const styles = getStyles()
    const { identityModal: strings, account: accountStrings } = useStrings()

    const onPressIdentityBackup = useCallback(
      () => navigate(SCREEN_IDENTITY_BACKUP_AGREEMENT),
      [],
    )

    const onPressIdentitySync = useCallback(
      () => navigate(SCREEN_IDENTITY_SYNC),
      [],
    )

    const onPressRecoverAccount = useCallback(
      () => navigate(SCREEN_RECOVER_ACCOUNT_AGREEMENT),
      [],
    )

    const Component = fromOnboarding ? View : GestureContainer

    return (
      <Component style={styles.wrapper} enabled={!fromOnboarding}>
        <SvgIcon
          name="consent"
          width={width}
          height={width * BackgroundImageSizeRatio}
          style={styles.imageBackground}
        />
        <View style={styles.container}>
          {!fromOnboarding && <NavBar title="" style={styles.navBar} />}
          <View style={s.container} />
          <View style={styles.content}>
            <Text style={styles.title}>{strings.title}</Text>
            <Text style={styles.hint}>{strings.desc}</Text>
            <View style={s.container} />
            <ButtonBase
              style={styles.button}
              onPress={onPressIdentityBackup}
              {...appiumTestProps(APPIUM_IDs.identity_btn_create)}
            >
              <View style={s.container}>
                <Text style={styles.buttonTitle}>{strings.setup.title}</Text>
                <Text style={styles.buttonHint}>{strings.setup.desc}</Text>
              </View>
              <SvgIcon
                color={colors.white_snow}
                name="chevronRight"
                width={ICON_SIZE_20}
                height={ICON_SIZE_20}
              />
            </ButtonBase>
            <ButtonBase
              style={styles.button}
              onPress={onPressIdentitySync}
              {...appiumTestProps(APPIUM_IDs.identity_btn_link)}
            >
              <View style={s.container}>
                <Text style={styles.buttonTitle}>{strings.sync.title}</Text>
                <Text style={styles.buttonHint}>{strings.sync.desc}</Text>
              </View>
              <SvgIcon
                color={colors.white_snow}
                name="chevronRight"
                width={ICON_SIZE_20}
                height={ICON_SIZE_20}
              />
            </ButtonBase>
            <ButtonBase
              style={styles.textButton}
              onPress={onPressRecoverAccount}
              hitSlop={UI_SIZE_8}
            >
              <Text style={styles.textButtonTitle}>
                {accountStrings.recoverAccount}
              </Text>
            </ButtonBase>
          </View>
        </View>
      </Component>
    )
  },
)

const BackgroundImageSizeRatio = 536 / 393

const getStyles = createThemedStylesheetWithHooks(
  (theme, { top, bottom }) => {
    const styles = StyleSheet.create({
      button: {
        ...s.centerAlignedRow,
        backgroundColor: theme.color.grey_800,
        borderRadius: UI_SIZE_16,
        marginBottom: UI_SIZE_16,
        padding: UI_SIZE_16,
      },
      buttonHint: {
        ...theme.text.body,
        ...theme.text.subtitle,
        color: theme.color.grey_200,
        marginTop: UI_SIZE_2,
      },
      buttonTitle: {
        ...theme.text.title2,
      },
      container: {
        ...s.absoluteFill,
        paddingBottom: bottom,
      },
      content: {
        paddingHorizontal: UI_SIZE_16,
      },
      hint: {
        ...theme.text.body,
        ...s.textAlignCenter,
        color: colors.keet_grey_200,
        marginBottom: UI_SIZE_32,
      },
      imageBackground: {
        top: top - 10 * BackgroundImageSizeRatio,
      },
      navBar: {
        backgroundColor: TRANSPARENT,
      },
      textButton: {
        alignSelf: 'center',
        paddingBottom: UI_SIZE_16,
      },
      textButtonTitle: {
        ...theme.text.title,
        color: theme.color.blue_400,
        fontSize: UI_SIZE_14,
      },
      title: {
        ...theme.text.title,
        ...s.textAlignCenter,
        fontSize: UI_SIZE_24,
        marginBottom: UI_SIZE_32,
      },
      wrapper: {
        ...s.container,
        backgroundColor: theme.color.grey_900,
      },
    })
    return styles
  },
  () => useSafeAreaInsets(),
)

export default IdentitySyncOrBackup
