import { createContext } from 'react'
import { TextStyle } from 'react-native'

interface DisplayTypeContextProps {
  roomId?: string
  onPress?: (url: string) => void
  onLongPress?: () => void
  textStyle?: TextStyle[] | TextStyle
  forPreview?: boolean
  isSingleEmoji?: boolean
}

export const DisplayTypeContext = createContext<DisplayTypeContextProps>({})
