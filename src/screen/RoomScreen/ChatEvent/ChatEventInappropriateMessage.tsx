import React, { memo, useCallback, useEffect, useRef, useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { useSelector } from 'react-redux'
import { Image } from 'expo-image'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Tooltip from 'react-native-walkthrough-tooltip'

import { getChatLastSeenMessageSeq } from '@holepunchto/keet-store/store/chat'

import { IconButton } from 'component/Button'
import SvgIcon from 'component/SvgIcon'
import { createThemedStylesheet, useTheme } from 'component/theme'
import s, {
  DIRECTION_CODE,
  ICON_SIZE_24,
  height as screenHeight,
  TRANSPARENT,
  UI_SIZE_8,
  UI_SIZE_14,
  UI_SIZE_16,
  UI_SIZE_20,
} from 'lib/commonStyles'
import { isAndroid } from 'lib/platform'

import { useStrings } from 'i18n/strings'

export const InappropriateReportedMessage = memo(() => {
  const strings = useStrings()
  const styles = getStyles()

  return (
    <Text style={styles.inappropriateReportedMessage}>
      {strings.chat.inappropriateReported}
    </Text>
  )
})

export const InappropriateMessageBlur = memo(() => {
  const styles = getStyles()

  return (
    <Image
      source={require('../../../resources/inappropriate_message.png')}
      style={styles.inappropriateMessage}
      contentFit="contain"
      blurRadius={1}
    />
  )
})

export const InappropriateMessageNotice = memo(() => {
  const styles = getStyles()
  const theme = useTheme()
  const strings = useStrings()
  const { top: topSafeAreaInsect } = useSafeAreaInsets()

  const containerRef = useRef<View>(null)
  const [tooltipPlacement, setTooltipPlacement] = useState<
    'bottom' | 'top' | undefined
  >(undefined)

  const lastSeenSeq = useSelector(getChatLastSeenMessageSeq)

  useEffect(() => {
    // dismiss the tooltip when a new message comes
    setTooltipPlacement(undefined)
  }, [lastSeenSeq])

  const onPress = useCallback(
    () =>
      containerRef?.current?.measure((_, __, ___, ____, _____, pageY) =>
        setTooltipPlacement(pageY > screenHeight / 2 ? 'top' : 'bottom'),
      ),
    [],
  )

  const onClose = useCallback(() => {
    setTooltipPlacement(undefined)
  }, [])

  return (
    <View ref={containerRef} collapsable={false} style={s.centeredLayout}>
      <Tooltip
        isVisible={!!tooltipPlacement}
        content={
          <Text style={styles.inappropriateMessageNoticeTooltipText}>
            {strings.chat.inappropriateMessageTooltip}
          </Text>
        }
        placement={tooltipPlacement}
        onClose={onClose}
        contentStyle={styles.inappropriateMessageNoticeTooltip}
        backgroundColor={TRANSPARENT}
        parentWrapperStyle={styles.inappropriateMessageNotice}
        topAdjustment={isAndroid ? -topSafeAreaInsect : 0}
      >
        <IconButton onPress={onPress}>
          <SvgIcon
            name="circleExclamation"
            width={ICON_SIZE_24}
            height={ICON_SIZE_24}
            color={theme.color.red_400}
          />
        </IconButton>
      </Tooltip>
    </View>
  )
})

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    inappropriateMessage: {
      height: UI_SIZE_20,
      width: 168,
    },
    inappropriateMessageNotice: {
      marginHorizontal: UI_SIZE_8,
    },
    inappropriateMessageNoticeTooltip: {
      backgroundColor: theme.color.grey_500,
      borderRadius: UI_SIZE_8,
      paddingHorizontal: UI_SIZE_16,
      paddingVertical: UI_SIZE_8,
    },
    inappropriateMessageNoticeTooltipText: {
      ...theme.text.body,
      fontSize: UI_SIZE_14,
      maxWidth: 168,
    },
    inappropriateReportedMessage: {
      ...theme.text.bodyItalic,
      color: theme.color.grey_400,
      fontSize: 15,
      writingDirection: DIRECTION_CODE,
    },
  })
  return styles
})
