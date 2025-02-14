## Handling Rive animations

### Overview

Our project uses rive for our animations instead of lottie. To find existing rive animation usage in the codebase, search for `rive-react-native`.

### Adding a new local .riv file

Follow the official [documentation](https://rive.app/community/doc/loading-in-rive-files/doc8P5oDeLlH) on how to add local assets.

### Patch

Currently wrapping rive in touchable `<TouchableOpacity onPress={}><Rive/><TouchableOpacity>` , `onPress` would not work because inside rive's source code there's a TouchableOpacity which intercepts all touch event. We [patch](../patches/rive-react-native+6.2.3.patch) it to add a `isDisableTouch` condition.

### Caveat

- Certain `.riv` files(custom emojis) doesn't fire `onLoopEnd()` on iOS. Maybe it has something to do with how the file is created or different version of it. Fallback to use [`setTimeout -> pause()`](../src/component/EmojiRive.tsx) instead.
