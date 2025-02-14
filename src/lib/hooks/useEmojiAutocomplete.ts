import { useCallback, useEffect, useState } from 'react'
import {
  NativeSyntheticEvent,
  TextInputSelectionChangeEventData,
} from 'react-native'

interface EmojiAutocompleteOptions {
  text: string
  setText: (text: string) => void
}

interface EmojiAutocompleteResult {
  prefix: string
  showAutocomplete: boolean
  complete: (shortcode: string) => void
  selection: { start: number; end: number }
  onSelectionChange: (
    event: NativeSyntheticEvent<TextInputSelectionChangeEventData>,
  ) => void
}

export const useEmojiAutocomplete = ({
  text,
  setText,
}: EmojiAutocompleteOptions): EmojiAutocompleteResult => {
  const [showAutocomplete, setShowAutocomplete] = useState(false)
  const [selection, setSelection] = useState({ start: -1, end: -1 })
  const [prefix, setPrefix] = useState('')

  const onSelectionChange = useCallback(
    (e: NativeSyntheticEvent<TextInputSelectionChangeEventData>) =>
      setSelection(e.nativeEvent.selection),
    [],
  )

  const bounds = useCallback(() => {
    const start = text.slice(0, selection.start).lastIndexOf(':')
    const end = selection.end
    return { start, end }
  }, [selection.end, selection.start, text])

  const complete = useCallback(
    (shortcode: string) => {
      const { start, end } = bounds()
      const carret = start + shortcode.length + 3 // two colons and a space
      setSelection({ start: carret, end: carret })
      setText(
        `${text.slice(0, start)}:${shortcode}: ${text.slice(end).trimStart()}`,
      )
      setPrefix('')
      setShowAutocomplete(false)
    },
    [bounds, setText, text],
  )

  useEffect(() => {
    const { start, end } = bounds()
    if (start < 0) {
      setPrefix('')
      setShowAutocomplete(false)
      return
    }
    const currentPrefix = text.slice(start + 1, end)
    if (/^[a-z0-9+\-_]+$/i.test(currentPrefix)) {
      setPrefix(currentPrefix)
      setShowAutocomplete(true)
    } else {
      setPrefix('')
      setShowAutocomplete(false)
    }
  }, [bounds, selection.start, selection.end, text])

  return { prefix, showAutocomplete, complete, selection, onSelectionChange }
}
