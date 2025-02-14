import { useCallback, useMemo, useState } from 'react'
import * as Application from 'expo-application'
import * as Device from 'expo-device'
import _debounce from 'lodash/debounce'

import { closeBottomSheet } from 'component/AppBottomSheet/AppBottomSheet.Store'
import { BACK_DEBOUNCE_DELAY, BACK_DEBOUNCE_OPTIONS } from 'lib/constants'
import { consoleError } from 'lib/errors'
import { showErrorNotifier, showInfoNotifier } from 'lib/hud'

import { useStrings } from 'i18n/strings'

import { useNetworkInfo } from './useNetworkInfo'

const { nativeApplicationVersion, nativeBuildVersion } = Application

const KEET_META = `${nativeApplicationVersion}_${nativeBuildVersion}`

export const FEEDBACK_TYPES = {
  bug: 'Bug reporting',
  feature: 'Feature',
  suggestion: 'Suggestions',
}

const useFeedback = ({ defaultFeedbackType = '' } = {}) => {
  const strings = useStrings()
  const [loading, setLoading] = useState<boolean>(false)
  const [text, setText] = useState<string>('')
  const [feedbackType, setFeedbackType] = useState<string>(defaultFeedbackType)
  const [sendDeviceData, setSendDeviceData] = useState<boolean>(false)

  const { carrier, networkDhtVersion } = useNetworkInfo()

  const canSubmit = useMemo(() => {
    return Boolean(feedbackType && text) && !loading
  }, [feedbackType, loading, text])

  const onPressBug = useCallback(() => setFeedbackType(FEEDBACK_TYPES.bug), [])
  const onPressFeature = useCallback(
    () => setFeedbackType(FEEDBACK_TYPES.feature),
    [],
  )
  const onPressSuggestion = useCallback(
    () => setFeedbackType(FEEDBACK_TYPES.suggestion),
    [],
  )

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const onPressSubmit = useCallback(
    _debounce(
      async (textFromParams) => {
        if (canSubmit || textFromParams) {
          try {
            setLoading(true)
            const data = new FormData()
            data.append('entry.988746081', feedbackType)
            data.append('entry.906370496', 'Mobile App')
            data.append('entry.684225092', KEET_META)
            data.append('entry.1496019132', Device.modelName || '<null>')
            data.append('entry.791009276', Device.osName || '<null>')
            data.append('entry.1933100548', textFromParams || text)
            if (sendDeviceData) {
              data.append('entry.1095487897', carrier)
              data.append('entry.1301251051', networkDhtVersion || '<null>')
            }
            data.append('pageHistory', '0,1,2,3,4')

            await fetch(
              'https://docs.google.com/forms/u/0/d/e/1FAIpQLSekTbWfX7Eyi2WrN_uNvPbV1fwPsATr73ec4UJvJXeadnyVAQ/formResponse',
              {
                method: 'POST',
                body: data,
              },
            )
            showInfoNotifier(strings.feedback.successToast)
            closeBottomSheet()
          } catch (err) {
            showErrorNotifier(strings.feedback.errorToast)
            consoleError(err)
          } finally {
            setLoading(false)
          }
        }
      },
      BACK_DEBOUNCE_DELAY,
      BACK_DEBOUNCE_OPTIONS,
    ),
    [canSubmit, carrier, feedbackType, networkDhtVersion, text, sendDeviceData],
  )

  return {
    text,
    setText,
    feedbackType,
    sendDeviceData,
    setSendDeviceData,
    canSubmit,
    loading,
    onPressBug,
    onPressFeature,
    onPressSuggestion,
    onPressSubmit,
  }
}

export default useFeedback
