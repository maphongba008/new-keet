import React, { memo, useCallback, useMemo, useRef } from 'react'
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { Image } from 'expo-image'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { ButtonBase, TextButton, TextButtonType } from 'component/Button'
import LabeledCheckbox from 'component/Checkbox'
import { BackButton, NavBar } from 'component/NavBar'
import { QRCode } from 'component/QRCode'
import { RoomTitle } from 'component/RoomTitle'
import SvgIcon from 'component/SvgIcon'
import {
  colors,
  createThemedStylesheet,
  hexToRgbOpacity,
  useTheme,
} from 'component/theme'
import { APPIUM_IDs, appiumTestProps } from 'lib/appium'
import s, {
  ADMIN_WARNING_CONTAINER,
  BORDER_SEPARATOR_COLOR,
  DIRECTION_CODE,
  height,
  ICON_SIZE_16,
  UI_SIZE_4,
  UI_SIZE_8,
  UI_SIZE_12,
  UI_SIZE_16,
  UI_SIZE_20,
} from 'lib/commonStyles'
import { CAPABILITIES } from 'lib/constants'
import { getSnapshot, shareToDevice } from 'lib/share'

import { useStrings } from 'i18n/strings'

import OptionButtonGroup from './OptionButtonGroup'
import { useRoomInvite } from './RoomInvite.hook'

const QR_SIZE = 270

const RoomInvite = () => {
  const styles = getStyles()
  const strings = useStrings()
  const viewRef = useRef<View>(null)
  const theme = useTheme()

  const {
    onPressInviteInfo,
    onPressInviteTypeOptions,
    duration,
    setDuration,
    generateInvitation,
    invitation,
    roomName,
    areAdminRulesAccepted,
    invitationType,
    setAreAdminRulesAccepted,
    onCopy,
    selectedInvitationTypeText,
    isModeratorSelected,
    isAdminSelected,
    textToShare,
    qrUri,
    isChannel,
    canIndex,
  } = useRoomInvite()

  const imageSource = useMemo(
    () =>
      qrUri
        ? {
            uri: qrUri,
            width: QR_SIZE,
            height: QR_SIZE,
          }
        : null,
    [qrUri],
  )

  const { bottom: paddingBottom } = useSafeAreaInsets()

  const onPressShareQR = useCallback(async () => {
    if (!qrUri) {
      return
    }
    try {
      const filePath = await getSnapshot(viewRef.current as View)
      if (filePath) {
        await shareToDevice(filePath)
      }
    } catch (error) {
      console.log('onPressShareQR', error)
    }
  }, [qrUri])

  const capabilityStyle = useMemo(() => {
    switch (invitationType) {
      case CAPABILITIES.CAN_MODERATE:
        return [styles.label, { color: theme.memberTypes.mod }]
      case CAPABILITIES.CAN_INDEX:
        return [styles.label, { color: theme.memberTypes.admin }]
      default:
        return styles.label
    }
  }, [
    invitationType,
    styles.label,
    theme.memberTypes.admin,
    theme.memberTypes.mod,
  ])

  return (
    <>
      <NavBar left={<BackButton />} title="" />
      <ScrollView
        contentContainerStyle={[styles.scrollView, { paddingBottom }]}
      >
        <View style={{ gap: UI_SIZE_16 }}>
          <View style={s.centeredLayout}>
            <Text style={styles.titleMeta}>{strings.room.dialog.meta}</Text>
            <RoomTitle title={roomName} fontSize={24} style={styles.title} />
          </View>
          <View style={styles.separator} />
          <View style={{ gap: UI_SIZE_12 }}>
            <Pressable
              style={[s.row, s.alignItemsCenter, { gap: UI_SIZE_4 }]}
              onPress={onPressInviteInfo}
            >
              <Text style={[styles.label, styles.inviteTypeLabel]}>
                {strings.room.inviteType.label}
              </Text>
              <SvgIcon
                name="info"
                width={ICON_SIZE_16}
                height={ICON_SIZE_16}
                color={theme.color.blue_400}
              />
            </Pressable>
            <ButtonBase
              onPress={onPressInviteTypeOptions}
              style={[styles.widgetWrapper, styles.actionButton]}
              {...appiumTestProps(APPIUM_IDs.invite_btn_type)}
            >
              <Text style={capabilityStyle}>{selectedInvitationTypeText}</Text>
            </ButtonBase>
          </View>

          <View style={{ gap: UI_SIZE_8 }}>
            <Text style={[styles.label, { color: colors.keet_grey_200 }]}>
              {strings.room.expiresIn}
            </Text>
            <View style={styles.feedbackView}>
              <OptionButtonGroup
                canIndex={canIndex}
                isChannel={isChannel}
                invitationType={invitationType}
                duration={duration}
                setDuration={setDuration}
              />
            </View>
          </View>

          {isAdminSelected && (
            <>
              <Text style={styles.moderatorLabel}>
                {strings.room.adminInviteAreSingleUse}
              </Text>
              <View style={styles.adminWarningContainer}>
                <SvgIcon
                  name="info"
                  width={ICON_SIZE_16}
                  height={ICON_SIZE_16}
                  color={theme.color.el_salvador}
                />
                <Text style={[styles.label, styles.adminLabel]}>
                  {strings.room.adminInvitationAlert}
                </Text>
              </View>
              <LabeledCheckbox
                label={strings.room.acceptAdminRules}
                onChange={setAreAdminRulesAccepted}
                value={areAdminRulesAccepted}
                testProps={appiumTestProps(APPIUM_IDs.invite_btn_accept_admin)}
              />
            </>
          )}

          {isModeratorSelected && (
            <Text style={styles.moderatorLabel}>
              {strings.room.moderatorInvitationAlert}
            </Text>
          )}

          <View style={styles.separator} />

          <TextButton
            text={strings.room.generateInvite}
            type={
              isAdminSelected && !areAdminRulesAccepted
                ? TextButtonType.gray
                : TextButtonType.primary
            }
            onPress={generateInvitation}
            disabled={isAdminSelected && !areAdminRulesAccepted}
            {...appiumTestProps(APPIUM_IDs.invite_btn_generate)}
          />

          {invitation ? (
            <View style={styles.invitationContainer}>
              <View style={styles.qrWrapper}>
                <QRCode value={invitation} />
              </View>

              {/** Image when user press on share QR invite */}
              <View ref={viewRef} style={styles.shareView}>
                <Text style={styles.shareTitle}>{textToShare}</Text>
                {Boolean(imageSource) && (
                  <Image source={imageSource} style={styles.qrCodeImg} />
                )}
              </View>

              <TouchableOpacity style={styles.inviteTextRoot} onPress={onCopy}>
                <Text
                  numberOfLines={1}
                  ellipsizeMode="middle"
                  style={styles.inviteText}
                >
                  {invitation}
                </Text>
                <SvgIcon
                  width={ICON_SIZE_16}
                  height={ICON_SIZE_16}
                  name="copy"
                  color={theme.color.blue_400}
                  style={styles.inviteCopyIcon}
                />
              </TouchableOpacity>
              <TextButton
                text={strings.room.shareInvite}
                onPress={onPressShareQR}
                type={TextButtonType.primaryOutline}
              />
            </View>
          ) : null}
        </View>
      </ScrollView>
    </>
  )
}

export default memo(RoomInvite)

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    actionButton: {
      ...s.container,
      paddingHorizontal: UI_SIZE_16,
      paddingVertical: UI_SIZE_12,
    },
    adminLabel: {
      flexWrap: 'nowrap',
      flex: 1,
    },
    adminWarningContainer: {
      backgroundColor: ADMIN_WARNING_CONTAINER,
      borderColor: theme.color.el_salvador,
      borderRadius: UI_SIZE_8,
      borderWidth: theme.border.width,
      display: 'flex',
      flexDirection: 'row',
      flex: 1,
      gap: UI_SIZE_8,
      padding: UI_SIZE_8,
    },
    feedbackView: {
      ...s.centerAlignedRow,
      gap: UI_SIZE_12,
    },
    invitationContainer: {
      backgroundColor: theme.background.bg_2,
      borderRadius: UI_SIZE_12,
      gap: UI_SIZE_20,
      padding: UI_SIZE_16,
    },
    inviteCopyIcon: {
      marginLeft: UI_SIZE_8,
    },
    inviteText: {
      ...s.container,
      ...theme.text.body,
      color: theme.color.grey_200,
      writingDirection: DIRECTION_CODE,
    },
    inviteTextRoot: {
      ...s.centerAlignedRow,
      backgroundColor: theme.color.grey_600,
      borderRadius: UI_SIZE_8,
      padding: theme.spacing.normal,
    },
    inviteTypeLabel: {
      fontSize: UI_SIZE_16,
    },
    label: {
      ...theme.text.body,
      color: colors.white_snow,
      textAlign: 'left',
    },
    moderatorLabel: {
      color: theme.color.grey_300,
    },
    qrCodeImg: {
      height: QR_SIZE,
      width: QR_SIZE,
    },
    qrWrapper: {
      ...s.alignSelfCenter,
      backgroundColor: hexToRgbOpacity(colors.white_snow, 0.1),
      borderRadius: theme.border.radiusLarge,
      padding: UI_SIZE_12,
    },
    scrollView: {
      paddingHorizontal: UI_SIZE_16,
    },
    separator: {
      ...s.fullWidth,
      borderBottomColor: BORDER_SEPARATOR_COLOR,
      borderBottomWidth: 1,
      height: 1,
    },
    shareTitle: {
      ...theme.text.body,
      fontSize: 12,
      marginBottom: theme.spacing.normal,
      textAlign: 'center',
      writingDirection: DIRECTION_CODE,
    },
    shareView: {
      backgroundColor: theme.background.bg_2,
      ...s.centeredLayout,
      padding: theme.spacing.normal,
      position: 'absolute',
      top: height,
    },
    title: {
      ...theme.text.bodySemiBold,
      fontSize: 24,
      marginTop: UI_SIZE_4,
      writingDirection: DIRECTION_CODE,
    },
    titleMeta: {
      ...theme.text.body,
      color: theme.color.grey_300,
      fontSize: 14,
      writingDirection: DIRECTION_CODE,
    },
    widgetWrapper: {
      backgroundColor: theme.color.grey_600,
      borderRadius: UI_SIZE_12,
    },
  })
  return styles
})
