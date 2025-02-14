import React, { useCallback, useState } from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'

import { MarkDown } from 'component/MarkDown'
import { createThemedStylesheet } from 'component/theme'
import { UI_SIZE_2, UI_SIZE_4 } from 'lib/commonStyles'

import { useStrings } from 'i18n/strings'

const DescriptionComponent = ({ description }: { description: string }) => {
  const styles = getStyles()
  const strings = useStrings()
  const [isFullDescriptionShown, setIsFullDescriptionShown] = useState(false)

  // Function to truncate text to the first 4 rows or 100 characters, whichever is less
  const truncateText = (text: string, maxChars: number, maxRows: number) => {
    const splitText = text.split('\n')
    let truncatedText = ''
    let currentChars = 0

    for (let i = 0; i < Math.min(splitText.length, maxRows); i++) {
      if (currentChars + splitText[i].length > maxChars) {
        truncatedText += splitText[i].substring(0, maxChars - currentChars)
        break
      } else {
        truncatedText += (i > 0 ? '\n' : '') + splitText[i]
        currentChars += splitText[i].length
        if (currentChars >= maxChars) break
      }
    }

    return truncatedText
  }

  const toggleDescription = useCallback(() => {
    setIsFullDescriptionShown(!isFullDescriptionShown)
  }, [isFullDescriptionShown])

  const maxLength = 100
  const maxRows = 4
  const shouldTruncate =
    description?.length > maxLength || description?.split('\n').length > maxRows

  const displayDescription =
    (shouldTruncate && !isFullDescriptionShown
      ? `${truncateText(description, maxLength, maxRows)}...`
      : description) ?? ''

  return (
    <View>
      {description && (
        <>
          <MarkDown md={displayDescription} />
          {shouldTruncate && (
            <TouchableOpacity onPress={toggleDescription}>
              <Text style={styles.editText}>
                {isFullDescriptionShown
                  ? strings.room.settings.seeLess
                  : strings.room.settings.seeMore}
              </Text>
            </TouchableOpacity>
          )}
        </>
      )}
    </View>
  )
}

export default DescriptionComponent

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    editText: {
      ...theme.text.body,
      color: theme.color.blue_400,
      fontSize: 14,
      marginTop: UI_SIZE_4 + UI_SIZE_2,
    },
  })
  return styles
})
