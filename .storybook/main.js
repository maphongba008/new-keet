module.exports = {
  stories: [
    './stories/**/*.stories.?(ts|tsx|js|jsx)',
    '../src/component/*.stories.?(ts|tsx|js|jsx)',
    '../src/component/**/*.stories.?(ts|tsx|js|jsx)',
  ],
  addons: [
    '@storybook/addon-ondevice-controls',
    '@storybook/addon-ondevice-actions',
  ],
}
