import { ReactRenderer } from 'marked-react'
import React, { memo, useCallback, useEffect, useMemo, useState } from 'react'
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import * as Clipboard from 'expo-clipboard'

import {
  getSyncDeviceErrorMsg,
  submitSyncIdentity,
} from '@holepunchto/keet-store/store/identity'

import { IconButton, TextButton, TextButtonType } from 'component/Button'
import { mdRenderer as defaultRenderer, MarkDown } from 'component/MarkDown'
import { BackButton, NavBar } from 'component/NavBar'
import { containsRoomUrl } from 'component/QRScannerSheet'
import SvgIcon from 'component/SvgIcon'
import { colors, createThemedStylesheet, useTheme } from 'component/theme'
import { ThreeDotsIndicator } from 'component/ThreeDotsIndicator'
import { APPIUM_IDs, appiumTestProps } from 'lib/appium'
import s, {
  DIRECTION,
  DIRECTION_CODE,
  ICON_SIZE_16,
  INPUT_ICON_COLOR,
  UI_SIZE_6,
  UI_SIZE_8,
  UI_SIZE_12,
  UI_SIZE_14,
  UI_SIZE_16,
  UI_SIZE_18,
  UI_SIZE_42,
} from 'lib/commonStyles'
import { useFocusedBackHandler } from 'lib/hooks/useBackHandler'
import { keyboardBehavior } from 'lib/keyboard'

import { useStrings } from 'i18n/strings'

import { PAGES } from './IdentitySync.helpers'

const IdentitySyncInput = memo(
  ({ onChangeFormMode }: { onChangeFormMode: (value: PAGES) => void }) => {
    const [inputFocused, setInputFocused] = useState<boolean>(false)
    const styles = getStyles()
    const strings = useStrings()
    const theme = useTheme()

    const [link, setLink] = useState('')
    const [isShowError, setIsShowError] = useState(false)
    const errorMsg = useSelector(getSyncDeviceErrorMsg)
    const isError = useMemo(() => !containsRoomUrl(link), [link])
    const dispatch = useDispatch()

    useEffect(() => {
      if (link.trim().length > 0 && isError) {
        setIsShowError(true)
      } else {
        setIsShowError(false)
      }
    }, [isError, link])

    const valid = !!link && !isShowError

    const onPressBack = useCallback(() => {
      onChangeFormMode(PAGES.camera)
      return true
    }, [onChangeFormMode])
    useFocusedBackHandler(onPressBack)

    const onFocus = useCallback(() => setInputFocused(true), [])
    const onBlur = useCallback(() => setInputFocused(false), [])
    const submitSearch = useCallback(() => {
      if (!valid) return
      dispatch(submitSyncIdentity(link))
    }, [dispatch, link, valid])

    const onPressPaste = useCallback(async () => {
      const text = await Clipboard.getStringAsync()
      text && setLink(text)
    }, [])

    const mdRenderer = useMemo(
      (): Partial<ReactRenderer> => ({
        ...defaultRenderer,
        // eslint-disable-next-line react/no-unstable-nested-components
        text(text: string) {
          return (
            <Text style={styles.text} key={`${this.elementId}`}>
              {text}
            </Text>
          )
        },
      }),
      [styles.text],
    )
    const renderer = useCallback(() => mdRenderer, [mdRenderer])

    return (
      <>
        <NavBar
          title={null}
          left={<BackButton overrideOnPress={onPressBack} />}
          middle={<ThreeDotsIndicator currentIndex={0} />}
        />
        <KeyboardAvoidingView behavior={keyboardBehavior} style={s.container}>
          <ScrollView contentContainerStyle={styles.root} bounces={false}>
            <Text style={styles.title}>
              {strings.syncDevice.syncDeviceOpts.inputLabel}
            </Text>
            <MarkDown
              md={strings.syncDevice.syncDeviceOpts.inputDesc}
              renderer={renderer}
            />
            {!!errorMsg && (
              <Text style={styles.errorText}>
                {strings.syncDevice.syncDeviceOpts.inputError}
              </Text>
            )}
            <Text style={styles.inputLabel}>
              {strings.syncDevice.syncDeviceOpts.inputPlaceholder}
            </Text>
            <View
              style={[
                styles.inputWrapper,
                inputFocused && styles.formInputFocused,
                (!!errorMsg || isShowError) && styles.formInputError,
              ]}
            >
              <TextInput
                placeholderTextColor={theme.color.grey_300}
                placeholder={strings.syncDevice.syncDeviceOpts.inputPlaceholder}
                style={styles.input as any}
                onChangeText={setLink}
                defaultValue={link}
                onFocus={onFocus}
                onBlur={onBlur}
                {...appiumTestProps(APPIUM_IDs.identity_sync_invite_link_input)}
              />
              <IconButton onPress={onPressPaste} style={styles.inputIconPaste}>
                <SvgIcon
                  name="paste"
                  width={ICON_SIZE_16}
                  height={ICON_SIZE_16}
                  color={colors.white_snow}
                />
              </IconButton>
            </View>
            <View style={s.container} />
            <TextButton
              text={strings.common.next}
              onPress={submitSearch}
              type={valid ? TextButtonType.primary : TextButtonType.gray}
              disabled={!valid}
              {...appiumTestProps(APPIUM_IDs.identity_sync_invite_link_submit)}
            />
          </ScrollView>
        </KeyboardAvoidingView>
      </>
    )
  },
)

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    errorText: {
      ...theme.text.body,
      color: theme.color.danger,
      fontSize: UI_SIZE_14,
      marginTop: UI_SIZE_8,
    },
    formInputError: {
      borderColor: theme.color.danger,
    },
    formInputFocused: {
      borderColor: theme.color.blue_400,
    },
    input: {
      ...theme.text.body,
      flex: 1,
      paddingHorizontal: theme.spacing.standard,
      paddingVertical:
        theme.spacing.standard /
        Platform.select({ ios: 1, android: 2, default: 1 }),
      textAlign: Platform.select({
        ios: 'auto',
        android: DIRECTION,
        default: 'auto',
      }),
      writingDirection: Platform.select({
        ios: undefined,
        android: DIRECTION_CODE,
        default: undefined,
      }),
    },
    inputIconPaste: {
      ...s.centeredLayout,
      backgroundColor: INPUT_ICON_COLOR,
      borderRadius: theme.border.radiusNormal,
      height: UI_SIZE_42,
      margin: UI_SIZE_6,
      width: UI_SIZE_42,
    },
    inputLabel: {
      ...theme.text.bodySemiBold,
      color: theme.color.grey_100,
      fontSize: 13,
      marginTop: UI_SIZE_16,
    },
    inputWrapper: {
      ...s.centerAlignedRow,
      backgroundColor: theme.color.grey_600,
      borderColor: theme.border.color,
      borderRadius: theme.border.radiusLarge,
      borderWidth: theme.border.width,
      marginTop: UI_SIZE_8,
    },
    root: {
      ...s.container,
      paddingHorizontal: UI_SIZE_12,
      paddingVertical: UI_SIZE_16,
    },
    text: {
      color: theme.color.grey_100,
      fontSize: UI_SIZE_14,
    },
    title: {
      ...theme.text.title,
      fontSize: UI_SIZE_18,
      marginBottom: UI_SIZE_16,
    },
  })
  return styles
})

export default IdentitySyncInput
