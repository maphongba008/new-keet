import React, { useCallback, useState } from 'react'
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
} from 'react-native'
import { useDispatch } from 'react-redux'
import { BottomSheetTextInput } from '@gorhom/bottom-sheet'

import { dmRequestSubmit } from '@holepunchto/keet-store/store/room'
import { ROOM_DM_MESSAGE_MAX_LENGTH } from '@holepunchto/keet-store/store/room/dm'

import { closeBottomSheet } from 'component/AppBottomSheet/AppBottomSheet.Store'
import { BtmSheetHeader } from 'component/BottomSheetBase'
import { TextButton, TextButtonType } from 'component/Button'
import { createThemedStylesheet, useTheme } from 'component/theme'
import s, {
  DIRECTION_CODE,
  UI_SIZE_8,
  UI_SIZE_12,
  UI_SIZE_16,
  UI_SIZE_24,
  UI_SIZE_40,
} from 'lib/commonStyles'
import { keyboardBehavior } from 'lib/keyboard'
import { MemberType } from 'lib/types'

import { useStrings } from 'i18n/strings'

export interface DMRequestInterface {
  member: MemberType
}
enum RequestSteps {
  request,
  success,
}

function RequestView({
  onSuccess,
  member,
}: {
  member: MemberType
  onSuccess: () => void
}) {
  const styles = getStyles()
  const strings = useStrings()
  const theme = useTheme()
  const [message, setMessage] = useState('')
  const dispatch = useDispatch()
  const onPress = useCallback(() => {
    Keyboard.dismiss()
    dispatch(dmRequestSubmit(member.id, message))
    onSuccess()
  }, [dispatch, member.id, message, onSuccess])
  return (
    <ScrollView>
      <BtmSheetHeader
        title={strings.chat.dm.inviteToChat.replace(
          '$1',
          member.displayName || '',
        )}
        onClose={closeBottomSheet}
        isDismissIcon
      />
      <Text style={styles.description}>
        {strings.chat.dm.inviteToChatDescription}
      </Text>
      <Text style={styles.messageLabel}>{strings.chat.dm.message}</Text>
      <BottomSheetTextInput
        style={styles.messageInput}
        multiline
        placeholder={strings.chat.dm.messagePlaceHolder}
        placeholderTextColor={theme.color.grey_400}
        value={message}
        onChangeText={setMessage}
        maxLength={ROOM_DM_MESSAGE_MAX_LENGTH}
      />
      <TextButton
        style={styles.sendButton}
        text={strings.chat.dm.sendDMRequest}
        type={TextButtonType.primary}
        onPress={onPress}
        disabled={message.length === 0}
      />
    </ScrollView>
  )
}

function SuccessView() {
  const styles = getStyles()
  const strings = useStrings()
  return <Text style={styles.successText}>{strings.chat.dm.sendDMSuccess}</Text>
}

function DMRequest({ member }: DMRequestInterface) {
  const [step, setStep] = useState(RequestSteps.request)
  const onRequestSuccess = useCallback(() => setStep(RequestSteps.success), [])
  return (
    <ScrollView
      contentContainerStyle={[s.flexGrow, s.justifyEnd]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <KeyboardAvoidingView behavior={keyboardBehavior} style={s.container}>
        {step === RequestSteps.request && (
          <RequestView member={member} onSuccess={onRequestSuccess} />
        )}
        {step === RequestSteps.success && <SuccessView />}
      </KeyboardAvoidingView>
    </ScrollView>
  )
}

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    description: {
      ...theme.text.body,
      color: theme.color.grey_200,
      direction: DIRECTION_CODE,
      marginTop: UI_SIZE_8,
    },
    messageInput: {
      ...theme.text.body,
      borderColor: theme.color.grey_200,
      borderRadius: theme.border.radiusLarge,
      borderWidth: 1,
      height: 150,
      marginTop: UI_SIZE_8,
      paddingHorizontal: UI_SIZE_16,
      paddingVertical: theme.spacing.normal,
      textAlignVertical: 'top',
      writingDirection: Platform.select({
        ios: undefined,
        android: DIRECTION_CODE,
        default: undefined,
      }),
    },
    messageLabel: {
      ...theme.text.body,
      color: theme.color.grey_200,
      direction: DIRECTION_CODE,
      fontSize: UI_SIZE_12,
      marginTop: UI_SIZE_16,
    },
    sendButton: {
      marginTop: UI_SIZE_24,
    },
    successText: {
      ...theme.text.title,
      direction: DIRECTION_CODE,
      marginHorizontal: UI_SIZE_8,
      marginVertical: UI_SIZE_40,
      textAlign: 'center',
    },
  })

  return styles
})

export default DMRequest
