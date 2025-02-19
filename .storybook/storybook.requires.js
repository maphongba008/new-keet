/* do not change this file, it is auto generated by storybook. */

import {
  addArgsEnhancer,
  addDecorator,
  addParameters,
  clearDecorators,
  configure,
} from '@storybook/react-native'

import '@storybook/addon-ondevice-controls/register'
import '@storybook/addon-ondevice-actions/register'

import { argsEnhancers } from '@storybook/addon-actions/dist/modern/preset/addArgs'

import { decorators, parameters } from './preview'

global.STORIES = [
  {
    titlePrefix: '',
    directory: './.storybook/stories',
    files: '**/*.stories.?(ts|tsx|js|jsx)',
    importPathMatcher:
      '^\\.[\\\\/](?:\\.storybook\\/stories(?:\\/(?!\\.)(?:(?:(?!(?:^|\\/)\\.).)*?)\\/|\\/|$)(?!\\.)(?=.)[^/]*?\\.stories\\.(?:ts|tsx|js|jsx)?)$',
  },
  {
    titlePrefix: '',
    directory: './src/component',
    files: '*.stories.?(ts|tsx|js|jsx)',
    importPathMatcher:
      '^\\.[\\\\/](?:src\\/component\\/(?!\\.)(?=.)[^/]*?\\.stories\\.(?:ts|tsx|js|jsx)?)$',
  },
  {
    titlePrefix: '',
    directory: './src/component',
    files: '**/*.stories.?(ts|tsx|js|jsx)',
    importPathMatcher:
      '^\\.[\\\\/](?:src\\/component(?:\\/(?!\\.)(?:(?:(?!(?:^|\\/)\\.).)*?)\\/|\\/|$)(?!\\.)(?=.)[^/]*?\\.stories\\.(?:ts|tsx|js|jsx)?)$',
  },
]

if (decorators) {
  if (__DEV__) {
    // stops the warning from showing on every HMR
    require('react-native').LogBox.ignoreLogs([
      '`clearDecorators` is deprecated and will be removed in Storybook 7.0',
    ])
  }
  // workaround for global decorators getting infinitely applied on HMR, see https://github.com/storybookjs/react-native/issues/185
  clearDecorators()
  decorators.forEach((decorator) => addDecorator(decorator))
}

if (parameters) {
  addParameters(parameters)
}

try {
  argsEnhancers.forEach((enhancer) => addArgsEnhancer(enhancer))
} catch {}

const getStories = () => {
  return {
    './src/component/SvgIcon.stories.tsx': require('../src/component/SvgIcon.stories.tsx'),
    './src/component/stories/Button/OptionButton.stories.tsx': require('../src/component/stories/Button/OptionButton.stories.tsx'),
    './src/component/stories/Button/OutlineButton.stories.tsx': require('../src/component/stories/Button/OutlineButton.stories.tsx'),
    './src/component/stories/Button/TextButton.stories.tsx': require('../src/component/stories/Button/TextButton.stories.tsx'),
    './src/component/SvgIcon.stories.tsx': require('../src/component/SvgIcon.stories.tsx'),
  }
}

configure(getStories, module, false)
