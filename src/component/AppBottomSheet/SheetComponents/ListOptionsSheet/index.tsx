import React, { useCallback } from 'react'
import { StyleSheet, Text, View } from 'react-native'

import { closeBottomSheet } from 'component/AppBottomSheet/AppBottomSheet.Store'
import { IconButton } from 'component/Button'
import ListItem, { ListItemProps } from 'component/ListItem'
import SvgIcon from 'component/SvgIcon'
import { colors, createThemedStylesheet } from 'component/theme'
import s, {
  DIRECTION_CODE,
  UI_SIZE_2,
  UI_SIZE_12,
  UI_SIZE_24,
} from 'lib/commonStyles'

export interface ListOptionSheetPropsI {
  options: ListItemProps[]
  title?: string
  icon?: React.JSX.Element
  closeButton?: boolean
}

const ListOptionSheet = (props: ListOptionSheetPropsI) => {
  const { options = [], title, icon, closeButton } = props
  const styles = getStyles()

  const renderMenuItems = useCallback(
    (value: ListItemProps) => (
      <ListItem
        key={value.name}
        listType="grouped"
        containerStyle={styles.listItem}
        {...value}
      />
    ),
    [styles],
  )

  return (
    <View style={styles.container}>
      {!!title && (
        <View
          style={[
            s.centerAlignedRow,
            s.flexSpaceBetween,
            styles.titleContainer,
          ]}
        >
          <View style={[s.row, s.alignItemsCenter]}>
            {!!icon && icon}
            <Text style={styles.titleText}>{title}</Text>
          </View>
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
      {options.map(renderMenuItems)}
    </View>
  )
}

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    container: {
      backgroundColor: theme.background.bg_2,
      borderRadius: theme.border.radiusLarge,
      marginTop: -UI_SIZE_12,
      overflow: 'hidden',
    },
    listItem: {
      backgroundColor: theme.color.grey_700,
      padding: UI_SIZE_2,
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

export default ListOptionSheet
