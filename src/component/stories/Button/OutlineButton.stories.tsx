import SvgIcon from 'component/SvgIcon'
import { ICON_SIZE_16, OUTLINE_BUTTON_COLOR } from 'lib/commonStyles'

import { OutlineButton, type OutlineButtonProps } from '../../Button'

export default {
  title: 'Button/Outline',
  component: OutlineButton,
}

const defaultProp: OutlineButtonProps = {
  title: 'Title',
  subtitle: 'Subtitle',
}
export const Default = {
  args: { ...defaultProp },
}

export const Color = {
  args: { ...defaultProp, color: 'red' },
}

export const PrimaryIcon = {
  args: {
    ...defaultProp,
    PrimaryIcon: () => (
      <SvgIcon
        color={OUTLINE_BUTTON_COLOR}
        width={ICON_SIZE_16}
        height={ICON_SIZE_16}
        name="arrowRightFromBracket"
      />
    ),
  },
}

export const SecondaryIcon = {
  args: {
    ...defaultProp,
    subtitle: 'Subtitle',
    PrimaryIcon: () => (
      <SvgIcon
        color={OUTLINE_BUTTON_COLOR}
        width={ICON_SIZE_16}
        height={ICON_SIZE_16}
        name="arrowRightFromBracket"
      />
    ),
    SecondaryIcon: () => (
      <SvgIcon
        color={OUTLINE_BUTTON_COLOR}
        width={ICON_SIZE_16}
        height={ICON_SIZE_16}
        name="arrowRightFromBracket"
      />
    ),
  },
}

export const IconColor = {
  args: {
    title: 'Title',
    subtitle: 'Subtitle',
    PrimaryIcon: (props: any) => (
      <SvgIcon
        color={OUTLINE_BUTTON_COLOR}
        width={ICON_SIZE_16}
        height={ICON_SIZE_16}
        name="arrowRightFromBracket"
        {...props}
      />
    ),
    iconColor: 'green',
    SecondaryIcon: (props: any) => (
      <SvgIcon
        color={OUTLINE_BUTTON_COLOR}
        width={ICON_SIZE_16}
        height={ICON_SIZE_16}
        name="arrowRightFromBracket"
        {...props}
      />
    ),
  },
}
