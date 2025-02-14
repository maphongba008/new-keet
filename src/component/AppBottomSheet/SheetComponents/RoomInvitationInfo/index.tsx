import React, { memo } from 'react'
import { StyleSheet, Text, View, type TextStyle } from 'react-native'

import SvgIcon, { SvgIconType } from 'component/SvgIcon'
import { createThemedStylesheet } from 'component/theme'
import s, { DIRECTION_CODE, UI_SIZE_8, UI_SIZE_24 } from 'lib/commonStyles'

import { useStrings } from 'i18n/strings'

type RoomInvitation = {
  icon: SvgIconType
  text: string
  textStyle: TextStyle
}

const RoomInvitationItem = memo(({ icon, text, textStyle }: RoomInvitation) => {
  return (
    <View style={[s.centerAlignedRow, { gap: UI_SIZE_8 }]}>
      <SvgIcon name={icon} />
      <Text style={textStyle}>{text}</Text>
    </View>
  )
})

const RoomInvitationInfo = memo(() => {
  const strings = useStrings()
  const styles = getStyles()

  return (
    <View style={{ gap: UI_SIZE_24 }}>
      <Text style={styles.title}>{strings.room.dialog.inviteInfo}</Text>
      <View style={styles.list}>
        <RoomInvitationItem
          icon="peer_icon"
          text={strings.room.inviteType.peer}
          textStyle={styles.semiTitle}
        />
        <RoomInvitationItem
          icon="check_star_icon"
          text={strings.room.dialog.peer1}
          textStyle={styles.listText}
        />
        <RoomInvitationItem
          icon="check_star_icon"
          text={strings.room.dialog.peer2}
          textStyle={styles.listText}
        />
      </View>
      <View style={styles.list}>
        <RoomInvitationItem
          icon="moderator_icon"
          text={strings.room.inviteType.moderator}
          textStyle={styles.semiTitle}
        />
        <RoomInvitationItem
          icon="check_star_icon"
          text={strings.room.dialog.moderator1}
          textStyle={styles.listText}
        />
        <RoomInvitationItem
          icon="check_star_icon"
          text={strings.room.dialog.moderator2}
          textStyle={styles.listText}
        />
        <RoomInvitationItem
          icon="check_star_icon"
          text={strings.room.dialog.moderator3}
          textStyle={styles.listText}
        />

        <RoomInvitationItem
          icon="check_star_icon"
          text={strings.room.dialog.moderator5}
          textStyle={styles.listText}
        />
      </View>
      <View style={styles.list}>
        <RoomInvitationItem
          icon="admin_icon"
          text={strings.room.inviteType.admin}
          textStyle={styles.semiTitle}
        />
        <RoomInvitationItem
          icon="check_star_icon"
          text={strings.room.dialog.admin1}
          textStyle={styles.listText}
        />
        <RoomInvitationItem
          icon="check_star_icon"
          text={strings.room.dialog.admin2}
          textStyle={styles.listText}
        />
        <RoomInvitationItem
          icon="check_star_icon"
          text={strings.room.dialog.moderator4}
          textStyle={styles.listText}
        />
      </View>
    </View>
  )
})

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    list: {
      gap: UI_SIZE_8,
    },
    listText: {
      ...theme.text.body,
      flexWrap: 'nowrap',
      flex: 1,
      writingDirection: DIRECTION_CODE,
    },
    semiTitle: {
      ...theme.text.title2,
      writingDirection: DIRECTION_CODE,
    },
    title: {
      ...theme.text.title,
      writingDirection: DIRECTION_CODE,
    },
  })
  return styles
})

export default RoomInvitationInfo
