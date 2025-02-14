import { StyleSheet, View } from 'react-native'
import SvgQRCode from 'react-native-qrcode-svg'

import { UI_SIZE_4, UI_SIZE_8 } from 'lib/commonStyles'

import { colors } from './theme'

const SVG_LOGO_SIZE = 45

type QRCodeProps = {
  value: string
  size?: number
  color?: string
  backgroundColor?: string
  logoSVG?: string
}

export const QRCode = ({
  value,
  size = 150,
  backgroundColor = '#FFF',
  color = '#000',
  logoSVG,
}: QRCodeProps) => {
  return (
    <View style={styles.qrCode}>
      <SvgQRCode
        {...{
          value,
          size,
          color,
          backgroundColor,
          ecl: 'M',
          logoSVG,
          logoSize: SVG_LOGO_SIZE,
          logoBorderRadius: UI_SIZE_8,
          logoColor: colors.keet_grey_000,
          logoMargin: UI_SIZE_4,
        }}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  qrCode: {
    backgroundColor: colors.white_snow,
    padding: UI_SIZE_8,
  },
})
