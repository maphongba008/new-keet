import React, { memo, useCallback, useContext } from 'react'
import { StyleSheet, Text } from 'react-native'
import { useSelector } from 'react-redux'

import { getAppCurrentRoomId } from '@holepunchto/keet-store/store/app'

import { createThemedStylesheet } from 'component/theme'
import { useMember } from 'lib/hooks/useMember'
import { getMentionsColorByMemberRole } from 'lib/md'
import { navigate, SCREEN_USER_PROFILE } from 'lib/navigation'

import { DisplayTypeContext } from './DisplayTypeContext'

interface DisplayTypeMentionProps {
  roomId?: string
  memberId: string
  content: string | React.JSX.Element
}

const DisplayTypeMention = memo(
  ({ roomId, memberId, content }: DisplayTypeMentionProps) => {
    const { textStyle } = useContext(DisplayTypeContext)
    const styles = getStyles()
    const { member } = useMember(roomId!, memberId)
    const color = getMentionsColorByMemberRole(member)
    const currentRoomId = useSelector(getAppCurrentRoomId)
    const hasTrailingSpace = String(content).endsWith(' ')
    const onPressMember = useCallback(() => {
      navigate(SCREEN_USER_PROFILE, {
        memberId,
        roomId,
      })
    }, [memberId, roomId])

    return (
      // only navigate to user profile if user is in the room screen
      <Text
        onPress={currentRoomId ? onPressMember : undefined}
        style={[styles.link, textStyle, { color }]}
      >
        @{member.displayName}
        {hasTrailingSpace ? ' ' : ''}
      </Text>
    )
  },
)

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    link: {
      color: theme.color.blue_400,
      flexShrink: 1,
      flexWrap: 'wrap',
    },
  })
  return styles
})

export default DisplayTypeMention
