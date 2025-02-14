import { useCallback, useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import * as Clipboard from 'expo-clipboard'
import _compact from 'lodash/compact'

// @ts-ignore
import { getCoreBackend } from '@holepunchto/keet-store/backend'
import {
  ANNOUNCEMENT_EVENT_TYPES,
  // @ts-ignore
  makeGetPinnedChatMessageById,
  // @ts-ignore
  toggleMessagePinnedStatusCmd,
} from '@holepunchto/keet-store/store/chat'
import { getFileId } from '@holepunchto/keet-store/store/media/file'
import {
  createRoomInvitation,
  getInvitationMessageId,
  getRoomInvitation,
  setRoomInvitation,
} from '@holepunchto/keet-store/store/room'

import { copyEventAction } from 'sagas/eventLongPressSaga'

import { showBottomSheet } from 'component/AppBottomSheet/AppBottomSheet.Store'
import BottomSheetEnum from 'component/AppBottomSheet/SheetComponents/BottomSheetEnum'
import { EmojiData } from 'component/AppBottomSheet/SheetComponents/ChatEventOptionsSheet/components/EmojiSheet'
import { OptionSheetOption } from 'component/AppBottomSheet/SheetComponents/components/OptionsButtonList'
import {
  ActionType,
  MessageOptionsSheetInterface,
} from 'component/AppBottomSheet/SheetComponents/MessageOptionSheet'
import { useTheme, waitForAnimations } from 'component/theme'
import { useUpdateClearedFile } from 'screen/RoomScreen/hooks/useUpdateClearedFile'
import { APPIUM_IDs, appiumTestProps } from 'lib/appium'
import { SHOW_MESSAGE_COPY_LINK } from 'lib/build.constants'
import { BOTTOM_SHEET_ANIMATION_DURATION } from 'lib/constants'
import { getMediaType } from 'lib/fs'
import { useTimeout } from 'lib/hooks'
import {
  getIsPinMessageEnabled,
  getRoomTypeFlags,
  useConfig,
  useMembership,
} from 'lib/hooks/useRoom'
import { showInfoNotifier } from 'lib/hud'
import { clearImage } from 'lib/KeetVideoThumbnail'
import { ChatEventFileRaw, ChatEventType } from 'lib/types'
import { isString } from 'lib/validation'

import { useStrings } from 'i18n/strings'

import { useToggleReaction } from './useReactions'
import { triggerEditMsgMode, triggerReplyMsgMode } from '../../ChatEventActions'
import { forwardMessage } from '../helpers/forwardMessage'

interface UseOnLongPressMessage {
  roomId: string
  messageId: ChatEventType['id']
  inappropriateMessage: boolean
  roomType?: string
}
export interface onLongPressType {
  // Injected in ChatFile
  src?: string
  cleared?: boolean
  // Injected in EmojiBar
  isSkipToEmojiSheet?: boolean
}

const useOnLongPressMessage = ({
  roomId,
  messageId,
  inappropriateMessage,
  roomType,
}: UseOnLongPressMessage) => {
  const theme = useTheme()
  const strings = useStrings()
  const updateClearedFile = useUpdateClearedFile()
  const isPinMessageEnabled = useSelector(getIsPinMessageEnabled(roomId))
  const { memberId, canModerate } = useMembership(roomId)
  const onPressDeleteMessage = useCallback(() => {
    showBottomSheet({
      bottomSheetType: BottomSheetEnum.ChatEventDeleteConfirmSheet,
      roomId,
      messageId,
    })
  }, [messageId, roomId])
  const onToggleReaction = useToggleReaction(messageId)
  const getIsPinned = useMemo(
    () => makeGetPinnedChatMessageById(messageId),
    [messageId],
  )
  const isPinned = useSelector(getIsPinned)
  const invitation = useSelector(getRoomInvitation)
  const { isChannel, isDm } = getRoomTypeFlags(roomType)
  const dispatch = useDispatch()

  const clearFileCache = useCallback(
    async (fileData: ChatEventType['file']) => {
      if (!fileData) return

      const { type = '', key, path, version } = fileData
      const fileId = getFileId({ driveId: key, path, version })

      updateClearedFile(fileId, true)

      const fileDetails = await getCoreBackend().getFileEntry(
        roomId,
        key,
        path,
        version,
      )
      const { isImage } = getMediaType(fileDetails.httpLink, type)
      if (isImage) {
        clearImage(fileDetails.httpLink)
      }
    },
    [roomId, updateClearedFile],
  )

  const togglePinned = useCallback(() => {
    dispatch(toggleMessagePinnedStatusCmd({ messageId }))
  }, [dispatch, messageId])

  const showBottomSheetWithDelay = useTimeout<{
    file: ChatEventFileRaw
    opts: MessageOptionsSheetInterface['opts']
    action: ActionType
  }>(({ file, opts, action }) => {
    showBottomSheet({
      bottomSheetType: BottomSheetEnum.MessageOptionsSheet,
      file,
      opts,
      action,
      bottomSheetEnablePanDownToClose: false,
      bottomSheetBackdropPressBehaviour: 'none',
    })
  }, BOTTOM_SHEET_ANIMATION_DURATION)

  const onSelectEmoji = useCallback(
    (emoji: EmojiData) => onToggleReaction(emoji.shortCodes[0]),
    [onToggleReaction],
  )

  const { title: roomTitle } = useConfig(roomId)

  useEffect(() => {
    if (!invitation) return
    if (getInvitationMessageId(invitation)) {
      const {
        messageLinkCopied,
        messageLinkCopiedTitle,
        messageLinkCopiedValidity,
      } = strings.chat

      const linkText = messageLinkCopiedTitle.replace('$0', roomTitle)
      const copyInvite = `${linkText}${invitation}${messageLinkCopiedValidity}`

      Clipboard.setStringAsync(copyInvite).then(() => {
        waitForAnimations(() => {
          showInfoNotifier(messageLinkCopied)
        })
        dispatch(setRoomInvitation(''))
      })
    }
  }, [dispatch, invitation, roomTitle, strings])

  const generateChatMessageQuery = useCallback(
    (chatMessageId: ChatEventType['id']) => {
      dispatch(
        createRoomInvitation({
          roomId,
          messageId: chatMessageId,
        }),
      )
    },
    [dispatch, roomId],
  )

  return useCallback(
    (event: ChatEventType, opts: onLongPressType) => {
      const { text } = event.chat || {}
      const { file, id } = event || {}

      const { type = '' } = file || {}
      const { src, cleared, isSkipToEmojiSheet = false } = opts || {}

      const isMe = event?.memberId === memberId
      const attachment = !!file && !!src

      const isAnnouncementEvent =
        event.event?.type &&
        ANNOUNCEMENT_EVENT_TYPES.includes(event.event?.type)
      const canEdit =
        isMe && !isAnnouncementEvent && !attachment && !inappropriateMessage
      const canDownload = attachment && !inappropriateMessage
      const canCopy = isString(text) && !inappropriateMessage
      const canCopyMessageLink =
        !isDm && !inappropriateMessage && SHOW_MESSAGE_COPY_LINK
      const canForward = (isString(text) || attachment) && !inappropriateMessage
      const canShare = attachment && !inappropriateMessage
      const canDelete = (isMe || canModerate) && !isAnnouncementEvent
      const canFlag = !isMe && !isAnnouncementEvent && !inappropriateMessage
      const canPin =
        isPinMessageEnabled &&
        canModerate &&
        isString(text) &&
        !inappropriateMessage

      const { isImage } = getMediaType(src ?? '', type)

      const isShowDeleteFile = attachment && !cleared
      const canCopyImage = attachment && isImage && !inappropriateMessage
      const canReply =
        !isAnnouncementEvent && !inappropriateMessage && !isChannel

      const options: (OptionSheetOption | false)[] = [
        canReply && {
          title: strings.chat.reply,
          icon: 'paperPlaneLight',
          onPress: () => {
            triggerReplyMsgMode(dispatch, id)
          },
          ...appiumTestProps(APPIUM_IDs.room_btn_reply),
        },
        canEdit && {
          title: strings.chat.edit,
          icon: 'pencil',
          onPress: () => {
            triggerEditMsgMode(dispatch, roomId, id)
          },
          ...appiumTestProps(APPIUM_IDs.room_btn_edit),
        },
        canDownload && {
          title: strings.downloads.save,
          icon: 'download',
          onPress: () =>
            opts.src &&
            showBottomSheet({
              bottomSheetType: BottomSheetEnum.MessageOptionsSheet,
              file,
              opts: { src: opts.src },
              action: ActionType.DOWNLOAD,
              bottomSheetEnablePanDownToClose: false,
              bottomSheetBackdropPressBehaviour: 'none',
            }),
          ...appiumTestProps(APPIUM_IDs.room_btn_download),
        },
        canPin && {
          title: isPinned ? strings.chat.unpin : strings.chat.pin,
          icon: isPinned ? 'pushPinFilled' : 'pushPin',
          onPress: togglePinned,
          ...appiumTestProps(APPIUM_IDs.room_btn_pin),
        },
        canCopy && {
          title: strings.downloads.copy,
          icon: 'copy',
          onPress: () => {
            dispatch(
              copyEventAction({
                messageId: event.id,
                roomId,
              }),
            )
          },
          ...appiumTestProps(APPIUM_IDs.room_btn_copy_msg),
        },
        canCopyMessageLink && {
          title: strings.downloads.copyLink,
          icon: 'link',
          onPress: () => {
            generateChatMessageQuery(event.id)
          },
          ...appiumTestProps(APPIUM_IDs.room_btn_copy_msg_link),
        },
        canForward && {
          title: strings.downloads.forward,
          icon: 'share',
          onPress: () => {
            forwardMessage(dispatch, event, opts)
          },
          ...appiumTestProps(APPIUM_IDs.room_btn_forward),
        },
        canCopyImage && {
          title: strings.downloads.copy,
          icon: 'copy',
          onPress: () =>
            opts.src &&
            showBottomSheetWithDelay({
              file,
              opts: { src: opts.src },
              action: ActionType.COPY_IMAGE,
            }),
          ...appiumTestProps(APPIUM_IDs.room_btn_copy_img),
        },
        canShare && {
          title: strings.downloads.share,
          icon: 'arrowUpFromBracket',
          onPress: () =>
            opts.src &&
            showBottomSheetWithDelay({
              file,
              opts: { src: opts.src },
              action: ActionType.SHARE,
            }),
          ...appiumTestProps(APPIUM_IDs.room_btn_share),
        },
        canFlag && {
          title: strings.room.report,
          icon: 'flag',
          onPress: () => {
            showBottomSheet({
              bottomSheetType:
                BottomSheetEnum.ConfirmInappropriateMessageDialog,
              messageId: id,
              memberId,
              reportedMemberId: event.memberId,
            })
          },
          ...appiumTestProps(APPIUM_IDs.room_btn_flag),
        },
        canDelete && {
          title: strings.room.delete,
          icon: 'trash',
          onPress: onPressDeleteMessage,
          ...appiumTestProps(APPIUM_IDs.room_btn_del),
        },
        isShowDeleteFile && {
          title: strings.downloads.clearCache,
          icon: 'trash',
          iconColor: theme.color.danger,
          onPress: () => {
            clearFileCache(file)
          },
          ...appiumTestProps(APPIUM_IDs.room_btn_clear),
        },
      ]

      showBottomSheet({
        bottomSheetType: BottomSheetEnum.ChatEventOptionsSheet,
        options: _compact(options),
        bottomSheetIsTransparent: false,
        onSelectEmoji,
        isSkipToEmojiSheet,
      })
    },
    [
      memberId,
      inappropriateMessage,
      canModerate,
      isPinMessageEnabled,
      isChannel,
      strings,
      isPinned,
      togglePinned,
      onPressDeleteMessage,
      theme.color.danger,
      onSelectEmoji,
      dispatch,
      roomId,
      generateChatMessageQuery,
      showBottomSheetWithDelay,
      clearFileCache,
      isDm,
    ],
  )
}
export default useOnLongPressMessage
