import React, { memo } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { useSelector } from 'react-redux'
import isEqual from 'react-fast-compare'
import { SafeAreaView } from 'react-native-safe-area-context'

import {
  getMyMember,
  // @ts-ignore
  MEMBER_ROLE,
} from '@holepunchto/keet-store/store/member'

import {
  DIRECTION_CODE,
  UI_SIZE_2,
  UI_SIZE_8,
  UI_SIZE_12,
  UI_SIZE_14,
  UI_SIZE_16,
  UI_SIZE_40,
} from 'lib/commonStyles'
import { useMember } from 'lib/hooks/useMember'
import { useConfig } from 'lib/hooks/useRoom'

import { useStrings } from 'i18n/strings'

import { MemberAvatar } from './Avatar'
import { colorWithAlpha, createThemedStylesheet } from './theme'

export interface RoleChangeNotifierProps {
  role: number
  roomId: string
}

export interface MemberRoleChangeNotifierProps extends RoleChangeNotifierProps {
  memberId: string
}

export const SelfRoleChangeNotifier = memo(
  ({ role, roomId }: RoleChangeNotifierProps) => {
    const styles = getStyles()
    const {
      room: { adminDashboard: strings },
    } = useStrings()
    const { title } = useConfig(roomId)
    const member: any = useSelector(getMyMember(roomId))
    const text = `${
      role === MEMBER_ROLE.ADMIN
        ? strings.selfUpgradeAdminNotification
        : strings.selfUpgradeModNotification
    } ${title}`

    return (
      <SafeAreaView>
        <View style={styles.container}>
          <MemberAvatar member={member} />
          <View style={styles.textContainer}>
            <Text style={styles.text}>{text}</Text>
          </View>
        </View>
      </SafeAreaView>
    )
  },
  isEqual,
)

export const MemberRoleChangeNotifier = memo(
  ({ role, roomId, memberId }: MemberRoleChangeNotifierProps) => {
    const styles = getStyles()
    const {
      room: { adminDashboard: strings },
    } = useStrings()
    const { title } = useConfig(roomId)
    const { member } = useMember(roomId, memberId)
    const text = `${member.displayName} ${
      role === MEMBER_ROLE.ADMIN
        ? strings.memberUpgradeAdminNotification
        : role === MEMBER_ROLE.MODERATOR
          ? strings.memberUpgradeModNotification
          : strings.memberUpgradePeerNotification
    } ${title}`

    return (
      <SafeAreaView>
        <View style={styles.container}>
          <MemberAvatar member={member} />
          <View style={styles.textContainer}>
            <Text style={styles.text}>{text}</Text>
          </View>
        </View>
      </SafeAreaView>
    )
  },
  isEqual,
)

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    container: {
      alignItems: 'center',
      backgroundColor: theme.color.grey_600,
      borderColor: colorWithAlpha(theme.color.grey_500, 0.5),
      borderRadius: UI_SIZE_12,
      borderWidth: 1,
      flexDirection: 'row',
      marginHorizontal: UI_SIZE_16,
      paddingHorizontal: UI_SIZE_16,
      paddingVertical: UI_SIZE_8,
    },
    text: {
      ...theme.text.body,
      fontSize: UI_SIZE_14,
      marginBottom: UI_SIZE_2,
      marginRight: UI_SIZE_40,
      writingDirection: DIRECTION_CODE,
    },
    textContainer: {
      marginLeft: UI_SIZE_8,
    },
  })
  return styles
})
