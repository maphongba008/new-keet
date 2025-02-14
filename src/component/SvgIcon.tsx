import React from 'react'
import isEqual from 'react-fast-compare'
import { SvgXml } from 'react-native-svg'
import { StyleProp, type ColorValue, type ViewStyle } from 'react-native/types'

import { ICON_SIZE_16, ICON_SIZE_20, ICON_SIZE_24 } from 'lib/commonStyles'

// Import SVG resources
import * as icons from '../resources'

// Define a type for the icon names, inferring from the imported icons
export type SvgIconType = keyof typeof icons

// Define default dimensions for specific icons
const defaultDimensions: Partial<{
  [key in SvgIconType]: { width: number; height: number }
}> = {
  astronaut: { width: 300, height: 158 },
  admin_icon: { width: ICON_SIZE_24, height: ICON_SIZE_24 },
  channel_disclaimer_icon: { width: 200, height: 160 },
  chats: { width: 20, height: 20 },
  chat_placeholder_video: { width: 46, height: 56 },
  chat_placeholder_audio: { width: 28, height: 28 },
  chat_placeholder_image: { width: 46, height: 56 },
  chat_placeholder_file_any: { width: 46, height: 56 },
  checkCircle: { width: ICON_SIZE_16, height: ICON_SIZE_16 },
  chevronLeft: { width: ICON_SIZE_24, height: ICON_SIZE_24 },
  chevronRight: { width: ICON_SIZE_24, height: ICON_SIZE_24 },
  chevronUp: { width: ICON_SIZE_24, height: ICON_SIZE_24 },
  check_star_icon: { width: ICON_SIZE_24, height: ICON_SIZE_24 },
  keetFilled: { width: ICON_SIZE_24, height: ICON_SIZE_24 },
  megaphone: { width: ICON_SIZE_24, height: ICON_SIZE_24 },
  moderator_icon: { width: ICON_SIZE_24, height: ICON_SIZE_24 },
  newspaper: { width: ICON_SIZE_24, height: ICON_SIZE_24 },
  newVersion: { width: 167, height: 122 },
  pear_gray: { width: 12, height: ICON_SIZE_16 },
  peer_icon: { width: ICON_SIZE_24, height: ICON_SIZE_24 },
  play: { width: 20, height: 20 },
  profileTooltip: { width: ICON_SIZE_24, height: ICON_SIZE_24 },
  settings: { width: ICON_SIZE_24, height: ICON_SIZE_24 },
  users: { width: ICON_SIZE_24, height: ICON_SIZE_24 },
  usersThree: { width: ICON_SIZE_24, height: ICON_SIZE_24 },
  warning: { width: ICON_SIZE_16, height: ICON_SIZE_16 },
  mail: { width: ICON_SIZE_20, height: ICON_SIZE_20 },
  user: { width: ICON_SIZE_20, height: ICON_SIZE_20 },
  phone: { width: ICON_SIZE_20, height: ICON_SIZE_20 },
  bulbGradient: { width: 36, height: 36 },
}

interface SvgIconProps {
  name: SvgIconType
  color?: ColorValue
  width?: number
  height?: number
  style?: StyleProp<ViewStyle>
}

export const getDefaultIconDimensions = (name: SvgIconType) =>
  defaultDimensions[name]

const SvgIcon: React.FC<SvgIconProps> = React.memo(
  ({
    name,
    width,
    height,
    color = 'transparent',
    style = {},
  }: SvgIconProps) => {
    const icon = icons[name]
    const { width: defaultWidth, height: defaultHeight } =
      getDefaultIconDimensions(name) || {}

    return (
      <SvgXml
        testID={`svg-icon-${name}`}
        xml={icon}
        color={color}
        fill={color}
        width={width ?? defaultWidth ?? '100%'}
        height={height ?? defaultHeight ?? '100%'}
        style={style}
      />
    )
  },
  isEqual,
)

export default SvgIcon
