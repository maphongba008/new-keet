import React, { ReactElement } from 'react'
import { StyleSheet } from 'react-native'
import LinearGradient, {
  type LinearGradientProps,
} from 'react-native-linear-gradient'
import MaskedView from '@react-native-masked-view/masked-view'

const MaskGradient = ({
  MaskElement,
  linearGradientProps,
}: {
  MaskElement: ReactElement
  linearGradientProps: LinearGradientProps
}) => {
  return (
    <MaskedView maskElement={MaskElement}>
      {/**
       * maskElement() in the next line doesn't show anything, it is a hacky way for MaskedView to dynamically sizing according to its children https://github.com/react-native-masked-view/masked-view/issues/141 . Performance might take a hit if children is big
       */}
      {MaskElement}
      <LinearGradient
        {...linearGradientProps}
        style={styles.gradientContainer}
      />
    </MaskedView>
  )
}
export default MaskGradient

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
    height: '100%',
    position: 'absolute',
    width: '100%',
  },
})
