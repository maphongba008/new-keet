import React, { memo, useCallback, useEffect, useMemo } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import _get from 'lodash/get'

import {
  canMuteMember,
  // @ts-ignore
  // canRemoveMember,
  getMemberMutedById,
  getMemberMutedByIdLoading,
  getMemberRole,
  // @ts-ignore
  // getMemberRole,
  memberCheckMutedStatusCmd,
  memberMuteToggleCmd,
  // @ts-ignore
  // memberRemoveCmd,
} from '@holepunchto/keet-store/store/member'
// @ts-ignore
import { makeGetIsMeLastAdmin } from '@holepunchto/keet-store/store/member-list'

import {
  closeBottomSheet,
  showBottomSheet,
} from 'component/AppBottomSheet/AppBottomSheet.Store'
import BottomSheetEnum from 'component/AppBottomSheet/SheetComponents/BottomSheetEnum'
import { MemberAvatar } from 'component/Avatar'
import { ButtonBase, TextButtonType } from 'component/Button'
import MemberTag from 'component/MemberTag'
import { NavBar } from 'component/NavBar'
import SvgIcon, { SvgIconType } from 'component/SvgIcon'
import { colors, createThemedStylesheet } from 'component/theme'
import s, {
  UI_SIZE_2,
  UI_SIZE_8,
  UI_SIZE_14,
  UI_SIZE_16,
  UI_SIZE_20,
  UI_SIZE_24,
  UI_SIZE_32,
  UI_SIZE_64,
} from 'lib/commonStyles'
import WithRoomIdRendered from 'lib/hoc/withRoomIdRendered'
import {
  useIsMemberMuteSupported,
  // useIsRemoveMemberSupported,
} from 'lib/hooks/useIsFeatureSupported'
import { useMember } from 'lib/hooks/useMember'
import { useMembership } from 'lib/hooks/useRoom'
import {
  navigate,
  SCREEN_MEMBER_ROLE,
  SCREEN_USER_PROFILE,
} from 'lib/navigation'

import { useStrings } from 'i18n/strings'

const ManageMemberScreen = WithRoomIdRendered(({ roomId, route }: any) => {
  const styles = getStyles()
  // const strings = useStrings()
  const dispatch = useDispatch()
  const {
    common,
    room: { adminDashboard, inviteType },
  } = useStrings()
  const { memberId } = _get(route, 'params', {})
  const { member } = useMember(roomId, memberId)
  const me = useMembership(roomId)
  const isMe = memberId === me.memberId
  const managedMemberRole = getMemberRole(member)
  const myRole = getMemberRole(me)
  // const removeMemberSupported = useIsRemoveMemberSupported(roomId)
  const memberMuteSupported = useIsMemberMuteSupported(roomId)

  const canMute =
    memberMuteSupported && !isMe && canMuteMember({ myRole, managedMemberRole })

  const isMeLastAdminSelector = useMemo(
    () => makeGetIsMeLastAdmin({ roomId, memberId }),
    [roomId, memberId],
  )
  const isLastAdmin = useSelector(isMeLastAdminSelector)
  const isMuted = useSelector((state) =>
    getMemberMutedById(state, roomId, memberId),
  )
  const isMuteLoading = useSelector((state) =>
    getMemberMutedByIdLoading(state, roomId, memberId),
  )

  useEffect(() => {
    dispatch(memberCheckMutedStatusCmd({ roomId, memberId }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const goToProfile = useCallback(() => {
    navigate(SCREEN_USER_PROFILE, {
      memberId,
      roomId,
    })
  }, [memberId, roomId])

  const chooseRole = useCallback(() => {
    navigate(SCREEN_MEMBER_ROLE, {
      memberId,
      roomId,
    })
  }, [memberId, roomId])

  // Temporarily disabled for this sprint
  // const removeMember = useCallback(() => {
  //   dispatch(memberRemoveCmd({ roomId, memberId }))
  //   closeBottomSheet()
  // }, [dispatch, memberId, roomId])

  // const removeMemberConfirm = useCallback(() => {
  //   showBottomSheet({
  //     bottomSheetType: BottomSheetEnum.ConfirmDialog,
  //     closeButton: true,
  //     reverse: true,
  //     title: strings.room.adminDashboard.removeName.replace(
  //       '$1',
  //       member.displayName ?? '',
  //     ),
  //     description: strings.room.adminDashboard.removeMemberDescription,
  //     confirmButton: {
  //       text: strings.common.remove,
  //       onPress: removeMember,
  //       type: TextButtonType.danger,
  //     },
  //     buttons: [
  //       {
  //         text: strings.common.cancel,
  //         onPress: closeBottomSheet,
  //         type: TextButtonType.secondary,
  //       },
  //     ],
  //   })
  // }, [member, removeMember, strings])

  const muteDisclaimerList: Array<{ label: string; icon: SvgIconType }> =
    useMemo(() => {
      const { muteDisclaimer_1, muteDisclaimer_2, muteDisclaimer_3 } =
        adminDashboard
      return [
        { label: muteDisclaimer_1, icon: 'commentOff' },
        { label: muteDisclaimer_2, icon: 'notificationOff' },
        { label: muteDisclaimer_3, icon: 'settings' },
      ]
    }, [adminDashboard])

  const getMemberMuteDescription = useCallback(() => {
    return (
      <View style={styles.muteDisclaimerWrapper}>
        {muteDisclaimerList.map(({ label, icon }, key) => (
          <View key={key} style={[s.row, styles.extraBottom]}>
            <SvgIcon
              name={icon}
              color={colors.white_snow}
              width={UI_SIZE_20}
              height={UI_SIZE_20}
            />
            <Text style={styles.muteDisclaimer}>{label}</Text>
          </View>
        ))}
      </View>
    )
  }, [styles, muteDisclaimerList])

  const getMuteDialogTitle = useCallback(() => {
    return !isMuted
      ? `${common.mute} ${member.name}?`
      : `${common.unmute} ${member.name}?`
  }, [common, member.name, isMuted])

  const onToggleMuteStatus = useCallback(() => {
    dispatch(memberMuteToggleCmd({ roomId, memberId, mute: !isMuted }))
  }, [dispatch, isMuted, memberId, roomId])

  const toggleMemberMute = useCallback(() => {
    showBottomSheet({
      bottomSheetType: BottomSheetEnum.ConfirmDialog,
      title: getMuteDialogTitle(),
      description: !isMuted
        ? getMemberMuteDescription()
        : adminDashboard.unmuteDisclaimer,
      closeButton: true,
      buttons: [
        {
          text: !isMuted ? common.mute : common.unmute,
          type: TextButtonType.danger,
          onPress: () => {
            onToggleMuteStatus()
            closeBottomSheet()
          },
        },
      ],
      confirmButton: {
        text: common.cancel,
        type: TextButtonType.secondary,
        onPress: () => {
          closeBottomSheet()
        },
      },
    })
  }, [
    isMuted,
    common,
    adminDashboard,
    getMuteDialogTitle,
    onToggleMuteStatus,
    getMemberMuteDescription,
  ])

  return (
    <View style={s.container}>
      <NavBar title={member.displayName!} middle={null} right={null} />
      <View style={s.container}>
        <View style={[s.centeredLayout, styles.avatarContainer]}>
          <MemberAvatar member={member} style={styles.avatar} />
          <View style={s.centerAlignedRow}>
            <Text style={styles.name}>{member.displayName}</Text>
            <MemberTag
              member={member}
              isList
              containerStyleProps={styles.tag}
            />
          </View>
        </View>

        <ButtonBase style={styles.button} onPress={goToProfile}>
          <Text style={styles.buttonText}>{adminDashboard.viewProfile}</Text>
          <SvgIcon
            name="info"
            color={colors.white_snow}
            width={UI_SIZE_20}
            height={UI_SIZE_20}
          />
        </ButtonBase>

        {isLastAdmin ? (
          <View style={[s.centerAlignedRow, styles.disclaimer]}>
            <SvgIcon
              name="info"
              color={colors.blue_200}
              width={UI_SIZE_20}
              height={UI_SIZE_20}
              style={styles.disclaimerIcon}
            />
            <Text style={styles.disclaimerText}>
              {adminDashboard.lastAdminDisclaimer}
            </Text>
          </View>
        ) : (
          (!member.canIndex || me.canIndex) && (
            <>
              <Text style={styles.label}>{adminDashboard.membersRole}</Text>
              <ButtonBase style={styles.button} onPress={chooseRole}>
                <Text
                  style={[
                    styles.buttonText,
                    member.canModerate && { color: member.theme?.color },
                  ]}
                >
                  {member.canIndex
                    ? inviteType.admin
                    : member.canModerate
                      ? inviteType.moderator
                      : inviteType.peer}
                </Text>
                <SvgIcon
                  name="chevronRight"
                  color={colors.white_snow}
                  width={UI_SIZE_20}
                  height={UI_SIZE_20}
                />
              </ButtonBase>
            </>
          )
        )}

        {/* Temporarily disabled for this sprint
         {removeMemberSupported &&
          !isMe &&
          canRemoveMember({ myRole, managedMemberRole }) && (
            <ButtonBase style={styles.button} onPress={removeMemberConfirm}>
              <Text style={styles.buttonText}>
                {strings.room.adminDashboard.removeMember}
              </Text>
              <SvgIcon
                name="minusCircle"
                color={colors.red_400}
                width={UI_SIZE_20}
                height={UI_SIZE_20}
              />
            </ButtonBase>
          )} */}
        {canMute && (
          <>
            <ButtonBase
              style={styles.button}
              disabled={isMuteLoading}
              onPress={toggleMemberMute}
            >
              <Text style={styles.buttonText}>
                {!isMuted
                  ? adminDashboard.muteMember
                  : adminDashboard.unmuteMember}
              </Text>
              <SvgIcon
                name="userBan"
                color={colors.white_snow}
                width={UI_SIZE_20}
                height={UI_SIZE_20}
              />
            </ButtonBase>
            <Text style={styles.muteDescription}>
              {isMuted
                ? adminDashboard.mutedMemberDescription
                : adminDashboard.unmutedMemberDescription}
            </Text>
          </>
        )}
      </View>
    </View>
  )
})

export default memo(ManageMemberScreen)

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    avatar: {
      borderRadius: UI_SIZE_32,
      height: UI_SIZE_64,
      width: UI_SIZE_64,
    },
    avatarContainer: {
      marginVertical: UI_SIZE_64,
    },
    button: {
      ...s.centerAlignedRow,
      ...s.flexSpaceBetween,
      backgroundColor: theme.color.grey_700,
      borderRadius: UI_SIZE_16,
      marginHorizontal: UI_SIZE_16,
      marginTop: UI_SIZE_16,
      padding: UI_SIZE_16,
    },
    buttonText: {
      ...theme.text.body,
      fontSize: 15,
    },
    disclaimer: {
      backgroundColor: theme.color.blue_950,
      borderRadius: UI_SIZE_8,
      marginHorizontal: UI_SIZE_16,
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
    extraBottom: {
      marginBottom: UI_SIZE_14,
    },
    label: {
      ...theme.text.title2,
      fontSize: UI_SIZE_14,
      marginHorizontal: UI_SIZE_16,
      marginTop: UI_SIZE_24,
    },
    muteDescription: {
      ...theme.text.body,
      color: theme.color.grey_200,
      fontSize: UI_SIZE_14,
      lineHeight: 21,
      marginHorizontal: UI_SIZE_16,
      marginLeft: UI_SIZE_32,
      marginTop: UI_SIZE_8,
    },
    muteDisclaimer: {
      ...theme.text.body,
      fontSize: UI_SIZE_14,
      lineHeight: 21,
      marginLeft: UI_SIZE_8,
      marginTop: -UI_SIZE_2,
    },
    muteDisclaimerWrapper: {
      paddingHorizontal: UI_SIZE_8,
      paddingRight: UI_SIZE_32,
    },
    name: {
      ...theme.text.title,
      marginTop: UI_SIZE_16,
    },
    tag: {
      marginBottom: -UI_SIZE_16,
      marginStart: UI_SIZE_8,
    },
  })
  return styles
})
