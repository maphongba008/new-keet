import React, { useCallback, useMemo, useRef, useState } from 'react'
import {
  Keyboard,
  LayoutChangeEvent,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { useDispatch } from 'react-redux'
import { ScrollView } from 'react-native-gesture-handler'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import _noop from 'lodash/noop'

import {
  createRoomSubmit,
  ROOM_NAME_MAX_LENGTH,
} from '@holepunchto/keet-store/store/room'
import { ROOM_TYPE } from '@holepunchto/keet-store/store/room/room.constants'

import { TextButton, TextButtonType } from 'component/Button'
import { CloseButton } from 'component/CloseButton'
import { EmojiAutocomplete } from 'component/EmojiAutocomplete'
import { NavBar, ScreenSystemBars } from 'component/NavBar'
import { isValidRoomName } from 'component/QRScannerSheet'
import SvgIcon from 'component/SvgIcon'
import { colors, createThemedStylesheet, useTheme } from 'component/theme'
import { APPIUM_IDs, appiumTestProps } from 'lib/appium'
import s, {
  DIRECTION_CODE,
  ICON_SIZE_16,
  UI_SIZE_2,
  UI_SIZE_4,
  UI_SIZE_8,
  UI_SIZE_12,
  UI_SIZE_14,
  UI_SIZE_24,
} from 'lib/commonStyles'
import { SAFE_EDGES } from 'lib/constants'
import withInteractiveKeyboard, {
  InteractiveKeyboardI,
} from 'lib/hoc/withInteractiveKeyboard'
import { useEmojiAutocomplete } from 'lib/hooks/useEmojiAutocomplete'
import { navReplace, SCREEN_ROOM } from 'lib/navigation'
import { interactiveKeyboardDismissMode, isIOS } from 'lib/platform'

import { useStrings } from 'i18n/strings'

const SHOW_AVATAR = false

function CreateChannel({ contentStyle }: InteractiveKeyboardI) {
  const theme = useTheme()
  const styles = getStyles()
  const strings = useStrings()
  const dispatch = useDispatch()
  const { top: insetTop } = useSafeAreaInsets()

  const [text, setText] = useState('')
  const [description, setDescription] = useState('')
  const [focusType, setFocusType] = useState('')
  const [isShowError, setIsShowError] = useState(false)
  const [autocompleteYOffset, setAutocompleteYOffset] = useState(0)
  const inputRef = useRef<TextInput>(null)

  const { prefix, showAutocomplete, complete, selection, onSelectionChange } =
    useEmojiAutocomplete({ text, setText })

  const createButtonDisabled = useMemo(() => !isValidRoomName(text), [text])

  const onClickSubmit = useCallback(async () => {
    if (text.trim().length === 0) setIsShowError(true)
    if (!isValidRoomName(text)) return
    Keyboard.dismiss()

    dispatch(
      createRoomSubmit({
        title: text,
        opts: {
          roomType: ROOM_TYPE.BROADCAST,
          canCall: 'false',
          description,
        },
      }),
    )
    navReplace(SCREEN_ROOM)
  }, [dispatch, text, description])
  const onFocusName = useCallback(() => setFocusType('name'), [])
  const onFocusDescription = useCallback(() => setFocusType('description'), [])
  const onBlur = useCallback(() => setFocusType(''), [])
  const onAutocompleteLayout = useCallback(
    (e: LayoutChangeEvent) =>
      e.target.measure((x, y, width, height, pageX, pageY) =>
        setAutocompleteYOffset(pageY + height + (isIOS ? insetTop : 0)),
      ),
    [insetTop],
  )

  return (
    <>
      <ScreenSystemBars />
      <SafeAreaView style={s.container} edges={SAFE_EDGES}>
        <NavBar
          title={null}
          left={null}
          right={<CloseButton style={s.alignSelfEnd} />}
        />

        <ScrollView
          contentContainerStyle={[
            s.flexGrow,
            s.justifyEnd,
            styles.contentWrapper,
          ]}
          keyboardDismissMode={interactiveKeyboardDismissMode}
        >
          <View style={s.container}>
            <Text style={styles.onboardTitle}>
              {strings.lobby.roomActions.channelAction.title}
            </Text>
            <Text style={styles.onboardMeta}>
              {strings.lobby.roomActions.channelAction.description}
            </Text>

            {SHOW_AVATAR && (
              <TouchableOpacity style={styles.thumbnail} onPress={_noop}>
                <SvgIcon
                  name="camera"
                  width={ICON_SIZE_16}
                  height={ICON_SIZE_16}
                  color={colors.white_snow}
                />
                <Text style={styles.thumbnailLabel}>
                  {strings.lobby.roomActions.channelAction.upload}
                </Text>
              </TouchableOpacity>
            )}

            <View style={styles.formRow}>
              <Text style={styles.channelFormLabel}>
                {strings.lobby.roomActions.channelAction.roomNameLabel}
              </Text>
              <TextInput
                style={[
                  styles.channelForm,
                  isShowError && styles.formInputError,
                  focusType === 'name' && styles.formInputFocused,
                ]}
                ref={inputRef}
                returnKeyType="done"
                maxLength={ROOM_NAME_MAX_LENGTH}
                autoCorrect={false}
                placeholder={
                  strings.lobby.roomActions.channelAction.roomNamePlaceholder
                }
                placeholderTextColor={theme.color.grey_300}
                value={text}
                onChangeText={setText}
                onFocus={onFocusName}
                onBlur={onBlur}
                selection={selection}
                onSelectionChange={onSelectionChange}
                onLayout={onAutocompleteLayout}
                {...appiumTestProps(APPIUM_IDs.lobby_input_room_name)}
              />
            </View>

            <View>
              <Text style={styles.channelFormLabel}>
                {strings.lobby.roomActions.channelAction.roomDescLabel}
              </Text>
              <TextInput
                style={[
                  styles.channelForm,
                  styles.channelFormDesc,
                  focusType === 'description' && styles.formInputFocused,
                ]}
                ref={inputRef}
                placeholder={
                  strings.lobby.roomActions.channelAction.roomDescPlaceholder
                }
                placeholderTextColor={theme.color.grey_300}
                multiline
                onChangeText={setDescription}
                onFocus={onFocusDescription}
                onBlur={onBlur}
                {...appiumTestProps(APPIUM_IDs.lobby_input_room_description)}
              />
            </View>
          </View>
        </ScrollView>

        {showAutocomplete && focusType === 'name' && (
          <EmojiAutocomplete
            yOffset={autocompleteYOffset}
            prefix={prefix}
            complete={complete}
          />
        )}

        <TextButton
          testID={APPIUM_IDs.lobby_btn_submit}
          style={[styles.btnWrapper, contentStyle]}
          text={strings.lobby.roomActions.channelAction.disclaimer.button}
          onPress={onClickSubmit}
          type={
            createButtonDisabled ? TextButtonType.gray : TextButtonType.primary
          }
          disabled={createButtonDisabled}
        />
      </SafeAreaView>
    </>
  )
}

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    btnWrapper: {
      marginBottom: UI_SIZE_8,
      marginHorizontal: UI_SIZE_12,
      marginTop: UI_SIZE_4,
    },
    channelForm: {
      ...theme.text.body,
      backgroundColor: theme.background.bg_2,
      borderRadius: theme.border.radiusLarge,
      height: 42,
      marginBottom: theme.spacing.standard,
      paddingHorizontal: theme.spacing.standard,
      paddingVertical: theme.spacing.normal + UI_SIZE_2,
    },
    channelFormDesc: {
      height: 169,
      paddingTop: theme.spacing.normal + UI_SIZE_2,
      textAlignVertical: 'top',
    },
    channelFormLabel: {
      ...theme.text.body,
      color: colors.text_grey,
      fontSize: 14,
      paddingBottom: UI_SIZE_8,
    },
    contentWrapper: {
      padding: UI_SIZE_12,
    },
    formInputError: {
      borderColor: theme.color.danger,
    },
    formInputFocused: {
      borderColor: theme.color.blue_400,
    },
    formRow: {
      marginTop: UI_SIZE_24,
    },
    onboardMeta: {
      ...theme.text.body,
      color: theme.color.grey_300,
      fontSize: UI_SIZE_14,
      writingDirection: DIRECTION_CODE,
    },
    onboardTitle: {
      ...theme.text.title,
      marginBottom: theme.spacing.normal,
      writingDirection: DIRECTION_CODE,
    },
    thumbnail: {
      ...s.alignItemsCenter,
      ...s.alignSelfCenter,
      ...s.justifyCenter,
      borderColor: theme.color.blue_400,
      borderRadius: 100,
      borderStyle: 'dashed',
      borderWidth: 1,
      height: 100,
      width: 100,
    },
    thumbnailLabel: {
      ...theme.text.body,
      fontSize: 14,
      marginTop: UI_SIZE_4,
    },
  })
  return styles
})

export default withInteractiveKeyboard(CreateChannel)
