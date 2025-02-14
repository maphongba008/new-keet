import React, { useCallback } from 'react'
import { StyleSheet, Text } from 'react-native'
import { useDispatch } from 'react-redux'

import { memberUnblockSubmit } from '@holepunchto/keet-store/store/member'

import {
  closeBottomSheet,
  showBottomSheet,
} from 'component/AppBottomSheet/AppBottomSheet.Store'
import BottomSheetEnum from 'component/AppBottomSheet/SheetComponents/BottomSheetEnum'
import { ButtonBase } from 'component/Button'
import { createThemedStylesheet, useTheme } from 'component/theme'
import s, { UI_SIZE_8, UI_SIZE_16 } from 'lib/commonStyles'
import { MemberType } from 'lib/types'

import { useStrings } from 'i18n/strings'

import BlockStatusIcon from './BlockStatusIcon'

export const BlockView = ({ member }: { member: MemberType }) => {
  const { blocked, id: memberId } = member
  const theme = useTheme()
  const styles = getStyles()
  const dispatch = useDispatch()
  const strings = useStrings()
  const showConfirmDialog = useCallback(() => {
    showBottomSheet({
      bottomSheetType: BottomSheetEnum.ConfirmBlockDialog,
      memberId,
      bottomSheetOnDismissCallback: () => {},
    })
  }, [memberId])

  const toggleBlockMember = useCallback(() => {
    if (blocked) {
      dispatch(memberUnblockSubmit(memberId))
      closeBottomSheet()
    } else {
      showConfirmDialog()
    }
  }, [blocked, dispatch, memberId, showConfirmDialog])

  return (
    <ButtonBase
      onPress={toggleBlockMember}
      style={[styles.row, styles.blockContainer]}
    >
      <BlockStatusIcon blocked={!blocked} color={theme.color.red_400} />
      <Text style={styles.blockText}>
        {blocked ? strings.room.unblockUser : strings.room.blockUser}
      </Text>
    </ButtonBase>
  )
}

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    blockContainer: {
      paddingVertical: UI_SIZE_16,
    },
    blockText: {
      ...theme.text.body,
      color: theme.color.red_400,
      marginLeft: UI_SIZE_16,
    },
    row: {
      ...s.centerAlignedRow,
      backgroundColor: theme.color.grey_800,
      borderRadius: theme.border.radiusNormal,
      marginTop: UI_SIZE_16,
      paddingHorizontal: UI_SIZE_16,
      paddingVertical: UI_SIZE_8,
    },
  })
  return styles
})
