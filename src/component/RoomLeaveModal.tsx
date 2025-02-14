import React, {
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react'
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import { type BottomSheetModal } from '@gorhom/bottom-sheet'

import { canIndex, getMyMember } from '@holepunchto/keet-store/store/member'
import {
  getRoomLeavingDirty,
  getRoomLeavingInProgress,
  getRoomLeavingShouldConfirm,
  leaveRoomCleanup,
  leaveRoomConfirmForce,
  leaveRoomRejectForce,
  leaveRoomSubmit,
} from '@holepunchto/keet-store/store/room'

import s, {
  DIRECTION_CODE,
  ICON_SIZE_16,
  UI_SIZE_4,
  UI_SIZE_8,
  UI_SIZE_12,
} from 'lib/commonStyles'
import { useTimeout } from 'lib/hooks'
import { showInfoNotifier } from 'lib/hud'

import { useStrings } from 'i18n/strings'

import { BottomSheetBase, BtmSheetHeader } from './BottomSheetBase'
import { TextButton, TextButtonType } from './Button'
import LabeledCheckbox from './Checkbox'
import SvgIcon from './SvgIcon'
import { createThemedStylesheet, useTheme } from './theme'

const LeaveIcon = memo(() => {
  const theme = useTheme()
  return (
    <SvgIcon
      color={theme.color.danger}
      width={ICON_SIZE_16}
      height={ICON_SIZE_16}
      name="arrowRightFromBracket"
    />
  )
})

const RoomLeaveModal = forwardRef(({ roomId }: { roomId: string }, ref) => {
  const inProgress = useSelector(getRoomLeavingInProgress)
  const isDirtyLeave = useSelector(getRoomLeavingDirty(roomId))
  const forceConfirmation = useSelector(getRoomLeavingShouldConfirm)
  const myMember: any = useSelector(getMyMember(roomId))
  const [agree, setAgree] = useState(false)
  const dispatch = useDispatch()
  const strings = useStrings()
  const styles = getStyles()
  const theme = useTheme()
  const [isAdminFinalStep, setIsAdminFinalStep] = useState(false)

  const hasNotifiedRef = useRef(false)
  const bottomSheetRef = useRef<BottomSheetModal>(null)

  const isAdmin = canIndex(myMember?.capabilities)

  const onCancel = useCallback(() => {
    if (inProgress) {
      return
    }
    if (forceConfirmation) {
      dispatch(leaveRoomRejectForce())
    } else {
      dispatch(leaveRoomCleanup())
    }
  }, [dispatch, forceConfirmation, inProgress])

  const onConfirm = useCallback(() => {
    try {
      if (forceConfirmation) {
        dispatch(leaveRoomConfirmForce())
        setIsAdminFinalStep(true)
      } else {
        dispatch(leaveRoomSubmit())

        if (!forceConfirmation && !hasNotifiedRef.current && !isAdmin) {
          showInfoNotifier('Room left successfully')
          hasNotifiedRef.current = true
        }
      }
    } catch (error) {
      console.error('Failed to leave room', error)
    }
  }, [dispatch, forceConfirmation, isAdmin])

  const warnText = useMemo(() => {
    if (canIndex(myMember?.capabilities)) {
      return strings.room.leaveAdminMessage
    }
    return strings.room.leavePeerMessage
  }, [
    myMember?.capabilities,
    strings.room.leaveAdminMessage,
    strings.room.leavePeerMessage,
  ])

  const closeSheetWithDelay = useTimeout(
    () => bottomSheetRef.current?.dismiss({ duration: theme.animation.ms }),
    500,
  )

  useEffect(() => {
    const timeout = setTimeout(() => bottomSheetRef?.current?.present())
    return () => clearTimeout(timeout)
  }, [])

  useEffect(() => {
    if (isAdminFinalStep && !hasNotifiedRef.current) {
      showInfoNotifier(strings.room.leaveSuccess)
      hasNotifiedRef.current = true
    }
  }, [isAdminFinalStep, strings.room.leaveSuccess])

  useImperativeHandle(
    ref,
    () => ({
      closeSheet: closeSheetWithDelay,
    }),
    [closeSheetWithDelay],
  )

  return (
    <BottomSheetBase
      sheetRef={bottomSheetRef}
      isTransparent
      backdropPressBehaviour={'close'}
      enablePanDownToClose
      onClose={onCancel}
    >
      <View style={styles.modalWrapper}>
        <BtmSheetHeader
          title={strings.room.leaveTitle}
          onClose={onCancel}
          isDismissIcon
        />
        {forceConfirmation ? (
          <>
            <View style={styles.warning}>
              <SvgIcon
                name="info"
                width={20}
                height={20}
                color={theme.color.el_salvador}
              />
              <Text style={styles.warningText}>
                {isDirtyLeave
                  ? strings.room.oldRoomLeaveMessage
                  : strings.room.forceLeaveMessage}
              </Text>
            </View>
            <LabeledCheckbox
              label={
                isDirtyLeave
                  ? strings.room.oldRoomLeaveCheckbox
                  : strings.room.forceLeaveCheckbox
              }
              onChange={setAgree}
              value={agree}
              style={styles.labelCheckbox}
            />
          </>
        ) : (
          <Text style={styles.body}>{warnText}</Text>
        )}
        {inProgress ? (
          <ActivityIndicator />
        ) : (
          <>
            <TextButton
              text={strings.room.leave}
              onPress={onConfirm}
              style={[styles.button, styles.buttonSpacing]}
              icon={LeaveIcon}
              type={TextButtonType.danger}
              disabled={!agree && forceConfirmation}
            />
            <TextButton
              text={strings.common.cancel}
              type={TextButtonType.cancel}
              onPress={onCancel}
              style={styles.button}
            />
          </>
        )}
      </View>
    </BottomSheetBase>
  )
})

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    body: {
      ...theme.text.body,
      color: theme.color.grey_300,
      fontSize: 14,
      marginBottom: theme.spacing.standard,
      writingDirection: DIRECTION_CODE,
    },
    button: {
      ...s.fullWidth,
    },
    buttonSpacing: {
      marginBottom: UI_SIZE_12,
    },
    labelCheckbox: {
      marginBottom: theme.spacing.standard,
    },
    modalWrapper: {
      backgroundColor: theme.background.bg_2,
      borderRadius: theme.border.radiusLarge,
      padding: theme.spacing.standard,
      paddingTop: theme.spacing.large,
    },
    warning: {
      ...s.row,
      backgroundColor: theme.color.dark_yellow,
      borderColor: theme.color.el_salvador,
      borderRadius: theme.border.radiusNormal,
      borderWidth: 1,
      marginBottom: theme.spacing.normal,
      padding: UI_SIZE_8,
    },
    warningText: {
      ...s.container,
      ...theme.text.body,
      fontSize: 14,
      paddingLeft: UI_SIZE_4,
      writingDirection: DIRECTION_CODE,
    },
  })
  return styles
})

export default memo(RoomLeaveModal)
