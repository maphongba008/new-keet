import React, { memo, useMemo } from 'react'
import { StyleSheet, Text, TextStyle, View, ViewStyle } from 'react-native'
import isEqual from 'react-fast-compare'
import _truncate from 'lodash/truncate'

import { ROOM_TYPE } from '@holepunchto/keet-store/store/room/room.constants'

import MemberTag from 'component/MemberTag'
import { createThemedStylesheet } from 'component/theme'
import { APPIUM_IDs, appiumTestProps } from 'lib/appium'
import s, { UI_SIZE_4 } from 'lib/commonStyles'
import { useMember } from 'lib/hooks/useMember'
import { getRoomTypeFlags, useConfig } from 'lib/hooks/useRoom'

import { useStrings } from 'i18n/strings'

interface ChatEventHeaderProps {
  memberId: string
  roomId: string
  isBlockedUser?: boolean
  styleProps?: TextStyle | ViewStyle
  containerStyleProps?: ViewStyle
}

export const PROFILE_NAME_MAX_LENGTH = 35 // The longest possible generated name is 35 characters (Magnificent African Forest Elephant)

const ChatEventHeader = memo(
  ({
    memberId,
    roomId,
    isBlockedUser = false,
    styleProps,
    containerStyleProps,
  }: ChatEventHeaderProps) => {
    const { member } = useMember(roomId, memberId)
    const { title, roomType } = useConfig(roomId)

    const styles = getStyles()
    const strings = useStrings()

    const isAdmin = member?.canModerate && member?.canIndex
    const isModerator = member?.canModerate
    const { isChannel, isDm } = getRoomTypeFlags(roomType)

    const isMemberTagVisible =
      (isAdmin || isModerator) &&
      roomType !== ROOM_TYPE.DM &&
      !isBlockedUser &&
      !isDm

    const text = useMemo(() => {
      if (isBlockedUser) {
        return strings.chat.blockedUserName
      }

      if (isChannel && (isAdmin || isModerator)) {
        return title
      }

      return member?.displayName
    }, [
      isBlockedUser,
      isChannel,
      isAdmin,
      isModerator,
      member?.displayName,
      strings.chat.blockedUserName,
      title,
    ])

    const textStyle = useMemo(() => {
      let emptyStyle = {}
      if (isDm) {
        return emptyStyle
      }
      const isBroadCastWithPrivilege = isChannel && (isAdmin || isModerator)

      if (isBroadCastWithPrivilege || isBlockedUser) {
        return emptyStyle
      }
      if (isAdmin) {
        return [emptyStyle, styles.adminLabel]
      }
      if (isModerator) {
        return [emptyStyle, styles.modLabel]
      }
      return emptyStyle
    }, [
      isDm,
      isChannel,
      isAdmin,
      isModerator,
      isBlockedUser,
      styles.adminLabel,
      styles.modLabel,
    ])

    return (
      <View style={[styles.container, containerStyleProps]}>
        <Text
          style={[styles.text, textStyle, styleProps]}
          {...appiumTestProps(APPIUM_IDs.room_profile_name)}
        >
          {_truncate(text, {
            length: PROFILE_NAME_MAX_LENGTH,
          })}
        </Text>

        {isMemberTagVisible && (
          <MemberTag member={member} containerStyleProps={styles.extraMargin} />
        )}
      </View>
    )
  },
  isEqual,
)

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    adminLabel: {
      color: theme.memberTypes.admin,
    },
    container: {
      ...s.centerAlignedRow,
      flexShrink: 1,
    },
    extraMargin: {
      marginHorizontal: UI_SIZE_4,
    },
    modLabel: {
      color: theme.memberTypes.mod,
    },
    text: {
      ...theme.text.bodySemiBold,
      flexShrink: 1,
      fontSize: 12,
    },
  })
  return styles
})

export default ChatEventHeader
