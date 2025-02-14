import { memo } from 'react'
import { StyleSheet, TextInput, View } from 'react-native'

import { colors } from 'component/theme'
import { TRANSPARENT } from 'lib/commonStyles'

interface Props {
  placeholder: string
  value: string
  autoFocus: boolean
  onChangeText(text: string): void
}

const Input = ({ placeholder, value, onChangeText, autoFocus }: Props) => {
  return (
    <View style={styles.container}>
      <TextInput
        clearButtonMode="while-editing"
        style={styles.input}
        returnKeyType="search"
        onChangeText={onChangeText}
        value={value}
        placeholder={placeholder}
        placeholderTextColor={colors.keet_grey_200}
        blurOnSubmit
        underlineColorAndroid="transparent"
        autoFocus={autoFocus}
        keyboardAppearance={'dark'}
        autoCorrect={false}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: colors.keet_grey_900,
    borderColor: TRANSPARENT,
    borderRadius: 4,
    flexDirection: 'row',
    flex: 1,
    height: 34,
    overflow: 'hidden',
  },
  input: {
    color: colors.white_snow,
    flex: 1,
    fontSize: 16,
    height: 34,
    paddingHorizontal: 15,
    padding: 0,
  },
})

export default memo(Input)
