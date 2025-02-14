import { memo, useCallback } from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { Category } from '.'
import isEqual from 'react-fast-compare'

import SvgIcon from 'component/SvgIcon'
import { colors } from 'component/theme'
import { TRANSPARENT } from 'lib/commonStyles'

const KEET_EMOJI = 'keet-emoji'

interface Props {
  categories: Category[]
  selectedIndex: number
  width: number
  onPress(index: number): void
}
const TabBarItem = memo(
  ({
    onPress,
    index,
    tabSize,
    category,
    emojiSize,
    uiSize,
    selectedIndex,
  }: {
    onPress: (index: number) => void
    index: number
    tabSize: number
    category: Category
    emojiSize: number
    uiSize: number
    selectedIndex: number
  }) => {
    const onPressDown = useCallback(() => {
      onPress(index)
    }, [index, onPress])

    return (
      <TouchableOpacity
        onPress={onPressDown}
        style={[
          styles.touchable,
          {
            height: tabSize,
          },
        ]}
      >
        {category.key === KEET_EMOJI ? (
          <View style={styles.emoji}>
            <SvgIcon width={emojiSize} height={emojiSize} name="keetFilled" />
          </View>
        ) : (
          <Text style={[styles.emoji, { fontSize: uiSize }]}>
            {category.emoji}
          </Text>
        )}
        <View
          // eslint-disable-next-line react-native/no-inline-styles
          style={{
            width: uiSize,
            height: 1,
            backgroundColor:
              index === selectedIndex ? colors.white_snow : TRANSPARENT,
          }}
        />
      </TouchableOpacity>
    )
  },
  isEqual,
)
const TabBar = memo(({ categories, selectedIndex, onPress, width }: Props) => {
  const tabSize = width / categories.length
  const uiSize = tabSize - 20
  const emojiSize = uiSize + 5
  return (
    <View style={styles.container}>
      {categories.map((category, index) => {
        return (
          <TabBarItem
            key={category.key}
            onPress={onPress}
            index={index}
            tabSize={tabSize}
            category={category}
            emojiSize={emojiSize}
            uiSize={uiSize}
            selectedIndex={selectedIndex}
          />
        )
      })}
    </View>
  )
}, isEqual)

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
  },
  emoji: {
    paddingBottom: 8,
    textAlign: 'center',
  },
  touchable: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
})

export default TabBar
