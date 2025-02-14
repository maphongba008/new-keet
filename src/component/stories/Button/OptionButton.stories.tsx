import { OptionButton, type ButtonBaseProps } from '../../Button'

export default {
  title: 'Button/Option',
  component: OptionButton,
}

const defaultProp: ButtonBaseProps & {
  text: string
  selected: boolean
} = {
  text: 'Test',
  selected: false,
}
export const OnOff = {
  args: {
    ...defaultProp,
  },
}
export const WithStyle = {
  args: {
    ...defaultProp,
    selected: true,
    ...{
      style: {
        width: '33%',
        height: 54,
      },
    },
  },
}
