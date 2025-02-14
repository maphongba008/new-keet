# Why Customization

Keet Mobile need support different varients of features and themes to fullfil the different partnership requirements.

## What can be customized

We could assign different feature sets to the `APP`, which pre-defined different feature sets.

https://github.com/holepunchto/keet-mobile/blob/main/src/lib/build.constants.ts#L41

When we need a separate build, we can also use `scripts/setup-[folder]` to further patch or replace assets.

## How to setup a separate build

In `scripts/` folder there's `setup-sv.sh` for El Salvador 🇸🇻 customization. The `sv` folder host all El Salvador 🇸🇻 related assets.

To build the customized build,

1. follow [[STORES]] to config android/ios build correctly.

2. run `setup-[sv].sh` command to setup custom build.

```sh
./scripts/setup-sv.sh
a
```

3. For ios build its the same path; For Android build run command

`cd android && ./gradlew clean && ./gradlew assembleSvRelease` (To be improved)
