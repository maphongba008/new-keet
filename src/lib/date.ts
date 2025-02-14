import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'
import isToday from 'dayjs/plugin/isToday'
import isYesterday from 'dayjs/plugin/isYesterday'
import LocalizedFormat from 'dayjs/plugin/localizedFormat'
import relativeTime from 'dayjs/plugin/relativeTime'
import utc from 'dayjs/plugin/utc'
import weekday from 'dayjs/plugin/weekday'

import {
  DATEJS_SUPPORT_LANGUAGES,
  DEFAULT_LANGUAGE,
  getStrings,
} from 'i18n/strings'

import { Keys, localStorage } from './localStorage'

import 'dayjs/locale/ar'
import 'dayjs/locale/de'
import 'dayjs/locale/es'
import 'dayjs/locale/fr'
import 'dayjs/locale/it'
import 'dayjs/locale/ka'
import 'dayjs/locale/nl'
import 'dayjs/locale/pt'
import 'dayjs/locale/ro'
import 'dayjs/locale/ru'
import 'dayjs/locale/tr'
import 'dayjs/locale/uk'
import 'dayjs/locale/vi'
import 'dayjs/locale/zh-cn'
import 'dayjs/locale/zh-tw'

const currentLocale =
  localStorage.getItem(Keys.I18N_LOCALE_KEY) ?? DEFAULT_LANGUAGE
if (currentLocale && DATEJS_SUPPORT_LANGUAGES[currentLocale]) {
  // Redundant checking (just putting here for future) because
  dayjs.locale(currentLocale) // so far datejs lang and our mobile app's lang are of exact match
}

dayjs.extend(relativeTime)
dayjs.extend(isToday)
dayjs.extend(isYesterday)
dayjs.extend(LocalizedFormat)
dayjs.extend(weekday)
dayjs.extend(duration)
dayjs.extend(utc)

export const timestampToRelativeTimeString = (date: number) => dayjs().to(date)

export const timestampToTimeString = (date: number) =>
  dayjs(date).format('HH:mm')

export const timestampToDay = (ts: number): string => {
  const date = dayjs(ts)
  const today = dayjs()
  const diff = today.diff(date, 'days')

  return date.isToday()
    ? getStrings().date.today
    : date.isYesterday()
      ? getStrings().date.yesterday
      : diff < 6
        ? date.format('dddd, D')
        : date.format('LL')
}

export const elapsedTime = (present: number, past: number): string => {
  const diff = present - past

  if (diff < 1000) {
    return `+${diff}ms`
  } else if (diff > 1000 && diff < 60000) {
    const secs =
      Math.round(dayjs(present).diff(past, 'second', true) * 100) / 100
    return `+${secs}s`
  }
  return `+${dayjs(present).diff(past, 'minutes')}m`
}

export const timeToLastMessage = (timestamp: number): string => {
  const {
    date: { short },
  } = getStrings()
  const date = dayjs(timestamp)
  const now = dayjs()

  const units: { unit: dayjs.UnitType; label: string }[] = [
    { unit: 'year', label: short.years },
    { unit: 'month', label: short.months },
    { unit: 'day', label: short.days },
    { unit: 'hour', label: short.hours },
    { unit: 'minute', label: short.minutes },
    { unit: 'second', label: short.seconds },
  ]

  for (const { unit, label } of units) {
    const diff = Math.max(0, now.diff(date, unit))
    if (diff) {
      return `${diff}${label}`
    }
  }

  return short.now
}

/**
 * Calculates the expiry date based on the specified duration in hours, days, and weeks,
 * and formats the result in "YYYY/M/D H:mm UTC".
 * Uses dayjs for precise and easy date manipulation and formatting.
 *
 * @param durationString string containing '2h'(2 hours) or '2d'(2 days) or '2w'(2 weeks) as strings. Each value represents
 *                        the duration that will be added to the current date to calculate the expiry date.
 * @returns The expiry date formatted as "YYYY/M/D H:mm UTC".
 */
export function calculateExpiryDateAndFormat(durationString: string): string {
  // Extract the numeric value and unit from the duration string
  const value = parseInt(durationString, 10)
  const unit = durationString.slice(-1) // Get the last character of the string
  // Calculate the duration based on the unit
  let durationFromUnit
  switch (unit) {
    case 'h':
      durationFromUnit = dayjs.duration(value, 'hour')
      break
    case 'd':
      durationFromUnit = dayjs.duration(value, 'day')
      break
    case 'w':
      durationFromUnit = dayjs.duration(value * 7, 'day') // Convert weeks to days
      break
    default:
      throw new Error('Invalid duration unit')
  }

  // Add the total duration to the current date and convert to UTC
  const expiryDate = dayjs().add(durationFromUnit).utc()

  // Format the date as "YYYY/M/D H:mm UTC".
  return expiryDate.format('YYYY/M/D H:mm') + ' UTC'
}

export const timestampToOutOfOrderTimestamp = (ts: number): string => {
  const date = dayjs(ts)

  return `${getStrings().chat.sent} ${date.format('dddd D')}`
}
