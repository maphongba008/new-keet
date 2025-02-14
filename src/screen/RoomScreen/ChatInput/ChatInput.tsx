// desktop equivalent https://github.com/holepunchto/keet-desktop/blob/main/src/components/chat/chat-input.js
import {
  lazy,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import {
  NativeSyntheticEvent,
  Pressable,
  StyleSheet,
  Text,
  TextInputSelectionChangeEventData,
  TouchableOpacity,
  View,
} from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import { isDevice } from 'expo-device'
import isEqual from 'react-fast-compare'
import Reanimated, {
  clamp,
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated'
import PasteInput, {
  PastedFile,
  PasteInputRef,
} from '@mattermost/react-native-paste-input'
import _debounce from 'lodash/debounce'
import _isEmpty from 'lodash/isEmpty'
import _noop from 'lodash/noop'

import { emojify } from '@holepunchto/emojis'
import { getCoreBackend } from '@holepunchto/keet-store/backend'
import { getAppCurrentRoomId } from '@holepunchto/keet-store/store/app'
import {
  getChatMessageById,
  getEditingMessageId,
  makeMentionUrl,
} from '@holepunchto/keet-store/store/chat'
import { parseMemberResponse } from '@holepunchto/keet-store/store/member'
import { getNetworkOnline } from '@holepunchto/keet-store/store/network'

import {
  getVMAudioSamples,
  getVMDuration,
  getVMIsLocked,
  getVMIsStopped,
  getVMShowAudioPlayer,
  getVMUri,
  setChatBarHeight,
  setVoiceMessageState,
} from 'reducers/application'

import { showBottomSheet } from 'component/AppBottomSheet/AppBottomSheet.Store'
import BottomSheetEnum from 'component/AppBottomSheet/SheetComponents/BottomSheetEnum'
import { EmojiData } from 'component/AppBottomSheet/SheetComponents/ChatEventOptionsSheet/components/EmojiSheet'
import { IconButton } from 'component/Button'
import SvgIcon from 'component/SvgIcon'
import {
  colors,
  createThemedStylesheet,
  getTheme,
  useReanimatedLayoutAnimation,
  useTheme,
} from 'component/theme'
import { removeMediaPreviewFileEntry } from 'screen/MediaPreviewScreen'
import { useReplyMessageData } from 'screen/RoomScreen/hooks/useReplyMessageItem'
import { APPIUM_IDs, appiumTestProps } from 'lib/appium'
import s, {
  DIRECTION_CODE,
  ICON_SIZE_14,
  ICON_SIZE_16,
  ICON_SIZE_24,
  TRANSPARENT,
  UI_SIZE_4,
  UI_SIZE_8,
  UI_SIZE_12,
  UI_SIZE_24,
  UI_SIZE_32,
  UI_SIZE_42,
} from 'lib/commonStyles'
import {
  BACK_DEBOUNCE_DELAY,
  BACK_DEBOUNCE_OPTIONS,
  INPUT_DEBOUNCE_OPTIONS,
  INPUT_DEBOUNCE_WAIT_TIME,
} from 'lib/constants'
import { consoleError } from 'lib/errors'
import { getFileName } from 'lib/fs'
import { withSuspense } from 'lib/hoc/withSuspense'
import { useTimeout } from 'lib/hooks'
import { useDeepEqualSelector } from 'lib/hooks/useDeepEqualSelector'
import useStateDeepEqual from 'lib/hooks/useStateDeepEqual'
import { showErrorNotifier } from 'lib/hud'
import { getMimeType } from 'lib/KeetVideoUtilsModule'
import { useKeyboardHeight } from 'lib/keyboard'
import {
  emojifyHandleCustomEmoji,
  EmptyListItemRegex,
  escapeRegExp,
  MAX_EMPTY_LIST_ITEMS_ALLOWED,
  OrderedListRegExp,
  stripMentions,
} from 'lib/md'
import { fetchLinkPreviews, pickAndSendImageOrVideo } from 'lib/media'
import { pasteImageFromClipboard } from 'lib/media/pasteImageFromClipboard'
import { isIOS } from 'lib/platform'
import { parseRemoteUrls } from 'lib/previewLink'
import { SOUND_SEND_MSG, usePlaySound } from 'lib/sound'
import { getState } from 'lib/store'
import { OnLayoutEvent, SearchProfile, SearchProfileObj } from 'lib/types'
import {
  allowMoreUploads,
  clear,
  del as deleteUpload,
  getAllUploads,
  LinkPreviewObjectType,
  addUploadFile as onSendFiles,
  startUploading,
  useRoomUploads,
} from 'lib/uploads'
import { wait } from 'lib/wait'

import { useStrings } from 'i18n/strings'

import { useAndroidTextInputIndicator } from './AndroidTextInputIndicator'
import AudioRecorderMicrophoneIcon, { X_THRESHOLD } from './AudioRecorderIcon'
import { CHAT_INPUT_FILE_GROUP_ID } from './ChatInputAttachment'
import { useAutoSaveDraft, useRestoreDraftOnLoad } from './hooks/useDraft'
import useOnSendText from './hooks/useOnSendText'
import { usePreFetchSearchProfiles } from './hooks/usePreFetchSearchProfiles'
import { usePreviewManager } from './hooks/usePreviewManager'
import { useShowFileOptionSheet } from './hooks/useShowFileOptionSheet'
import MentionsAutocomplete from './MentionAutoComplete'
import { ChatEventReply } from '../ChatEvent/ChatEventReply'
import { dismissEditMsgMode, dismissReplyMsgMode } from '../ChatEventActions'

const AudioPlayerWaveform = withSuspense(
  lazy(() => import('./AudioPlayerWaveform')),
)
const ChatInputAttachmentsPreview = withSuspense(
  lazy(() => import('./ChatInputAttachmentsPreview')),
)

type RecorderRef = {
  stopRecording: Function
  recording: {
    startAsync: Function
  }
}

export const ChatInput = memo(() => {
  const styles = getStyles()
  const strings = useStrings()
  const theme = useTheme()
  const isNetworkOnline = useSelector(getNetworkOnline)

  const editingMessageId = useSelector(getEditingMessageId)
  const roomId = useSelector(getAppCurrentRoomId)
  const { onSendText } = useOnSendText()
  const dispatch = useDispatch()
  const onChatBarLayout = useCallback(
    (e: OnLayoutEvent) => {
      dispatch(setChatBarHeight(e.nativeEvent.layout.height))
    },
    [dispatch],
  )
  const keyboardHeight = useKeyboardHeight()
  const editingMessageOriginText = useSelector(
    (state) => getChatMessageById(state, editingMessageId)?.chat?.text ?? '',
  )

  // =============
  // Reply Message
  // =============
  const {
    replyMessageText,
    replyMessageFile,
    replyMessageMemberName,
    replyMessageId = undefined,
    isDisplay,
    styledFragments,
  } = useReplyMessageData()

  // =============
  // Voice Message
  // =============
  const uri = useSelector(getVMUri)
  const audioSamples = useDeepEqualSelector(getVMAudioSamples) || []
  const audioAttachmentValue = useSelector(getVMIsStopped)
  const isLocked = useSelector(getVMIsLocked)
  const audioAttachmentDuration = useSelector(getVMDuration)
  const showAudioPlayer = useSelector(getVMShowAudioPlayer)

  const [searchProfileObj, setSearchProfileObj] =
    useStateDeepEqual<SearchProfileObj>({})
  const [focused, setFocused] = useState(false)
  const [showAutocomplete, setShowAutocomplete] = useStateDeepEqual(false)
  const [currentMentionProfiles, setCurrentMentionProfiles] = useStateDeepEqual<
    any[]
  >([])
  const [text, setText] = useState('')
  const [previewLinks, setPreviewLinks] =
    useState<LinkPreviewObjectType | null>(null)
  const [selection, setSelection] = useStateDeepEqual({ start: -1, end: -1 })
  const urlsRef = useRef(new Set<string>())
  const textRef = useRef<string>(text)
  const inputRef = useRef<PasteInputRef>(null)
  const recorderRef = useRef<RecorderRef>()

  const endUserSelectionIndex = useRef<number>(-1)
  const swipeX = useSharedValue(0)
  const opacity = useSharedValue(1)
  const { setPreviewFiles } = usePreviewManager(text)

  // =============
  // Share Content
  // =============
  usePreFetchSearchProfiles(roomId, setSearchProfileObj)
  useRestoreDraftOnLoad(roomId, inputRef, setText, setSelection, onSendFiles)
  useAutoSaveDraft(roomId, text, editingMessageId)

  const onPaste = useCallback(
    async (error: string | null | undefined, files: Array<PastedFile>) => {
      if (error) {
        consoleError(error)
        return
      }

      try {
        await pasteImageFromClipboard(roomId, files, onSendFiles)
      } catch (err) {
        const _error = err as Error
        showErrorNotifier(_error.message)
      }
    },
    [roomId],
  )

  const bounds = useCallback(() => {
    const start = text.slice(0, selection.start).lastIndexOf('@')
    const end = selection.end
    return { start, end }
  }, [selection.end, selection.start, text])

  const onSelectMentionProfile = useCallback(
    (name: string) => {
      const { start, end } = bounds()
      const caret = start + name.length + 2 // @ symbol & space
      setSelection({ start: caret, end: caret })

      const newText = `${text.slice(0, start)}@${name} ${text.slice(end)}`
      setText(newText)
      endUserSelectionIndex.current = caret
      setShowAutocomplete(false)
    },
    [bounds, setSelection, text, setShowAutocomplete],
  )

  const inputFocusWithDelay = useTimeout(() => inputRef.current?.focus(), 1000)

  const onSelectEmoji = useCallback(
    (emoji: EmojiData) => {
      const { start, end } = selection
      let caret, newText
      if (emoji.url) {
        caret = start + emoji.shortCodes[0].length + 3 //  :: space
        newText = `${text.slice(0, start)}:${emoji.shortCodes[0]}:${text.slice(
          end,
        )}`
      } else {
        caret = start + emoji.emoji.length + 1 // emoji space
        newText = `${text.slice(0, start)}${emoji.emoji}${text.slice(end)}`
      }
      setSelection({ start: caret, end: caret })
      setText(newText)
      if (!isDevice) {
        // iOS simulator without keyboard has this issue
        // https://github.com/gorhom/react-native-bottom-sheet/issues/1583
        inputFocusWithDelay()
      } else {
        inputRef.current?.focus()
      }
    },
    [selection, setSelection, text, inputFocusWithDelay],
  )
  const onPressAddEmoji = useCallback(() => {
    showBottomSheet({
      bottomSheetType: BottomSheetEnum.ChatEventOptionsSheet,
      options: [],
      bottomSheetIsTransparent: false,
      onSelectEmoji,
      isSkipToEmojiSheet: true,
    })
  }, [onSelectEmoji])

  const transformMentions = useCallback(
    (_text: string) => {
      const record: Record<string, string> = {}
      const pattern = Object.values<SearchProfile>(searchProfileObj)
        .map((p: SearchProfile) => {
          const mention = `@${p.displayName}`
          record[mention] = p.memberId
          return escapeRegExp(mention)
        })
        .sort((a, b) => b.length - a.length)
        .join('|')

      if (!pattern) {
        return _text
      }

      const regexp = new RegExp(pattern, 'g')

      return _text.replace(regexp, (match) => {
        const memberId = record[match]
        return memberId ? `[${match}](${makeMentionUrl(memberId)})` : match
      })
    },
    [searchProfileObj],
  )

  const dismiss = useCallback(() => {
    setCurrentMentionProfiles([])
    setShowAutocomplete(false)
  }, [setCurrentMentionProfiles, setShowAutocomplete])

  const checkKeyword = useRef<string>()
  const checkIfMentioning = async () => {
    const { start, end } = bounds()
    if (start < 0 || end === endUserSelectionIndex.current) return dismiss()
    const keyword = text.slice(start + 1, end)
    checkKeyword.current = keyword

    const profiles: SearchProfile[] = (
      await getCoreBackend().getSearchMembers(roomId, keyword, {
        limit: 10,
      })
    )?.map((item: any) => parseMemberResponse(item))
    if (checkKeyword.current !== keyword) return
    if (!profiles?.length) return dismiss()
    const profileObj = profiles.reduce(
      (obj: SearchProfileObj, item: SearchProfile) =>
        Object.assign(obj, { [item.memberId]: item }),
      {},
    )
    setSearchProfileObj({ ...searchProfileObj, ...profileObj })
    setCurrentMentionProfiles(profiles)
    setShowAutocomplete(true)
  }

  useEffect(() => {
    checkIfMentioning()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selection.start, selection.end, text])

  const onPickImagesFromGallery = useCallback(async () => {
    try {
      return await pickAndSendImageOrVideo({
        roomId,
        onSendFiles,
      })
    } catch (err) {
      const error = err as Error
      showErrorNotifier(error.message)
    }
  }, [roomId])

  const showFileOptionSheet = useShowFileOptionSheet(
    roomId,
    onSendFiles,
    onPickImagesFromGallery,
  )

  const showFileOptionSheetWithDelay = useTimeout(
    showFileOptionSheet,
    getTheme().animation.ms,
  )

  const handleAttachMedia = useCallback(() => {
    inputRef.current?.blur()
    showFileOptionSheetWithDelay()
  }, [showFileOptionSheetWithDelay])

  // =============
  // Edit functions
  // =============

  /// When edit mode is toggled ON
  useEffect(() => {
    if (!_isEmpty(editingMessageId)) {
      inputRef.current?.focus()
      setText(
        emojify(
          stripMentions(editingMessageOriginText),
          emojifyHandleCustomEmoji,
        ),
      )
      setSelection({
        start: editingMessageOriginText.length,
        end: editingMessageOriginText.length,
      })
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingMessageId])

  /// When reply mode is toggled ON
  useEffect(() => {
    if (!_isEmpty(replyMessageId)) {
      inputRef.current?.focus()
    }
  }, [replyMessageId])

  /// Dismiss edit mode on press back
  useEffect(() => {
    return () => {
      dismissEditMsgMode(dispatch)
      dismissReplyMsgMode(dispatch)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const clearEditing = useCallback(() => {
    dismissEditMsgMode(dispatch)
    setText('')
    setPreviewLinks(null)
  }, [dispatch])

  const clearReply = useCallback(() => {
    dismissReplyMsgMode(dispatch)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, replyMessageId])

  const attachAudioFile = useCallback(() => {
    if (!uri) return
    getMimeType(uri, (type) => {
      if (!type) return
      const fileName = getFileName(uri)
      onSendFiles({ uri, type, name: fileName, byteLength: 0 })
    })
  }, [uri])

  const fileUploads = useRoomUploads(roomId)
  const fileUploadsReady = fileUploads.every((file) => !file.isDownloading)

  const handleReset = useCallback(
    async ({ clearFile = false } = {}) => {
      if (recorderRef.current?.recording) {
        await recorderRef.current?.stopRecording({ forceStop: true })
        await wait(50)
      }
      if (fileUploads.length > 0 && clearFile) {
        clear()
        removeMediaPreviewFileEntry({ groupId: CHAT_INPUT_FILE_GROUP_ID })
      }
      dispatch(
        setVoiceMessageState({
          duration: undefined,
          isStopped: false,
          isLocked: false,
          audioSamples: [],
          uri: '',
        }),
      )
    },
    [dispatch, fileUploads.length],
  )

  const processOrderedList = useCallback(
    (nextText: string, prevText: string) => {
      let listIndex = 0
      let emptyListItemCount = 0
      let listMode = false
      let isDeleting = prevText.length > nextText.length

      if (!nextText.endsWith('\n')) {
        return nextText
      }

      nextText = nextText
        .split('\n')
        .map((line, index, lines) => {
          const previousLine = lines[index - 1] || ''

          // Check if the previous line is an empty list item
          if (EmptyListItemRegex.test(previousLine)) {
            emptyListItemCount++
            if (emptyListItemCount >= MAX_EMPTY_LIST_ITEMS_ALLOWED) {
              // If two consecutive blank list items are detected, exit list mode
              listMode = false
              listIndex = 0
              return line
            }
          } else {
            // Reset the count if the current line is not empty
            emptyListItemCount = 0
          }

          if (OrderedListRegExp.test(line)) {
            listMode = true

            const firstListItem = line.replace(
              OrderedListRegExp,
              (_, listNumber, _rest) => {
                listIndex = Number(listNumber) // Update listIndex based on the current list item number
                return ` ${listIndex}. ${_rest}` // Keep the current item with the correct number
              },
            )

            return firstListItem
          }

          // Return any non-list text as it is
          return line
        })
        .join('\n')

      // Automatically add the next list item if needed and there's only one empty list item
      if (
        !isDeleting &&
        nextText.endsWith('\n') &&
        listMode &&
        emptyListItemCount < MAX_EMPTY_LIST_ITEMS_ALLOWED
      ) {
        listIndex++
        nextText += ` ${listIndex}. `

        // this fixes caret position for android on the remaining list items
        setSelection({ start: nextText.length, end: nextText.length })
      }

      return nextText
    },
    [setSelection],
  )

  useEffect(() => {
    if (showAudioPlayer) {
      attachAudioFile()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showAudioPlayer])

  const clearVoiceAttachment = useCallback(() => {
    const _fileUploads = getAllUploads(roomId)
    const _showAudioPlayer = getVMShowAudioPlayer(getState())
    if (_showAudioPlayer && _fileUploads.length > 0) {
      handleReset()
      clear()
    }
  }, [roomId, handleReset])

  useEffect(() => {
    return () => clearVoiceAttachment()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // handleSend useCallback dependency array changes when called resulting in _debounce not working as expected
  // wrap around useRef progress to avoid extra calls
  const isChatSendInProgress = useRef(false)

  const playSound = usePlaySound()

  const handleChatSentWithDelay = useTimeout(() => {
    setText('')
    setPreviewLinks(null)
    dismissReplyMsgMode(dispatch)
    isChatSendInProgress.current = false
  }, 50)

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleSend = useCallback(
    _debounce(
      () => {
        const hasChatContent = Boolean(text || fileUploads?.length)
        if (isChatSendInProgress.current || !hasChatContent) {
          return
        }
        const formattedText = transformMentions(text)
        isChatSendInProgress.current = true
        if (
          !_isEmpty(editingMessageId) &&
          editingMessageOriginText === formattedText
        ) {
          clearEditing()
          isChatSendInProgress.current = false
          return
        }
        const attachmentFileIds = fileUploads.filter(
          (upload) => !upload.isLinkPreview,
        )

        const fileIds = attachmentFileIds.map((upload) => upload.id)
        onSendText(formattedText, fileIds, previewLinks || {}, replyMessageId)
        setPreviewLinks(null)
        playSound(SOUND_SEND_MSG)
        startUploading(fileIds)
        handleChatSentWithDelay()
        if (audioAttachmentValue) {
          handleReset()
        }
      },

      BACK_DEBOUNCE_DELAY,
      BACK_DEBOUNCE_OPTIONS,
    ),
    [
      clearEditing,
      editingMessageId,
      editingMessageOriginText,
      fileUploads,
      handleReset,
      onSendText,
      previewLinks,
      audioAttachmentValue,
      text,
      transformMentions,
      handleChatSentWithDelay,
      replyMessageId,
    ],
  )

  const { inputProps, ScrollIndicator } = useAndroidTextInputIndicator()

  const { layout } = useReanimatedLayoutAnimation()
  const isUpload = fileUploads.length > 0
  const isEnabled = (Boolean(text) || isUpload) && fileUploadsReady
  const showAudioRecordButton =
    !audioAttachmentValue && !isUpload && !text && !replyMessageId
  const showClearEditingMessageButton =
    !_isEmpty(editingMessageId) && !audioSamples.length
  const showAttachMediaButton =
    _isEmpty(editingMessageId) &&
    !audioSamples.length &&
    allowMoreUploads(roomId)
  const showSendButton =
    !showAudioRecordButton && !showClearEditingMessageButton
  const showReplyMessage = !!replyMessageId
  const showEmojiButton = !audioSamples.length && !audioAttachmentDuration

  const SendButton = useCallback(
    () => (
      <IconButton
        enabled={isEnabled}
        hint={strings.chat.sendHint}
        style={[styles.icon, s.alignSelfEnd]}
        onPress={handleSend}
        testID={APPIUM_IDs.room_btn_send}
      >
        <SvgIcon
          name="paperPlane"
          width={ICON_SIZE_24}
          height={ICON_SIZE_24}
          color={
            isEnabled || audioSamples.length
              ? theme.color.blue_400
              : theme.color.grey_200
          }
        />
      </IconButton>
    ),
    [
      audioSamples.length,
      handleSend,
      isEnabled,
      strings.chat.sendHint,
      styles.icon,
      theme.color.grey_200,
      theme.color.blue_400,
    ],
  )

  const onFocus = useCallback(() => {
    setFocused(true)
  }, [])
  const onBlur = useCallback(() => {
    setFocused(false)
  }, [])
  const onSelectionChange = useCallback(
    (e: NativeSyntheticEvent<TextInputSelectionChangeEventData>) => {
      setSelection(e.nativeEvent.selection)
    },
    [setSelection],
  )
  const handleAudioReset = useCallback(
    () => handleReset({ clearFile: true }),
    [handleReset],
  )

  const handleFocus = useCallback(() => {
    inputRef.current?.focus()
  }, [])

  const handlePromptSwipe = useCallback(
    (translateX: number, isAnimating = false) => {
      if (!isAnimating) {
        opacity.value = withSpring(1)
        swipeX.value = withSpring(0)
        return
      }
      swipeX.value = clamp(translateX, X_THRESHOLD, 0)
    },
    [opacity, swipeX],
  )

  const swipeAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: swipeX.value }],
    opacity: interpolate(
      swipeX.value,
      [X_THRESHOLD, 0],
      [0, 1],
      Extrapolation.CLAMP,
    ),
  }))

  // Track the latest URL processing request to handle race conditions
  // This helps prevent duplicate previews when typing/deleting quickly
  const lastRequestIdRef = useRef(0)

  // Process URLs in text to generate link previews
  // This is debounced through processText to avoid too frequent API calls
  const processUrls = useCallback(
    async (nextText: string) => {
      if (!isNetworkOnline) return

      // Each URL processing request gets a unique ID
      // This helps us track which request is the most recent
      const currentRequestId = ++lastRequestIdRef.current

      // Extract unique URLs from the text
      const parsedUrls = [...new Set(parseRemoteUrls(nextText))]
      const urls = urlsRef.current

      // If there are no URLs in the text, clean up any existing previews
      if (parsedUrls.length === 0) {
        Array.from(urls).forEach((url) => {
          deleteUpload(url)
        })
        setPreviewLinks(null)
        urls.clear()
        return
      }

      // Remove URLs that are no longer in the text
      // This happens when user deletes a URL
      Array.from(urls).forEach((url) => {
        if (!parsedUrls.includes(url)) {
          urls.delete(url)
          deleteUpload(url)
        }
      })

      // Process any new URLs that we haven't seen before
      const newUrls = parsedUrls.filter((url) => !urls.has(url))
      if (newUrls.length > 0) {
        // Before processing, verify this is still the most recent request
        // If not, abandon it to prevent duplicate previews
        if (currentRequestId !== lastRequestIdRef.current) {
          return // Abandon this request as it's outdated
        }

        // Add new URLs to our tracking Set
        newUrls.forEach((url) => urls.add(url))

        // Fetch preview data for new URLs
        // This is an async operation that could take some time
        const { linkPreviews, fileNames } = await fetchLinkPreviews(newUrls)

        // After the async operation, check again if this request is still valid
        // The user might have typed/deleted while we were fetching
        if (currentRequestId !== lastRequestIdRef.current) {
          // Clean up URLs we added if the request is no longer valid
          newUrls.forEach((url) => urls.delete(url))
          return
        }

        // If we have preview data and this is still the most recent request,
        // update the UI with the new previews
        if (linkPreviews) {
          setPreviewFiles(newUrls, roomId, fileNames, linkPreviews)
          setPreviewLinks((prev) => ({ ...prev, ...linkPreviews }))
        }
      }
    },
    [isNetworkOnline, roomId, setPreviewFiles],
  )

  // Process text changes, including ordered lists and URL detection
  const processText = useCallback(
    (nextText: string) => {
      const prevText = textRef.current
      const processedText = processOrderedList(nextText, prevText)
      setText(processedText)
      textRef.current = processedText

      if (nextText) {
        // Cancel any pending URL processing by incrementing the request ID
        // This ensures only the most recent request will complete
        lastRequestIdRef.current++
        processUrls(nextText)
      }
    },
    [processUrls, processOrderedList],
  )

  // Debounce text processing to avoid too frequent updates
  // This helps with performance and reduces API calls
  const debouncedProcessText = useMemo(
    () =>
      _debounce(processText, INPUT_DEBOUNCE_WAIT_TIME, INPUT_DEBOUNCE_OPTIONS),
    [processText],
  )

  // Process text changes with debouncing
  useEffect(() => {
    debouncedProcessText(text)
    // Clean up debounced function on unmount
    return () => {
      debouncedProcessText.cancel()
    }
  }, [debouncedProcessText, text])

  return (
    <Reanimated.View style={styles.root}>
      {showAutocomplete && focused && (
        <MentionsAutocomplete
          onSelectMentionProfile={onSelectMentionProfile}
          profiles={currentMentionProfiles}
        />
      )}
      <View onLayout={onChatBarLayout}>
        <View
          style={[
            focused || audioSamples.length
              ? [styles.bar, styles.barFocused]
              : styles.bar,
            s.column,
          ]}
        >
          {showReplyMessage && (
            <ChatEventReply
              memberName={replyMessageMemberName}
              replyingToId={replyMessageId}
              replyingToText={replyMessageText ?? ''}
              replyingToFile={replyMessageFile}
              isDisplay={isDisplay}
              styledFragments={styledFragments}
              isActiveReply
              dismissReplyMsgMode={clearReply}
            />
          )}
          {audioAttachmentDuration && <AudioPlayerWaveform />}
          <View
            style={[
              s.row,
              s.alignItemsCenter,
              audioAttachmentDuration && styles.actionContainer,
            ]}
          >
            {showAttachMediaButton && (
              <IconButton
                hint={strings.chat.attachHint}
                onPress={handleAttachMedia}
                style={[styles.iconBordered, styles.attach]}
                {...appiumTestProps(APPIUM_IDs.room_btn_attach)}
              >
                <SvgIcon
                  name="plus"
                  width={ICON_SIZE_24}
                  height={ICON_SIZE_24}
                  color={theme.color.grey_200}
                />
              </IconButton>
            )}
            {audioSamples.length > 0 && (
              <Reanimated.View
                style={[
                  s.row,
                  audioAttachmentValue ? s.container : {},
                  s.flexSpaceBetween,
                ]}
              >
                <TouchableOpacity
                  style={[s.centeredLayout, styles.icon]}
                  onPress={handleAudioReset}
                >
                  <SvgIcon
                    name="trash"
                    width={ICON_SIZE_24}
                    height={ICON_SIZE_24}
                    color={theme.color.danger}
                  />
                </TouchableOpacity>
                {!audioAttachmentValue && !isLocked && (
                  <View style={styles.swipeTextContainer}>
                    <Reanimated.View
                      style={[s.row, s.alignItemsCenter, swipeAnimatedStyle]}
                    >
                      <SvgIcon
                        name="chevronLeft"
                        width={ICON_SIZE_14}
                        height={ICON_SIZE_14}
                        color={colors.white_snow}
                      />
                      <Text style={styles.swipeText}>
                        {strings.chat.swipeToCancel}
                      </Text>
                    </Reanimated.View>
                  </View>
                )}
              </Reanimated.View>
            )}

            <Reanimated.View style={!uri && s.container} layout={layout}>
              <Pressable onPress={handleFocus}>
                <View>
                  <PasteInput
                    ref={inputRef}
                    onFocus={onFocus}
                    onBlur={onBlur}
                    disableCopyPaste={false}
                    onPaste={onPaste}
                    {...inputProps}
                    multiline
                    style={[
                      styles.input,
                      audioAttachmentDuration && styles.inputTransparent,
                    ]}
                    value={text}
                    onChangeText={audioAttachmentDuration ? _noop : setText}
                    selection={isIOS ? undefined : selection}
                    onSelectionChange={onSelectionChange}
                    editable={
                      keyboardHeight === 0 && audioAttachmentDuration
                        ? false
                        : true
                    }
                    {...appiumTestProps(APPIUM_IDs.room_input_msg)}
                  />
                  {ScrollIndicator}
                </View>
                {!showAudioPlayer && (
                  <ChatInputAttachmentsPreview roomId={roomId} />
                )}
              </Pressable>
            </Reanimated.View>

            {showEmojiButton && (
              <IconButton
                enabled={isEnabled}
                hint={strings.chat.pickAnEmoji}
                style={[s.alignSelfEnd, styles.icon]}
                onPress={onPressAddEmoji}
              >
                <SvgIcon
                  name="emoji"
                  width={ICON_SIZE_24}
                  height={ICON_SIZE_24}
                  color={theme.color.grey_200}
                />
              </IconButton>
            )}
            {showAudioRecordButton && (
              <AudioRecorderMicrophoneIcon
                ref={recorderRef}
                resetRecording={handleReset}
                onEventSwipe={handlePromptSwipe}
                style={styles.icon}
              />
            )}
            {showClearEditingMessageButton && (
              <View style={styles.editIconWrapper}>
                <IconButton
                  enabled={isEnabled}
                  hint={strings.chat.sendHint}
                  style={styles.editIconCancel}
                  onPress={clearEditing}
                >
                  <SvgIcon
                    name="xThick"
                    width={ICON_SIZE_16}
                    height={ICON_SIZE_16}
                    color={colors.white_snow}
                  />
                </IconButton>
                <IconButton
                  enabled={isEnabled}
                  hint={strings.chat.sendHint}
                  style={styles.editIconAccept}
                  onPress={handleSend}
                >
                  <SvgIcon
                    name="checkFat"
                    width={ICON_SIZE_16}
                    height={ICON_SIZE_16}
                    color={colors.white_snow}
                  />
                </IconButton>
              </View>
            )}
            {showSendButton && <SendButton />}
          </View>
        </View>
      </View>
    </Reanimated.View>
  )
}, isEqual)

const getStyles = createThemedStylesheet((theme) => {
  const padding = theme.spacing.standard / 2
  const styles = StyleSheet.create({
    actionContainer: {
      paddingVertical: UI_SIZE_4,
    },
    attach: {
      backgroundColor: theme.color.grey_500,
    },
    bar: {
      ...s.flex,
      ...s.centerAlignedRow,
      ...s.justifyStart,
      backgroundColor: theme.color.grey_600,
      borderColor: theme.color.blue_950,
      borderRadius: UI_SIZE_24,
      borderWidth: theme.border.width,
      padding: UI_SIZE_4,
    },
    barFocused: {
      borderColor: theme.color.blue_400,
    },
    editIconAccept: {
      backgroundColor: colors.keet_blue_1,
      borderRadius: UI_SIZE_32,
      ...s.alignSelfEnd,
    },
    editIconCancel: {
      backgroundColor: theme.color.red_400,
      borderRadius: UI_SIZE_32,
      ...s.alignSelfEnd,
    },
    editIconWrapper: {
      ...s.centerAlignedRow,
      gap: UI_SIZE_12,
      paddingHorizontal: UI_SIZE_8,
    },
    editorScrollView: {
      maxHeight: 130,
    },
    icon: {
      ...s.centeredLayout,
      height: UI_SIZE_42,
      width: UI_SIZE_42,
    },
    iconBordered: {
      ...s.centeredLayout,
      borderRadius: UI_SIZE_32,
      height: UI_SIZE_42,
      width: UI_SIZE_42,
    },
    input: {
      ...theme.text.body,
      margin: 0,
      marginLeft: padding,
      maxHeight: isIOS ? 136 : 145,
      padding: 0,
      ...s.bidirectionalInput,
    },
    inputTransparent: {
      color: TRANSPARENT,
      opacity: 0,
    },
    root: {
      paddingHorizontal: padding,
    },
    swipeText: {
      color: colors.white_snow,
      writingDirection: DIRECTION_CODE,
    },
    swipeTextContainer: {
      ...s.justifyCenter,
      alignItems: 'flex-end',
      width: '72%',
    },
  })
  return styles
})
