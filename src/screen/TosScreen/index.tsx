import { ReactNode, useCallback } from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { TextButton, TextButtonType } from 'component/Button'
import { ListType, MarkDown, mdRenderer, T } from 'component/MarkDown'
import { NavBar } from 'component/NavBar'
import { createThemedStylesheet } from 'component/theme'
import s, { UI_SIZE_12, UI_SIZE_14 } from 'lib/commonStyles'
import { SAFE_EDGES } from 'lib/constants'
import { back } from 'lib/navigation'

import { useStrings } from 'i18n/strings'

import { TERMS } from './terms'

const renderer = () => {
  const styles = getStyles()
  return {
    ...mdRenderer,
    heading(children: ReactNode) {
      return (
        <View key={`${this.elementId}`} style={styles.heading}>
          <T strong>{children}</T>
        </View>
      )
    },
    list(children: ReactNode, ordered: boolean) {
      return (
        <View key={`${this.elementId}`} style={styles.list}>
          <T list={ordered ? ListType.OL : ListType.UL}>{children}</T>
        </View>
      )
    },
  }
}

const TosScreen = () => {
  const styles = getStyles()
  const strings = useStrings()

  const handleDone = useCallback(() => {
    back()
  }, [])

  return (
    <SafeAreaView style={[s.container, styles.container]} edges={SAFE_EDGES}>
      <NavBar title={strings.syncDevice.setupModal.termsAndConditions} />
      <ScrollView contentContainerStyle={styles.content}>
        <MarkDown md={TERMS} renderer={renderer} processMd={false} />
      </ScrollView>
      <View style={styles.content}>
        <TextButton
          type={TextButtonType.primary}
          text={strings.common.done}
          onPress={handleDone}
        />
      </View>
    </SafeAreaView>
  )
}

export default TosScreen

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    container: {
      backgroundColor: theme.color.grey_900,
    },
    content: {
      padding: theme.spacing.standard,
    },
    heading: {
      marginTop: UI_SIZE_14,
    },
    list: {
      paddingLeft: UI_SIZE_12,
    },
  })
  return styles
})
