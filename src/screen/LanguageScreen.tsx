import React, { useCallback } from 'react'
import { ScrollView, StyleSheet } from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import _orderBy from 'lodash/orderBy'

import ListItem, { type ListItemProps } from 'component/ListItem'
import { NavBar } from 'component/NavBar'
import { createThemedStylesheet } from 'component/theme'
import s, { UI_SIZE_16 } from 'lib/commonStyles'
import { SAFE_EDGES } from 'lib/constants'

import {
  LANGUAGE_MENU,
  SUPPORT_LANGUAGES,
  useChangeLanguage,
  useLocale,
  useStrings,
} from 'i18n/strings'

export const LanguageScreen = () => {
  const { top: marginTop } = useSafeAreaInsets()
  const styles = getStyles()
  const strings = useStrings()
  const locale = useLocale()
  const changeLanguage = useChangeLanguage()

  const langs = _orderBy(
    Object.values(SUPPORT_LANGUAGES).map((item) => ({
      icon: '',
      name: LANGUAGE_MENU[`lang-${item}`],
      plainText: true,
      right: '',
      rightIcon: '',
      onPress: () => {
        changeLanguage(item)
      },
      marginBottom: true,
      bordered: true,
      active: locale === item,
    })),
    ['active'],
    ['desc'],
  )

  const renderMenuItems = useCallback(
    (value: ListItemProps) => <ListItem key={value.name} {...value} />,
    [],
  )

  return (
    <>
      <SafeAreaView style={s.container} edges={SAFE_EDGES}>
        <NavBar title={strings.account.language} />
        <ScrollView
          style={[s.container, { marginTop }]}
          contentContainerStyle={[styles.container]}
        >
          {langs.map(renderMenuItems)}
        </ScrollView>
      </SafeAreaView>
    </>
  )
}

export default LanguageScreen

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    container: {
      borderRadius: theme.border.radiusLarge,
      marginHorizontal: UI_SIZE_16,
      overflow: 'hidden',
    },
  })
  return styles
})
