import React, { useCallback } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { useDispatch } from 'react-redux'

import { closeAppModal } from 'reducers/application'

import { CloseButton } from 'component/CloseButton'
import SvgIcon from 'component/SvgIcon'
import { createThemedStylesheet } from 'component/theme'
import s, {
  UI_SIZE_16,
  UI_SIZE_20,
  UI_SIZE_24,
  UI_SIZE_32,
} from 'lib/commonStyles'
import { setShowVersionUpdateDone } from 'lib/localStorage'

import { useStrings } from 'i18n/strings'

const hitSlop = {
  top: 40,
  bottom: 40,
  left: 40,
  right: 40,
}

const NewVersionModal = () => {
  const styles = getStyles()
  const strings = useStrings()
  const dispatch = useDispatch()

  const closeModal = useCallback(() => {
    setShowVersionUpdateDone()
    dispatch(closeAppModal())
  }, [dispatch])

  return (
    <View style={[s.container, s.centeredLayout, styles.container]}>
      <SvgIcon name="newVersion" />
      <Text style={styles.title}>{strings.common.newVersion}</Text>
      <Text style={styles.description}>
        {strings.common.newVersionDescription}
      </Text>
      <CloseButton
        onPress={closeModal}
        hitSlop={hitSlop}
        style={styles.closeButton}
        width={UI_SIZE_20}
        height={UI_SIZE_20}
      />
    </View>
  )
}

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    closeButton: {
      position: 'absolute',
      right: UI_SIZE_20,
      top: UI_SIZE_20,
    },
    container: {
      backgroundColor: theme.background.bg_2,
    },
    description: {
      ...theme.text.body,
      fontSize: 16,
      marginHorizontal: UI_SIZE_32,
      marginTop: UI_SIZE_16,
      textAlign: 'center',
    },
    title: {
      ...theme.text.title,
      color: theme.color.blue_400,
      fontSize: 24,
      marginHorizontal: UI_SIZE_32,
      marginTop: UI_SIZE_24,
      textAlign: 'center',
    },
  })
  return styles
})

export default NewVersionModal
