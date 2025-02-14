import React, { memo, useCallback } from 'react'
import { StyleSheet, Text, View } from 'react-native'

import { closeBottomSheet } from 'component/AppBottomSheet/AppBottomSheet.Store'
import SvgIcon from 'component/SvgIcon'
import { colors, createThemedStylesheet } from 'component/theme'
import s, { DIRECTION_CODE, UI_SIZE_16, UI_SIZE_24 } from 'lib/commonStyles'

import { IconButton, TextButton, TextButtonType } from '../../../Button'

export interface ConfirmDialogInterface {
  title?: string
  description?: string | React.JSX.Element
  closeButton?: boolean
  reverse?: boolean
  confirmButton: {
    text: string
    onPress: () => void
    type?: TextButtonType
  }
  buttons?: {
    text: string
    onPress: () => void
    type?: TextButtonType
  }[]
}

const ConfirmDialog = ({
  title,
  description,
  closeButton,
  reverse,
  confirmButton,
  buttons,
}: ConfirmDialogInterface) => {
  const styles = getStyles()

  const onPressConfirm = useCallback(
    () => confirmButton.onPress(),
    [confirmButton],
  )
  return (
    <>
      {!!title && (
        <View
          style={[
            s.centerAlignedRow,
            s.flexSpaceBetween,
            styles.titleContainer,
          ]}
        >
          <Text style={styles.titleText}>{title}</Text>
          {!!closeButton && (
            <IconButton onPress={closeBottomSheet}>
              <SvgIcon
                name="close"
                color={colors.white_snow}
                width={UI_SIZE_24}
                height={UI_SIZE_24}
              />
            </IconButton>
          )}
        </View>
      )}
      {!!description && typeof description === 'string' ? (
        <Text style={styles.descriptionText}>{description}</Text>
      ) : (
        description
      )}
      {!!reverse && (
        <TextButton
          testID={confirmButton.text}
          accessibilityLabel={confirmButton.text}
          text={confirmButton.text}
          onPress={onPressConfirm}
          type={confirmButton.type}
          style={styles.confirmButton}
        />
      )}
      {buttons?.map((button) => (
        <TextButton
          testID={button.text}
          accessibilityLabel={button.text}
          key={button.text}
          text={button?.text}
          // eslint-disable-next-line react/jsx-no-bind
          onPress={() => button?.onPress()}
          type={button.type}
          style={styles.button}
        />
      ))}
      {!reverse && (
        <TextButton
          testID={confirmButton.text}
          accessibilityLabel={confirmButton.text}
          text={confirmButton.text}
          onPress={onPressConfirm}
          type={confirmButton.type}
          style={styles.confirmButton}
        />
      )}
    </>
  )
}

export default memo(ConfirmDialog)

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    button: {
      marginTop: UI_SIZE_16,
    },
    confirmButton: {
      marginTop: UI_SIZE_16,
    },
    descriptionText: {
      ...theme.text.body,
      marginBottom: theme.spacing.standard,
      writingDirection: DIRECTION_CODE,
    },
    titleContainer: {
      marginBottom: theme.spacing.standard,
    },
    titleText: {
      ...theme.text.bodyBold,
      writingDirection: DIRECTION_CODE,
    },
  })
  return styles
})
