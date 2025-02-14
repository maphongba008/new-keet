/* eslint-disable react/jsx-no-bind */
/* eslint-disable react-native/no-color-literals */
import React, { useEffect, useRef, useState } from 'react'
import { StyleSheet, Text, TextInput, View } from 'react-native'
import * as Clipboard from 'expo-clipboard'
import { SafeAreaView } from 'react-native-safe-area-context'

import { TextButton, TextButtonType } from 'component/Button'
import { NavBar } from 'component/NavBar'
import { createThemedStylesheet } from 'component/theme'
import s from 'lib/commonStyles'
import { SAFE_EDGES } from 'lib/constants'
import { Keys, localStorage } from 'lib/localStorage'
import { getKeetBackend } from 'lib/rpc'

const DebuggingScreen = () => {
  const styles = getStyles()
  const [key, setKey] = useState(
    localStorage.getItem(Keys.HYPERTRACE_KEY) as string,
  )
  const [editKey, setEditKey] = useState('')
  const [isEditingKey, setIsEditingKey] = useState(false)
  const [isRunning] = useState(!!key)
  const [isWaitingToRestart, setIsWaitingToRestart] = useState(false)
  const [inspectorKey, setInspectorKey] = useState('')
  const backend = getKeetBackend()
  const oldConsoleLog = useRef(globalThis.console.log)
  const oldConsoleError = useRef(globalThis.console.error)
  const oldConsoleWarn = useRef(globalThis.console.warn)

  useEffect(() => {
    fetch()

    async function fetch() {
      const inspectorKeyFromApi = await backend.api.mobile.getInspectorKey()
      setInspectorKey(inspectorKeyFromApi)
    }
  }, [backend.api.mobile])

  return (
    <SafeAreaView style={s.container} edges={SAFE_EDGES}>
      <NavBar title="Debugging" />
      <View style={styles.root}>
        <View style={styles.marginBottom}>
          <Text style={[styles.header, styles.marginBottom]}>Inspector</Text>
          <Text style={[styles.text, styles.marginBottom]}>
            When Inspector is enabled, it is possible to use Chrome Devtools
            from a desktop, to inspect Keet. There are certain security risks
            involved in this, so only enanble if you know what you are doing.
          </Text>
          {inspectorKey ? (
            <>
              <Text style={styles.text}>Paste this key into Pear Desktop</Text>
              <View style={styles.copyTextView}>
                <Text style={[styles.text, styles.copyText]} numberOfLines={1}>
                  {inspectorKey}
                </Text>
                <TextButton
                  text="Copy"
                  type={TextButtonType.link}
                  onPress={() => Clipboard.setStringAsync(inspectorKey)}
                />
              </View>
              <TextButton
                text="Disable inspector"
                type={TextButtonType.cancel}
                onPress={async () => {
                  await backend.api.mobile.disableInspector()
                  setInspectorKey('')

                  globalThis.console.log = oldConsoleLog.current
                  globalThis.console.error = oldConsoleError.current
                  globalThis.console.warn = oldConsoleWarn.current
                }}
              />
            </>
          ) : (
            <TextButton
              text="Enable inspector"
              onPress={async () => {
                const inspectorKeyFromApi =
                  await backend.api.mobile.enableInspector()

                setInspectorKey(inspectorKeyFromApi)

                globalThis.console.log = async (...args) => {
                  await backend.api.console.log(...args)
                  oldConsoleLog.current(...args)
                }
                globalThis.console.error = async (...args) => {
                  await backend.api.console.error(...args)
                  oldConsoleError.current(...args)
                }
                globalThis.console.warn = async (...args) => {
                  await backend.api.console.warn(...args)
                  oldConsoleWarn.current(...args)
                }
              }}
            />
          )}
        </View>
        <View>
          <Text style={[styles.header, styles.marginBottom]}>Hypertrace</Text>
          <Text style={[styles.text, styles.marginBottom]}>
            When Hypertrace is enabled, logs from some low-level components are
            sent to the Hypertrace logging server. There are certain security
            risks involved in this, so only enable if you know what you are
            doing.
          </Text>
          {isRunning && !isWaitingToRestart && (
            <TextButton
              text="Stop tracing"
              type={TextButtonType.cancel}
              onPress={() => {
                localStorage.removeItem(Keys.HYPERTRACE_KEY)
                setKey('')
                setIsWaitingToRestart(true)
              }}
            />
          )}
          {!isEditingKey && !isRunning && !isWaitingToRestart && (
            <TextButton
              text="Enable tracing"
              onPress={() => {
                setEditKey(key)
                setIsEditingKey(true)
              }}
            />
          )}
          {isEditingKey && (
            <View>
              <TextInput
                style={[styles.editKeyInput, styles.marginBottom]}
                value={editKey}
                onChangeText={(k: string) => setEditKey(k)}
                placeholder="Paste in hypertrace key"
                placeholderTextColor="grey"
              />
              <View style={styles.editKeyButtons}>
                <TextButton
                  text="OK"
                  onPress={() => {
                    if (!editKey) return setIsEditingKey(false)

                    setKey(editKey)
                    setIsEditingKey(false)
                    setIsWaitingToRestart(true)
                    localStorage.setItem(Keys.HYPERTRACE_KEY, editKey)
                  }}
                />
                <TextButton
                  text="Cancel"
                  onPress={() => setIsEditingKey(false)}
                />
              </View>
            </View>
          )}
          {isWaitingToRestart && (
            <View>
              <Text style={styles.text}>
                You need to restart Keet, before Hypertrace is
                {isRunning ? ' disabled' : ' enabled'}.
              </Text>
            </View>
          )}
        </View>
      </View>
    </SafeAreaView>
  )
}

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    copyText: {
      flex: 1,
      fontWeight: 'bold',
    },
    copyTextView: {
      alignItems: 'center',
      flexDirection: 'row',
    },
    editKeyButtons: {
      flexDirection: 'row',
      gap: 10,
      justifyContent: 'flex-end',
    },
    editKeyInput: {
      borderColor: 'white',
      borderWidth: 1,
      color: 'white',
      height: 40,
      padding: 5,
    },
    header: {
      color: 'white',
      fontSize: 20,
    },
    marginBottom: {
      marginBottom: 10,
    },
    root: {
      padding: theme.spacing.standard,
    },
    text: {
      color: 'white',
      fontSize: 12,
    },
  })
  return styles
})

export default DebuggingScreen
