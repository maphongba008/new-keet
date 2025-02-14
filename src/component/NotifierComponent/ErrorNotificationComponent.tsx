import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import SvgIcon from 'component/SvgIcon'
import { colors, createThemedStylesheet } from 'component/theme'
import s, { DIRECTION_CODE, UI_SIZE_4, UI_SIZE_16 } from 'lib/commonStyles'

import { useStrings } from 'i18n/strings'

interface ErrorNotificationComponentProps {
  title: string
  description?: string
  testID?: string
  showDetails?: boolean
}

const ErrorNotificationComponent = ({
  title = '',
  description,
  testID = 'error-notification',
  showDetails,
}: ErrorNotificationComponentProps) => {
  const styles = getStyles()
  const strings = useStrings()

  return (
    <SafeAreaView>
      <View
        style={styles.container}
        accessible
        accessibilityLabel={testID}
        testID={testID}
      >
        <View style={[styles.content, s.row, s.alignItemsStart]}>
          <View style={styles.iconContainer}>
            <SvgIcon
              name="warningOctagon"
              width={UI_SIZE_16}
              height={UI_SIZE_16}
              color={colors.red_400}
            />
          </View>
          <View style={s.container}>
            {!!title && (
              <Text style={styles.title} numberOfLines={1}>
                {title}
              </Text>
            )}
            {!!description && (
              <Text style={styles.description} numberOfLines={2}>
                {description}
              </Text>
            )}
            {showDetails && (
              <Text style={styles.details}>{strings.common.viewDetails}</Text>
            )}
          </View>
        </View>
      </View>
    </SafeAreaView>
  )
}

export default ErrorNotificationComponent

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    container: {
      alignItems: 'center',
      backgroundColor: theme.color.red_900,
      borderRadius: 5,
      elevation: 10,
      flexDirection: 'row',
      marginHorizontal: 10,
      marginTop: 10,
      paddingHorizontal: 10,
      paddingVertical: 10,
      shadowColor: colors.black,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 4,
    },
    content: {
      flex: 1,
      marginHorizontal: 5,
    },
    description: {
      ...theme.text.body,
      fontSize: 14,
      lineHeight: 20,
      writingDirection: DIRECTION_CODE,
    },
    details: {
      color: theme.color.blue_400,
    },
    iconContainer: {
      marginRight: UI_SIZE_4,
      marginTop: 3,
    },
    title: {
      ...theme.text.title,
      fontSize: 15,
      fontWeight: 'bold',
      lineHeight: 25,
      marginRight: UI_SIZE_4,
      writingDirection: DIRECTION_CODE,
    },
  })
  return styles
})
