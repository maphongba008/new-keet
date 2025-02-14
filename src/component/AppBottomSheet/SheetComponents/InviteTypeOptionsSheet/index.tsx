import React, { useCallback } from 'react'
import { StyleSheet, Text, TouchableOpacity } from 'react-native'

import { closeBottomSheet } from 'component/AppBottomSheet/AppBottomSheet.Store'
import {
  colors,
  createThemedStylesheet,
  hexToRgbOpacity,
} from 'component/theme'
import s, { DIRECTION_CODE } from 'lib/commonStyles'
import { CAPABILITIES } from 'lib/constants'

import { useStrings } from 'i18n/strings'

export interface InviteTypeOptionsSheetProps {
  setInvitationType: (invitationType: number) => void
  canModerate: boolean
  canIndex: boolean
}

const InviteTypeOptionsSheet = ({
  setInvitationType,
  canModerate,
  canIndex,
}: InviteTypeOptionsSheetProps) => {
  const styles = getStyles()
  const strings = useStrings()

  const onPress = useCallback(
    (invitationType: number) => {
      setInvitationType(invitationType)
      closeBottomSheet()
    },
    [setInvitationType],
  )

  const onPressPeer = useCallback(
    () => onPress(CAPABILITIES.CAN_WRITE),
    [onPress],
  )
  const onPressModerate = useCallback(
    () => onPress(CAPABILITIES.CAN_MODERATE),
    [onPress],
  )
  const onPressAdmin = useCallback(
    () => onPress(CAPABILITIES.CAN_INDEX),
    [onPress],
  )

  return (
    <>
      <TouchableOpacity
        style={[styles.container, canModerate && styles.borderBottom]}
        onPress={onPressPeer}
      >
        <Text style={styles.body}>{strings.room.inviteType.peer}</Text>
      </TouchableOpacity>

      {canModerate && (
        <TouchableOpacity
          style={[
            styles.container,
            canIndex && canModerate && styles.borderBottom,
          ]}
          onPress={onPressModerate}
        >
          <Text style={[styles.body, styles.modLabel]}>
            {strings.room.inviteType.moderator}
          </Text>
        </TouchableOpacity>
      )}

      {canIndex && canModerate && (
        <TouchableOpacity style={styles.container} onPress={onPressAdmin}>
          <Text style={[styles.body, styles.adminLabel]}>
            {strings.room.inviteType.admin}
          </Text>
        </TouchableOpacity>
      )}
    </>
  )
}

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    adminLabel: {
      color: theme.memberTypes.admin,
    },
    body: {
      ...theme.text.body,
      writingDirection: DIRECTION_CODE,
    },
    borderBottom: {
      borderBottomColor: hexToRgbOpacity(colors.highway_gray2, 0.2),
      borderBottomWidth: 1,
    },
    container: {
      ...s.centerAlignedRow,
      padding: theme.spacing.standard * 0.45,
      paddingVertical: theme.spacing.standard,
    },
    modLabel: {
      color: theme.memberTypes.mod,
    },
  })
  return styles
})

export default InviteTypeOptionsSheet
