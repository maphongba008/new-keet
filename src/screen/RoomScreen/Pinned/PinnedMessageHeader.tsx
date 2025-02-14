import React, { useCallback, useEffect } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import { BlurView } from 'expo-blur'

import {
  getIsPinnedLimitMessageShown,
  getLastPinnedChatMessage,
  getPinnedChatMessagesCount,
  PINNED_MESSAGES_LIMIT,
  setIsPinnedLimitMessageShown,
} from '@holepunchto/keet-store/store/chat'

import {
  closeBottomSheet,
  showBottomSheet,
} from 'component/AppBottomSheet/AppBottomSheet.Store'
import BottomSheetEnum from 'component/AppBottomSheet/SheetComponents/BottomSheetEnum'
import { MarkdownPreview } from 'component/MarkdownPreview'
import { NavBar } from 'component/NavBar'
import SvgIcon from 'component/SvgIcon'
import { colors, colorWithAlpha, createThemedStylesheet } from 'component/theme'
import { APPIUM_IDs, appiumTestProps } from 'lib/appium'
import s, {
  UI_SIZE_4,
  UI_SIZE_8,
  UI_SIZE_14,
  UI_SIZE_48,
} from 'lib/commonStyles'
import { useMember } from 'lib/hooks/useMember'
import { escapeNameMd } from 'lib/md'
import { isDisplayFormat, processEmoji } from 'lib/messages'
import { navigate, SCREEN_PINNED_MESSAGES } from 'lib/navigation'
import { isIOS } from 'lib/platform'

import { useStrings } from 'i18n/strings'

import TextMessageDisplay from '../ChatEvent/ChatEventMessage/TextMessageDisplay'

export const PinnedMessageHeader: React.FC<{
  roomId: string
  roomType: string
}> = ({ roomId, roomType }) => {
  const styles = getStyles()
  const strings = useStrings()
  const dispatch = useDispatch()
  const count = useSelector(getPinnedChatMessagesCount)
  const message = useSelector(getLastPinnedChatMessage)
  const { chat, id, memberId } = message || {}
  const { styledFragments } = chat || {}
  const { member } = useMember(roomId, memberId)
  const sender = escapeNameMd(
    member?.isLocal ? strings.chat.you : (member?.displayName ?? ''),
  )
  const preview = processEmoji(chat?.text ?? '')
  const text = `${escapeNameMd(sender)}: ${preview}`
  const isDisplay = isDisplayFormat(chat?.format)
  const pinnedLimitWarningShown = useSelector(getIsPinnedLimitMessageShown)

  const onPress = useCallback(
    () => navigate(SCREEN_PINNED_MESSAGES, { type: roomType }),
    [roomType],
  )

  useEffect(() => {
    if (pinnedLimitWarningShown) {
      showBottomSheet({
        bottomSheetType: BottomSheetEnum.ConfirmDialog,
        title: strings.chat.maxPinsHeader,
        description: strings.chat.maxPinsMessage.replace(
          '$1',
          String(PINNED_MESSAGES_LIMIT),
        ),
        confirmButton: {
          text: strings.common.okGotIt,
          onPress: () => dispatch(setIsPinnedLimitMessageShown(false)),
        },
      })
    } else {
      closeBottomSheet()
    }
  }, [dispatch, pinnedLimitWarningShown, strings])

  if (count <= 0) {
    return null
  }

  return (
    <View style={styles.container}>
      {/* should have the "fake NavBar" here
      to have the proper UI
      and fix the issue https://app.asana.com/0/1207558849244259/1209302542670101/f */}
      <NavBar left={null} title={null} />
      <BlurView
        intensity={isIOS ? 8 : 1}
        experimentalBlurMethod="dimezisBlurView"
      >
        <Pressable
          style={styles.insideContainer}
          onPress={onPress}
          {...appiumTestProps(APPIUM_IDs.room_pinned_message_header)}
        >
          <View style={styles.icon}>
            <Text style={styles.count}>{count}</Text>
            <SvgIcon
              name="pushPinFilled"
              color={colors.blue_400}
              width={UI_SIZE_14}
              height={UI_SIZE_14}
            />
          </View>
          <View style={styles.textContainer} pointerEvents="none">
            {isDisplay ? (
              <TextMessageDisplay
                messageId={id}
                text={preview}
                sender={sender}
                styledFragments={styledFragments}
                textStyle={styles.message}
                forPreview
              />
            ) : (
              <MarkdownPreview
                text={text}
                numberOfLines={1}
                ellipsizeMode="tail"
                style={styles.message}
              />
            )}
          </View>
        </Pressable>
      </BlurView>
    </View>
  )
}

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    container: {
      ...s.fullWidth,
      ...s.absolute,
      top: UI_SIZE_8, // equivalent to this line of code /src/screen/RoomScreen/RoomScreen.tsx#L157
      zIndex: 1,
    },
    count: {
      ...theme.text.title,
      color: theme.color.blue_400,
      fontSize: UI_SIZE_14,
      marginRight: UI_SIZE_4,
    },
    icon: {
      alignItems: 'center',
      backgroundColor: theme.color.blue_950,
      borderRadius: UI_SIZE_48,
      flexDirection: 'row',
      justifyContent: 'center',
      padding: theme.spacing.normal,
    },
    insideContainer: {
      alignItems: 'center',
      backgroundColor: colorWithAlpha(theme.color.grey_900, 0.75),
      flexDirection: 'row',
      paddingBottom: theme.spacing.normal,
      paddingHorizontal: theme.spacing.standard,
      paddingTop: UI_SIZE_4,
    },
    message: {
      ...theme.text.body,
      fontSize: UI_SIZE_14,
    },
    textContainer: {
      flex: 1,
      marginHorizontal: theme.spacing.normal,
    },
  })
  return styles
})
