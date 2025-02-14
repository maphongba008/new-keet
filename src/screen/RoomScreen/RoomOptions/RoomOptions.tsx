import React, { useCallback, useEffect, useRef, useState } from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import { ScrollView } from 'react-native-gesture-handler'
import _debounce from 'lodash/debounce'
import _get from 'lodash/get'

import roomsApi from '@holepunchto/keet-store/api/rooms'
import { getCanMyMemberManageRoles } from '@holepunchto/keet-store/store/member'
import {
  getPreferencesNotificationsType,
  getPreferencesRoomNotifications,
  NOTIFICATIONS_TYPES,
} from '@holepunchto/keet-store/store/preferences'
import {
  createRoomInvitation,
  getRoomInvitation,
  leaveRoomAsk,
} from '@holepunchto/keet-store/store/room'

import { toggleRoomPushNotificationAction } from 'sagas/pushNotificationsSaga'

import { showBottomSheet } from 'component/AppBottomSheet/AppBottomSheet'
import BottomSheetEnum from 'component/AppBottomSheet/SheetComponents/BottomSheetEnum'
import GestureContainer from 'component/GestureContainer'
import { NavBar } from 'component/NavBar'
import { RoomParticipants } from 'component/RoomParticipants'
import { RoomTitle } from 'component/RoomTitle'
import SvgIcon from 'component/SvgIcon'
import { createThemedStylesheet, useTheme } from 'component/theme'
import { APPIUM_IDs, appiumTestProps } from 'lib/appium'
import { SHOW_PUSH_NOTIFICATION_OPTION } from 'lib/build.constants'
import s, {
  TRANSPARENT,
  UI_SIZE_2,
  UI_SIZE_4,
  UI_SIZE_8,
  UI_SIZE_12,
  UI_SIZE_14,
  UI_SIZE_16,
  UI_SIZE_20,
  UI_SIZE_24,
  UI_SIZE_32,
  UI_SIZE_48,
} from 'lib/commonStyles'
import {
  BACK_DEBOUNCE_DELAY,
  BACK_DEBOUNCE_OPTIONS,
  INPUT_DEBOUNCE_WAIT_TIME,
  INVITE_DURATION,
  STATS_MAX_TAPS,
} from 'lib/constants'
import WithRoomIdRendered from 'lib/hoc/withRoomIdRendered'
import { useGetInvitationPreview } from 'lib/hooks/useGetInvitationPreview'
import { getInvitationShareText } from 'lib/hooks/useInvitation'
import { useIsDowngradeSupported } from 'lib/hooks/useIsFeatureSupported'
import { getRoomTypeFlags, useConfig, useMembership } from 'lib/hooks/useRoom'
import { showErrorNotifier } from 'lib/hud'
import {
  navigate,
  SCREEN_ADMINS_AND_MODS,
  SCREEN_EDIT_ROOM_DETAILS,
  SCREEN_ROOM_FILES,
  SCREEN_ROOM_INVITE,
} from 'lib/navigation'
import { shareText } from 'lib/share'

import { useStrings } from 'i18n/strings'

import DescriptionComponent from './DescriptionComponent'
import RoomOptionSwitch from './RoomOptionSwitch'
import RoomProfileIcon from './RoomProfileIcon'

const { useUpdateConfigMutation } = roomsApi

const SHOW_ADMIN_TOGGLE = false

export const RoomOptionsScreen = WithRoomIdRendered(
  ({ roomId, route }: any) => {
    const dispatch = useDispatch()
    const { memberId } = _get(route, 'params', {})
    const { title, description, roomType, experimental, canCall } =
      useConfig(roomId)
    const { isChannel, isDm } = getRoomTypeFlags(roomType)
    const isDowngradeSupported = useIsDowngradeSupported(roomId)
    const { canModerate } = useMembership(roomId)
    const canManageRoles: boolean = useSelector(
      getCanMyMemberManageRoles(roomId),
    )
    const invitation = useSelector(getRoomInvitation)
    const isNotificationsOn: boolean = useSelector((state) =>
      getPreferencesRoomNotifications(state, roomId),
    )
    const notificationsType = useSelector(getPreferencesNotificationsType)
    const [updateConfig, { isError }] = useUpdateConfigMutation()
    const shareRef = useRef(false)

    const theme = useTheme()
    const strings = useStrings()
    const styles = getStyles()
    const tapCount = useRef(0)

    const [isEnabled, setIsEnabled] = useState(false)
    const showInviteOpts = !isDm
    const canLeaveRoom = !isDm
    const showCallOption = !!canModerate && !isChannel
    const showAdminAndModOption =
      !!canManageRoles && !!isDowngradeSupported && !isDm

    const getInvitationPreview = useGetInvitationPreview({})

    useEffect(() => {
      if (shareRef.current === true && invitation) {
        const textToShare = getInvitationShareText(
          strings,
          title,
          INVITE_DURATION.WEEKS,
          invitation,
        )

        shareText(textToShare)
        shareRef.current = false
      }
    }, [invitation, title, strings, strings.room])

    useEffect(() => {
      if (isError) showErrorNotifier(strings.room.roomEditError, false)
    }, [isError, strings])

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const toggleNotification = useCallback(
      _debounce(
        () => {
          if (
            SHOW_PUSH_NOTIFICATION_OPTION &&
            notificationsType === NOTIFICATIONS_TYPES.NONE
          ) {
            showErrorNotifier(
              strings.notifications.notificationsDisabled,
              false,
            )
            return
          }
          if (!roomId) return
          dispatch(toggleRoomPushNotificationAction(roomId))
        },
        INPUT_DEBOUNCE_WAIT_TIME,
        BACK_DEBOUNCE_OPTIONS,
      ),
      [dispatch, roomId],
    )

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const toggleCallConfig = useCallback(
      _debounce(
        () => {
          updateConfig({ roomId, key: 'canCall', value: String(!canCall) })
        },
        INPUT_DEBOUNCE_WAIT_TIME,
        BACK_DEBOUNCE_OPTIONS,
      ),
      [canCall, roomId, updateConfig],
    )

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const shareLink = useCallback(
      _debounce(
        async () => {
          if (roomId) {
            const invitationPreview = await getInvitationPreview()
            dispatch(
              createRoomInvitation({
                roomId,
                isPublic: false,
                invitationPreview,
                opts: {
                  canModerate: false,
                  canIndex: false,
                  expiration: INVITE_DURATION.WEEKS,
                  reusable: true,
                },
              }),
            )
            shareRef.current = true
          }
        },
        BACK_DEBOUNCE_DELAY,
        BACK_DEBOUNCE_OPTIONS,
      ),
      [dispatch, getInvitationPreview, roomId],
    )

    const navigateToAdminsAndModsScreen = useCallback(() => {
      navigate(SCREEN_ADMINS_AND_MODS, { roomId })
    }, [roomId])

    const navigateToEditRoomDetailsScreen = useCallback(() => {
      navigate(SCREEN_EDIT_ROOM_DETAILS, { roomId })
    }, [roomId])

    const navigateToInvitationScreen = useCallback(() => {
      navigate(SCREEN_ROOM_INVITE, { roomId })
    }, [roomId])

    const confirmLeave = useCallback(() => {
      dispatch(leaveRoomAsk(roomId))
    }, [dispatch, roomId])

    const clearAllFiles = useCallback(() => {
      showBottomSheet({
        bottomSheetType: BottomSheetEnum.ClearAllFiles,
        roomId,
      })
    }, [roomId])

    const navToRoomFiles = useCallback(() => {
      navigate(SCREEN_ROOM_FILES, {
        data: roomId,
      })
    }, [roomId])

    const toggleSwitch = useCallback(() => {
      setIsEnabled(!isEnabled)
    }, [isEnabled])

    const handleNavTitleMultiTap = useCallback(() => {
      tapCount.current += 1
      if (tapCount.current === STATS_MAX_TAPS) {
        tapCount.current = 0
        showBottomSheet({
          bottomSheetType: BottomSheetEnum.RoomOptionsStats,
          roomId,
        })
      }
    }, [roomId])

    return (
      <GestureContainer>
        <NavBar
          title={strings.room.options}
          middle={null}
          right={null}
          showTapToCallButton
          onClickTitle={handleNavTitleMultiTap}
        />
        <View style={s.container}>
          <ScrollView
            keyboardDismissMode="on-drag"
            contentInsetAdjustmentBehavior="always"
            contentContainerStyle={styles.scrollView}
          >
            <View style={styles.titleView}>
              <RoomProfileIcon roomId={roomId} large />
              <View style={styles.titleWrapper}>
                {experimental && (
                  <SvgIcon
                    name="pear_gray"
                    color={theme.color.blue_400}
                    width={UI_SIZE_16}
                    height={UI_SIZE_16}
                  />
                )}
                <RoomTitle
                  fontSize={20}
                  title={title ?? `${strings.common.loading}...`}
                  style={styles.title}
                />
                {!isDm && <DescriptionComponent description={description!} />}
                {canModerate && !isDm && (
                  <TouchableOpacity
                    onPress={navigateToEditRoomDetailsScreen}
                    {...appiumTestProps(APPIUM_IDs.options_edit_details)}
                  >
                    <Text style={styles.editText}>
                      {strings.room.settings.editRoomDetails}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
            <Text style={styles.widgetTitle}>
              {strings.room.settings.title}
            </Text>
            <RoomOptionSwitch
              iconName="bell"
              title={strings.room.notificationsSettings}
              bottomSeparator
              switchOption={{
                value: isNotificationsOn,
                onChange: toggleNotification,
              }}
            />
            {isChannel && canModerate && SHOW_ADMIN_TOGGLE && (
              <RoomOptionSwitch
                iconName="chatCenteredDots"
                iconSize={UI_SIZE_24}
                title={strings.room.settings.adminOnly}
                bottomSeparator
                switchOption={{ value: isEnabled, onChange: toggleSwitch }}
              />
            )}
            <RoomOptionSwitch
              iconName="image"
              title={strings.room.settings.mediaDownload}
              onPress={navToRoomFiles}
              hint="room-files"
              testID={APPIUM_IDs.options_btn_files}
            />

            {(showCallOption || showAdminAndModOption) && (
              <Text style={styles.widgetTitle}>
                {strings.room.adminDashboard.title}
              </Text>
            )}
            {showCallOption && (
              <RoomOptionSwitch
                iconName="phone"
                title={strings.room.callsSettings}
                bottomSeparator
                switchOption={{ value: canCall, onChange: toggleCallConfig }}
              />
            )}
            {showAdminAndModOption && (
              <RoomOptionSwitch
                iconName="shield"
                title={strings.room.adminDashboard.adminsAndMods}
                onPress={navigateToAdminsAndModsScreen}
                hint="admins-and-mods"
              />
            )}

            {showInviteOpts && (
              <>
                <Text style={styles.widgetTitle}>{strings.room.invite}</Text>
                <View style={styles.widgetWrapper}>
                  <RoomOptionSwitch
                    iconName="link"
                    iconSize={UI_SIZE_16}
                    title={strings.room.shareRoomLink}
                    onPress={shareLink}
                    isLoading={shareRef.current && !invitation}
                    hint="share-room-link"
                    testID={APPIUM_IDs.options_btn_share_link}
                    noBorderRadius
                    contentBottomSeparator
                  />
                  <RoomOptionSwitch
                    iconName="qrcode"
                    title={strings.room.shareRoomQR}
                    onPress={navigateToInvitationScreen}
                    hint="share-room-qr"
                    testID={APPIUM_IDs.options_btn_share_qr}
                    noBorderRadius
                  />
                </View>
              </>
            )}
            <Text style={styles.widgetTitle}>{strings.room.members}</Text>
            <View
              style={[
                styles.widgetWrapper,
                styles.widgetSeparator,
                styles.participants,
              ]}
            >
              <RoomParticipants compact roomId={roomId} memberId={memberId} />
            </View>

            <View style={styles.widgetWrapper}>
              <RoomOptionSwitch
                iconName="trash"
                title={strings.downloads.clearCache}
                onPress={clearAllFiles}
                hint="clear-files"
                testID={APPIUM_IDs.options_btn_clear_files}
                noBorderRadius
                contentBottomSeparator={canLeaveRoom}
              />
              {canLeaveRoom && (
                <RoomOptionSwitch
                  iconName="arrowRightFromBracket"
                  iconColor={theme.color.danger}
                  title={strings.room.leave}
                  titleStyle={styles.leaveText}
                  onPress={confirmLeave}
                  hint="leave-room"
                  testID={APPIUM_IDs.options_btn_leave}
                  noBorderRadius
                />
              )}
            </View>
          </ScrollView>
        </View>
      </GestureContainer>
    )
  },
)

export default RoomOptionsScreen

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    editText: {
      ...theme.text.body,
      color: theme.color.blue_400,
      fontSize: UI_SIZE_14,
      marginTop: UI_SIZE_4 + UI_SIZE_2,
    },
    leaveText: {
      color: theme.color.danger,
    },
    participants: {
      minHeight: UI_SIZE_48,
    },
    scrollView: {
      paddingHorizontal: UI_SIZE_16,
    },
    title: {
      ...theme.text.body,
      ...theme.text.bodySemiBold,
      flexShrink: 1,
      fontSize: UI_SIZE_20,
      paddingVertical: 0,
    },
    titleView: {
      ...s.centeredLayout,
      paddingTop: UI_SIZE_32,
    },
    titleWrapper: {
      ...s.centeredLayout,
      borderColor: TRANSPARENT,
      borderRadius: theme.border.radiusLarge,
      borderWidth: theme.border.width,
      marginTop: UI_SIZE_16,
      paddingHorizontal: UI_SIZE_16,
      paddingVertical: UI_SIZE_8,
      width: '100%',
    },
    widgetSeparator: {
      marginBottom: UI_SIZE_16,
    },
    widgetTitle: {
      ...theme.text.body,
      marginBottom: UI_SIZE_8,
      marginTop: UI_SIZE_16,
    },
    widgetWrapper: {
      backgroundColor: theme.color.grey_600,
      borderRadius: UI_SIZE_12,
      overflow: 'hidden',
    },
  })
  return styles
})
