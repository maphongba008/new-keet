import { StyleSheet, Text } from 'react-native'

import { TextButton, TextButtonType } from 'component/Button'
import { createThemedStylesheet } from 'component/theme'
import { DIRECTION_CODE, UI_SIZE_16, UI_SIZE_20 } from 'lib/commonStyles'

import { useStrings } from 'i18n/strings'

export interface IdentityBackupConfirmSheetInterface {
  onDoItLater: () => void
  onContinue: () => void
}

const IdentityBackupConfirmSheet = ({
  onDoItLater,
  onContinue,
}: IdentityBackupConfirmSheetInterface) => {
  const styles = getStyles()
  const { identityBackupConfirm: strings } = useStrings()

  return (
    <>
      <Text style={styles.title}>{strings.exitingIdSetup}</Text>
      <Text style={styles.body}>{strings.description}</Text>
      <TextButton
        text={strings.exitDoItLater}
        type={TextButtonType.dangerTransparentBg}
        onPress={onDoItLater}
        style={styles.actionBtn}
      />
      <TextButton
        text={strings.continueAndSecure}
        type={TextButtonType.primaryOutline}
        onPress={onContinue}
      />
    </>
  )
}

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    actionBtn: {
      marginVertical: UI_SIZE_16,
    },
    body: {
      ...theme.text.body,
      fontSize: 14,
      marginBottom: theme.spacing.standard,
      writingDirection: DIRECTION_CODE,
    },
    title: {
      ...theme.text.title,
      fontSize: UI_SIZE_20,
      marginBottom: theme.spacing.normal,
      writingDirection: DIRECTION_CODE,
    },
  })
  return styles
})

export default IdentityBackupConfirmSheet
