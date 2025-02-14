import { FC, useCallback, useMemo } from 'react'
import {
  LayoutAnimation,
  StyleSheet,
  Text,
  UIManager,
  View,
} from 'react-native'
import prettyBytes from 'pretty-bytes'

import { RoomFileRaw } from '@holepunchto/keet-store/store/room'

import { CloseButton } from 'component/CloseButton'
import { Loading } from 'component/Loading'
import SvgIcon from 'component/SvgIcon'
import { createThemedStylesheet, useTheme } from 'component/theme'
import { useFileId } from 'screen/RoomScreen/hooks/useFileId'
import { useUpdateClearedFile } from 'screen/RoomScreen/hooks/useUpdateClearedFile'
import s, {
  ICON_SIZE_16,
  ICON_SIZE_24,
  UI_SIZE_4,
  UI_SIZE_8,
  UI_SIZE_12,
  UI_SIZE_16,
  UI_SIZE_20,
} from 'lib/commonStyles'
import { useFile } from 'lib/hooks/useFile'
import { isAndroid } from 'lib/platform'

import { useStrings } from 'i18n/strings'

if (isAndroid) {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true)
  }
}

export const ROOM_FILE_ROW_SIZE = 70

export const RoomFileRow: FC<RoomFileRaw> = (props) => {
  const { path } = props
  const fileId = useFileId(props)
  const [fileEntry, { isLoading, error }] = useFile(fileId)

  const { cleared = false, byteLength = 0 } = fileEntry || {}

  const strings = useStrings()
  const styles = getStyles()
  const theme = useTheme()

  const updateClearFile = useUpdateClearedFile()
  const fileStatus = useMemo(() => {
    if (cleared) return strings.chat.deleted
    if (error) return strings.chat.failed
    if (isLoading) return strings.chat.loading
    if (byteLength) return prettyBytes(byteLength)

    return ''
  }, [
    cleared,
    error,
    byteLength,
    isLoading,
    strings.chat.deleted,
    strings.chat.failed,
    strings.chat.loading,
  ])
  const fileFormat = useMemo(() => {
    return path.includes('.') ? path.replace(/^.*\./, '') : strings.chat.unknown
  }, [path, strings.chat.unknown])

  const onDelete = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut)

    updateClearFile(fileId, true)
  }, [fileId, updateClearFile])

  if (cleared) {
    return null
  }

  return (
    <View style={styles.container}>
      <View style={styles.iconLeftContainer}>
        <SvgIcon
          name="fileLines"
          width={ICON_SIZE_24}
          height={ICON_SIZE_24}
          color={theme.color.grey_300}
        />
      </View>

      <View style={styles.titleContainer}>
        <Text style={styles.title} ellipsizeMode="middle" numberOfLines={1}>
          {path.replace(/^\//, '').replace(/\..*$/, '')}
        </Text>

        <View style={s.row}>
          {isLoading && <Loading style={styles.loader} />}
          <Text style={styles.details} ellipsizeMode="middle" numberOfLines={1}>
            {strings.chat.fileDetails
              .replace('$1', isLoading ? '' : fileStatus)
              .replace('$2', fileFormat)}
          </Text>
        </View>
      </View>
      <CloseButton
        onPress={onDelete}
        color={theme.color.grey_300}
        width={ICON_SIZE_16}
        height={ICON_SIZE_16}
        style={styles.iconRightContainer}
      />
    </View>
  )
}

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    container: {
      backgroundColor: theme.color.grey_600,
      borderRadius: UI_SIZE_12,
      flex: 1,
      flexDirection: 'row',
      height: ROOM_FILE_ROW_SIZE,
      marginBottom: UI_SIZE_8,
      marginRight: UI_SIZE_4,
      padding: UI_SIZE_16,
      paddingTop: 10,
    },
    details: {
      ...theme.text.body,
      color: theme.color.grey_200,
      flex: 1,
    },
    iconLeftContainer: {
      alignItems: 'center',
      height: 30,
      justifyContent: 'center',
      width: 30,
    },
    iconRightContainer: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    loader: {
      height: UI_SIZE_20,
      marginBottom: -3,
      width: UI_SIZE_20,
    },
    title: {
      ...theme.text.body,
      color: theme.color.grey_200,
      flex: 1,
    },
    titleContainer: {
      flex: 1,
      paddingHorizontal: 11,
    },
  })
  return styles
})
