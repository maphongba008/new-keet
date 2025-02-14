import { useCallback, useState } from 'react'
import { FlatList, StyleSheet, Text, TextInput, View } from 'react-native'

import GestureContainer from 'component/GestureContainer'
import { NavBar, ScreenSystemBars } from 'component/NavBar'
import SvgIcon from 'component/SvgIcon'
import { colors, useTheme } from 'component/theme'
import { UI_SIZE_8, UI_SIZE_16 } from 'lib/commonStyles'

import * as SvgIcons from '../../resources'

const SvgIconsScreen = () => {
  const [search, setSearch] = useState('')
  const keyExtractor = useCallback((name: string) => name, [])
  const theme = useTheme()
  const renderItem = useCallback(
    ({ item }: { item: string }) => {
      return (
        <View style={styles.item}>
          <SvgIcon
            key={item}
            width={40}
            height={40}
            name={item as any}
            color={theme.color.red_600}
          />
          <Text style={styles.iconName}>{item}</Text>
        </View>
      )
    },
    [theme.color.red_600],
  )
  const icons = Object.keys(SvgIcons).filter((t) =>
    t.toLowerCase().includes(search?.toLowerCase()),
  )
  return (
    <GestureContainer>
      <ScreenSystemBars />
      <NavBar title={'SVG Icons'} />
      <TextInput
        style={styles.input}
        placeholder="Search"
        placeholderTextColor={colors.white_snow}
        value={search}
        onChangeText={setSearch}
      />
      <FlatList
        data={icons}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        numColumns={3}
      />
    </GestureContainer>
  )
}

const styles = StyleSheet.create({
  iconName: {
    color: colors.white_snow,
    textAlign: 'center',
  },
  input: {
    borderColor: colors.white_snow,
    borderRadius: UI_SIZE_8,
    borderWidth: 1,
    color: colors.white_snow,
    height: 40,
    margin: UI_SIZE_16,
    paddingHorizontal: UI_SIZE_8,
  },
  item: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    marginTop: UI_SIZE_16,
  },
})

export default SvgIconsScreen
