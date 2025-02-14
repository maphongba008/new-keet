## Package upgrade

### Normal package upgrade

After merged dependency versions, can run [Bump Dependencies](https://github.com/holepunchto/keet-mobile/actions/workflows/bump-deps.yml) github action to update the `package-lock` file.

The `Bump Dependencies` github action also support change the following keet related packages on UI:

- mobile core (from [Keet-Mobile-Core](https://github.com/holepunchto/keet-mobile-core)) \*
- [keet-call](https://github.com/holepunchto/keet-call/commits/main)
- [holepunch webrtc](https://github.com/holepunchto/webrtc)
- [keet-store](https://github.com/holepunchto/keet-store) \*
- [emojis](https://github.com/holepunchto/emojis)
- [keet-core-api](https://github.com/holepunchto/keet-core-api)

### Keet-Mobile-Core upgrade

When [keet-core](https://github.com/holepunchto/keet-core) and related packages are updated, can run [Build Core](https://github.com/holepunchto/keet-mobile-core/actions/workflows/build-core.yml) github action in [keet-mobile-core](https://github.com/holepunchto/keet-mobile-core) to make a new mobile core.

Also confirm the [keet-call](https://github.com/holepunchto/keet-call/commits/main) version should align with the version contained in related [keet-mobile-core](https://github.com/holepunchto/keet-mobile-core/commits/main/).

### Keet-store upgrade

Same as normal package upgrade. Check [keet-store](https://github.com/holepunchto/keet-store/commits/main) to fix related changes.

---

### Expo/React Native upgrade

Can refer [EXPO bundled native modules](https://github.com/expo/expo/blob/main/packages/expo/bundledNativeModules.json) for current Expo SDK default packages.

Also check https://blog.expo.dev/ , [Expo Changelog](https://github.com/expo/expo/blob/main/CHANGELOG.md) and [React Native Changelog](https://github.com/facebook/react-native/blob/main/CHANGELOG.md) for related version notices, build and API changes.

#### Android support

For [GIF and WebP support on Android](https://reactnative.dev/docs/image#gif-and-webp-support-on-android), need upgrade `fresco` version related to the correspondent [React native package version](https://github.com/facebook/react-native/blob/main/packages/react-native/gradle/libs.versions.toml).
