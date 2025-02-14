import { ReactNode, useCallback, useEffect, useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import * as Progress from 'react-native-progress'

import { UI_SIZE_4, UI_SIZE_32 } from 'lib/commonStyles'
import { OnLayoutEvent } from 'lib/types'

import { useStrings } from 'i18n/strings'

import { SimpleButton } from './SimpleButton'
import SvgIcon from './SvgIcon'
import { createThemedStylesheet, useTheme } from './theme'

const WAITING_TIMER_MS = 4_000

export interface CircleProgressProps {
  progress: number
  title: string
  titleDone: string
  onCancel?: () => void
  onClose?: () => void
  children?: ReactNode
}

export const ProgressBar = ({
  progress,
  title,
  titleDone,
  onCancel,
  onClose,
  children,
}: CircleProgressProps) => {
  const theme = useTheme()
  const styles = getStyles()
  const strings = useStrings()

  const [width, setWidth] = useState(0)
  const [waiting, setWaiting] = useState(false)

  useEffect(() => {
    setWaiting(false)

    if (progress >= 1) {
      return
    }

    const timer = setTimeout(() => setWaiting(true), WAITING_TIMER_MS)

    return () => clearTimeout(timer)
  }, [progress])

  const done = progress >= 1
  const text = waiting
    ? strings.downloads.waitingSeeders
    : done
      ? titleDone
      : title
  const textButton = !done ? strings.common.cancel : strings.common.close

  const onLayout = useCallback((ev: OnLayoutEvent) => {
    setWidth(ev.nativeEvent.layout.width)
  }, [])

  const onPress = useCallback(() => {
    return done ? onClose?.() : onCancel?.()
  }, [done, onClose, onCancel])

  return (
    <View onLayout={onLayout}>
      {width > 0 && (
        <View style={styles.root}>
          <View style={styles.textRoot}>
            {(waiting || done) && (
              <SvgIcon
                name={waiting ? 'warning' : 'checkCircle'}
                color={
                  waiting ? theme.button.warnColor : theme.button.successColor
                }
              />
            )}
            <Text style={styles.text}>{text}</Text>
          </View>
          <Progress.Bar
            indeterminate={waiting || progress < 0}
            borderWidth={0}
            borderRadius={0}
            width={width}
            height={UI_SIZE_4}
            progress={progress}
            color={theme.progress.mainColor}
            unfilledColor={theme.progress.darkerColor}
          />
          {children}
          <SimpleButton
            title={textButton}
            onPress={onPress}
            style={styles.button}
          />
        </View>
      )}
    </View>
  )
}

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    button: {
      marginTop: theme.spacing.standard,
    },
    root: {
      flexDirection: 'column',
      rowGap: theme.spacing.standard / 2,
    },
    text: {
      ...theme.text.body,
    },
    textRoot: {
      alignItems: 'center',
      columnGap: theme.spacing.standard / 2,
      flexDirection: 'row',
      height: UI_SIZE_32,
    },
  })
  return styles
})
