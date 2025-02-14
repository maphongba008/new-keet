import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import {
  Keyboard,
  KeyboardAvoidingView,
  LayoutChangeEvent,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import * as Clipboard from 'expo-clipboard'
import { BottomSheetTextInput } from '@gorhom/bottom-sheet'

import { getAppCurrentRoomId } from '@holepunchto/keet-store/store/app'
import {
  getSyncDeviceErrorMsg,
  setSyncDeviceErrorMsg,
} from '@holepunchto/keet-store/store/identity'
import {
  createRoomSubmit,
  getRoomLastPairing,
  getRoomPairError,
  joinRoomSubmit,
  PAIRING_STATUS,
  ROOM_NAME_MAX_LENGTH,
  setRoomPairError,
} from '@holepunchto/keet-store/store/room'

import { closeBottomSheet } from 'component/AppBottomSheet/AppBottomSheet.Store'
import { BtmSheetHeader } from 'component/BottomSheetBase'
import {
  ButtonBase,
  IconButton,
  TextButton,
  TextButtonType,
} from 'component/Button'
import { EmojiAutocomplete } from 'component/EmojiAutocomplete'
import QRScannerSheet, {
  containsRoomUrl,
  isValidRoomName,
  normalizeRoomUrl,
} from 'component/QRScannerSheet'
import RoomPairingError from 'component/RoomPairingError'
import SvgIcon from 'component/SvgIcon'
import { colors, createThemedStylesheet, useTheme } from 'component/theme'
import { APPIUM_IDs, appiumTestProps } from 'lib/appium'
import { SHOW_CHANNEL_UI } from 'lib/build.constants'
import s, {
  DIRECTION,
  DIRECTION_CODE,
  ICON_SIZE_16,
  ICON_SIZE_20,
  INPUT_ICON_COLOR,
  UI_SIZE_2,
  UI_SIZE_8,
  UI_SIZE_12,
  UI_SIZE_14,
  UI_SIZE_18,
  UI_SIZE_48,
} from 'lib/commonStyles'
import { useEmojiAutocomplete } from 'lib/hooks/useEmojiAutocomplete'
import { getErrorMessage } from 'lib/hooks/useErrorMessage'
import { keyboardBehavior } from 'lib/keyboard'
import { md2tx } from 'lib/md'
import {
  navigate,
  SCREEN_CREATE_CHANNEL_DISCLAIMER,
  SCREEN_ROOM,
} from 'lib/navigation'
import { wait } from 'lib/wait'

import { useStrings } from 'i18n/strings'

enum ACTION_TYPES {
  UNDEFINED,
  JOIN,
  CREATE,
  CHAT_ROOM,
  CHANNEL,
}

const RoomActionOnboarding = memo(
  ({
    setType,
  }: {
    setType: React.Dispatch<React.SetStateAction<ACTION_TYPES>>
  }) => {
    const styles = getStyles()
    const strings = useStrings()

    const onClickJoin = useCallback(() => {
      setType(ACTION_TYPES.JOIN)
    }, [setType])
    const onClickCreate = useCallback(() => {
      if (!SHOW_CHANNEL_UI) {
        setType(ACTION_TYPES.CHAT_ROOM)
        return
      }
      setType(ACTION_TYPES.CREATE)
    }, [setType])

    return (
      <>
        <Text style={styles.onboardTitle}>
          {strings.lobby.roomActions.onboardTitle}
        </Text>
        <Text style={styles.onboardMeta}>
          {strings.lobby.roomActions.onboardText}
        </Text>
        <TextButton
          text={strings.lobby.roomActions.joinRoomBtn}
          hint={strings.lobby.roomActions.joinRoomBtn}
          onPress={onClickJoin}
          style={styles.joinButton}
          type={TextButtonType.outline}
          testID={APPIUM_IDs.lobby_btn_join_room}
        />
        <TextButton
          text={strings.lobby.roomActions.createRoomBtn}
          hint={strings.lobby.roomActions.createRoomBtn}
          onPress={onClickCreate}
          type={TextButtonType.outline}
          testID={APPIUM_IDs.lobby_btn_create_room}
        />
      </>
    )
  },
)

type qrBottomSheetRef = {
  presentSheet: () => void
  closeSheet: () => void
}
const RoomActionSheet = memo(() => {
  const theme = useTheme()
  const styles = getStyles()
  const strings = useStrings()
  const dispatch = useDispatch()

  const deviceSyncError = useSelector(getSyncDeviceErrorMsg)
  const pairError = useSelector(getRoomPairError)
  const errorMessage = getErrorMessage(deviceSyncError || pairError)
  const currentRoomId = useSelector(getAppCurrentRoomId)
  const previousRoomId = useRef(currentRoomId)
  const roomLastPairing = useSelector(getRoomLastPairing)
  const previousRoomLastPairingStatus = useRef(roomLastPairing?.status)
  const isLoadingRef = useRef(false)

  const [text, setText] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState<ACTION_TYPES>(ACTION_TYPES.UNDEFINED)
  const [focusType, setFocusType] = useState('')
  const [autocompleteYOffset, setAutocompleteYOffset] = useState(0)

  const onAutocompleteLayout = useCallback(
    (e: LayoutChangeEvent) =>
      setAutocompleteYOffset(
        e.nativeEvent.layout.y +
          e.nativeEvent.layout.height -
          theme.spacing.standard, // margin
      ),
    [theme],
  )

  const ContentLayout = useMemo(
    // remove scrollview usage from create room modal
    () => (type === ACTION_TYPES.CREATE ? View : ScrollView),
    [type],
  )

  const isCreateJoinRoom = useMemo(
    () =>
      type !== ACTION_TYPES.UNDEFINED &&
      (type === ACTION_TYPES.JOIN || type === ACTION_TYPES.CHAT_ROOM),
    [type],
  )

  const [isShowError, setIsShowError] = useState(false)
  const isError = useMemo(
    () =>
      type === ACTION_TYPES.JOIN
        ? !containsRoomUrl(text)
        : !isValidRoomName(text),
    [text, type],
  )
  const qrBottomSheetRef = useRef<qrBottomSheetRef>(null)

  const { prefix, showAutocomplete, complete, selection, onSelectionChange } =
    useEmojiAutocomplete({ text, setText })

  useEffect(() => {
    // No need show error for empty space text "   " if user still typing
    if (text.trim().length > 0 && type === ACTION_TYPES.JOIN && isError) {
      setIsShowError(true)
    } else {
      setIsShowError(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text])

  useEffect(() => {
    if (type === ACTION_TYPES.CHANNEL) {
      closeBottomSheet()
      navigate(SCREEN_CREATE_CHANNEL_DISCLAIMER)
    }
  }, [type])

  const unsetInputError = useCallback(() => {
    setText('')
    if (deviceSyncError) dispatch(setSyncDeviceErrorMsg(''))
    if (pairError) dispatch(setRoomPairError(''))
  }, [deviceSyncError, dispatch, pairError])

  useEffect(() => {
    return () => {
      if (type === ACTION_TYPES.JOIN) {
        unsetInputError()
      }
    }
  }, [type, unsetInputError])

  useEffect(() => {
    if (
      type === ACTION_TYPES.JOIN &&
      ((previousRoomId.current !== currentRoomId && currentRoomId) ||
        (previousRoomLastPairingStatus.current === PAIRING_STATUS.NEW &&
          roomLastPairing?.status === PAIRING_STATUS.ASKED))
    ) {
      unsetInputError()
      closeBottomSheet()
      isLoadingRef.current = false
    }
    previousRoomId.current = currentRoomId
    previousRoomLastPairingStatus.current = roomLastPairing?.status
  }, [type, currentRoomId, roomLastPairing?.status, unsetInputError])

  const modifiedSetText = useCallback(
    (inputText: string) => {
      unsetInputError()
      // Automatically add a space after '@'
      const newText = inputText.replace(/@(?!\s)/g, '@ ')
      setText(newText)
    },
    [unsetInputError],
  )

  const onClickSubmit = useCallback(async () => {
    if (isLoadingRef.current) return

    // We show error for empty spaces only when user press submit button
    if (text.trim().length === 0) setIsShowError(true)
    if (isError || !!errorMessage) return
    Keyboard.dismiss()

    isLoadingRef.current = true
    await wait(250)

    if (type === ACTION_TYPES.JOIN) {
      dispatch(joinRoomSubmit({ link: normalizeRoomUrl(text) }))
      isLoadingRef.current = false
    } else if (type === ACTION_TYPES.CHAT_ROOM) {
      closeBottomSheet()
      const opts = { description }
      dispatch(createRoomSubmit({ title: text, opts }))
      navigate(SCREEN_ROOM)
    }
  }, [text, isError, errorMessage, type, dispatch, description])

  const onSelectType = useCallback(
    (_type: ACTION_TYPES) => {
      setType(_type)
    },
    [setType],
  )

  const onPressBack = useCallback(
    (_type: ACTION_TYPES) => {
      setText('')
      onSelectType(_type)
    },
    [onSelectType],
  )

  const onPressPaste = useCallback(async () => {
    unsetInputError()
    const _text = await Clipboard.getStringAsync()
    _text && setText(md2tx(_text))
  }, [unsetInputError])

  const onScanQR = useCallback(
    (_text: string) => {
      unsetInputError()
      setText(_text)
    },
    [unsetInputError],
  )

  const onPressScanQR = useCallback(
    () => qrBottomSheetRef.current?.presentSheet(),
    [],
  )

  const onPressBackArrow = useCallback(
    () => onPressBack(ACTION_TYPES.UNDEFINED),
    [onPressBack],
  )

  const onPressChatRoom = useCallback(
    () => onSelectType(ACTION_TYPES.CHAT_ROOM),
    [onSelectType],
  )
  const onPressChannelRoom = useCallback(
    () => onSelectType(ACTION_TYPES.CHANNEL),
    [onSelectType],
  )

  const onNavigateBack = useCallback(
    () =>
      onPressBack(
        type === ACTION_TYPES.JOIN || !SHOW_CHANNEL_UI
          ? ACTION_TYPES.UNDEFINED
          : ACTION_TYPES.CREATE,
      ),
    [onPressBack, type],
  )

  const onFocusTitle = useCallback(() => setFocusType('title'), [])
  const onBlurTitle = useCallback(() => setFocusType(''), [])

  const onFocusDescription = useCallback(() => setFocusType('description'), [])
  const onBlurDescription = useCallback(() => setFocusType(''), [])

  return (
    <KeyboardAvoidingView
      behavior={keyboardBehavior}
      keyboardVerticalOffset={25}
    >
      <ContentLayout
        contentContainerStyle={[s.flexGrow, s.justifyEnd]}
        showsVerticalScrollIndicator={false}
      >
        {type === ACTION_TYPES.UNDEFINED && (
          <RoomActionOnboarding setType={setType} />
        )}
        {type === ACTION_TYPES.CREATE && (
          <>
            <BtmSheetHeader
              title={strings.lobby.roomActions.roomTypeAction.title}
              onClose={onPressBackArrow}
              testProps={appiumTestProps(APPIUM_IDs.lobby_btn_create_back)}
            />
            <Text style={[styles.onboardMeta, styles.reduceMargin]}>
              {strings.lobby.roomActions.roomTypeAction.description}
            </Text>
            <ButtonBase
              style={styles.roomTypeBtn}
              onPress={onPressChatRoom}
              {...appiumTestProps(APPIUM_IDs.lobby_btn_create_chat)}
            >
              <View style={[s.row, s.alignItemsCenter]}>
                <SvgIcon name="usersThree" color={colors.white_snow} />
                <View style={styles.textWrapper}>
                  <Text style={styles.roomTypeBtnLabel}>
                    {strings.lobby.roomActions.chatRoomBtnLabel}
                  </Text>
                  <Text style={styles.roomTypeBtnSubLabel}>
                    {strings.lobby.roomActions.chatRoomBtnSubLabel}
                  </Text>
                </View>
              </View>
              <SvgIcon
                name="arrowRight"
                width={UI_SIZE_18}
                height={UI_SIZE_18}
                color={colors.white_snow}
              />
            </ButtonBase>
            <ButtonBase
              style={styles.roomTypeBtn}
              onPress={onPressChannelRoom}
              {...appiumTestProps(APPIUM_IDs.lobby_btn_create_broadcast)}
            >
              <View style={[s.row, s.alignItemsCenter]}>
                <SvgIcon name="megaphone" color={colors.white_snow} />
                <View style={styles.textWrapper}>
                  <Text style={styles.roomTypeBtnLabel}>
                    {strings.lobby.roomActions.channelBtnLabel}
                  </Text>
                  <Text style={styles.roomTypeBtnSubLabel}>
                    {strings.lobby.roomActions.channelBtnSubLabel}
                  </Text>
                </View>
              </View>
              <SvgIcon
                name="arrowRight"
                width={UI_SIZE_18}
                height={UI_SIZE_18}
                color={colors.white_snow}
              />
            </ButtonBase>
          </>
        )}
        {isCreateJoinRoom && (
          <>
            <BtmSheetHeader
              title={
                strings.lobby.roomActions[
                  type === ACTION_TYPES.CHAT_ROOM
                    ? 'createAction'
                    : 'joinAction'
                ]?.title
              }
              onClose={onNavigateBack}
              testProps={appiumTestProps(APPIUM_IDs.back_button)}
            />
            <Text style={[styles.onboardMeta, styles.reduceMargin]}>
              {strings.lobby.roomActions.createAction.description}
            </Text>
            <Text style={styles.formLabel}>
              {strings.lobby.roomActions.createAction.roomNameLabel}
            </Text>
            <View style={s.centerAlignedRow} onLayout={onAutocompleteLayout}>
              <BottomSheetTextInput
                {...appiumTestProps(APPIUM_IDs.lobby_input_room_name)}
                style={[
                  styles.formInput,
                  focusType === 'title' && styles.formInputFocused,
                  isShowError && styles.formInputError,
                  type === ACTION_TYPES.JOIN && styles.inputIconPadding,
                ]}
                returnKeyType="done"
                maxLength={
                  type === ACTION_TYPES.CHAT_ROOM
                    ? ROOM_NAME_MAX_LENGTH
                    : undefined
                }
                placeholderTextColor={theme.text.placeholder.color}
                placeholder={
                  strings.lobby.roomActions[
                    type === ACTION_TYPES.CHAT_ROOM
                      ? 'createAction'
                      : 'joinAction'
                  ]?.inputPlaceholder
                }
                onFocus={onFocusTitle}
                onBlur={onBlurTitle}
                onChangeText={modifiedSetText}
                defaultValue={text}
                selection={selection}
                onSelectionChange={onSelectionChange}
              />
              {type === ACTION_TYPES.JOIN && (
                <>
                  <IconButton
                    onPress={onPressPaste}
                    testID={APPIUM_IDs.lobby_btn_paste}
                    style={styles.inputIconPaste}
                  >
                    <SvgIcon
                      name="paste"
                      width={ICON_SIZE_16}
                      height={ICON_SIZE_16}
                      color={colors.white_snow}
                    />
                  </IconButton>
                  <IconButton
                    onPress={onPressScanQR}
                    style={styles.inputIconQr}
                    testID={APPIUM_IDs.lobby_btn_qr}
                  >
                    <SvgIcon
                      name="qrcode"
                      color={colors.white_snow}
                      width={ICON_SIZE_20}
                      height={ICON_SIZE_20}
                    />
                  </IconButton>
                </>
              )}
            </View>
            {type === ACTION_TYPES.JOIN && (
              <RoomPairingError
                errorMessage={errorMessage}
                unsetInputError={unsetInputError}
                style={styles.joinButton}
              />
            )}
            {type === ACTION_TYPES.CHAT_ROOM && (
              <View>
                <Text style={styles.formLabel}>
                  {strings.lobby.roomActions.createAction.roomDescLabel}
                </Text>
                <BottomSheetTextInput
                  style={[
                    styles.formDesc,
                    focusType === 'description' && styles.formInputFocused,
                  ]}
                  placeholder={
                    strings.lobby.roomActions.createAction.roomDescPlaceholder
                  }
                  placeholderTextColor={theme.text.placeholder.color}
                  multiline
                  onChangeText={setDescription}
                  onFocus={onFocusDescription}
                  onBlur={onBlurDescription}
                  {...appiumTestProps(APPIUM_IDs.lobby_input_room_description)}
                />
              </View>
            )}
            {showAutocomplete && focusType === 'title' && (
              <EmojiAutocomplete
                yOffset={autocompleteYOffset}
                prefix={prefix}
                complete={complete}
              />
            )}
          </>
        )}
        <QRScannerSheet ref={qrBottomSheetRef} setText={onScanQR} />
      </ContentLayout>
      {isCreateJoinRoom && (
        <TextButton
          testID={APPIUM_IDs.lobby_btn_submit}
          text={
            strings.lobby.roomActions[
              type === ACTION_TYPES.CHAT_ROOM ? 'createRoomBtn' : 'joinRoomBtn'
            ]
          }
          onPress={onClickSubmit}
          type={isError ? TextButtonType.disabled : TextButtonType.primary}
        />
      )}
    </KeyboardAvoidingView>
  )
})

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    formDesc: {
      ...theme.text.body,
      backgroundColor: theme.color.grey_600,
      borderRadius: theme.border.radiusLarge,
      height: 120,
      marginBottom: theme.spacing.standard,
      paddingHorizontal: theme.spacing.standard,
      paddingTop: theme.spacing.normal + UI_SIZE_2,
      paddingVertical: theme.spacing.normal + UI_SIZE_2,
      textAlignVertical: 'top',
    },
    formInput: {
      ...theme.text.body,
      ...s.container,
      backgroundColor: theme.color.grey_600,
      borderRadius: theme.border.radiusLarge,
      height: 54,
      lineHeight: undefined,
      marginBottom: theme.spacing.standard,
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
    formInputError: {
      borderColor: theme.color.danger,
    },
    formInputFocused: {
      borderColor: theme.color.blue_400,
    },
    formLabel: {
      ...theme.text.body,
      color: colors.text_grey,
      fontSize: 14,
      paddingBottom: UI_SIZE_8,
    },
    inputIconPadding: {
      paddingRight: 54 + 54,
    },
    inputIconPaste: {
      backgroundColor: INPUT_ICON_COLOR,
      borderRadius: 6,
      bottom: 6,
      height: 42,
      position: 'absolute',
      right: 6 + UI_SIZE_48,
      top: 6,
      width: 42,
      ...s.centeredLayout,
    },
    inputIconQr: {
      backgroundColor: INPUT_ICON_COLOR,
      borderRadius: 6,
      bottom: 6,
      height: 42,
      position: 'absolute',
      right: 6,
      top: 6,
      width: 42,
      ...s.centeredLayout,
    },
    joinButton: {
      marginBottom: theme.spacing.standard,
    },
    onboardMeta: {
      ...theme.text.body,
      color: theme.color.grey_300,
      fontSize: UI_SIZE_14,
      marginBottom: theme.spacing.large,
      writingDirection: DIRECTION_CODE,
    },
    onboardTitle: {
      ...theme.text.title,
      marginBottom: theme.spacing.normal,
      writingDirection: DIRECTION_CODE,
    },
    reduceMargin: {
      marginTop: -10,
    },
    roomTypeBtn: {
      ...s.row,
      ...s.alignItemsCenter,
      ...s.flexSpaceBetween,
      backgroundColor: theme.color.grey_600,
      borderColor: theme.border.color,
      borderRadius: 12,
      borderWidth: theme.border.width,
      height: 64,
      marginBottom: theme.spacing.standard,
      padding: theme.spacing.standard,
    },
    roomTypeBtnLabel: {
      ...theme.text.bodySemiBold,
    },
    roomTypeBtnSubLabel: {
      ...theme.text.body,
      color: theme.color.grey_300,
      fontSize: 12,
      lineHeight: 20,
    },
    textWrapper: {
      marginLeft: UI_SIZE_12,
    },
    title: {
      ...s.centerAlignedRow,
      marginBottom: theme.spacing.large,
    },
  })
  return styles
})

export default RoomActionSheet
