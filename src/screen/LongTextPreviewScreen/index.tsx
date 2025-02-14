import { useMemo } from 'react'
import { ScrollView, StyleSheet, Text, View } from 'react-native'
import { TextInput } from 'react-native-gesture-handler'

import GestureContainer from 'component/GestureContainer'
import { NavBar } from 'component/NavBar'
import { createThemedStylesheet } from 'component/theme'
import TextMessageDisplay from 'screen/RoomScreen/ChatEvent/ChatEventMessage/TextMessageDisplay'
import { DIRECTION_CODE, UI_SIZE_16 } from 'lib/commonStyles'
import { useMember } from 'lib/hooks/useMember'
import { getRoomTypeFlags, useConfig } from 'lib/hooks/useRoom'
import { isIOS } from 'lib/platform'
import { StyledFragments } from 'lib/types'

import { useStrings } from 'i18n/strings'

type props = {
  route: {
    params: {
      roomId: string
      memberId: string
      onPress?: (url: string) => void
      messageId: string
      text: string
      fragments?: StyledFragments
      asPlainText?: boolean
    }
  }
}
const LongTextPreviewScreen = (props: props) => {
  const {
    memberId,
    messageId,
    text,
    fragments,
    roomId,
    onPress,
    asPlainText = false,
  } = props.route.params
  const { title, roomType } = useConfig(roomId)
  const { isChannel } = getRoomTypeFlags(roomType)
  const { member } = useMember(roomId, memberId)
  const name = member?.displayName ?? ''
  const styles = getStyles()
  const strings = useStrings()

  const header = useMemo(() => {
    return isChannel
      ? title
      : `${title} - ${strings.chat.chatFrom.replace('$1', name)}`
  }, [name, isChannel, strings.chat.chatFrom, title])

  return (
    <GestureContainer>
      <NavBar title={header} centerTitle showTapToCallButton />

      <View style={styles.navContainer}>
        {!asPlainText ? (
          <ScrollView>
            <TextMessageDisplay
              roomId={roomId}
              memberId={memberId}
              messageId={messageId}
              text={text}
              styledFragments={fragments}
              expanded={true}
              onPress={onPress}
            />
          </ScrollView>
        ) : isIOS ? (
          <TextInput
            multiline
            editable={false}
            selection={{ start: 0 }}
            style={styles.text}
          >
            {text}
          </TextInput>
        ) : (
          <ScrollView>
            <Text style={styles.text}>{text}</Text>
          </ScrollView>
        )}
      </View>
    </GestureContainer>
  )
}

export default LongTextPreviewScreen

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    navContainer: {
      flex: 1,
      marginHorizontal: UI_SIZE_16,
    },
    text: {
      ...theme.text.body,
      // some Android devices can cause missing text
      // https://app.asana.com/0/1204361817407975/1206494428758633/f
      letterSpacing: isIOS ? -0.3 : undefined,
      writingDirection: DIRECTION_CODE,
    },
  })
  return styles
})
