import { memo } from 'react'
import { Image, StyleSheet, Text, View } from 'react-native'
import { SvgUri } from 'react-native-svg'

import { createThemedStylesheet } from 'component/theme'
import { UI_SIZE_4, UI_SIZE_16 } from 'lib/commonStyles'
import { svgRegEx } from 'lib/fs'
import { DisplayFormat } from 'lib/types'

type PreviewProp = DisplayFormat['preview']

export const ChatInputLinkPreviewMessage = memo(
  ({
    icon,
    description,
    title,
  }: {
    icon?: PreviewProp['icon']
    description?: PreviewProp['description']
    title?: PreviewProp['title']
  }) => {
    const styles = getStyles()

    const renderIcon = () => {
      if (!icon) {
        return null
      }
      if (svgRegEx.test(icon)) {
        return <SvgUri width={UI_SIZE_16} height={UI_SIZE_16} uri={icon} />
      }
      return <Image source={{ uri: icon }} style={styles.iconStyle} />
    }

    return (
      <View style={styles.previewContainer}>
        <View style={styles.titleViewStyle}>
          {renderIcon()}
          {!!title && (
            <Text style={styles.previewTitle} numberOfLines={1}>
              {title}
            </Text>
          )}
        </View>
        {!!description && (
          <Text style={styles.previewDescription} numberOfLines={1}>
            {description}
          </Text>
        )}
      </View>
    )
  },
)

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    iconStyle: {
      height: UI_SIZE_16,
      width: UI_SIZE_16,
    },
    previewContainer: {
      backgroundColor: theme.color.almost_black,
      borderRadius: theme.border.radiusNormal,
      gap: UI_SIZE_4,
      padding: theme.spacing.normal,
    },
    previewDescription: {
      ...theme.text.body,
      color: theme.color.grey_100,
      fontSize: 11,
      marginBottom: UI_SIZE_4,
    },
    previewTitle: {
      ...theme.text.bodyBold,
      flex: 1,
      fontSize: 11,
    },
    titleViewStyle: {
      flexDirection: 'row',
      gap: 8,
    },
  })
  return styles
})
