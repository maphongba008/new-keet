import React from 'react'
import {
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
  ViewStyle,
} from 'react-native'

import s from 'lib/commonStyles'
import { keyboardBehavior } from 'lib/keyboard'

import { createThemedStylesheet } from './theme'

interface PageWrapperI {
  children: React.ReactNode
  bounces?: boolean
  keyboardDismissMode?: 'none' | 'interactive' | 'on-drag' | undefined
  scrollEnabled?: boolean
  containerStyle?: ViewStyle
}

function PageWrapper({
  children,
  bounces,
  keyboardDismissMode = 'on-drag',
  scrollEnabled,
  containerStyle,
}: PageWrapperI) {
  const styles = getStyles()

  return (
    <KeyboardAvoidingView
      style={[styles.contentWrapper, containerStyle]}
      behavior={keyboardBehavior}
    >
      <ScrollView
        scrollEnabled={scrollEnabled}
        keyboardDismissMode={keyboardDismissMode}
        bounces={bounces}
      >
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const getStyles = createThemedStylesheet(() => {
  const styles = StyleSheet.create({
    contentWrapper: {
      ...s.container,
      flexGrow: 1,
    },
  })
  return styles
})

export default PageWrapper
