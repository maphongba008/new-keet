import React, { ErrorInfo, ReactElement } from 'react'
import { ScrollView, StyleSheet, Text, View } from 'react-native'
import { reloadAppAsync } from 'expo'
import * as Clipboard from 'expo-clipboard'
import { SafeAreaView } from 'react-native-safe-area-context'

import { TextButton, TextButtonType } from 'component/Button'
import SvgIcon from 'component/SvgIcon'
import { colors, getTheme } from 'component/theme'
import s, {
  ICON_SIZE_90,
  UI_SIZE_4,
  UI_SIZE_8,
  UI_SIZE_10,
  UI_SIZE_20,
} from 'lib/commonStyles'
import { showInfoNotifier } from 'lib/hud'

import { getStrings } from 'i18n/strings'

interface stateType {
  error: Error
  stack: ErrorInfo
  hasError: boolean
}

interface propsType {
  children: ReactElement
}

class ErrorBoundary extends React.Component<propsType> {
  constructor(props: propsType) {
    super(props)
    this.state = { hasError: false, error: {}, stack: {} }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: Error, stack: ErrorInfo) {
    this.setState({ error, stack })
  }

  handleCopyDebug = () => {
    const { error, stack } = this.state as stateType
    const strings = getStrings()
    const shareText = `${error.toString()} \n\n ${Object(stack?.componentStack)
      .toString()
      .trim()}`

    Clipboard.setStringAsync(shareText)
    showInfoNotifier(strings.downloads.textCopied)
  }

  handleRestart = async () => {
    await reloadAppAsync()
  }

  render() {
    const { error, stack, hasError } = this.state as stateType
    const { children } = this.props
    const theme = getTheme()
    const styles = getStyles(theme)
    const strings = getStrings()

    if (hasError) {
      return (
        <SafeAreaView style={styles.containerStyle}>
          <View style={styles.keetLogo}>
            <SvgIcon
              width={ICON_SIZE_90}
              height={ICON_SIZE_90}
              name="keetFilled"
            />
          </View>
          <Text style={styles.title}>{strings.errorFallback.title}</Text>
          <Text style={styles.errorSubtitle}>
            {strings.errorFallback.subtitle}
          </Text>
          <Text style={[styles.errorTitle, styles.errorSubtitle]}>
            {error.toString()}
          </Text>
          <ScrollView style={styles.stackStyle} persistentScrollbar>
            <Text style={styles.errorText}>
              {Object(stack?.componentStack).toString().trim()}
            </Text>
          </ScrollView>
          <TextButton
            style={styles.copyDebug}
            text={strings.errorFallback.debugInfo}
            type={TextButtonType.secondary}
            onPress={this.handleCopyDebug}
          />
          <TextButton
            text={strings.errorFallback.restart}
            type={TextButtonType.outline}
            onPress={this.handleRestart}
          />
        </SafeAreaView>
      )
    }

    return children
  }
}

export default ErrorBoundary

const getStyles = (theme: any) => {
  const styles = StyleSheet.create({
    containerStyle: {
      backgroundColor: theme.color.bg2,
      padding: UI_SIZE_8,
      ...s.justifyCenter,
      ...s.container,
    },
    copyDebug: {
      marginVertical: UI_SIZE_10,
    },
    errorSubtitle: {
      color: colors.white_snow,
      ...theme.text.subtitle,
      ...s.textAlignCenter,
    },
    errorText: {
      ...theme.text.subtitle,
      padding: UI_SIZE_8,
    },
    errorTitle: {
      marginTop: UI_SIZE_8,
    },
    keetLogo: {
      ...s.alignItemsCenter,
      marginBottom: UI_SIZE_20,
    },
    stackStyle: {
      backgroundColor: theme.color.grey_500,
      borderRadius: UI_SIZE_8,
      marginTop: UI_SIZE_4,
      maxHeight: 300,
    },
    title: {
      color: colors.white_snow,
      marginBottom: UI_SIZE_8,
      ...s.textAlignCenter,
      ...theme.text.title,
    },
  })

  return styles
}
