import React, { useCallback, useEffect, useRef, useState } from 'react'
import { ScrollView, StyleSheet, Text } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import { nativeApplicationVersion, nativeBuildVersion } from 'expo-application'
import * as Clipboard from 'expo-clipboard'

import { getCoreBackend } from '@holepunchto/keet-store/backend'
import meta from 'mobile-core/meta.json'

import { getShowStats, setShowStats } from 'reducers/application'

import { TextButton, TextButtonType } from 'component/Button'
import { NavBar } from 'component/NavBar'
import { createThemedStylesheet } from 'component/theme'
import { UI_SIZE_8, UI_SIZE_16, UI_SIZE_18 } from 'lib/commonStyles'
import { STATS_MAX_TAPS } from 'lib/constants'
import { showInfoNotifier } from 'lib/hud'
import { setStorageStatsEnabled } from 'lib/localStorage'

import { useStrings } from 'i18n/strings'

// https://github.com/holepunchto/keet-desktop/blob/main/src/lib/versions.js
const { version: emojis } = require('@holepunchto/emojis/package.json')
const { version: keet_call } = require('@holepunchto/keet-call/package.json')
const { version: keet_store } = require('@holepunchto/keet-store/package.json')
const { version: rtk } = require('@reduxjs/toolkit/package.json')
const { version: react } = require('react/package.json')
const { version: react_native } = require('react-native/package.json')
const { version: react_redux } = require('react-redux/package.json')
const { version: redux_saga } = require('redux-saga/package.json')
const { version: compact_encoding } = require('compact-encoding/package.json')
const {
  version: link_preview,
} = require('@holepunchto/keet-link-preview/package.json')

export const KEET_META = `${nativeApplicationVersion}_${nativeBuildVersion}`

export const MetaScreen = () => {
  const dispatch = useDispatch()
  const tapCount = useRef(0)
  const showStats = useSelector(getShowStats)
  const [coreModules, setCoreModules] = useState({})
  const [dependencies, setDependencies] = useState({
    ...meta,
    'compact-encoding': compact_encoding,
    'keet-call': keet_call,
    'keet-store': keet_store,
    '@reduxjs/toolkit': rtk,
    'keet-link-preview': link_preview,
    'keet-emojis': emojis,
    react,
    'react-native': react_native,
    'react-redux': react_redux,
    'redux-saga': redux_saga,
  })

  const styles = getStyles()
  const strings = useStrings()

  const getCoreVersions = async () => {
    const { modules } = await getCoreBackend().getVersion()
    setCoreModules(modules)
  }

  useEffect(() => {
    getCoreVersions()
  }, [])

  useEffect(() => {
    setDependencies((prevDependencies) => ({
      ...prevDependencies,
      ...coreModules,
    }))
  }, [coreModules])

  const stringifiedMeta = dependencies
    ? JSON.stringify(dependencies, Object.keys(dependencies).sort(), 2)
    : ''

  const onPressCopyInfo = useCallback(async () => {
    await Clipboard.setStringAsync(stringifiedMeta)
    showInfoNotifier(strings.downloads.textCopied)
  }, [stringifiedMeta, strings.downloads.textCopied])

  const handleMultiTap = useCallback(() => {
    tapCount.current += 1
    if (tapCount.current === STATS_MAX_TAPS) {
      tapCount.current = 0
      const isEnabled = !showStats
      dispatch(setShowStats(isEnabled))
      setStorageStatsEnabled(isEnabled)
    }
  }, [dispatch, showStats])

  return (
    <>
      <NavBar title={strings.account.versions} onClickTitle={handleMultiTap} />
      <ScrollView style={styles.root}>
        <Text style={styles.title}>Keet</Text>
        <Text style={styles.text}>{KEET_META}</Text>
        <Text style={styles.title}>Packages</Text>
        <Text style={styles.text}>{stringifiedMeta}</Text>
        <TextButton
          text={strings.networkStatus.copyInfo}
          hint={strings.networkStatus.copyInfo}
          onPress={onPressCopyInfo}
          style={styles.copyButton}
          type={TextButtonType.gray}
        />
      </ScrollView>
    </>
  )
}

export default MetaScreen

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    copyButton: {
      marginTop: UI_SIZE_16,
    },
    root: {
      padding: theme.spacing.standard,
      paddingTop: 0,
    },
    text: {
      ...theme.text.body,
      fontSize: UI_SIZE_18,
    },
    title: {
      color: theme.color.grey_300,
      fontSize: UI_SIZE_16,
      marginVertical: UI_SIZE_8,
    },
  })
  return styles
})
