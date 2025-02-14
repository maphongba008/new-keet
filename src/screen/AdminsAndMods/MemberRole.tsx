import React, { memo, useCallback } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import _get from 'lodash/get'

// @ts-ignore
import { MEMBER_ROLE } from '@holepunchto/keet-store/store/member'

import { showBottomSheet } from 'component/AppBottomSheet/AppBottomSheet.Store'
import BottomSheetEnum from 'component/AppBottomSheet/SheetComponents/BottomSheetEnum'
import { ButtonBase } from 'component/Button'
import { NavBar } from 'component/NavBar'
import SvgIcon from 'component/SvgIcon'
import { colors, createThemedStylesheet } from 'component/theme'
import s, { UI_SIZE_8, UI_SIZE_16, UI_SIZE_20 } from 'lib/commonStyles'
import WithRoomIdRendered from 'lib/hoc/withRoomIdRendered'
import { useMember } from 'lib/hooks/useMember'
import { useMembership } from 'lib/hooks/useRoom'

import { useStrings } from 'i18n/strings'

const MemberRoleScreen = WithRoomIdRendered(({ roomId, route }: any) => {
  const styles = getStyles()
  const strings = useStrings()
  const { memberId } = _get(route, 'params', {})
  const { member } = useMember(roomId, memberId)
  const { canIndex } = useMembership(roomId)

  const toPeer = useCallback(() => {
    showBottomSheet({
      bottomSheetType: BottomSheetEnum.RoleChangeConfirm,
      memberId,
      roomId,
      role: MEMBER_ROLE.PEER,
    })
  }, [memberId, roomId])
  const toMod = useCallback(() => {
    showBottomSheet({
      bottomSheetType: BottomSheetEnum.RoleChangeConfirm,
      memberId,
      roomId,
      role: MEMBER_ROLE.MODERATOR,
    })
  }, [memberId, roomId])
  const toAdmin = useCallback(() => {
    showBottomSheet({
      bottomSheetType: BottomSheetEnum.RoleChangeConfirm,
      memberId,
      roomId,
      role: MEMBER_ROLE.ADMIN,
    })
  }, [memberId, roomId])

  return (
    <View style={s.container}>
      <NavBar
        title={strings.room.adminDashboard.membersRole}
        middle={null}
        right={null}
      />
      <View style={s.container}>
        <ButtonBase style={[styles.item, styles.first]} onPress={toPeer}>
          <Text style={styles.itemText}>{strings.room.inviteType.peer}</Text>
          {!member.canModerate && (
            <SvgIcon
              name="check"
              color={colors.white_snow}
              width={UI_SIZE_20}
              height={UI_SIZE_20}
            />
          )}
        </ButtonBase>
        <ButtonBase
          style={[styles.item, !canIndex && styles.last]}
          onPress={toMod}
        >
          <Text style={[styles.itemText, styles.mod]}>
            {strings.room.inviteType.moderator}
          </Text>
          {member.canModerate && !member.canIndex && (
            <SvgIcon
              name="check"
              color={colors.white_snow}
              width={UI_SIZE_20}
              height={UI_SIZE_20}
            />
          )}
        </ButtonBase>
        {canIndex && (
          <ButtonBase
            style={[styles.item, styles.last]}
            disabled
            onPress={toAdmin}
          >
            <Text style={[styles.itemText, styles.admin]}>
              {strings.room.inviteType.admin}
            </Text>
            {member.canIndex && (
              <SvgIcon
                name="check"
                color={colors.white_snow}
                width={UI_SIZE_20}
                height={UI_SIZE_20}
              />
            )}
          </ButtonBase>
        )}

        {canIndex && (
          <View style={styles.disclaimer}>
            <SvgIcon
              name="userPlus"
              color={colors.white_snow}
              width={UI_SIZE_20}
              height={UI_SIZE_20}
              style={styles.disclaimerIcon}
            />
            <Text style={styles.disclaimerText}>
              {strings.room.adminDashboard.adminUpgradeDisclaimer}
            </Text>
          </View>
        )}
      </View>
    </View>
  )
})

export default memo(MemberRoleScreen)

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    admin: {
      color: theme.memberTypes.admin,
    },
    disclaimer: {
      ...s.centerAlignedRow,
      backgroundColor: theme.color.blue_950,
      borderRadius: UI_SIZE_8,
      marginTop: UI_SIZE_16,
      padding: UI_SIZE_8,
    },
    disclaimerIcon: {
      alignSelf: 'flex-start',
    },
    disclaimerText: {
      ...theme.text.body,
      flex: 1,
      marginStart: UI_SIZE_8,
    },
    first: {
      borderTopLeftRadius: UI_SIZE_16,
      borderTopRightRadius: UI_SIZE_16,
      marginTop: UI_SIZE_16,
    },
    item: {
      ...s.centerAlignedRow,
      ...s.flexSpaceBetween,
      backgroundColor: theme.color.grey_700,
      padding: UI_SIZE_16,
    },
    itemText: {
      ...theme.text.body,
      fontSize: 15,
    },
    last: {
      borderBottomLeftRadius: UI_SIZE_16,
      borderBottomRightRadius: UI_SIZE_16,
    },
    mod: {
      color: theme.memberTypes.mod,
    },
  })
  return styles
})
