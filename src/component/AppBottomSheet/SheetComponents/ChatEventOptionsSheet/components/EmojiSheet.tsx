import React, { memo, useCallback, useEffect, useState } from 'react'
import { StyleSheet, Text, TouchableWithoutFeedback, View } from 'react-native'
import isEqual from 'react-fast-compare'

import { closeBottomSheet } from 'component/AppBottomSheet/AppBottomSheet.Store'
import { BtmSheetHeader } from 'component/BottomSheetBase'
import { ButtonBase } from 'component/Button'
import EmojiPicker from 'component/EmojiPicker/src'
import { createThemedStylesheet, getTheme } from 'component/theme'
import emoji_categories from 'screen/RoomScreen/ChatInput/emoji_categories.json'
import s, { height as screenHeight } from 'lib/commonStyles'
import { useEmojis } from 'lib/hooks/useEmojis'
import {
  getStorageEmojiRecent,
  getStorageEmojiSkinColor,
  setStorageEmojiRecent,
} from 'lib/localStorage'

import { useStrings } from 'i18n/strings'

export interface EmojiData {
  emoji: string
  shortCodes: string[]
  group: number
  tags: string[]
  label: string
  order: number
  subgroup: number
  text: string

  // Properties exclusively for custom emoji
  alt: string
  url: string
  urlRiv: string

  // Not being used
  hexcode: string
  type: number
  version: number
}
export type EmojiDataSuperset = EmojiData & {
  skins?: EmojiData[]
}

const SkinSelector = memo(
  ({
    onSelectSkin,
    selectedSkin,
    skinTone,
  }: {
    onSelectSkin: (index: number) => void
    selectedSkin: number
    skinTone: {
      tone: number
      emoji: string
    }
  }) => {
    const styles = getStyles()

    const onPress = useCallback(() => {
      onSelectSkin(skinTone.tone)
    }, [onSelectSkin, skinTone.tone])

    return (
      <ButtonBase
        style={[
          styles.buttonBase,
          selectedSkin === skinTone.tone && styles.buttonBaseSelected,
        ]}
        key={skinTone.emoji}
        onPress={onPress}
      >
        <Text>{skinTone.emoji}</Text>
      </ButtonBase>
    )
  },
  isEqual,
)

const EmojiSheet = ({
  onBack,
  onSelectEmoji,
  isSkipToEmojiSheet,
}: {
  onBack: () => void
  onSelectEmoji: (e: EmojiData) => void
  isSkipToEmojiSheet: boolean
}) => {
  const styles = getStyles()
  const theme = getTheme()
  const strings = useStrings()

  const [isSelectingSkin, setIsSelectingSkin] = useState(false)
  const [recentEmojis, setRecentEmojis] = useState<EmojiData[]>([])

  const { emojis, currentSkinTone, skinTones, onSelectSkinTone } = useEmojis()

  const onPressEmoji = useCallback(
    (e: EmojiData) => {
      // Add recent emoji to the front, then remove duplicate
      let tempRecentEmojis = [...recentEmojis]
      tempRecentEmojis.unshift(e)
      tempRecentEmojis = tempRecentEmojis.filter(
        (value, index, self) =>
          index === self.findIndex((t) => t.emoji === value.emoji),
      )

      setRecentEmojis(tempRecentEmojis)
      setStorageEmojiRecent(tempRecentEmojis)
      onSelectEmoji(e)
    },
    [onSelectEmoji, recentEmojis],
  )

  useEffect(() => {
    const skinColor = getStorageEmojiSkinColor()
    onSelectSkinTone(skinColor)

    const _recentEmojis = getStorageEmojiRecent()
    setRecentEmojis(_recentEmojis)
  }, [onSelectSkinTone])

  const onPressSkinSelection = useCallback(() => {
    setIsSelectingSkin(true)
  }, [])

  const dismissSkinSelection = useCallback(() => {
    setIsSelectingSkin(false)
  }, [])

  const onSelectSkin = useCallback(
    (index: number) => {
      setIsSelectingSkin(false)
      onSelectSkinTone(index)
    },
    [onSelectSkinTone],
  )

  const onCloseEmoji = useCallback(() => {
    isSkipToEmojiSheet ? closeBottomSheet() : onBack()
  }, [isSkipToEmojiSheet, onBack])

  return (
    <View style={styles.container}>
      <BtmSheetHeader
        title={strings.room.selectEmoji}
        onClose={onCloseEmoji}
        isDismissIcon={isSkipToEmojiSheet}
      />
      <View
        // eslint-disable-next-line react-native/no-inline-styles
        style={{
          opacity: isSelectingSkin ? 0.5 : 1,
          ...s.container,
        }}
      >
        {!!emojis?.length && (
          <EmojiPicker
            emojis={emojis}
            categories={emoji_categories}
            recent={recentEmojis}
            autoFocus={false}
            perLine={7}
            onSelect={onPressEmoji}
            backgroundColor={theme.modal.bg}
          />
        )}
      </View>
      {isSelectingSkin && (
        <TouchableWithoutFeedback onPress={dismissSkinSelection}>
          <View style={styles.invisibleBtn} />
        </TouchableWithoutFeedback>
      )}
      <View style={styles.skinContainer}>
        {isSelectingSkin ? (
          skinTones.map((skinTone) => {
            return (
              <SkinSelector
                key={`tone-${skinTone.emoji}`}
                skinTone={skinTone}
                onSelectSkin={onSelectSkin}
                selectedSkin={currentSkinTone}
              />
            )
          })
        ) : (
          <ButtonBase
            style={styles.singleButtonBase}
            onPress={onPressSkinSelection}
          >
            <Text>{skinTones[currentSkinTone].emoji}</Text>
          </ButtonBase>
        )}
      </View>
    </View>
  )
}

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    buttonBase: {
      ...s.container,
      ...s.centeredLayout,
      height: theme.button.height,
    },
    buttonBaseSelected: {
      backgroundColor: theme.button.successColor,
      borderRadius: theme.border.radiusLarge,
    },
    container: {
      backgroundColor: theme.modal.bg,
      height: (screenHeight / 5) * 4,
    },
    invisibleBtn: {
      position: 'absolute',
      ...s.fullHeight,
      ...s.fullWidth,
    },
    singleButtonBase: {
      height: theme.button.height,
      width: theme.button.height,
      ...s.centeredLayout,
      borderColor: theme.border.color,
      borderRadius: theme.border.radiusLarge,
      borderWidth: theme.border.width,
    },
    skinContainer: {
      ...s.row,
      ...s.justifyEnd,
      borderColor: theme.border.color,
      borderTopWidth: theme.border.width,
      padding: theme.spacing.normal,
      paddingBottom: 0,
    },
  })
  return styles
})

export default EmojiSheet
