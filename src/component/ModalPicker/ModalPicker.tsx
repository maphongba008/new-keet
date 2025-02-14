import React, {
  memo,
  SetStateAction,
  useCallback,
  useMemo,
  useState,
} from 'react'
import {
  FlatList,
  Modal,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'

import s, {
  UI_SIZE_8,
  UI_SIZE_16,
  UI_SIZE_18,
  UI_SIZE_20,
  UI_SIZE_24,
  UI_SIZE_32,
  UI_SIZE_48,
} from 'lib/commonStyles'
import { filterSearchData } from 'lib/wallet'

import PickerItems from './ModalPicker.Items'
import { ButtonBase } from '../Button'
import SvgIcon from '../SvgIcon'
import { colors, createThemedStylesheet } from '../theme'

export interface ModalPickerItemI {
  label: string
  value: any
  icon?: string
  avatarUrl?: string
}

interface ModalPickerI {
  hasSearch?: boolean
  values: ModalPickerItemI[]
  currentValue?: any
  onSelectItem: React.Dispatch<SetStateAction<any>>
  containerStyle?: any
}

const getItemLayout = (_: any, index: number) => ({
  length: UI_SIZE_48,
  offset: UI_SIZE_48 * index,
  index,
})

function ModalPicker({
  values,
  currentValue,
  hasSearch = false,
  onSelectItem,
  containerStyle,
}: ModalPickerI) {
  const styles = getStyles()
  const [isVisible, setIsVisible] = useState(false)
  const [searchValue, setSearchValue] = useState<any>('')

  const keyExtractor = useCallback((_: any, index: any) => `model_${index}`, [])

  const toggleModalVisible = useCallback(() => {
    setIsVisible(!isVisible)
    setSearchValue('')
  }, [isVisible])

  const onSelectOption = useCallback(
    (selecteditem: ModalPickerItemI) => {
      onSelectItem(selecteditem)
      setIsVisible(false)
    },
    [onSelectItem],
  )

  const data = useMemo(() => {
    if (!hasSearch) return values
    return filterSearchData(values, searchValue)
  }, [hasSearch, searchValue, values])

  const renderItem = useCallback(
    ({ item }: any) => {
      return <PickerItems item={item} onSelectOption={onSelectOption} />
    },
    [onSelectOption],
  )

  return (
    <View style={[styles.modalRoot, containerStyle]}>
      <ButtonBase style={styles.btnType} onPress={toggleModalVisible}>
        <View style={[s.row, s.alignItemsCenter]}>
          {currentValue && (
            <View style={s.row}>
              <SvgIcon
                key={currentValue?.icon}
                name={currentValue?.icon}
                width={UI_SIZE_20}
                height={UI_SIZE_20}
                style={styles.extraSpacing}
              />
              <Text style={styles.text}>{currentValue?.label}</Text>
            </View>
          )}
        </View>
        <SvgIcon
          name="chevronUp"
          width={UI_SIZE_18}
          height={UI_SIZE_18}
          color={colors.white_snow}
          style={styles.chevronBottom}
        />
      </ButtonBase>
      <Modal
        animationType="slide"
        transparent={false}
        visible={isVisible}
        onRequestClose={toggleModalVisible}
      >
        <SafeAreaView style={[s.container, styles.modalWrapper]}>
          <TouchableOpacity
            style={styles.closeIcon}
            onPress={toggleModalVisible}
          >
            <SvgIcon
              name="close"
              width={UI_SIZE_24}
              height={UI_SIZE_24}
              color={colors.white_snow}
            />
          </TouchableOpacity>
          {hasSearch && (
            <TextInput
              style={styles.inputStyle}
              placeholder="Search"
              autoCorrect={false}
              placeholderTextColor={colors.keet_grey_300}
              onChangeText={setSearchValue}
            />
          )}
          <FlatList
            data={data}
            keyExtractor={keyExtractor}
            getItemLayout={getItemLayout}
            initialNumToRender={15}
            renderItem={renderItem}
            contentContainerStyle={styles.contentStyle}
            keyboardDismissMode="on-drag"
          />
        </SafeAreaView>
      </Modal>
    </View>
  )
}

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    btnType: {
      ...s.row,
      ...s.alignItemsCenter,
      ...s.flexSpaceBetween,
      backgroundColor: theme.color.grey_600,
      borderRadius: theme.border.radiusNormal,
      height: 42,
      marginTop: theme.spacing.normal,
      paddingHorizontal: theme.spacing.standard,
    },
    chevronBottom: {
      marginLeft: UI_SIZE_16,
      transform: [{ rotateZ: '180deg' }],
    },
    closeIcon: {
      alignItems: 'flex-end',
      paddingHorizontal: UI_SIZE_16,
    },
    contentStyle: {
      paddingTop: UI_SIZE_24,
    },
    extraSpacing: {
      marginRight: UI_SIZE_8,
    },
    inputStyle: {
      ...theme.text.body,
      backgroundColor: theme.color.grey_600,
      borderRadius: theme.border.radiusNormal,
      fontSize: 15,
      height: 42,
      marginHorizontal: UI_SIZE_16,
      marginTop: theme.spacing.standard,
      paddingHorizontal: theme.spacing.standard,
      paddingRight: UI_SIZE_32,
    },
    modalRoot: {
      marginBottom: theme.spacing.standard,
    },
    modalWrapper: {
      backgroundColor: theme.color.grey_800,
    },
    text: {
      ...theme.text.body,
      fontSize: 15,
    },
  })
  return styles
})

export default memo(ModalPicker)
