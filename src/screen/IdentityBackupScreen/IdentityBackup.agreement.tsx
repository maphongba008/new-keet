import { type ReactRenderer } from 'marked-react'
import React, {
  cloneElement,
  memo,
  ReactElement,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { useDispatch } from 'react-redux'

import { APP_STATUS, setAppStatus } from '@holepunchto/keet-store/store/app'
import { resetBackupCreate } from '@holepunchto/keet-store/store/identity'
import {
  setItemsInView,
  switchRoomSubmit,
} from '@holepunchto/keet-store/store/room'

import { TextButton, TextButtonType } from 'component/Button'
import LabeledCheckbox from 'component/Checkbox'
import GestureContainer from 'component/GestureContainer'
import { mdRenderer as defaultRenderer, MarkDown } from 'component/MarkDown'
import MaskGradient from 'component/MaskGradient'
import { NavBar, ScreenSystemBars } from 'component/NavBar'
import { createThemedStylesheet, gradient } from 'component/theme'
import { APPIUM_IDs, appiumTestProps } from 'lib/appium'
import s, { UI_SIZE_14, UI_SIZE_16, UI_SIZE_24 } from 'lib/commonStyles'
import { getAndResetLastRoomProps } from 'lib/localStorage'
import {
  navigate,
  SCREEN_IDENTITY_BACKUP_QUICK_SETUP,
  SCREEN_IDENTITY_BACKUP_SETUP,
  SCREEN_TOS,
} from 'lib/navigation'

import { useStrings } from 'i18n/strings'

const IdentityBackupAgreement = memo(() => {
  const { syncDevice: strings } = useStrings()
  const styles = getStyles()
  const dispatch = useDispatch()
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    dispatch(setAppStatus(APP_STATUS.IDENTITY_SETUP))
    return () => {
      dispatch(setAppStatus(APP_STATUS.RUNNING))
      const props = getAndResetLastRoomProps()
      if (props) {
        const { roomId } = props
        dispatch(switchRoomSubmit({ roomId }))
        dispatch(setItemsInView(props.inView))
      }
    }
  }, [dispatch])

  const onPressAction = useCallback(
    () => navigate(SCREEN_IDENTITY_BACKUP_QUICK_SETUP),
    [],
  )

  useEffect(() => {
    dispatch(resetBackupCreate())
  }, [dispatch])

  const descriptionMDRenderer = useMemo(
    (): Partial<ReactRenderer> => ({
      ...defaultRenderer,
      // eslint-disable-next-line react/no-unstable-nested-components
      text(text: string) {
        return (
          <Text style={styles.text} key={`${this.elementId}`}>
            {text}
          </Text>
        )
      },
      link(_, text: ReactElement[]) {
        return cloneElement(text[0], {
          style: [styles.text, styles.actionText],
          onPress: () => navigate(SCREEN_IDENTITY_BACKUP_SETUP),
        })
      },
    }),
    [styles.text, styles.actionText],
  )
  const descriptionRenderer = useCallback(
    () => descriptionMDRenderer,
    [descriptionMDRenderer],
  )

  const tosMDRenderer = useMemo(
    (): Partial<ReactRenderer> => ({
      ...defaultRenderer,
      // eslint-disable-next-line react/no-unstable-nested-components
      text(text: string) {
        return (
          <Text style={styles.tosText} key={`${this.elementId}`}>
            {text}
          </Text>
        )
      },
      link(url: string, text: ReactElement[]) {
        const onPress = () => {
          navigate(SCREEN_TOS)
        }

        return cloneElement(text[0], {
          style: [styles.tosText, styles.tosLinkText],
          onPress,
        })
      },
    }),
    [styles.tosText, styles.tosLinkText],
  )
  const tosRenderer = useCallback(() => tosMDRenderer, [tosMDRenderer])

  return (
    <GestureContainer>
      <ScreenSystemBars />
      <NavBar title={strings.title} />
      <View style={styles.root}>
        <MaskGradient
          linearGradientProps={gradient.keet_gradient_pink}
          MaskElement={
            <Text style={styles.title}>{strings.setupModal.title}</Text>
          }
        />
        <Text style={styles.text}>{strings.setupModal.text1}</Text>
        <MarkDown
          md={strings.setupModal.text2}
          renderer={descriptionRenderer}
          style={styles.marginTop24}
        />
        <View style={s.container} />
        <LabeledCheckbox
          label={strings.setupModal.acknowledged}
          onChange={setChecked}
          value={checked}
          style={s.alignItemsStart}
          textStyle={styles.acknowledged}
        />
        <TextButton
          text={strings.setupModal.setupAction}
          type={checked ? TextButtonType.primary : TextButtonType.gray}
          onPress={onPressAction}
          style={styles.buttonContainer}
          disabled={!checked}
          {...appiumTestProps(APPIUM_IDs.create_identity_agreement_btn)}
        />
        <MarkDown md={strings.setupModal.tos} renderer={tosRenderer} />
      </View>
    </GestureContainer>
  )
})

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    acknowledged: {
      ...theme.text.bodySemiBold,
      fontSize: UI_SIZE_14,
    },
    actionText: {
      ...theme.text.bodySemiBold,
      color: theme.color.blue_400,
    },
    buttonContainer: {
      marginVertical: UI_SIZE_16,
    },
    marginTop24: {
      marginTop: UI_SIZE_24,
    },
    root: {
      ...s.container,
      padding: theme.spacing.standard,
    },
    text: {
      ...theme.text.body,
      color: theme.color.grey_000,
      textAlign: 'center',
    },
    title: {
      ...theme.text.title,
      fontSize: 26,
      marginBottom: UI_SIZE_16,
      marginTop: UI_SIZE_24,
      textAlign: 'center',
    },
    tosLinkText: {
      ...theme.text.body,
      color: theme.color.blue_400,
    },
    tosText: {
      ...theme.text.body,
      color: theme.color.grey_200,
      textAlign: 'center',
    },
  })
  return styles
})

export default IdentityBackupAgreement
