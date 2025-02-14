declare module '@holepunchto/emojis' {
  import { EmojiData } from 'component/AppBottomSheet/SheetComponents/ChatEventOptionsSheet/components/EmojiSheet'

  interface EmojiMessages {
    groups: { key: string; message: string; order: number }[]
  }

  /**
   * shortCode[0] to emoji
   * 'good :coffee: is :heart_on_fire:' =>  'good ☕️ is ❤️‍🔥'
   */
  export const emojify: (
    text: string,
    format?: (emoji: string, string: string, emojiData: EmojiData) => string,
  ) => string

  // Append asset path to .riv and png
  export const initEmojis: ({ emojisPath }: { emojisPath: string }) => void

  // (tone: 0 | 1 | 2 | 3 | 4 | 5) => []
  export const getDataOfSkin: (tone: number) => []

  // (hexcode "1F600" | emoji "😀") => EmojiData
  export const getEmojiData: (string: string) => EmojiData

  // Need to filter off regional code (without group)
  export const getAllEmojisData: () => EmojiData[]

  // Only using EmojiMessages.group which is category
  export const getEmojiMessages: () => EmojiMessages

  /** Not being used */
  export const unemojify: (text: string) => string
  export const getCategories: () => string[]
  export const getCustomEmojisData: (string: string) => EmojiData
  export const getSkinTones: () => { tone: number; emoji: string }[]
}
