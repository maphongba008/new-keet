import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Keyboard,
  KeyboardAvoidingView,
  LayoutChangeEvent,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import _debounce from 'lodash/debounce'

import roomsApi from '@holepunchto/keet-store/api/rooms'
import { ROOM_NAME_MAX_LENGTH } from '@holepunchto/keet-store/store/room'

import { showBottomSheet } from 'component/AppBottomSheet/AppBottomSheet.Store'
import BottomSheetEnum from 'component/AppBottomSheet/SheetComponents/BottomSheetEnum'
import { EmojiAutocomplete } from 'component/EmojiAutocomplete'
import { NavBar } from 'component/NavBar'
import { colors, createThemedStylesheet, useTheme } from 'component/theme'
import s, {
  UI_SIZE_2,
  UI_SIZE_8,
  UI_SIZE_14,
  UI_SIZE_16,
  UI_SIZE_24,
  UI_SIZE_42,
} from 'lib/commonStyles'
import { BACK_DEBOUNCE_DELAY, BACK_DEBOUNCE_OPTIONS } from 'lib/constants'
import WithRoomIdRendered from 'lib/hoc/withRoomIdRendered'
import { useEmojiAutocomplete } from 'lib/hooks/useEmojiAutocomplete'
import { getRoomTypeFlags, useConfig } from 'lib/hooks/useRoom'
import { showErrorNotifier } from 'lib/hud'
import { back } from 'lib/navigation'
import { isAndroid, isIOS } from 'lib/platform'

import { useStrings } from 'i18n/strings'

import RoomProfileIcon from './RoomProfileIcon'

const { useUpdateConfigMutation } = roomsApi

enum FocusType {
  None,
  Name,
  Description,
}

const OFFSCREEN_POSITION = -10_000

const EditRoomDetailsScreen = WithRoomIdRendered(({ roomId }: any) => {
  const styles = getStyles()
  const theme = useTheme()
  const strings = useStrings()
  const { top: insetTop } = useSafeAreaInsets()

  const { title, description, roomType } = useConfig(roomId)
  const { isDm } = getRoomTypeFlags(roomType)
  const [updateConfig, { isError }] = useUpdateConfigMutation()

  const [newTitle, setNewTitle] = useState(title ?? '')
  const [newDescription, setNewDescription] = useState(description ?? '')

  const [focusType, setFocusType] = useState(FocusType.None)
  const hasInputError = !newTitle.trim()

  const [nameYOffset, setNameYOffset] = useState(0)
  const [descriptionYOffset, setDescriptionYOffset] = useState(0)

  const [text, setText] = useMemo(
    () => [
      focusType === FocusType.Name
        ? newTitle
        : focusType === FocusType.Description
          ? newDescription
          : '',
      focusType === FocusType.Name
        ? setNewTitle
        : focusType === FocusType.Description
          ? setNewDescription
          : noop,
    ],
    [focusType, newDescription, newTitle],
  )

  const { prefix, showAutocomplete, complete, selection, onSelectionChange } =
    useEmojiAutocomplete({ text, setText })

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleCancel = useCallback(
    _debounce(
      () => {
        Keyboard.dismiss()
        back()
      },
      BACK_DEBOUNCE_DELAY,
      BACK_DEBOUNCE_OPTIONS,
    ),
    [],
  )

  const handleSave = useCallback(() => {
    if (title !== newTitle) {
      updateConfig({ roomId, key: 'title', value: newTitle })
    }
    if (description !== newDescription) {
      updateConfig({ roomId, key: 'description', value: newDescription })
    }
    handleCancel()
  }, [
    description,
    handleCancel,
    newDescription,
    newTitle,
    roomId,
    title,
    updateConfig,
  ])

  const changePicture = useCallback(() => {
    showBottomSheet({
      bottomSheetType: BottomSheetEnum.RoomAvatarBottomSheet,
      roomId,
    })
  }, [roomId])

  const onBlur = useCallback(() => setFocusType(FocusType.None), [])
  const onFocusName = useCallback(() => setFocusType(FocusType.Name), [])
  const onFocusDescription = useCallback(
    () => setFocusType(FocusType.Description),
    [],
  )
  const onNameLayout = useCallback(
    (e: LayoutChangeEvent) =>
      e.target.measure((x, y, width, height, pageX, pageY) => {
        setNameYOffset(pageY + (isIOS ? height - insetTop + 2 : -26))
      }),
    [insetTop],
  )
  const onDescriptionLayout = useCallback(
    (e: LayoutChangeEvent) => {
      e.target.measure((x, y, width, height, pageX, pageY) =>
        setDescriptionYOffset(
          pageY + height - insetTop - (isAndroid ? 60 : -2),
        ),
      )
    },
    [insetTop],
  )

  useEffect(() => {
    if (isError) {
      showErrorNotifier(strings.room.roomEditError, false)
    }
  }, [isError, strings])

  const cancelButton = useMemo(
    () => (
      <Text style={styles.navButton} onPress={handleCancel}>
        {strings.common.cancel}
      </Text>
    ),
    [handleCancel, strings, styles],
  )
  const saveButton = useMemo(
    () => (
      <Text style={[styles.navButton, styles.saveLabel]} onPress={handleSave}>
        {strings.account.save}
      </Text>
    ),
    [handleSave, strings, styles],
  )
  const yOffset = useMemo(() => {
    switch (focusType) {
      case FocusType.Name:
        return nameYOffset
      case FocusType.Description:
        return descriptionYOffset
      default:
        return OFFSCREEN_POSITION
    }
  }, [focusType, nameYOffset, descriptionYOffset])

  return (
    <View style={s.container}>
      <NavBar title={''} left={cancelButton} middle={null} right={saveButton} />
      <KeyboardAvoidingView
        behavior={isIOS ? 'padding' : 'height'}
        style={[s.container, styles.formContainer]}
      >
        <View style={styles.iconContainer}>
          <RoomProfileIcon roomId={roomId} large />
          <Text style={styles.iconLabel} onPress={changePicture}>
            Edit room icon
          </Text>
        </View>

        <View style={styles.formSection} onLayout={onNameLayout}>
          <Text style={styles.formLabel}>
            {strings.lobby.roomActions.channelAction.roomNameLabel}
          </Text>
          <TextInput
            style={[
              styles.form,
              focusType === FocusType.Name && styles.formInputFocused,
              hasInputError && styles.formInputError,
            ]}
            autoCorrect={false}
            maxLength={ROOM_NAME_MAX_LENGTH}
            returnKeyType="done"
            placeholder={
              strings.lobby.roomActions.channelAction.roomNamePlaceholder
            }
            placeholderTextColor={theme.color.grey_300}
            defaultValue={newTitle}
            onChangeText={setNewTitle}
            selection={selection}
            onSelectionChange={onSelectionChange}
            onFocus={onFocusName}
            onBlur={onBlur}
          />
        </View>

        {!isDm && (
          <View style={styles.formSection} onLayout={onDescriptionLayout}>
            <Text style={styles.formLabel}>
              {strings.room.settings.roomDescription}
            </Text>
            <TextInput
              style={[
                styles.form,
                styles.formDescription,
                focusType === FocusType.Description && styles.formInputFocused,
              ]}
              multiline
              placeholder={
                strings.lobby.roomActions.channelAction.roomDescPlaceholder
              }
              placeholderTextColor={theme.color.grey_300}
              defaultValue={newDescription}
              onChangeText={setNewDescription}
              selection={selection}
              onSelectionChange={onSelectionChange}
              onBlur={onBlur}
              onFocus={onFocusDescription}
            />
          </View>
        )}

        {showAutocomplete && focusType !== FocusType.None && (
          <EmojiAutocomplete
            xOffset={UI_SIZE_24}
            yOffset={yOffset}
            prefix={prefix}
            complete={complete}
          />
        )}
      </KeyboardAvoidingView>
    </View>
  )
})

export default EditRoomDetailsScreen

function noop() {}

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    form: {
      ...theme.text.body,
      backgroundColor: theme.color.grey_600,
      borderColor: theme.border.color,
      borderRadius: theme.border.radiusLarge,
      borderWidth: theme.border.width,
      height: UI_SIZE_42,
      marginBottom: theme.spacing.standard,
      paddingHorizontal: theme.spacing.standard,
      paddingVertical: theme.spacing.normal + UI_SIZE_2,
    },
    formContainer: {
      padding: UI_SIZE_24,
    },
    formDescription: {
      height: 182,
      textAlignVertical: 'top',
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
      fontSize: UI_SIZE_14,
      paddingBottom: UI_SIZE_8,
    },
    formSection: {
      marginBottom: UI_SIZE_16,
    },
    iconContainer: {
      alignItems: 'center',
    },
    iconLabel: {
      ...theme.text.body,
      color: theme.color.blue_400,
      marginTop: UI_SIZE_8,
    },
    navButton: {
      ...theme.text.bodyBold,
    },
    saveLabel: {
      color: theme.color.blue_400,
    },
  })
  return styles
})
