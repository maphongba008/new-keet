import dayjs from 'dayjs'

import { timeToLastMessage } from '../date'

jest.mock('i18n/strings', () => ({
  getStrings: () => ({
    date: {
      short: {
        years: 'y',
        months: 'mo',
        days: 'd',
        hours: 'h',
        minutes: 'm',
        seconds: 's',
        now: 'now',
      },
    },
  }),
}))

describe('timeToLastMessage', () => {
  beforeEach(() => {
    // Mock the current time to a fixed value for consistent testing
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2024-03-15T12:00:00Z'))
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('should return "now" for current timestamp', () => {
    const now = Date.now()
    expect(timeToLastMessage(now)).toBe('now')
  })

  it('should return seconds difference', () => {
    const timestamp = dayjs().subtract(30, 'second').valueOf()
    expect(timeToLastMessage(timestamp)).toBe('30s')
  })

  it('should return minutes difference', () => {
    const timestamp = dayjs().subtract(5, 'minute').valueOf()
    expect(timeToLastMessage(timestamp)).toBe('5m')
  })

  it('should return hours difference', () => {
    const timestamp = dayjs().subtract(3, 'hour').valueOf()
    expect(timeToLastMessage(timestamp)).toBe('3h')
  })

  it('should return days difference', () => {
    const timestamp = dayjs().subtract(4, 'day').valueOf()
    expect(timeToLastMessage(timestamp)).toBe('4d')
  })

  it('should return months difference', () => {
    const timestamp = dayjs().subtract(2, 'month').valueOf()
    expect(timeToLastMessage(timestamp)).toBe('2mo')
  })

  it('should return years difference', () => {
    const timestamp = dayjs().subtract(1, 'year').valueOf()
    expect(timeToLastMessage(timestamp)).toBe('1y')
  })
})
