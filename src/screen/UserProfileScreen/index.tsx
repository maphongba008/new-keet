import React from 'react'
import { StyleSheet, View } from 'react-native'

import GestureContainer from 'component/GestureContainer'
import { NavBar, ScreenSystemBars } from 'component/NavBar'
import { createThemedStylesheet } from 'component/theme'
import { UI_SIZE_16 } from 'lib/commonStyles'
import { useAppRoute } from 'lib/hooks/useAppNavigation'
import { useIsDmSupported } from 'lib/hooks/useIsFeatureSupported'
import { useMember } from 'lib/hooks/useMember'
import { useMembership } from 'lib/hooks/useRoom'
import { SCREEN_USER_PROFILE } from 'lib/navigation'

import { useStrings } from 'i18n/strings'

import { Avatar } from './Avatar'
import { BlockView } from './BlockView'
import { DMView } from './DMView'
import { UsernameView } from './UsernameView'

const UserProfileScreen = () => {
  const styles = getStyles()
  const strings = useStrings()
  const {
    params: { memberId, roomId },
  } = useAppRoute<typeof SCREEN_USER_PROFILE>()
  const { memberId: myMemberId } = useMembership(roomId ?? '')

  const { member } = useMember(roomId, memberId)

  const canBlock = myMemberId !== memberId
  const canSendDMRequest = useIsDmSupported(roomId) && myMemberId !== memberId
  return (
    <GestureContainer>
      <ScreenSystemBars />
      <NavBar title={strings.chat.userProfile.profile} />
      <Avatar {...{ member, roomId }} />
      <View style={styles.container}>
        {canSendDMRequest && <DMView {...{ member }} />}
        <UsernameView {...{ member }} />
        {canBlock && <BlockView {...{ member }} />}
      </View>
    </GestureContainer>
  )
}

export default UserProfileScreen

const getStyles = createThemedStylesheet(() => {
  const styles = StyleSheet.create({
    container: {
      paddingHorizontal: UI_SIZE_16,
    },
  })
  return styles
})
