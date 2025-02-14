/* eslint-disable react/jsx-no-bind */
import React, { useMemo } from 'react'
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native'

import { ButtonBase } from 'component/Button'
import LabeledRadio from 'component/RadioButton'
import { createThemedStylesheet } from 'component/theme'
import s, { TRANSPARENT } from 'lib/commonStyles'
import { isAndroid } from 'lib/platform'

import { useStrings } from 'i18n/strings'

interface SortOptionsType {
  isVisible: boolean
  selectedSort: string
  iconPosition: { top: number }
  onSelect: Function
  closeFilterModal: () => void
}

function SortOptions({
  isVisible,
  closeFilterModal,
  iconPosition,
  onSelect,
  selectedSort,
}: SortOptionsType) {
  const styles = getStyles()
  const strings = useStrings()

  const COMMUNITY_SORT_OPTIONS = useMemo(() => {
    return [
      strings.discoverCommunities.mostPopular,
      strings.discoverCommunities.featured,
      strings.discoverCommunities.relevant,
    ]
  }, [
    strings.discoverCommunities.featured,
    strings.discoverCommunities.mostPopular,
    strings.discoverCommunities.relevant,
  ])

  return (
    <Modal
      animationType="none"
      transparent
      visible={isVisible}
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
              {COMMUNITY_SORT_OPTIONS.map((label, key) => (
                <ButtonBase
                  key={key}
                  style={[
                    s.row,
                    s.flexSpaceBetween,
                    styles.filterButtonBase,
                    key !== COMMUNITY_SORT_OPTIONS.length - 1 &&
                      styles.borderBottom,
                  ]}
                  onPress={() => onSelect(label)}
                >
                  <Text style={styles.text}>{label}</Text>
                  <LabeledRadio
                    value={selectedSort?.indexOf(label) >= 0}
                    onChange={() => onSelect(label)}
                  />
                </ButtonBase>
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
      borderBottomWidth: 0.5,
    },
    filterButtonBase: {
      borderBottomColor: theme.color.grey_500,
      padding: theme.spacing.standard * 0.45,
      paddingVertical: theme.spacing.normal * 1.5,
    },
    modalContainer: {
      backgroundColor: TRANSPARENT,
      paddingHorizontal: theme.spacing.standard * 0.75,
      position: 'absolute',
      right: 0,
      width: '50%',
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

export default SortOptions
