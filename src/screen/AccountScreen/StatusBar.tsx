import React, { useMemo } from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'

import { ButtonBase } from 'component/Button'
import SvgIcon from 'component/SvgIcon'
import { createThemedStylesheet, useTheme } from 'component/theme'
import s, {
  UI_SIZE_4,
  UI_SIZE_6,
  UI_SIZE_10,
  UI_SIZE_12,
  UI_SIZE_16,
} from 'lib/commonStyles'

import { useStrings } from 'i18n/strings'

enum STATUS_MESSAGE {
  'AVAILABLE',
  'AWAY',
}

const StatusDot = ({ color }: { color: string }) => {
  const styles = getStyles()

  return <View style={[styles.statusDot, { backgroundColor: color }]} />
}

function StatusBar({ status = STATUS_MESSAGE.AVAILABLE }) {
  const styles = getStyles()
  const theme = useTheme()
  const strings = useStrings()

  const { label, color } = useMemo(() => {
    return status === STATUS_MESSAGE.AVAILABLE
      ? { label: strings.account.available, color: theme.color.green_300 }
      : { label: strings.account.away, color: theme.color.yellow_500 }
  }, [status, theme, strings])

  return (
    <View style={styles.container}>
      <ButtonBase style={styles.statusSelector}>
        <StatusDot color={color} />
        <Text style={styles.text}>{label}</Text>
        <SvgIcon
          color={theme.color.grey_300}
          name="chevronUp"
          width={UI_SIZE_12}
          height={UI_SIZE_12}
          style={styles.chevronBottom}
        />
      </ButtonBase>
      <View style={styles.divider} />
      <TouchableOpacity style={[s.container, s.alignItemsCenter]}>
        <Text style={styles.statusMsgLbl}>{strings.account.setStatusMsg}</Text>
      </TouchableOpacity>
    </View>
  )
}

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    chevronBottom: {
      marginLeft: UI_SIZE_6,
      transform: [{ rotateZ: '180deg' }],
    },
    container: {
      backgroundColor: theme.color.grey_800,
      borderRadius: UI_SIZE_16,
      ...s.row,
      ...s.flexSpaceAround,
      marginHorizontal: UI_SIZE_4,
      marginTop: UI_SIZE_10,
      padding: UI_SIZE_16,
    },
    divider: {
      borderRightColor: theme.color.grey_600,
      borderRightWidth: 1,
    },
    statusDot: {
      backgroundColor: theme.color.green_300,
      borderRadius: UI_SIZE_10 / 2,
      height: UI_SIZE_10,
      marginRight: UI_SIZE_4,
      width: UI_SIZE_10,
    },
    statusMsgLbl: {
      ...theme.text.body,
      color: theme.color.blue_400,
    },
    statusSelector: {
      ...s.container,
      ...s.row,
      ...s.centeredLayout,
    },
    text: {
      ...theme.text.body,
    },
  })
  return styles
})

export default StatusBar
