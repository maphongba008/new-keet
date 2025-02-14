import { StyleSheet, Text, View, type ViewProps } from 'react-native'
import Svg, { Path, type SvgProps } from 'react-native-svg'

import { createThemedStylesheet } from './theme'

const Ok = (props: SvgProps) => (
  <Svg width={16} height={16} fill="none" {...props}>
    <Path
      d="M0 8c0-4.406 3.563-8 8-8 4.406 0 8 3.594 8 8 0 4.438-3.594 8-8 8-4.438 0-8-3.563-8-8Zm11.594-1.375a.85.85 0 0 0 0-1.219.85.85 0 0 0-1.219 0L7 8.781 5.594 7.406a.85.85 0 0 0-1.219 0 .85.85 0 0 0 0 1.219l2 2a.849.849 0 0 0 1.219 0l4-4Z"
      fill="#95E6CB"
    />
  </Svg>
)

const Warn = (props: SvgProps) => (
  <Svg width={18} height={15} fill="none" {...props}>
    <Path
      d="M16.813 13.031 10.155 1.656c-.531-.875-1.812-.875-2.312 0L1.156 13.031c-.5.875.125 1.969 1.157 1.969h13.343a1.316 1.316 0 0 0 1.156-1.969ZM8.25 5.25A.74.74 0 0 1 9 4.5a.76.76 0 0 1 .75.75v4A.74.74 0 0 1 9 10a.76.76 0 0 1-.75-.75v-4ZM9 13a.98.98 0 0 1-1-.969.98.98 0 0 1 1-.969c.531 0 .969.438.969.97A.974.974 0 0 1 9 13Z"
      fill="#FC6"
    />
  </Svg>
)

export const TIP_OK = 'ok'
export const TIP_WARN = 'warn'
export type TipKind = 'ok' | 'warn'

export type TipProps = ViewProps & { kind: TipKind; text: string }

export const Tip = (props: TipProps) => {
  const { kind, text, style } = props

  const styles = getStyles()

  return (
    <View style={[style, styles.root]}>
      <View style={kind === TIP_OK ? styles.strokeOk : styles.strokeWarn} />
      {kind === TIP_OK ? (
        <Ok style={styles.icon} />
      ) : (
        <Warn style={styles.icon} />
      )}
      <View style={styles.textWrapper}>
        <Text style={styles.text}>{text}</Text>
      </View>
    </View>
  )
}

const STROKE_WIDTH = 6

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    icon: {
      left: theme.spacing.standard,
      position: 'absolute',
      top: theme.spacing.standard,
    },
    root: {
      borderColor: theme.color.bg4,
      borderRadius: 8,
      borderWidth: 1,
      overflow: 'hidden',
    },
    strokeOk: {
      backgroundColor: theme.color.accent,
      bottom: 0,
      left: 0,
      position: 'absolute',
      top: 0,
      width: STROKE_WIDTH,
    },
    strokeWarn: {
      backgroundColor: theme.color.flag,
      bottom: 0,
      left: 0,
      position: 'absolute',
      top: 0,
      width: STROKE_WIDTH,
    },
    text: {
      padding: theme.spacing.standard - 3,
      paddingLeft: theme.spacing.standard + 18 + 10,
      ...theme.text.bodySemiBold,
      fontSize: 14,
    },
    textWrapper: {
      paddingLeft: 0,
    },
  })
  return styles
})
