import { memo } from 'react'
import { StyleSheet, Text, View, type ViewStyle } from 'react-native'

import s, {
  ICON_SIZE_16,
  UI_SIZE_4,
  UI_SIZE_8,
  UI_SIZE_12,
} from 'lib/commonStyles'

import { CloseButton } from './CloseButton'
import SvgIcon from './SvgIcon'
import { colors, createThemedStylesheet } from './theme'

interface RoomPairingErrorI {
  errorMessage?: string
  unsetInputError: () => void
  style?: ViewStyle
}
const RoomPairingError = memo(
  ({ errorMessage, unsetInputError, style }: RoomPairingErrorI) => {
    const styles = getStyles()

    if (!errorMessage) {
      return null
    }
    return (
      <View style={[styles.wrapper, style]}>
        <SvgIcon
          name="info"
          color={colors.white_snow}
          width={UI_SIZE_12}
          height={UI_SIZE_12}
          style={styles.icon}
        />
        <Text style={styles.message}>{errorMessage}</Text>
        <CloseButton
          onPress={unsetInputError}
          width={ICON_SIZE_16}
          height={ICON_SIZE_16}
        />
      </View>
    )
  },
)

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    icon: {
      marginTop: UI_SIZE_4,
    },
    message: {
      ...s.container,
      ...theme.text.body,
      fontSize: 13,
      marginLeft: UI_SIZE_4,
      paddingRight: UI_SIZE_8,
    },
    wrapper: {
      ...s.row,
      backgroundColor: theme.color.red_900,
      borderRadius: theme.border.radiusNormal,
      padding: UI_SIZE_8,
      paddingHorizontal: UI_SIZE_12,
    },
  })
  return styles
})

export default RoomPairingError
