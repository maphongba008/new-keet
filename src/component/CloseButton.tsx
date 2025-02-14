import { UI_SIZE_24 } from 'lib/commonStyles'
import { back } from 'lib/navigation'

import { ButtonBaseProps, IconButton } from './Button'
import SvgIcon from './SvgIcon'
import { colors } from './theme'

interface CloseButtonProps extends Omit<ButtonBaseProps, 'children'> {
  /**
   * Width of the close button icon.
   * @default UI_SIZE_24
   */
  width?: number

  /**
   * Height of the close button icon.
   * @default UI_SIZE_24
   */
  height?: number

  /**
   * Color of the close button icon.
   * @default colors.white_snow
   */
  color?: string
}

export const CloseButton: React.FC<CloseButtonProps> = ({
  width = UI_SIZE_24,
  height = UI_SIZE_24,
  color = colors.keet_grey_200,
  onPress = back,
  style,
  ...props
}) => {
  return (
    <IconButton onPress={onPress} style={style} {...props}>
      <SvgIcon name="x" width={width} height={height} color={color} />
    </IconButton>
  )
}
