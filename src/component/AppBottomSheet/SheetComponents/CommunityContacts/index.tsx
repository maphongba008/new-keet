import React, { useCallback } from 'react'
import { FlatList, Image, StyleSheet, Text, View } from 'react-native'

import { closeBottomSheet } from 'component/AppBottomSheet/AppBottomSheet.Store'
import { CloseButton } from 'component/CloseButton'
import { createThemedStylesheet } from 'component/theme'
import s, {
  UI_SIZE_8,
  UI_SIZE_14,
  UI_SIZE_20,
  UI_SIZE_42,
} from 'lib/commonStyles'

import { useStrings } from 'i18n/strings'

const CONTACT_LISTS = [
  {
    name: 'Charlotte Schimmel',
    avatar_url: '',
  },
]

function CommunityContacts() {
  const styles = getStyles()
  const strings = useStrings()

  const onClose = useCallback(() => closeBottomSheet(), [])

  const renderCommunityContacts = useCallback(
    ({ item }: any) => {
      return (
        <View style={[s.row, styles.listWrapper]}>
          <Image style={styles.img} source={{ uri: item.avatar_url }} />
          <View style={styles.textWrapper}>
            <Text style={styles.text}>{item.name}</Text>
          </View>
        </View>
      )
    },
    [styles.img, styles.listWrapper, styles.text, styles.textWrapper],
  )

  const keyExtractor = useCallback((item: any) => item.name, [])

  return (
    <View>
      <CloseButton
        onPress={onClose}
        width={UI_SIZE_20}
        height={UI_SIZE_20}
        style={styles.closeIcon}
      />
      <Text style={styles.title}>
        {strings.discoverCommunities.contactTitle}
      </Text>
      <FlatList
        keyExtractor={keyExtractor}
        data={CONTACT_LISTS}
        renderItem={renderCommunityContacts}
      />
    </View>
  )
}

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    closeIcon: {
      position: 'absolute',
      right: 0,
      top: -UI_SIZE_20,
    },
    img: {
      borderRadius: UI_SIZE_42 / 2,
      height: UI_SIZE_42,
      width: UI_SIZE_42,
    },
    listWrapper: {
      paddingVertical: UI_SIZE_8,
    },
    text: {
      ...theme.text.bodyBold,
      fontSize: UI_SIZE_14,
    },
    textWrapper: {
      marginLeft: UI_SIZE_8,
      ...s.centeredLayout,
    },
    title: {
      ...theme.text.title,
    },
  })

  return styles
})

export default CommunityContacts
