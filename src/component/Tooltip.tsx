import React, { useCallback, useEffect, useState } from 'react'
import {
  GestureResponderEvent,
  LayoutChangeEvent,
  Modal,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewProps,
  ViewStyle,
} from 'react-native'
import LinearGradient from 'react-native-linear-gradient'

import s, {
  TRANSPARENT,
  UI_SIZE_4,
  UI_SIZE_8,
  UI_SIZE_16,
  UI_SIZE_18,
  UI_SIZE_24,
} from 'lib/commonStyles'

import { useStrings } from 'i18n/strings'

import { CloseButton } from './CloseButton'
import {
  colors,
  createThemedStylesheet,
  gradient,
  hexToRgbOpacity,
} from './theme'

type TooltipContentProps = {
  title: string
  description: string
  content?: React.ReactNode
  step: number
  totalSteps?: number
  onClose?: () => void
  onPressNext?: () => void
  testProps?: Partial<ViewProps>
}

const TOTAL_STEPS = 2

export const TooltipContent = ({
  title,
  description,
  content,
  step,
  totalSteps = TOTAL_STEPS,
  onClose,
  onPressNext,
  testProps,
}: TooltipContentProps) => {
  const styles = getStyles()
  const strings = useStrings()
  const isLastStep = step === totalSteps
  const hasStepIndicator = step > 0

  return (
    <View>
      <View style={[s.centerAlignedRow, { marginBottom: UI_SIZE_16 }]}>
        {content}
        <Text style={styles.title}>{title}</Text>
        <CloseButton onPress={onClose} width={UI_SIZE_18} height={UI_SIZE_18} />
      </View>
      <Text style={styles.textWhite}>{description}</Text>
      {hasStepIndicator && (
        <View style={styles.stepIndicatorRow}>
          <View style={styles.dotContainer}>
            {[...Array(totalSteps)].map((_, index) => (
              <View
                key={index}
                style={[styles.dot, index + 1 === step && styles.dotActive]}
              />
            ))}
          </View>
          <TouchableOpacity
            style={styles.nextButton}
            onPress={onPressNext}
            {...testProps}
          >
            <Text style={styles.nextButtonText}>
              {isLastStep ? strings.common.finish : strings.common.next}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  )
}

type Position = {
  x: number
  y: number
  width: number
  height: number
}

export const Tooltip = ({
  componentRef,
  content,
  placement,
  children,
  step,
  title,
  description,
  toShow,
  totalSteps,
  onClose,
  onPressNext,
  testProps,
}: {
  componentRef: any
  content: any
  placement: 'top' | 'bottom'
  children: any
  step: number
  title: string
  description: string
  toShow?: boolean
  totalSteps?: number
  onClose?: () => void
  onPressNext?: () => void
  testProps?: Partial<ViewProps>
}) => {
  const styles = getStyles()
  const [position, setPosition] = React.useState<Position>({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  })
  const visible = toShow && position.x > 0
  const childrenClone = React.cloneElement(children, {
    onLayout: () => {
      componentRef.current?.measure(
        (
          _x: number,
          _y: number,
          width: number,
          height: number,
          pageX: number,
          pageY: number,
        ) => {
          setPosition({ x: pageX, y: pageY, width, height })
        },
      )
    },
  })
  const [contentHeight, setContentHeight] = React.useState(0)
  const onLayout = useCallback((e: LayoutChangeEvent) => {
    setContentHeight(e.nativeEvent.layout.height)
  }, [])
  const onDismiss = useCallback(
    (e: GestureResponderEvent) => e.target === e.currentTarget && onClose?.(),
    [onClose],
  )
  const [internalVisible, setInternalVisible] = useState(visible)
  useEffect(() => {
    if (visible) {
      // wait for modal animation to finish
      let timeoutId = setTimeout(() => setInternalVisible(visible), 750)
      return () => {
        clearTimeout(timeoutId)
      }
    } else {
      setInternalVisible(visible)
    }
  }, [visible])
  return (
    <>
      {childrenClone}
      <Modal
        statusBarTranslucent
        visible={internalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={onClose}
      >
        <Pressable onPress={onDismiss} style={styles.modalWrapper}>
          <View
            onLayout={onLayout}
            style={[
              s.absolute,
              styles.fullWidth,
              {
                top:
                  placement === 'top'
                    ? position.y + position.height + UI_SIZE_8
                    : position.y - contentHeight - UI_SIZE_8,
              },
            ]}
          >
            {placement === 'top' && (
              <Arrow placement="top" position={position} />
            )}
            <LinearGradient
              style={styles.tooltipContainer}
              {...gradient.keet_tooltip_gray}
            >
              <TooltipContent
                title={title}
                description={description}
                content={content}
                step={step}
                totalSteps={totalSteps}
                onClose={onClose}
                onPressNext={onPressNext}
                testProps={testProps}
              />
            </LinearGradient>
          </View>
          {placement === 'bottom' && (
            <Arrow placement="bottom" position={position} />
          )}
          <View
            style={[
              s.absolute,
              {
                width: position.width,
                height: position.height,
                left: position.x,
                top: position.y,
              },
            ]}
          >
            {children}
          </View>
        </Pressable>
      </Modal>
    </>
  )
}

export const Arrow = ({
  placement,
  position,
  style,
}: {
  placement: 'top' | 'bottom'
  position?: Position
  style?: StyleProp<ViewStyle>
}) => {
  const styles = getStyles()
  return (
    <View style={{ height: ARROW_SIZE }}>
      <View
        style={[
          styles.arrow,
          placement === 'bottom' && styles.arrowBottom,
          position && { left: position.x + position.width / 2 - ARROW_SIZE },
          style,
        ]}
      />
    </View>
  )
}

const ARROW_SIZE = 10

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    arrow: {
      backgroundColor: TRANSPARENT,
      borderBottomColor: colors.tooltip_arrow_color,
      borderBottomWidth: ARROW_SIZE,
      borderLeftColor: TRANSPARENT,
      borderLeftWidth: ARROW_SIZE,
      borderRightColor: TRANSPARENT,
      borderRightWidth: ARROW_SIZE,
      borderStyle: 'solid',
      height: 0,
      position: 'absolute',
      width: 0,
    },
    arrowBottom: {
      transform: [{ rotate: '180deg' }],
    },
    dot: {
      backgroundColor: theme.color.grey_200,
      borderRadius: 5, // Half of width/height to make it circle
      height: 6,
      margin: 2,
      width: 6,
    },
    dotActive: {
      backgroundColor: colors.white_snow,
      width: 18,
    },
    dotContainer: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: UI_SIZE_4,
    },
    fullWidth: {
      left: 0,
      right: 0,
    },
    modalWrapper: {
      backgroundColor: hexToRgbOpacity(colors.keet_almostBlack, 0.3),
      flex: 1,
    },
    nextButton: {
      backgroundColor: TRANSPARENT,
      borderColor: theme.color.blue_900,
      borderRadius: 5,
      borderWidth: 1,
      paddingHorizontal: UI_SIZE_16,
      paddingVertical: UI_SIZE_8,
    },
    nextButtonText: {
      color: theme.color.blue_400,
      fontWeight: 'bold',
    },
    stepIndicatorRow: {
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: UI_SIZE_24,
    },
    textWhite: {
      ...theme.text.body,
      color: theme.color.grey_100,
      fontSize: 16,
    },
    title: {
      ...theme.text.bodyBold,
      fontSize: UI_SIZE_18,
      marginRight: 'auto',
      paddingLeft: UI_SIZE_8,
    },
    tooltipContainer: {
      borderRadius: theme.border.radiusNormal,
      marginHorizontal: UI_SIZE_8,
      padding: UI_SIZE_16,
    },
  })
  return styles
})
