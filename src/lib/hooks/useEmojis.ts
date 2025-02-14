import { useCallback, useMemo, useRef, useState } from 'react'

import { getDataOfSkin, getSkinTones } from '@holepunchto/emojis'

import { EmojiData } from 'component/AppBottomSheet/SheetComponents/ChatEventOptionsSheet/components/EmojiSheet'
import emoji_categories from 'screen/RoomScreen/ChatInput/emoji_categories.json'
import {
  getStorageEmojiSkinColor,
  setStorageEmojiSkinColor,
} from 'lib/localStorage'

const useEmojis = () => {
  const emojis = useRef<EmojiData[]>([])
  const skinTones = getSkinTones()
  const skinTone = getStorageEmojiSkinColor() ?? 0
  const [currentSkinTone, setCurrentSkinTone] = useState(skinTone)

  emojis.current = useMemo(() => {
    const emojisBySkin = getDataOfSkin(currentSkinTone)
    return emojisBySkin.filter(
      (emojiData: EmojiData) =>
        emojiData.urlRiv ||
        emoji_categories.find((category) => category.group === emojiData.group),
    )
  }, [currentSkinTone])

  const onSelectSkinTone = useCallback((tone: number) => {
    setStorageEmojiSkinColor(tone)
    setCurrentSkinTone(tone)
  }, [])

  return {
    emojis: emojis.current,
    currentSkinTone,
    skinTones,
    onSelectSkinTone,
  }
}

export { useEmojis }
