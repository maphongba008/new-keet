import { StyleSheet, View } from 'react-native'

import { colors, createThemedStylesheet } from 'component/theme'
import s, { UI_SIZE_4, UI_SIZE_20 } from 'lib/commonStyles'

type ThreeDotsIndicatorProps = {
  currentIndex: number
}

export const ThreeDotsIndicator = ({
  currentIndex,
}: ThreeDotsIndicatorProps) => {
  const styles = getStyles()

  return (
    <View style={styles.dotsContainer}>
      {[...Array(3)].map((_, index) => (
        <View
          key={index}
          style={[
            styles.dot,
            index < currentIndex && styles.previousDot,
            currentIndex === index && styles.activeDot,
          ]}
        />
      ))}
    </View>
  )
}
const getStyles = createThemedStylesheet((theme) => {
  const dotSize = 6

  const styles = StyleSheet.create({
    activeDot: {
      backgroundColor: colors.white_snow,
      borderRadius: dotSize / 2,
      width: UI_SIZE_20,
    },
    dot: {
      backgroundColor: colors.keet_grey_200,
      borderRadius: dotSize / 2,
      height: dotSize,
      marginHorizontal: UI_SIZE_4,
      width: dotSize,
    },
    dotsContainer: {
      ...s.row,
      ...s.centeredLayout,
      height: dotSize,
      paddingRight: theme.bars.navigationBarHeight,
    },
    previousDot: {
      backgroundColor: colors.white_snow,
    },
  })
  return styles
})
