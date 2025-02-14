import { localStorage } from './storage'
import { CONFIG_CONSENT_VERSION, Keys } from './storageConstants'
import { jsonParse, parseNumber } from './storageUtils'
import { setStorageShowWalkthroughTooltip } from './storageWalkthroughTooltip'

/**
 * Checks if the user needs to give consent based on the last consent date.
 * @returns True if consent is needed, otherwise false.
 */
export const getStorageNeedsConsent = (): boolean => {
  const value = localStorage.getItem(Keys.LAST_CONSENT_DATE_KEY)
  return value ? parseNumber(value) !== CONFIG_CONSENT_VERSION : true
}

/**
 * Marks the consent as given by setting the last consent date.
 */
export const setStorageNeedsConsentDone = (): void => {
  localStorage.setItem(Keys.LAST_CONSENT_DATE_KEY, `${CONFIG_CONSENT_VERSION}`)
}

/**
 * Checks if the user needs onboarding.
 * @returns True if onboarding is needed, otherwise false.
 */
export const getStorageNeedsOnBoarding = (): boolean => {
  const value = localStorage.getBooleanItem(Keys.NEEDS_ON_BOARDING)
  return value === undefined ? true : value
}

/**
 * Marks the onboarding as done and sets the walkthrough tooltip to be shown.
 */
export const setStorageNeedsOnBoardingDone = (): void => {
  localStorage.setBooleanItem(Keys.NEEDS_ON_BOARDING, false)
  setStorageShowWalkthroughTooltip()
}

/**
 * Retrieves the flag indicating if the identity onboarding modal was skipped.
 * @returns True if skipped, otherwise false.
 */
export const getStorageIdentityModalSkipped = (): boolean | undefined => {
  return jsonParse<boolean>(
    localStorage.getItem(Keys.IDENTITY_ONBOARD_MODAL_SKIPPED),
  )
}

/**
 * Marks the identity onboarding modal as skipped.
 */
export const setStorageIdentityModalSkipped = (): void => {
  localStorage.setBooleanItem(Keys.IDENTITY_ONBOARD_MODAL_SKIPPED, true)
}
