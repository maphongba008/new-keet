import React, { memo, useCallback } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { useDispatch } from 'react-redux'

import {
  // @ts-ignore
  MEMBER_ROLE,
  // @ts-ignore
  memberChangeRoleSubmit,
} from '@holepunchto/keet-store/store/member'

import { closeBottomSheet } from 'component/AppBottomSheet/AppBottomSheet.Store'
import { IconButton, TextButton, TextButtonType } from 'component/Button'
import SvgIcon from 'component/SvgIcon'
import { colors, createThemedStylesheet } from 'component/theme'
import s, {
  DIRECTION_CODE,
  UI_SIZE_8,
  UI_SIZE_16,
  UI_SIZE_20,
  UI_SIZE_24,
} from 'lib/commonStyles'
import { useMemberItem } from 'lib/hooks/useMember'
import { resetStackWithHistory, roomOptionsStackHistory } from 'lib/navigation'

import { useStrings } from 'i18n/strings'

export interface RoleChangeConfirmInterface {
  memberId: string
  roomId: string
  role: number
}

const RoleChangeConfirm = ({
  roomId,
  memberId,
  role,
}: RoleChangeConfirmInterface) => {
  const styles = getStyles()
  const strings = useStrings()
  const dispatch = useDispatch()
  const { member } = useMemberItem(roomId, memberId)
  const isMod = member.canModerate && !member.canIndex
  const isAdmin = member.canIndex
  const revoke =
    (isAdmin && role > MEMBER_ROLE.ADMIN) ||
    (isMod && role > MEMBER_ROLE.MODERATOR)

  const changeRole = useCallback(() => {
    const isDowngradeRolePeer =
      member.isLocal &&
      (member.canIndex || member.canModerate) &&
      role === MEMBER_ROLE.PEER

    dispatch(memberChangeRoleSubmit({ memberId, role }))
    closeBottomSheet()

    if (isDowngradeRolePeer) {
      resetStackWithHistory(roomOptionsStackHistory)
    }
  }, [dispatch, member, memberId, role])

  if (role === MEMBER_ROLE.PEER) {
    return (
      <>
        <View style={styles.header}>
          <Text style={styles.title}>
            {strings.room.adminDashboard.downToPeerTitle}
          </Text>
          <IconButton hint={strings.common.close} onPress={closeBottomSheet}>
            <SvgIcon
              name="close"
              color={colors.white_snow}
              width={UI_SIZE_24}
              height={UI_SIZE_24}
            />
          </IconButton>
        </View>

        <Text style={styles.description}>
          {strings.room.adminDashboard.downToPeerDesc}
        </Text>

        <TextButton
          text={strings.room.adminDashboard.downgrade}
          type={TextButtonType.danger}
          onPress={changeRole}
          style={styles.button}
        />
        <TextButton
          text={strings.common.cancel}
          type={TextButtonType.cancel}
          onPress={closeBottomSheet}
          style={styles.button}
        />
      </>
    )
  } else if (role === MEMBER_ROLE.MODERATOR) {
    return (
      <>
        <View style={styles.header}>
          <Text style={styles.title}>
            {revoke
              ? strings.room.adminDashboard.downToModTitle
              : strings.room.adminDashboard.upToModTitle}
          </Text>
          <IconButton hint={strings.common.close} onPress={closeBottomSheet}>
            <SvgIcon
              name="close"
              color={colors.white_snow}
              width={UI_SIZE_24}
              height={UI_SIZE_24}
            />
          </IconButton>
        </View>

        <Text style={styles.description}>
          {revoke
            ? strings.room.adminDashboard.downToModDesc
            : strings.room.adminDashboard.upToModDesc}
        </Text>

        <Text style={styles.listLabel}>
          {strings.room.modResponsibilities.title}
        </Text>
        <View style={styles.list}>
          <View style={[s.centerAlignedRow, styles.item]}>
            <SvgIcon
              name="shieldTick"
              color={colors.white_snow}
              width={UI_SIZE_20}
              height={UI_SIZE_20}
            />
            <Text style={styles.itemLabel}>
              {strings.room.modResponsibilities.invite}
            </Text>
          </View>
          <View style={[s.centerAlignedRow, styles.item]}>
            <SvgIcon
              name="shieldTick"
              color={colors.white_snow}
              width={UI_SIZE_20}
              height={UI_SIZE_20}
            />
            <Text style={styles.itemLabel}>
              {strings.room.modResponsibilities.name}
            </Text>
          </View>
          <View style={[s.centerAlignedRow, styles.item]}>
            <SvgIcon
              name="shieldTick"
              color={colors.white_snow}
              width={UI_SIZE_20}
              height={UI_SIZE_20}
            />
            <Text style={styles.itemLabel}>
              {strings.room.modResponsibilities.delete}
            </Text>
          </View>
          <View style={[s.centerAlignedRow, styles.item]}>
            <SvgIcon
              name="shieldTick"
              color={colors.white_snow}
              width={UI_SIZE_20}
              height={UI_SIZE_20}
            />
            <Text style={styles.itemLabel}>
              {strings.room.modResponsibilities.ban}
            </Text>
          </View>
        </View>

        <TextButton
          text={
            revoke
              ? strings.room.adminDashboard.downgrade
              : strings.room.adminDashboard.upToModTitle
          }
          type={revoke ? TextButtonType.danger : TextButtonType.primary}
          onPress={changeRole}
          style={styles.button}
        />
        <TextButton
          text={strings.common.cancel}
          type={TextButtonType.cancel}
          onPress={closeBottomSheet}
          style={styles.button}
        />
      </>
    )
  } else {
    return (
      <>
        <View style={styles.header}>
          <Text style={styles.title}>
            {strings.room.adminDashboard.upToAdminTitle}
          </Text>
          <IconButton hint={strings.common.close} onPress={closeBottomSheet}>
            <SvgIcon
              name="close"
              color={colors.white_snow}
              width={UI_SIZE_24}
              height={UI_SIZE_24}
            />
          </IconButton>
        </View>

        <Text style={styles.description}>
          {strings.room.adminDashboard.upToAdminDesc}
        </Text>

        <Text style={styles.listLabel}>
          {strings.room.adminResponsibilities.title}
        </Text>
        <View style={styles.list}>
          <View style={[s.centerAlignedRow, styles.item]}>
            <SvgIcon
              name="shieldTick"
              color={colors.white_snow}
              width={UI_SIZE_20}
              height={UI_SIZE_20}
            />
            <Text style={styles.itemLabel}>
              {strings.room.adminResponsibilities.beOnline}
            </Text>
          </View>
          <View style={[s.centerAlignedRow, styles.item]}>
            <SvgIcon
              name="shieldTick"
              color={colors.white_snow}
              width={UI_SIZE_20}
              height={UI_SIZE_20}
            />
            <Text style={styles.itemLabel}>
              {strings.room.adminResponsibilities.invite}
            </Text>
          </View>
          <View style={[s.centerAlignedRow, styles.item]}>
            <SvgIcon
              name="shieldTick"
              color={colors.white_snow}
              width={UI_SIZE_20}
              height={UI_SIZE_20}
            />
            <Text style={styles.itemLabel}>
              {strings.room.adminResponsibilities.assign}
            </Text>
          </View>
          <View style={[s.centerAlignedRow, styles.item]}>
            <SvgIcon
              name="shieldTick"
              color={colors.white_snow}
              width={UI_SIZE_20}
              height={UI_SIZE_20}
            />
            <Text style={styles.itemLabel}>
              {strings.room.modResponsibilities.name}
            </Text>
          </View>
          <View style={[s.centerAlignedRow, styles.item]}>
            <SvgIcon
              name="shieldTick"
              color={colors.white_snow}
              width={UI_SIZE_20}
              height={UI_SIZE_20}
            />
            <Text style={styles.itemLabel}>
              {strings.room.modResponsibilities.delete}
            </Text>
          </View>
          <View style={[s.centerAlignedRow, styles.item]}>
            <SvgIcon
              name="shieldTick"
              color={colors.white_snow}
              width={UI_SIZE_20}
              height={UI_SIZE_20}
            />
            <Text style={styles.itemLabel}>
              {strings.room.modResponsibilities.ban}
            </Text>
          </View>
          <View style={[s.centerAlignedRow, styles.item]}>
            <SvgIcon
              name="shieldTick"
              color={colors.white_snow}
              width={UI_SIZE_20}
              height={UI_SIZE_20}
            />
            <Text style={styles.itemLabel}>
              {strings.room.adminResponsibilities.pin}
            </Text>
          </View>
        </View>

        <TextButton
          text={strings.room.adminDashboard.upToAdminTitle}
          type={TextButtonType.primary}
          onPress={changeRole}
          style={styles.button}
        />
        <TextButton
          text={strings.common.cancel}
          type={TextButtonType.cancel}
          onPress={closeBottomSheet}
          style={styles.button}
        />
      </>
    )
  }
}

export default memo(RoleChangeConfirm)

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    button: {
      marginBottom: UI_SIZE_16,
    },
    description: {
      ...theme.text.body,
      marginBottom: theme.spacing.standard,
    },
    header: {
      ...s.centerAlignedRow,
      marginBottom: theme.spacing.standard,
    },
    item: {
      marginBottom: UI_SIZE_16,
    },
    itemLabel: {
      ...theme.text.body,
      marginStart: UI_SIZE_8,
    },
    list: {
      margin: UI_SIZE_16,
    },
    listLabel: {
      ...theme.text.title2,
    },
    title: {
      ...theme.text.title,
      flex: 1,
      writingDirection: DIRECTION_CODE,
    },
  })
  return styles
})
