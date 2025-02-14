import { Dimensions, I18nManager, StyleSheet } from 'react-native'

import { isAndroid } from './platform'

export const UI_SIZE_2 = 2
export const UI_SIZE_4 = 4
export const UI_SIZE_6 = 6
export const UI_SIZE_8 = 8
export const UI_SIZE_10 = 10
export const UI_SIZE_12 = 12
export const UI_SIZE_14 = 14
export const UI_SIZE_16 = 16
export const UI_SIZE_18 = 18
export const UI_SIZE_20 = 20
export const UI_SIZE_24 = 24
export const UI_SIZE_32 = 32
export const UI_SIZE_36 = 36
export const UI_SIZE_40 = 40
export const UI_SIZE_42 = 42
export const UI_SIZE_44 = 44
export const UI_SIZE_48 = 48
export const UI_SIZE_64 = 64
export const UI_SIZE_120 = 120

export const ICON_SIZE_8 = 8
export const ICON_SIZE_14 = 14
export const ICON_SIZE_15 = 15
export const ICON_SIZE_16 = 16
export const ICON_SIZE_20 = 20
export const ICON_SIZE_24 = 24
export const ICON_SIZE_28 = 28
export const ICON_SIZE_32 = 32
export const ICON_SIZE_44 = 44
export const ICON_SIZE_64 = 64
export const ICON_SIZE_72 = 72
export const ICON_SIZE_90 = 90
export const ICON_SIZE_112 = 112
export const ICON_SIZE_120 = 120
export const ICON_SIZE_130 = 130
export const ICON_SIZE_512 = 512

export const FONT_SIZE_100 = '100'
export const FONT_SIZE_200 = '200'
export const FONT_SIZE_300 = '300'
export const FONT_SIZE_400 = '400'
export const FONT_SIZE_500 = '500'
export const FONT_SIZE_600 = '600'
export const FONT_SIZE_700 = '700'
export const FONT_SIZE_800 = '800'
export const FONT_SIZE_900 = '900'
export const FONT_SIZE_BOLD = 'bold'
export const FONT_SIZE_BLACK = 'black'
export const FONT_SIZE_CONDENSED = 'condensed'

export const DEFAULT_AVATAR_COLORS = [
  '#7994F2',
  '#F2B379',
  '#F27983',
  '#2AAAAA',
]
export const NETWORK_WARNING = '#F2B414'
export const TRANSPARENT = 'transparent'
export const INPUT_ICON_COLOR = 'rgba(50, 58, 76, 0.5)'
export const ADMIN_WARNING_CONTAINER = 'rgba(255, 191, 0, 0.2)' // #FFBF00 with 20% transparency
export const INVITE_TEXT = '#646C7E'
export const BORDER_SEPARATOR_COLOR = '#1F2430'
export const OUTLINE_BUTTON_COLOR = '#FFA597'
export const SENDER_HIGHLIGHT_BG_COLOR = '#288DA8'
export const RECEIVER_HIGHLIGHT_BG_COLOR = '#3F424D'

export const { width, height } = Dimensions.get('window')

export const DIRECTION = I18nManager.isRTL ? 'right' : 'left'
export const DIRECTION_REVERSE = I18nManager.isRTL ? 'left' : 'right'
export const DIRECTION_CODE = I18nManager.isRTL ? 'rtl' : 'ltr'
export const LAYOUT_MARK = isAndroid ? (I18nManager.isRTL ? '‏' : '‎') : ''

export const commonStyles = StyleSheet.create({
  absolute: { position: 'absolute' },
  absoluteFill: StyleSheet.absoluteFillObject,
  alignItemsCenter: { alignItems: 'center' },
  alignItemsEnd: { alignItems: 'flex-end' },
  alignItemsStart: { alignItems: 'flex-start' },
  alignSelfCenter: { alignSelf: 'center' },
  alignSelfEnd: { alignSelf: 'flex-end' },
  alignSelfStart: { alignSelf: 'flex-start' },
  alignSelfStretch: { alignSelf: 'stretch' },
  bidirectionalInput: {
    textAlign: DIRECTION,
    writingDirection: DIRECTION_CODE,
  },
  capitalize: { textTransform: 'capitalize' },
  centerAlignedRow: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  centeredLayout: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  column: { flexDirection: 'column' },
  container: { flex: 1 },
  // display: 'none' not always works correctly when component becomes visible again
  flex: { display: 'flex' },
  flex0: { flex: 0 },
  flex0_5: { flex: 0.5 },
  flexGrow: { flexGrow: 1 },
  flexSpaceAround: { justifyContent: 'space-around' },
  flexSpaceBetween: { justifyContent: 'space-between' },
  fullHeight: { height: '100%' },
  fullWidth: { width: '100%' },
  gap12: { gap: UI_SIZE_12 },
  hidden: { opacity: 0, position: 'absolute' },
  justifyCenter: {
    justifyContent: 'center',
  },
  justifyEnd: {
    justifyContent: 'flex-end',
  },
  justifyStart: {
    justifyContent: 'flex-start',
  },
  noMargin: { margin: 0 },
  noPadding: { padding: 0 },
  overflowHidden: { overflow: 'hidden' },
  overflowVisible: { overflow: 'visible' },
  posRelative: { position: 'relative' },
  row: { flexDirection: 'row' },
  rowCenterStart: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  rowReverse: { flexDirection: 'row-reverse' },
  rowStartCenter: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  textAlignCenter: { textAlign: 'center' },
  textAlignLeft: { textAlign: 'left' },
  textAlignRight: { textAlign: 'right' },
  textStrike: { textDecorationLine: 'line-through' },
  textUnderline: { textDecorationLine: 'underline' },
  uppercase: { textTransform: 'uppercase' },
  wrapFlex: { flexWrap: 'wrap' },
})

export default commonStyles
