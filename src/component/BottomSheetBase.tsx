import React, { useCallback, useEffect } from 'react'
import {
  BackHandler,
  Keyboard,
  StyleSheet,
  Text,
  View,
  ViewProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native'
import isEqual from 'react-fast-compare'
import { useAnimatedStyle, useSharedValue } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  BottomSheetView,
  type BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet'
import { BackdropPressBehavior } from '@gorhom/bottom-sheet/lib/typescript/components/bottomSheetBackdrop/types'
import { type BottomSheetModalMethods } from '@gorhom/bottom-sheet/lib/typescript/types'
import _capitalize from 'lodash/capitalize'

import { colors, createThemedStylesheet, useTheme } from 'component/theme'
import s, {
  DIRECTION,
  DIRECTION_CODE,
  ICON_SIZE_16,
  ICON_SIZE_28,
  TRANSPARENT,
  UI_SIZE_8,
  UI_SIZE_12,
} from 'lib/commonStyles'
import { isIOS } from 'lib/platform'

import { useStrings } from 'i18n/strings'

import { IconButton } from './Button'
import { CloseButton } from './CloseButton'
import SvgIcon from './SvgIcon'

export const HIDDEN_INDEX = -1

export interface BottomSheetBaseProps {
  sheetRef: React.RefObject<BottomSheetModalMethods>
  children?: React.ReactNode
  onClose?: () => void
  style?: StyleProp<ViewStyle>
  isTransparent?: boolean | undefined
  backdropPressBehaviour?: BackdropPressBehavior
  enablePanDownToClose?: boolean
}

export const BottomSheetBase = React.memo((props: BottomSheetBaseProps) => {
  const {
    sheetRef,
    style,
    backdropPressBehaviour = 'close',
    enablePanDownToClose = true,
    isTransparent = false,
  } = props

  const styles = getStyles()
  const theme = useTheme()

  const indexRef = React.useRef<number>(HIDDEN_INDEX)
  const { bottom: safeBottom } = useSafeAreaInsets()
  const keybShown = useSharedValue(false)

  const sheetStyle = useAnimatedStyle(() => {
    return {
      marginTop: !keybShown.value ? 0 : safeBottom,
    }
  }, [safeBottom])

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      function () {
        if (backdropPressBehaviour === 'none' && enablePanDownToClose) {
          return true
        }
        if (indexRef.current !== HIDDEN_INDEX) {
          sheetRef?.current?.close()
          return true
        }
        return false
      },
    )

    const keybWillShowSubs = isIOS
      ? Keyboard.addListener('keyboardWillShow', () => (keybShown.value = true))
      : undefined
    const keybWillHideSubs = isIOS
      ? Keyboard.addListener(
          'keyboardWillHide',
          () => (keybShown.value = false),
        )
      : undefined

    return () => {
      keybWillShowSubs?.remove()
      keybWillHideSubs?.remove()

      backHandler.remove()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const BackdropComponent = useCallback(
    (backdropProps: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...backdropProps}
        pressBehavior={backdropPressBehaviour}
        appearsOnIndex={0}
        disappearsOnIndex={HIDDEN_INDEX}
      />
    ),
    [backdropPressBehaviour],
  )

  const onDismiss = useCallback(() => {
    props.onClose?.()
  }, [props])

  const onChange = useCallback((index: number) => {
    indexRef.current = index
  }, [])

  return (
    <BottomSheetModal
      ref={sheetRef}
      enablePanDownToClose={enablePanDownToClose}
      enableContentPanningGesture={false}
      enableDynamicSizing
      enableDismissOnClose
      index={0}
      onDismiss={onDismiss}
      onChange={onChange}
      style={sheetStyle}
      backgroundStyle={
        isTransparent ? styles.transparentBg : styles.sheetBackground
      }
      handleIndicatorStyle={
        isTransparent ? styles.hideIndicator : styles.sheetHandle
      }
      backdropComponent={BackdropComponent}
      keyboardBlurBehavior="restore"
    >
      <BottomSheetView
        style={
          isTransparent
            ? {
                paddingBottom: isIOS
                  ? Math.max(safeBottom, theme.spacing.standard)
                  : safeBottom + theme.spacing.standard,
                paddingHorizontal: UI_SIZE_12,
              }
            : [
                styles.sheetRoot,
                { paddingBottom: theme.spacing.standard + safeBottom },
                style,
              ]
        }
        testID="bottom_sheet_view"
      >
        {props.children}
      </BottomSheetView>
    </BottomSheetModal>
  )
}, isEqual)

export const BtmSheetHeader = ({
  title,
  onClose,
  isDismissIcon, // Either back button or dismiss button. If need more can create enum
  testProps,
}: {
  title?: string
  onClose: () => void
  isDismissIcon?: boolean
  testProps?: Partial<ViewProps>
}) => {
  const styles = getStyles()
  const strings = useStrings()

  return (
    <View style={styles.title}>
      {!isDismissIcon && (
        <IconButton
          hint={strings.common.back}
          onPress={onClose}
          style={styles.backButton}
          {...testProps}
        >
          <SvgIcon
            name={`chevron${_capitalize(DIRECTION)}`}
            width={ICON_SIZE_16}
            height={ICON_SIZE_16}
            color={colors.white_snow}
          />
        </IconButton>
      )}
      <Text style={styles.formTitle}>
        {title ?? strings.cameraQrScan.defaultTitle}
      </Text>
      {isDismissIcon && (
        <CloseButton
          onPress={onClose}
          hint={strings.common.back}
          style={styles.closeButton}
          width={ICON_SIZE_16}
          height={ICON_SIZE_16}
        />
      )}
    </View>
  )
}

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    backButton: {
      ...s.centeredLayout,
      backgroundColor: theme.color.bg2,
      borderColor: theme.color.bg4,
      borderRadius: UI_SIZE_8,
      borderWidth: 1,
      height: ICON_SIZE_28,
      marginEnd: theme.spacing.standard,
      width: ICON_SIZE_28,
    },
    closeButton: {
      ...s.centeredLayout,
      backgroundColor: theme.color.bg2,
      borderColor: theme.color.bg4,
      borderRadius: UI_SIZE_8,
      borderWidth: 1,
      height: ICON_SIZE_28,
      marginStart: theme.spacing.standard,
      width: ICON_SIZE_28,
    },
    formTitle: {
      ...theme.text.title,
      flex: 1,
      writingDirection: DIRECTION_CODE,
    },
    hideIndicator: {
      height: 0,
    },
    sheetBackground: {
      backgroundColor: theme.modal.bg,
    },
    sheetHandle: {
      backgroundColor: colors.white_snow,
    },
    sheetRoot: {
      backgroundColor: theme.modal.bg,
      flexDirection: 'column',
      justifyContent: 'flex-start',
      padding: theme.spacing.standard,
    },
    title: {
      ...s.centerAlignedRow,
      marginBottom: theme.spacing.standard,
    },
    transparentBg: {
      backgroundColor: TRANSPARENT,
    },
  })
  return styles
})
