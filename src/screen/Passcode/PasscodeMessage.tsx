import React, { memo } from 'react'
import { StyleSheet, Text } from 'react-native'

import { createThemedStylesheet } from 'component/theme'
import { UI_SIZE_8 } from 'lib/commonStyles'

import { MessageType } from './usePasscodeStore'

type PasscodeMessageProps = {
  message: string
  messageType: MessageType | null
}

const PasscodeMessage: React.FC<PasscodeMessageProps> = ({
  message,
  messageType,
}) => {
  const styles = getStyles()

  if (!message) return null

  return (
    <Text
      style={
        messageType === MessageType.Success
          ? styles.successMessage
          : styles.errorMessage
      }
    >
      {message}
    </Text>
  )
}

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    errorMessage: {
      color: theme.color.red_400,
      marginTop: UI_SIZE_8,
      textAlign: 'center',
    },
    successMessage: {
      color: theme.color.green_300,
      marginTop: UI_SIZE_8,
      textAlign: 'center',
    },
  })

  return styles
})

export default memo(PasscodeMessage)
