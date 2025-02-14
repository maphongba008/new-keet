import { useCallback } from 'react'
import { StyleSheet } from 'react-native'
import { useSelector } from 'react-redux'

import { getShowStats } from 'reducers/application'

import { OptionButton } from 'component/Button'
import { APPIUM_IDs, appiumTestProps } from 'lib/appium'
import s, { DIRECTION_CODE } from 'lib/commonStyles'
import { CAPABILITIES, INVITE_DURATION } from 'lib/constants'

import { useStrings } from 'i18n/strings'

interface OptionButtonGroupProps {
  isChannel: boolean
  canIndex: number
  invitationType: number
  duration: string | null
  setDuration: (duration: string) => void
}

const OptionButtonGroup: React.FC<OptionButtonGroupProps> = ({
  isChannel,
  canIndex,
  invitationType,
  duration,
  setDuration,
}) => {
  const showStats = useSelector(getShowStats)
  const strings = useStrings()
  const setDurationDays = useCallback(
    () => setDuration(INVITE_DURATION.DAYS),
    [setDuration],
  )
  const setDurationWeeks = useCallback(
    () => setDuration(INVITE_DURATION.WEEKS),
    [setDuration],
  )
  const setDurationNoExpire = useCallback(() => setDuration('0'), [setDuration])
  const setDurationHours = useCallback(
    () => setDuration(INVITE_DURATION.HOURS),
    [setDuration],
  )

  // can create noexpiry link for peer invite
  // when in channel or room admin enabled show dev stats
  const isNoExpiryEnabled =
    invitationType === CAPABILITIES.CAN_WRITE &&
    (isChannel || (showStats && canIndex))

  const TWOHOUR = {
    text: strings.room.period.twohours,
    condition: duration === INVITE_DURATION.HOURS,
    onPress: setDurationHours,
    testProps: appiumTestProps(APPIUM_IDs.invite_btn_expires_hours),
    enabled: !isNoExpiryEnabled,
  }
  const TWODAY = {
    text: strings.room.period.twodays,
    condition: duration === INVITE_DURATION.DAYS,
    onPress: setDurationDays,
    testProps: appiumTestProps(APPIUM_IDs.invite_btn_expires_days),
    enabled: true,
  }
  const TWOWEEK = {
    text: strings.room.period.twoweeks,
    condition: duration === INVITE_DURATION.WEEKS,
    onPress: setDurationWeeks,
    testProps: appiumTestProps(APPIUM_IDs.invite_btn_expires_weeks),
    enabled: true,
  }
  const NOEXPIRY = {
    text: strings.room.period.noExpiry,
    condition: duration === '0',
    onPress: setDurationNoExpire,
    testProps: appiumTestProps(APPIUM_IDs.invite_btn_no_expire),
    enabled: isNoExpiryEnabled,
  }

  const options = [TWOHOUR, TWODAY, TWOWEEK, NOEXPIRY].filter(
    (item) => item.enabled,
  )

  return options.map((option, index) => (
    <OptionButton
      key={index}
      text={option.text}
      selected={option.condition}
      onPress={option.onPress}
      style={styles.feedbackButton}
      textStyle={styles.feedbackText}
      {...option.testProps}
    />
  ))
}

const styles = StyleSheet.create({
  feedbackButton: {
    ...s.container,
    ...s.alignSelfStretch,
  },
  feedbackText: {
    fontSize: 14,
    writingDirection: DIRECTION_CODE,
  },
})

export default OptionButtonGroup
