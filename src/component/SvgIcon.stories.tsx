import SvgIcon from './SvgIcon'
import * as icons from '../resources'

export default {
  title: 'SvgIcon',
  component: SvgIcon,
  argTypes: {
    name: {
      options: Object.keys(icons),
      control: { type: 'radio' },
    },
  },
}

export const Default = {
  args: {
    name: 'astronaut',
  },
}
