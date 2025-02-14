import React, { memo, useCallback } from 'react'
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native'

import { ButtonBase } from 'component/Button'
import LabeledCheckbox from 'component/Checkbox'
import { createThemedStylesheet } from 'component/theme'
import s, { TRANSPARENT } from 'lib/commonStyles'
import { isAndroid } from 'lib/platform'

import { ModalOptionsTypes, RoomFilterOptionTypes } from './types'

type FilterRowProps = {
  item: ModalOptionsTypes
  handleSelect: RoomFilterOptionTypes['handleSelect']
  selectedFilter: RoomFilterOptionTypes['selectedFilter']
  hasBorderBottom: boolean
}

function FilterRow({
  item,
  handleSelect,
  selectedFilter,
  hasBorderBottom,
}: FilterRowProps) {
  const styles = getStyles()
  const { key, description, label } = item
  const onPressItem = useCallback(() => {
    handleSelect(key)
  }, [handleSelect, key])
  return (
    <ButtonBase
      testID={item.label}
      accessibilityLabel={item.label}
      key={key}
      style={[
        s.row,
        s.flexSpaceBetween,
        styles.filterButtonBase,
        hasBorderBottom && styles.borderBottom,
      ]}
      onPress={onPressItem}
    >
      <View>
        <Text style={styles.text}>{label}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
      <LabeledCheckbox
        onChange={onPressItem}
        value={selectedFilter.includes(key)}
      />
    </ButtonBase>
  )
}

function RoomListFilterModal({
  filterModalVisible,
  closeFilterModal,
  iconPosition,
  roomTypeFilterOptions,
  handleSelect,
  selectedFilter,
}: RoomFilterOptionTypes) {
  const styles = getStyles()

  return (
    <Modal
      animationType="none"
      transparent
      visible={filterModalVisible}
      onRequestClose={closeFilterModal}
    >
      <TouchableOpacity style={s.container} onPressOut={closeFilterModal}>
        <TouchableWithoutFeedback>
          <View
            style={[
              s.alignSelfCenter,
              styles.modalContainer,
              {
                top: iconPosition.top + (isAndroid ? 20 : 45),
              },
            ]}
          >
            <View style={styles.modalContent}>
              {roomTypeFilterOptions.map((item, i) => (
                <FilterRow
                  item={item}
                  handleSelect={handleSelect}
                  selectedFilter={selectedFilter}
                  key={item.key}
                  hasBorderBottom={i !== roomTypeFilterOptions.length - 1}
                />
              ))}
            </View>
          </View>
        </TouchableWithoutFeedback>
      </TouchableOpacity>
    </Modal>
  )
}

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    borderBottom: {
      borderBottomWidth: 1,
    },
    description: {
      color: theme.color.grey_300,
    },
    filterButtonBase: {
      borderBottomColor: theme.color.grey_500,
      padding: theme.spacing.standard * 0.45,
      paddingVertical: theme.spacing.standard,
    },
    modalContainer: {
      backgroundColor: TRANSPARENT,
      paddingHorizontal: theme.spacing.standard * 0.75,
      position: 'absolute',
      width: '100%',
    },
    modalContent: {
      backgroundColor: theme.background.bg_2,
      borderRadius: theme.border.radiusNormal,
      paddingHorizontal: theme.spacing.standard * 0.75,
    },
    text: {
      ...theme.text.bodySemiBold,
      lineHeight: theme.spacing.standard + 10,
    },
  })
  return styles
})

export default memo(RoomListFilterModal)
