import React, { memo } from 'react'
import {
  Image,
  ImageStyle,
  StyleProp,
  StyleSheet,
  ViewStyle,
} from 'react-native'
import Rive from 'rive-react-native'

import { createThemedStylesheet } from './theme'

// All emoji rive ending follow the .riv file, we no longer control it from the code (onLoopEnd)
const EmojiRive = memo(
  ({
    style,
    shortCode,
    isDisableTouch = false,
  }: {
    style?: StyleProp<ViewStyle>
    shortCode: string
    isDisableTouch: boolean
  }) => {
    const styles = getStyles()
    let resourceName
    switch (shortCode) {
      case 'keet_laughs':
        resourceName = 'emoji_keet_laughs'
        break
      case 'keet_party':
        resourceName = 'emoji_keet_party'
        break
      case 'keet_love':
        resourceName = 'emoji_keet_love'
        break
      case 'keet_music':
        resourceName = 'emoji_keet_music'
        break
      case 'keet_pear':
        resourceName = 'emoji_pear_build'
        break
      case 'holepunch':
        resourceName = 'emoji_holepunch'
        break
      case 'tether':
        resourceName = 'emoji_tether'
        break
      case 'keet_bitcoin':
      default:
        resourceName = 'emoji_btc'
        break
    }
    const riveProps = {
      style: (style || styles.rive) as ViewStyle,
      resourceName,
      animationName: 'Timeline 1', // Named on the assert creation and it's over the all available resource
      // Rive internally has <TouchableWithoutFeedback>
      isDisableTouch,
    }
    return <Rive {...riveProps} />
  },
)

const EmojiCustomPng = memo(
  ({ style, shortCode }: { style?: ImageStyle; shortCode: string }) => {
    const styles = getStyles()
    let resourceName
    switch (shortCode) {
      case 'keet_laughs':
        resourceName = require('../resources/emojis/keet_laughs.png')
        break
      case 'keet_party':
        resourceName = require('../resources/emojis/keet_party.png')
        break
      case 'keet_love':
        resourceName = require('../resources/emojis/keet_love.png')
        break
      case 'keet_music':
        resourceName = require('../resources/emojis/keet_music.png')
        break
      case 'keet_pear':
        resourceName = require('../resources/emojis/keet_pear.png')
        break
      case 'holepunch':
        resourceName = require('../resources/emojis/holepunch.png')
        break
      case 'tether':
        resourceName = require('../resources/emojis/tether.png')
        break
      case 'keet_bitcoin':
      default:
        resourceName = require('../resources/emojis/bitcoin.png')
        break
    }
    return (
      <Image
        style={style || styles.rive}
        resizeMode="contain"
        source={resourceName}
      />
    )
  },
)
const getStyles = createThemedStylesheet(() => {
  const styles = StyleSheet.create({
    rive: { height: 40, width: 40 },
  })
  return styles
})

export { EmojiRive, EmojiCustomPng }
