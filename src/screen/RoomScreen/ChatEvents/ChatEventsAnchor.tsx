// desktop equivalent https://github.com/holepunchto/keet-desktop/blob/main/src/components/chat/chat-events/scroll-down-to-unread-msg.jsx
import React, { memo } from 'react'
import { StyleSheet, Text } from 'react-native'
import { useSelector } from 'react-redux'
import Animated from 'react-native-reanimated'

import {
  getChatMessageInitialCache,
  getChatMessageUnreadCount,
} from '@holepunchto/keet-store/store/chat'

import {
  getIsHistoryMode,
  getIsLoadingLatestMsgSeq,
} from 'reducers/application'

import { ButtonBase } from 'component/Button'
import { Loading } from 'component/Loading'
import SvgIcon from 'component/SvgIcon'
import {
  createThemedStylesheet,
  getTheme,
  useReanimatedLayoutAnimation,
} from 'component/theme'
import s, {
  UI_SIZE_4,
  UI_SIZE_6,
  UI_SIZE_8,
  UI_SIZE_12,
  UI_SIZE_16,
  UI_SIZE_20,
  UI_SIZE_48,
} from 'lib/commonStyles'
import { useVisibleDelay } from 'lib/hooks'

import { useStrings } from 'i18n/strings'

import useScrollToLatestMsg from '../hooks/useScrollToLatestMsg'

const DELAY_IN_SHOWING = 1000

export const ChatEventsAnchor = memo(() => {
  const styles = getStyles()
  const theme = getTheme()
  const strings = useStrings()
  const unreadCount = useSelector(getChatMessageUnreadCount)
  const isHistoryMode = useSelector(getIsHistoryMode)
  const { scrollToEndMightQuery } = useScrollToLatestMsg()
  const isLoadingLatestMsgSeq = useSelector(getIsLoadingLatestMsgSeq)
  const { entering } = useReanimatedLayoutAnimation(false)

  const initialCache = useSelector((state) => getChatMessageInitialCache(state))
  const isVisible = useVisibleDelay(DELAY_IN_SHOWING, !initialCache)
  if (!isVisible) return null

  const showArrow = isHistoryMode && !unreadCount
  const showArrowWithUnreadOrLoading =
    isHistoryMode && (!!unreadCount || !!isLoadingLatestMsgSeq)
  return (
    <>
      {showArrow && (
        <Animated.View entering={entering} style={styles.jumpBottomWrapper}>
          <ButtonBase
            onPress={scrollToEndMightQuery}
            style={styles.floatButton}
          >
            <SvgIcon
              color={theme.color.blue_400}
              name="arrowDown"
              width={UI_SIZE_20}
              height={UI_SIZE_20}
            />
          </ButtonBase>
        </Animated.View>
      )}

      {showArrowWithUnreadOrLoading && (
        <Animated.View entering={entering} style={styles.unreadWrapper}>
          <ButtonBase
            onPress={scrollToEndMightQuery}
            style={styles.floatButtonWithText}
          >
            {!!unreadCount && (
              <Text style={styles.scrollDownText}>
                {unreadCount === 1
                  ? strings.chat.newMessage
                  : strings.chat.newMessages.replace('$1', String(unreadCount))}
              </Text>
            )}
            {isLoadingLatestMsgSeq ? (
              <Loading style={{ width: UI_SIZE_20, height: UI_SIZE_20 }} />
            ) : (
              <SvgIcon
                color={theme.color.blue_400}
                name="arrowDown"
                width={UI_SIZE_20}
                height={UI_SIZE_20}
              />
            )}
          </ButtonBase>
        </Animated.View>
      )}
    </>
  )
})

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    floatButton: {
      alignItems: 'center',
      height: UI_SIZE_48,
      justifyContent: 'center',
      width: UI_SIZE_48,
    },
    floatButtonWithText: {
      alignItems: 'center',
      backgroundColor: theme.color.grey_600,
      borderColor: theme.color.grey_500,
      borderRadius: 30,
      borderWidth: 1,
      flexDirection: 'row',
      height: UI_SIZE_48,
      justifyContent: 'center',
      padding: UI_SIZE_12,
    },
    jumpBottomWrapper: {
      bottom: UI_SIZE_12,
      position: 'absolute',
      right: UI_SIZE_16,
    },
    loadingContainer: {
      ...s.fullHeight,
      ...s.fullWidth,
      position: 'absolute',
    },
    scrollDownText: {
      ...theme.text.bodySemiBold,
      color: theme.color.blue_400,
      marginBottom: -UI_SIZE_6,
      marginRight: UI_SIZE_8,
      marginTop: -UI_SIZE_4,
    },
    unreadWrapper: {
      bottom: UI_SIZE_12,
      position: 'absolute',
      right: UI_SIZE_16,
    },
  })
  return styles
})
