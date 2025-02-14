import { I18nManager } from 'react-native'
import dayjs from 'dayjs'
import { reloadAppAsync } from 'expo'
import { getLocales } from 'expo-localization'
import { create } from 'zustand'

import { showBottomSheet } from 'component/AppBottomSheet/AppBottomSheet.Store'
import BottomSheetEnum from 'component/AppBottomSheet/SheetComponents/BottomSheetEnum'
import { Keys, localStorage } from 'lib/localStorage'
import { back } from 'lib/navigation'

import arStrings from './ar-SA.json'
import deStrings from './de-DE.json'
import enStrings from './en.json'
import esStrings from './es-ES.json'
import frStrings from './fr-FR.json'
import hiStrings from './hi-IN.json'
import itStrings from './it-IT.json'
import kaStrings from './ka-GE.json'
import nlStrings from './nl-NL.json'
import ptStrings from './pt-PT.json'
import roStrings from './ro-RO.json'
import ruStrings from './ru-RU.json'
import trStrings from './tr-TR.json'
import ukStrings from './uk-UA.json'
import viStrings from './vi-VN.json'
import cnStrings from './zh-CN.json'
import twStrings from './zh-TW.json'

export type Strings = typeof enStrings

// the language menu string should be consistent through all translations
export const LANGUAGE_MENU: Record<string, string> = {
  'lang-ar': 'عربى',
  'lang-de': 'Deutsch',
  'lang-en': 'English',
  'lang-es': 'Español',
  'lang-fr': 'Français',
  'lang-hi': 'हिन्दी',
  'lang-it': 'Italiano',
  'lang-ka': 'ქართული',
  'lang-nl': 'Nederlands',
  'lang-pt': 'Português',
  'lang-ro': 'Română',
  'lang-ru': 'Русский',
  'lang-tr': 'Türkçe',
  'lang-tw': '中文 (繁體)',
  'lang-uk': 'Українська',
  'lang-vi': 'Tiếng Việt',
  'lang-zh': '中文 (简体)',
}

// define support languages in order
export const SUPPORT_LANGUAGES: Record<string, string> = {
  ar: 'ar',
  de: 'de',
  en: 'en',
  es: 'es',
  fr: 'fr',
  hi: 'hi',
  it: 'it',
  ka: 'ka',
  nl: 'nl',
  pt: 'pt',
  ro: 'ro',
  ru: 'ru',
  tr: 'tr',
  tw: 'tw',
  uk: 'uk',
  vi: 'vi',
  zh: 'zh',
}

// define datejs support languages in order.
// also MUST "import 'dayjs/locale/uk'" in lib/date.ts
// List of supported lang https://github.com/iamkun/dayjs/tree/dev/src/locale
export const DATEJS_SUPPORT_LANGUAGES: Record<string, string> = {
  ar: 'ar',
  de: 'de',
  en: 'en',
  es: 'es',
  fr: 'fr',
  hi: 'hi',
  it: 'it',
  ka: 'ka',
  nl: 'nl',
  pt: 'pt',
  ro: 'ro',
  ru: 'ru',
  tr: 'tr',
  tw: 'zh-tw',
  uk: 'uk',
  vi: 'vi',
  zh: 'zh-cn',
}

export const RTL_LANGUAGES = ['ar']

// languageTag
const getDefaultLang = () => {
  const { languageCode, regionCode } = getLocales()[0]
  return languageCode === 'zh'
    ? regionCode === 'TW'
      ? 'tw'
      : languageCode
    : languageCode
}
export const DEFAULT_LANGUAGE =
  SUPPORT_LANGUAGES[getDefaultLang() as string] || SUPPORT_LANGUAGES.en
export const DEFAULT_STRINGS = enStrings

const LOCALES = {
  [SUPPORT_LANGUAGES.ar ?? 'ar']: arStrings,
  [SUPPORT_LANGUAGES.de]: deStrings,
  [SUPPORT_LANGUAGES.en]: enStrings,
  [SUPPORT_LANGUAGES.es]: esStrings,
  [SUPPORT_LANGUAGES.fr]: frStrings,
  [SUPPORT_LANGUAGES.hi]: hiStrings,
  [SUPPORT_LANGUAGES.it]: itStrings,
  [SUPPORT_LANGUAGES.ka]: kaStrings,
  [SUPPORT_LANGUAGES.nl]: nlStrings,
  [SUPPORT_LANGUAGES.pt]: ptStrings,
  [SUPPORT_LANGUAGES.ro]: roStrings,
  [SUPPORT_LANGUAGES.ru]: ruStrings,
  [SUPPORT_LANGUAGES.tr]: trStrings,
  [SUPPORT_LANGUAGES.tw]: twStrings,
  [SUPPORT_LANGUAGES.uk]: ukStrings,
  [SUPPORT_LANGUAGES.vi]: viStrings,
  [SUPPORT_LANGUAGES.zh]: cnStrings,
}

interface StringsState {
  locale: string
  changeLanguage: (locale: string) => void
}

// Get the initial locale from storage or fall back to default
const currentLocale =
  localStorage.getItem(Keys.I18N_LOCALE_KEY) ?? DEFAULT_LANGUAGE

// Initialize RTL state on app startup
export const isRTL = RTL_LANGUAGES.includes(currentLocale)
// We need to set the initial RTL state, but only once at app startup
if (I18nManager.isRTL !== isRTL) {
  I18nManager.allowRTL(isRTL)
  I18nManager.forceRTL(isRTL)
  // No need to reload here as this is initial setup
}

/**
 * Determines if there's a need for RTL direction change between two languages
 * @param currentLang - Current language code
 * @param newLang - New language code to switch to
 * @returns Object containing RTL states and whether a change is needed
 */
const getRTLChangeInfo = (currentLang: string, newLang: string) => {
  const isCurrentRTL = RTL_LANGUAGES.includes(currentLang)
  const isNewRTL = RTL_LANGUAGES.includes(newLang)
  const needsRTLChange = isCurrentRTL !== isNewRTL
  return { isCurrentRTL, isNewRTL, needsRTLChange }
}

/**
 * Handles the language change process including RTL adjustments.
 *
 * @param set - Zustand state setter function
 * @param lang - Target language code
 *
 * Key points about RTL handling:
 * 1. We only force RTL changes when actually switching between RTL and LTR languages
 * 2. The app must be reloaded after an RTL change to ensure proper UI reconstruction
 * 3. We handle the RTL change and reload in a single place to avoid race conditions
 */
const setLang = async (
  set: (config: { locale: string }) => void,
  lang: string,
) => {
  // Get the current language from the store to ensure we're using fresh data
  const currentLang = useStore.getState().locale
  const { isNewRTL, needsRTLChange } = getRTLChangeInfo(currentLang, lang)

  // Handle RTL changes first before any other state updates
  if (needsRTLChange) {
    // Force RTL change immediately
    I18nManager.allowRTL(isNewRTL)
    I18nManager.forceRTL(isNewRTL)

    // Ensure the RTL change is applied
    await new Promise((resolve) => setTimeout(resolve, 0))
  }

  // Update the language state and persist it
  set({ locale: lang })
  localStorage.setItem(Keys.I18N_LOCALE_KEY, lang)
  dayjs.locale(DATEJS_SUPPORT_LANGUAGES[lang])

  // Only reload if we changed RTL state
  if (needsRTLChange) {
    await reloadAppAsync()
  }
}

const useStore = create<StringsState>((set) => ({
  locale: currentLocale,
  changeLanguage: async (lang: string) => {
    // Always use the current state value instead of module-level variables
    // to avoid stale data issues
    const currentLang = useStore.getState().locale
    const strings = getStrings()
    const { needsRTLChange } = getRTLChangeInfo(currentLang, lang)

    // Show a warning only when switching between RTL and LTR languages
    // since this requires a full app reload
    if (needsRTLChange) {
      showBottomSheet({
        bottomSheetType: BottomSheetEnum.ConfirmDialog,
        description: strings.account.languageWarning,
        confirmButton: {
          text: strings.account.closeKeet,
          onPress: () => setLang(set, lang),
        },
      })
    } else {
      // For same-direction changes, we can switch immediately
      await setLang(set, lang)
      back()
    }
  },
}))

export const useLocale = () => useStore(({ locale }) => locale)
export const useStrings = () =>
  useStore(({ locale }) => LOCALES[locale] as Strings)
export const getStrings = () => LOCALES[useStore.getState().locale]
export const useChangeLanguage = () =>
  useStore(({ changeLanguage }) => changeLanguage)
