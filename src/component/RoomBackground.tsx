import React, { memo, useMemo } from 'react'
import { StyleSheet, View } from 'react-native'

import s, { height, width } from 'lib/commonStyles'

import SvgIcon from './SvgIcon'
import { colors } from './theme'

const RoomBackground = ({
  children,
  centeredLayout,
}: {
  children?: React.ReactNode
  centeredLayout?: boolean
}) => {
  const { imageHeight, repeatCount } = useMemo(() => {
    const _imageHeight = (262 / 541) * width

    return {
      imageHeight: _imageHeight,
      repeatCount: Math.floor(height / _imageHeight) + 1,
    }
  }, [])

  return (
    <>
      <View style={styles.container}>
        {Array.from({ length: repeatCount }).map((_, index) => (
          <SvgIcon
            key={String(index)}
            name="roomChatBackground"
            width={width}
            height={imageHeight}
          />
        ))}
      </View>
      <View style={[s.absoluteFill, centeredLayout && s.centeredLayout]}>
        {children}
      </View>
    </>
  )
}

export default memo(RoomBackground)

const styles = StyleSheet.create({
  container: {
    ...s.container,
    backgroundColor: colors.black,
    opacity: 0.25,
  },
})
