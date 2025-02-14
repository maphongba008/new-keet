## Overview

Add accessibility label (android) and test id (ios) to perform Mobile Automation using Appium framework & E2E testing.

Read more at: https://appium.io/docs/en/about-appium/getting-started/index.html

### How to add testID to a component?

1. Avoid using `testID` directly in component, instead, put them to **APPIUM_IDs** object in `src/lib/appium`, with the format `<screen>_<component-type>_<component-name>`

2. Pass Accessibility Label & Test ID to component prop.

3. For custom component, that use ButtonBase or ButtonBase subclass (like IconButton or TextButton), just need to pass `testID` to that component.

Example:

```jsx
<IconButton onPress={onPressPaste} testID={APPIUM_IDs.lobby_btn_paste}>
  <SvgIcon
    name="paste"
    width={ICON_SIZE_16}
    height={ICON_SIZE_16}
    color={colors.white_snow}
  />
</IconButton>
```

4. For 3rd party component, call **appiumTestProps(key)** from `helpers/appium.js` with spread operator to get Accessibility Label and Test ID.

Example:

```jsx
<BottomSheetTextInput
  placeholder=""
  value={value}
  {...appiumTestProps(APPIUM_IDs.lobby_input_room_name)}
/>
```
