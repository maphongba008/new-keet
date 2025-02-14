import { TextButton, type ButtonBaseProps } from '../../Button'

export default {
  title: 'Button/TextButton',
  component: TextButton,
}

const defaultProp: ButtonBaseProps & {
  text: string
  icon?: React.FC
  link?: boolean
  cancel?: boolean
  primary?: boolean
  gray?: boolean
  disabled?: boolean
} = {
  text: 'Text Button',
}
export const Default = {
  args: {
    ...defaultProp,
    text: 'This text button supports unlimited character more than two line',
  },
}
export const Cancel = {
  args: {
    ...defaultProp,
    cancel: true,
  },
}
export const Gray = {
  args: {
    ...defaultProp,
    gray: true,
  },
}
export const Primary = {
  args: {
    ...defaultProp,
    primary: true,
  },
}
export const Disabled = {
  args: {
    ...defaultProp,
    disabled: true,
  },
}
export const Link = {
  args: { ...defaultProp, link: true },
}
