import React, { useEffect } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { Image } from 'expo-image'

import { ButtonBase } from 'component/Button'
import SvgIcon from 'component/SvgIcon'
import { createThemedStylesheet } from 'component/theme'
import s, {
  UI_SIZE_2,
  UI_SIZE_8,
  UI_SIZE_10,
  UI_SIZE_12,
  UI_SIZE_14,
  UI_SIZE_64,
} from 'lib/commonStyles'
import { getMessageCellAvailableWidth, readableFileSize } from 'lib/size'

import { useStrings } from 'i18n/strings'

import { ChatEventFileMediaProps } from './ChatEventFileImage'

const EXTRA_CELL_PADDING = 40

interface OutOfProportionType extends Partial<ChatEventFileMediaProps> {
  onPress: () => void
  onLoad: () => void
  onLoadError: () => void
  source?: string
  path: string
  byteLength: number
}

function ChatEventFileOutOfProportion({
  onPress,
  onLongPress,
  onLoad,
  onLoadError,
  source,
  path: name,
  byteLength,
}: OutOfProportionType) {
  const strings = useStrings()
  const styles = getStyles()

  useEffect(() => {
    onLoad()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <ButtonBase
      onPress={onPress}
      onLongPress={onLongPress}
      style={[s.row, styles.container]}
      disableFade
    >
      {source ? (
        <Image
          source={source}
          contentFit="cover"
          contentPosition="left"
          style={styles.image}
          onLoad={onLoad}
          onError={onLoadError}
        />
      ) : (
        <SvgIcon
          name="chat_placeholder_image"
          width={UI_SIZE_64}
          height={UI_SIZE_64}
        />
      )}
      <View style={styles.innerWrapper}>
        <Text numberOfLines={1} style={styles.text}>
          {name}
        </Text>
        <Text style={styles.fileSize}>{readableFileSize(byteLength)}</Text>
        <Text style={[styles.text, styles.text2]}>
          {strings.chat.openImage}
        </Text>
      </View>
    </ButtonBase>
  )
}

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    container: {
      backgroundColor: theme.color.grey_700,
      borderRadius: UI_SIZE_8,
      padding: UI_SIZE_10,
      ...s.fullWidth,
    },
    fileSize: {
      ...theme.text.bodySemiBold,
      color: theme.color.grey_300,
      fontSize: UI_SIZE_12,
    },
    image: {
      borderRadius: theme.border.radiusLarge,
      height: UI_SIZE_64,
      width: UI_SIZE_64,
    },
    innerWrapper: {
      flexShrink: 1,
      justifyContent: 'center',
      maxWidth: getMessageCellAvailableWidth() - EXTRA_CELL_PADDING,
      paddingLeft: UI_SIZE_10,
    },
    text: {
      ...theme.text.bodySemiBold,
      fontSize: UI_SIZE_14,
    },
    text2: {
      color: theme.color.blue_400,
      marginTop: UI_SIZE_2,
    },
  })
  return styles
})

export default ChatEventFileOutOfProportion
