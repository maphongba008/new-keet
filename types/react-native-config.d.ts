declare module 'react-native-config' {
  export interface KeetConfig {
    KEET_VARIANT: string
    KEET_APP_SUFFIX: string
    KEET_SCHEME_PEAR: string
    KEET_SCHEME_KEET: string
  }

  export const Config: KeetConfig
  export default Config
}
