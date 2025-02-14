import React, { useCallback, useState } from 'react'
import {
  StyleSheet,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from 'react-native'
import { useDispatch } from 'react-redux'
import Animated from 'react-native-reanimated'
import { ViewProps } from 'react-native-svg/lib/typescript/fabric/utils'

import { joinRoomSubmit } from '@holepunchto/keet-store/store/room'

import { IconButton } from 'component/Button'
import SvgIcon from 'component/SvgIcon'
import {
  colors,
  createThemedStylesheet,
  useReanimatedLayoutAnimation,
  useTheme,
} from 'component/theme'
import s, { ICON_SIZE_16, UI_SIZE_12, UI_SIZE_40 } from 'lib/commonStyles'
import { isRoomUrl } from 'lib/linking'

import { useStrings } from 'i18n/strings'

import { normalizeRoomUrl } from './QRScannerSheet'

export interface SearchBarProps {
  searchStr: string
  setSearchStr: (str: string) => void
  containerStyle?: ViewStyle
  isRoomMemberPlaceholder?: boolean
  onInputBlur?: () => void
  onInputFocus?: () => void
  testProps?: Partial<TextInputProps>
  clearTestProps?: Partial<ViewProps>
}

export const SearchBar = (props: SearchBarProps) => {
  const styles = getStyles()
  const theme = useTheme()
  const strings = useStrings()
  const dispatch = useDispatch()

  const {
    searchStr,
    setSearchStr,
    containerStyle = { marginHorizontal: 10 },
    isRoomMemberPlaceholder = false,
    onInputFocus,
    onInputBlur,
    testProps,
    clearTestProps,
  } = props
  const [searchOnFocus, setSearchOnFocus] = useState(false)
  const { layout } = useReanimatedLayoutAnimation()

  const onClear = useCallback(() => {
    setSearchStr('')
  }, [setSearchStr])

  const onFocus = useCallback(() => {
    onInputFocus?.()
    setSearchOnFocus(true)
  }, [onInputFocus])

  const onBlur = useCallback(() => {
    onInputBlur?.()
    setSearchOnFocus(false)
  }, [onInputBlur])

  const handleTextChange = useCallback(
    (text: string) => {
      setSearchStr(text)

      if (isRoomUrl(normalizeRoomUrl(text))) {
        dispatch(joinRoomSubmit({ link: normalizeRoomUrl(text) }))
        onClear()
      }
    },
    [dispatch, onClear, setSearchStr],
  )

  return (
    <View
      style={[
        styles.container,
        s.centerAlignedRow,
        searchOnFocus && styles.inputFocused,
        containerStyle,
      ]}
    >
      {!searchStr && !searchOnFocus && (
        <Animated.View style={styles.placeholderOverlay} pointerEvents="none">
          <SvgIcon
            name="search"
            color={colors.keet_grey_400}
            width={ICON_SIZE_16}
            height={ICON_SIZE_16}
          />
        </Animated.View>
      )}
      <Animated.View style={styles.textInputContainer} layout={layout}>
        <TextInput
          style={styles.textInput}
          value={searchStr}
          onChangeText={handleTextChange}
          placeholder={
            isRoomMemberPlaceholder
              ? strings.lobby.searchBar.search
              : strings.lobby.searchBar.searchOrPasteInviteLink
          }
          placeholderTextColor={theme.text.placeholder.color}
          onFocus={onFocus}
          onBlur={onBlur}
          textBreakStrategy="simple"
          {...testProps}
        />
      </Animated.View>
      {!!searchStr && (
        <IconButton
          hint={strings.common.close}
          onPress={onClear}
          style={styles.closeOverlay}
          {...clearTestProps}
        >
          <SvgIcon
            name="xCircle"
            color={colors.blue_400}
            width={ICON_SIZE_16}
            height={ICON_SIZE_16}
          />
        </IconButton>
      )}
    </View>
  )
}

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    closeOverlay: {},
    container: {
      backgroundColor: colors.keet_grey_600,
      borderColor: colors.keet_grey_600,
      borderRadius: UI_SIZE_12,
      borderWidth: theme.border.width,
      flex: 1,
      height: UI_SIZE_40,
    },
    inputFocused: {
      borderColor: theme.color.blue_400,
    },
    placeholderOverlay: {
      marginLeft: UI_SIZE_12,
      ...s.centerAlignedRow,
      ...s.alignItemsCenter,
    },
    textInput: {
      height: UI_SIZE_40,
      paddingLeft: theme.spacing.normal,
      ...theme.text.body,
      ...s.bidirectionalInput,
    },
    textInputContainer: {
      flex: 1,
    },
  })
  return styles
})
