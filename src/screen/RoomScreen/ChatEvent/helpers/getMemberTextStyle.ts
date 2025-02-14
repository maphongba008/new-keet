import { StyleSheet } from 'react-native'

import { createThemedStylesheet } from 'component/theme'
import { DIRECTION_CODE } from 'lib/commonStyles'
import { MemberType } from 'lib/types'

export const getMemberTextStyle = (member: MemberType) => {
  const styles = getStyles()

  const isAdmin = member?.canModerate && member?.canIndex
  const isModerator = member?.canModerate
  const isMe = member?.isLocal

  if (isMe) {
    return styles.textMention
  }
  if (isAdmin) {
    return [styles.textMention, styles.adminLabel]
  }
  if (isModerator) {
    return [styles.textMention, styles.modLabel]
  }
  return styles.textMention
}

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    adminLabel: {
      color: theme.memberTypes.admin,
    },
    modLabel: {
      color: theme.memberTypes.mod,
    },
    textMention: {
      ...theme.text.bodyBold,
      fontSize: 15,
      lineHeight: 20,
      textAlignVertical: 'center',
      writingDirection: DIRECTION_CODE,
    },
  })
  return styles
})
