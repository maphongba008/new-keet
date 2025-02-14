/** Cloned from rn-emoji-picker and fitted to keet-mobile's needs */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Keyboard,
  LayoutChangeEvent,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { FlashList } from '@shopify/flash-list'
import { cloneDeep, isNumber } from 'lodash'

import { EmojiData } from 'component/AppBottomSheet/SheetComponents/ChatEventOptionsSheet/components/EmojiSheet'
import { colors } from 'component/theme'

import { useStrings } from 'i18n/strings'

import Input from './Input'
import Row from './Row'
import TabBar from './TabBar'

export interface Category {
  key: string
  message: string
  emoji: string
  group?: number
  data: EmojiData[]
}
type CategoryWithChunk = Omit<Category, 'data'> & { data: EmojiData[][] }

// chunk emoji for each row
const chunkEmojis = (emojis: EmojiData[], chunkSize = 6) => {
  const chunkedArr = []
  for (let i = 0; i < emojis.length; i += chunkSize) {
    const chunk = emojis.slice(i, i + chunkSize)
    chunkedArr.push(chunk)
  }
  return chunkedArr
}

interface EmojiPickerProps {
  categories: Category[]
  recent?: EmojiData[]
  emojis: EmojiData[]
  autoFocus: boolean
  perLine: number
  backgroundColor?: string
  onSelect: (emoji: EmojiData) => void
}
const EmojiPicker = ({
  categories = [],
  recent = [],
  emojis = [],
  autoFocus = true,
  backgroundColor = '#000',
  perLine = 8,
  onSelect,
}: EmojiPickerProps) => {
  const strings = useStrings()
  const [searchQuery, setSearchQuery] = useState('')
  const [width, setWidth] = useState(0)
  const colSize = Math.floor(width / perLine)
  const flashList = useRef<any>(null)

  const [categoryWChunkedEmoji, setCategoryWChunkedEmoji] = useState<
    CategoryWithChunk[]
  >([])
  const [selectedIndex, setSelectedIndex] = useState<number>(0)
  const [isShowRecentFirstSecond, setIsShowRecentFirstSecond] = useState(true)

  useEffect(() => {
    // Insert emojis into categories[]
    const temp = cloneDeep(categories)
    temp[0].data = recent
    emojis.forEach((emoji) => {
      if (emoji.urlRiv) {
        temp[1].data.push(emoji)
      } else if (isNumber(emoji.group)) {
        let index = temp.findIndex((category) => category.group === emoji.group)
        if (index > -1) {
          temp[index].data.push(emoji)
        }
      }
    })
    // Chunk emoji[] into emoji[][]
    const chunked: CategoryWithChunk[] = temp.map((obj) => ({
      ...obj,
      data: chunkEmojis(obj.data, perLine),
    }))
    setCategoryWChunkedEmoji(chunked)
  }, [categories, emojis, perLine, recent])

  const searchResults: EmojiData[][] = useMemo(() => {
    if (!searchQuery.length) return []
    const filtered = emojis.filter((emoji) => {
      return emoji?.tags?.some((tag) =>
        tag.includes(searchQuery?.toLowerCase()),
      )
    })
    return chunkEmojis(filtered, perLine)
  }, [emojis, perLine, searchQuery])

  const selectTab = useCallback((index: number) => {
    setSearchQuery('')
    setSelectedIndex(index)
    setIsShowRecentFirstSecond(false)
    Keyboard.dismiss()
  }, [])

  const selectEmoji = useCallback(
    (emoji: EmojiData) => {
      onSelect(emoji)
    },
    [onSelect],
  )

  interface Prop {
    item: EmojiData[] | string
  }
  const renderRow = useCallback(
    ({ item }: Prop) => {
      if (typeof item === 'string') {
        return (
          <Text style={styles.sectionHeader}>
            {searchQuery
              ? strings.room.searchResults
              : strings.room.emojiCategory[
                  item as keyof typeof strings.room.emojiCategory
                ]}
          </Text>
        )
      }
      return <Row selectEmoji={selectEmoji} rowItems={item} colSize={colSize} />
    },
    [colSize, searchQuery, selectEmoji, strings],
  )

  const data = useMemo(() => {
    if (searchQuery) {
      return searchResults
    } else if (isShowRecentFirstSecond) {
      return [
        categoryWChunkedEmoji[0]?.message || '',
        ...(categoryWChunkedEmoji[0]?.data || []),
        categoryWChunkedEmoji[1]?.message || '',
        ...(categoryWChunkedEmoji[1]?.data || []),
        categoryWChunkedEmoji[2]?.message || '',
        ...(categoryWChunkedEmoji[2]?.data || []),
      ]
    } else {
      return [
        categoryWChunkedEmoji[selectedIndex]?.message || '',
        ...(categoryWChunkedEmoji[selectedIndex]?.data || []),
      ]
    }
  }, [
    categoryWChunkedEmoji,
    isShowRecentFirstSecond,
    searchQuery,
    searchResults,
    selectedIndex,
  ])

  const onScrollBeginDrag = useCallback(() => {
    Keyboard.dismiss()
  }, [])

  const onLayout = useCallback(
    (event: LayoutChangeEvent) => setWidth(event.nativeEvent.layout.width),
    [],
  )
  const keyExtractor = useCallback(
    (_: string | EmojiData[], index: number) => index.toString(),
    [],
  )

  const contentContainerStyle = useMemo(
    () => ({
      paddingBottom: colSize,
    }),
    [colSize],
  )
  return (
    <View style={[styles.container, { backgroundColor }]} onLayout={onLayout}>
      <TabBar
        onPress={selectTab}
        selectedIndex={selectedIndex}
        categories={categories}
        width={width}
      />
      <View style={styles.searchbarContainer}>
        <Input
          placeholder="Search..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoFocus={autoFocus}
        />
      </View>

      <FlashList
        ref={flashList}
        estimatedItemSize={48}
        data={data}
        renderItem={renderRow}
        keyExtractor={keyExtractor}
        showsVerticalScrollIndicator={false}
        onScrollBeginDrag={onScrollBeginDrag}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={contentContainerStyle}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, width: '100%' },
  searchbarContainer: {
    height: 50,
    padding: 8,
    width: '100%',
  },
  sectionHeader: {
    color: colors.keet_grey_200,
    fontSize: 17,
    margin: 8,
    width: '100%',
  },
})

export default EmojiPicker
